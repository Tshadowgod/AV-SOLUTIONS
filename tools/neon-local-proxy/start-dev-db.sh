#!/usr/bin/env bash
# Idempotent bring-up for the LOCAL development database layer used to run this
# app without a real Neon cloud database.
#
# It ensures:
#   1. a hosts entry so `db.neon.local` / `api.neon.local` resolve to localhost
#   2. a self-signed TLS cert for the Neon HTTP proxy (in ~/.neon-local-proxy)
#   3. a running local PostgreSQL cluster with role `avuser` and database `avdb`
#   4. the neon-local-proxy running on https://api.neon.local:443
#   5. the schema + seed data (via scripts/init-db.mjs)
#
# After running this, start the app with:
#   NODE_EXTRA_CA_CERTS=~/.neon-local-proxy/cert.pem npm run dev
#
# Safe to run repeatedly.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CERT_DIR="${HOME}/.neon-local-proxy"
NODE_BIN="$(command -v node)"
PROXY_PG_URL="postgres://avuser:avpass@127.0.0.1:5432/avdb"

echo "==> Ensuring /etc/hosts entry for *.neon.local"
if ! grep -q "api.neon.local" /etc/hosts; then
  echo "127.0.0.1 api.neon.local db.neon.local" | sudo tee -a /etc/hosts >/dev/null
fi

echo "==> Ensuring TLS cert in ${CERT_DIR}"
mkdir -p "${CERT_DIR}"
if [ ! -f "${CERT_DIR}/cert.pem" ] || [ ! -f "${CERT_DIR}/key.pem" ]; then
  openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout "${CERT_DIR}/key.pem" -out "${CERT_DIR}/cert.pem" -days 3650 \
    -subj "/CN=api.neon.local" \
    -addext "subjectAltName=DNS:api.neon.local,DNS:db.neon.local,DNS:localhost,IP:127.0.0.1"
fi

echo "==> Ensuring PostgreSQL cluster is running"
sudo pg_ctlcluster 16 main start 2>/dev/null || true

echo "==> Ensuring role 'avuser' and database 'avdb' exist"
sudo -u postgres psql -v ON_ERROR_STOP=1 -c \
  "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='avuser') THEN CREATE ROLE avuser LOGIN PASSWORD 'avpass'; END IF; END \$\$;"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='avdb'" | grep -q 1 \
  || sudo -u postgres createdb -O avuser avdb

echo "==> Ensuring neon-local-proxy is running on :443"
if ! curl -sk --max-time 3 https://api.neon.local/ >/dev/null 2>&1; then
  sudo PROXY_PG_URL="${PROXY_PG_URL}" \
    PROXY_TLS_KEY="${CERT_DIR}/key.pem" PROXY_TLS_CERT="${CERT_DIR}/cert.pem" \
    "${NODE_BIN}" "${REPO_ROOT}/tools/neon-local-proxy/server.mjs" \
    >/tmp/neon-local-proxy.log 2>&1 &
  sleep 2
fi

echo "==> Initializing schema + seed data"
NODE_EXTRA_CA_CERTS="${CERT_DIR}/cert.pem" \
  node --env-file="${REPO_ROOT}/.env.local" "${REPO_ROOT}/scripts/init-db.mjs"

echo "==> Local dev database is ready."
echo "    Start the app with:  NODE_EXTRA_CA_CERTS=${CERT_DIR}/cert.pem npm run dev"
