<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Single Next.js 16 app ("av-solutions", npm). Standard commands live in `package.json` (`dev`, `build`, `start`, `lint`) and README. The only external dependency is a Postgres DB accessed via the Neon serverless HTTP driver (`neon()` in `lib/db.ts`).

### Local database (no Neon cloud account)
There is no real Neon database in this VM. Instead, a local Postgres + a small Neon-compatible HTTPS proxy (`tools/neon-local-proxy/`) emulate Neon's SQL-over-HTTP endpoint, so the app runs unmodified. How it works: the `neon()` driver derives its endpoint by replacing the connection host's first label with `api.` (`db.neon.local` → `https://api.neon.local/sql`). The proxy listens on `:443` (self-signed cert) and forwards to local Postgres.

Bring up / refresh the DB layer (idempotent) with:
```bash
bash tools/neon-local-proxy/start-dev-db.sh
```
This ensures the `/etc/hosts` entry, TLS cert (`~/.neon-local-proxy/`), Postgres cluster, `avuser`/`avdb`, the running proxy, and schema+seed (`scripts/init-db.mjs`).

### Running the app — non-obvious gotchas
- The app AND `scripts/init-db.mjs` must trust the proxy's self-signed cert. Always start them with `NODE_EXTRA_CA_CERTS=~/.neon-local-proxy/cert.pem` set, e.g. `NODE_EXTRA_CA_CERTS=~/.neon-local-proxy/cert.pem npm run dev`. Without it, DB calls fail with a TLS error.
- Env vars are read from `.env.local` (git-ignored, already created here): `DATABASE_URL` points at `db.neon.local`, plus `ADMIN_PASSWORD` (default `admin123`) and `AUTH_SECRET`. `/admin` login throws if `AUTH_SECRET` is missing.
- The proxy binds privileged port 443, so it is started with `sudo`; check it with `curl -sk https://api.neon.local/` (logs at `/tmp/neon-local-proxy.log`).
- `npm run lint` and `npm run build` work without the DB running (the DB connection is lazy at runtime).
- WhatsApp quote notifications are a client-side `wa.me` deep link only — no server integration/secret needed.
