# 🛠️ AV SOLUTIONS

Página web para el servicio de **reparación y mantenimiento de computadoras**.
Los clientes consultan el estado de su equipo con su código de orden y ven
al instante si ya pueden pasar a recogerlo.

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS** para el diseño
- **Neon PostgreSQL** como base de datos
- Desplegado en **Vercel**

## Funciones

- 🔍 **Consulta pública**: el cliente escribe su código (ej. `AV-1001`) y ve
  una línea de tiempo con el estado: Recibido → Diagnóstico → Reparación →
  ✅ Listo para recoger → Entregado.
- 🔐 **Panel de administración** (`/admin`): protegido con contraseña.
  Crear, editar y eliminar órdenes; cambiar estados con un clic.
  Los cambios se publican **al instante** gracias a la base de datos.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completa tus valores
node --env-file=.env.local scripts/init-db.mjs   # crea la tabla (una sola vez)
npm run dev
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión de Neon PostgreSQL |
| `ADMIN_PASSWORD` | Contraseña del panel `/admin` |
| `AUTH_SECRET` | Cadena aleatoria larga para firmar sesiones |

Configúralas también en Vercel: **Settings → Environment Variables**.
