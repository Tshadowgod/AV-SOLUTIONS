# 🛠️ AV SOLUTIONS

Página web para el servicio de **reparación y mantenimiento de computadoras**.
Los clientes consultan el estado de su equipo con su código de orden y ven
al instante si ya pueden pasar a recogerlo.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS 4** para el diseño
- **Neon PostgreSQL** como base de datos
- Desplegado en **Vercel**

## Funciones

- 🔍 **Consulta pública**: el cliente escribe su código (ej. `AV-1001`, o solo
  `1001`) y ve una línea de tiempo con el estado: Recibido → Diagnóstico →
  Reparación → ✅ Listo para recoger → Entregado. La página también entiende
  enlaces del tipo `/?codigo=AV-1001` para consultar de una.
- 📝 **Cotización sin compromiso**: el cliente marca las fallas de una lista,
  se guarda en el panel y se abre WhatsApp con el mensaje ya escrito.
- 🔐 **Panel de administración** (`/admin`): protegido con contraseña. Crear,
  editar y eliminar órdenes, cambiar estados con un clic, avisar al cliente por
  WhatsApp y convertir cotizaciones en órdenes.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completa tus valores
npm run dev
```

Las tablas se crean solas en el primer arranque. Si quieres partir con datos de
ejemplo: `node --env-file=.env.local scripts/init-db.mjs`.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión de Neon PostgreSQL |
| `ADMIN_PASSWORD` | Contraseña del panel `/admin` |
| `AUTH_SECRET` | Cadena aleatoria larga para firmar sesiones |
| `NEXT_PUBLIC_URL_SITIO` | Opcional. Dirección pública del sitio, solo si no se despliega en Vercel |

Configúralas también en Vercel: **Settings → Environment Variables**.

## Datos del negocio

El teléfono, la dirección, el horario y la garantía viven en `lib/negocio.ts`.
Es el único archivo que hay que tocar para actualizarlos en toda la página.
