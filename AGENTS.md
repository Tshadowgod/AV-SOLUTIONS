<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Single Next.js 16 app (frontend + API route handlers). Standard commands (`dev`, `build`, `start`, `lint`) are in `package.json`; setup is in `README.md`. Admin panel is at `/admin`.

### Local database (non-obvious — no cloud Neon needed)
The app talks to Postgres exclusively through `@neondatabase/serverless`, which only speaks Neon's HTTPS `/sql` protocol (not raw Postgres wire). For fully-offline dev, the VM runs a local **Neon-compatible HTTPS proxy** (`~/neon-http-proxy/proxy.mjs`) in front of a local **PostgreSQL 16** cluster. The driver derives its endpoint from the connection host, so `db.localtest.me` → `https://api.localtest.me/sql`; `/etc/hosts` maps both to `127.0.0.1`, and the proxy listens on `:443` (self-signed cert). These (Postgres, the proxy dir, the `/etc/hosts` entry, and `.env.local`) persist in the VM snapshot but the two services must be (re)started each session.

### Start services each session (before `npm run dev`)
Run `~/start-services.sh` (idempotent: starts Postgres + the proxy on :443), then `cd /workspace && npm run dev` (port 3000). The proxy needs `:443` so it starts via `sudo`.

### Gotchas
- `.env.local` already exists (gitignored). It sets `NODE_TLS_REJECT_UNAUTHORIZED=0`, which is **required** so the Neon driver accepts the proxy's self-signed cert. `next dev`/`build`/`init-db` all fail with a TLS error without it. Admin creds there: `ADMIN_PASSWORD=admin123`, plus `AUTH_SECRET`.
- Seed data (orders `AV-1001`–`AV-1004`) is already loaded and persists in the snapshot. To reset/recreate tables: `cd /workspace && node --env-file=.env.local scripts/init-db.mjs` (proxy + Postgres must be running first).
- To use a real Neon DB instead of the local proxy, set `DATABASE_URL` to the Neon connection string and remove `NODE_TLS_REJECT_UNAUTHORIZED=0`; the proxy is then unnecessary.
- Quote submissions open a WhatsApp deep link client-side (no server integration / no credentials needed).
