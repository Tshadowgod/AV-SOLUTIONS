// Local dev-only proxy that emulates Neon's SQL-over-HTTP endpoint used by
// `@neondatabase/serverless` (the `neon()` HTTP driver) and forwards queries to
// a local PostgreSQL instance. This lets the app run against a local database
// WITHOUT modifying application code.
//
// The `neon()` HTTP driver POSTs to `https://api.<domain>/sql` with headers
// `Neon-Connection-String`, `Neon-Raw-Text-Output: true`, `Neon-Array-Mode: true`
// and a JSON body of `{query, params}` (single) or `{queries: [...]}` (batch).
// It expects a JSON response of `{fields, rows}` (or `{results: [...]}` for a
// batch), with all values returned as raw text and rows as arrays.
//
// Env vars:
//   PROXY_PG_URL   PostgreSQL connection string the proxy connects to.
//   PROXY_PORT     HTTPS port to listen on (default 443).
//   PROXY_TLS_KEY  Path to TLS private key PEM.
//   PROXY_TLS_CERT Path to TLS certificate PEM.

import https from "node:https";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import pg from "pg";

const { Pool } = pg;

const CERT_DIR = path.join(os.homedir(), ".neon-local-proxy");
const PROXY_PG_URL =
  process.env.PROXY_PG_URL || "postgres://avuser:avpass@127.0.0.1:5432/avdb";
const PORT = Number(process.env.PROXY_PORT || 443);
const KEY_PATH = process.env.PROXY_TLS_KEY || path.join(CERT_DIR, "key.pem");
const CERT_PATH = process.env.PROXY_TLS_CERT || path.join(CERT_DIR, "cert.pem");

// Return every value as raw text (identity parser), matching the driver's
// `Neon-Raw-Text-Output: true` expectation. The driver re-applies pg-types
// parsers client-side based on dataTypeID.
const rawTextTypes = { getTypeParser: () => (val) => val };

const pool = new Pool({ connectionString: PROXY_PG_URL, max: 10 });

async function runQuery(client, q) {
  const text = q.query ?? q.text ?? "";
  const values = q.params ?? q.values ?? [];
  const res = await client.query({
    text,
    values,
    rowMode: "array",
    types: rawTextTypes,
  });
  return {
    command: res.command,
    rowCount: res.rowCount,
    fields: (res.fields || []).map((f) => ({
      name: f.name,
      dataTypeID: f.dataTypeID,
      tableID: f.tableID,
      columnID: f.columnID,
      dataTypeSize: f.dataTypeSize,
      dataTypeModifier: f.dataTypeModifier,
      format: f.format,
    })),
    rows: res.rows,
  };
}

function pgErrorPayload(err) {
  return {
    message: err.message,
    code: err.code,
    detail: err.detail,
    hint: err.hint,
    position: err.position,
    internalPosition: err.internalPosition,
    internalQuery: err.internalQuery,
    where: err.where,
    schema: err.schema,
    table: err.table,
    column: err.column,
    dataType: err.dataType,
    constraint: err.constraint,
    file: err.file,
    line: err.line,
    routine: err.routine,
    severity: err.severity,
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const options = {
  key: fs.readFileSync(KEY_PATH),
  cert: fs.readFileSync(CERT_PATH),
};

const server = https.createServer(options, async (req, res) => {
  if (req.method === "GET") {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("neon-local-proxy ok");
    return;
  }
  if (req.method !== "POST") {
    res.writeHead(405);
    res.end();
    return;
  }

  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    res.writeHead(400, { "content-type": "application/json" });
    res.end(JSON.stringify({ message: "Invalid JSON body" }));
    return;
  }

  const client = await pool.connect();
  try {
    if (Array.isArray(body.queries)) {
      const isolation = req.headers["neon-batch-isolation-level"];
      const readOnly = req.headers["neon-batch-read-only"] === "true";
      const deferrable = req.headers["neon-batch-deferrable"] === "true";
      let begin = "BEGIN";
      if (isolation) begin += ` ISOLATION LEVEL ${isolation}`;
      if (readOnly) begin += " READ ONLY";
      if (deferrable) begin += " DEFERRABLE";
      await client.query(begin);
      try {
        const results = [];
        for (const q of body.queries) {
          results.push(await runQuery(client, q));
        }
        await client.query("COMMIT");
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ results }));
      } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        throw err;
      }
    } else {
      const result = await runQuery(client, body);
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(result));
    }
  } catch (err) {
    res.writeHead(400, { "content-type": "application/json" });
    res.end(JSON.stringify(pgErrorPayload(err)));
  } finally {
    client.release();
  }
});

server.listen(PORT, () => {
  console.log(
    `neon-local-proxy listening on https://0.0.0.0:${PORT} -> ${PROXY_PG_URL}`,
  );
});
