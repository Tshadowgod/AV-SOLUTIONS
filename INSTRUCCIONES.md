# 📋 AV SOLUTIONS — Guía rápida

## ☎️ Cambiar el teléfono, la dirección o el horario

Todo está en **un solo archivo**: `lib/negocio.ts`. Edítalo ahí y el cambio
aparece en la web, en los botones de WhatsApp, en el pie de página, en el panel
y en lo que ve Google.

```ts
whatsapp: "59165073163",              // código de país + número, sin «+»
whatsappVisible: "+591 65073163",     // cómo se muestra en pantalla
direccion: "Radial 10, calle Godofredo Núñez",
horario: "Emergencias 24/7",
garantiaDias: 30,
```

## 🔔 Cotizaciones por WhatsApp

Cuando un cliente llena el formulario de cotización y pulsa **Enviar**:

1. La cotización se **guarda en tu panel** (`/admin`) para que quede registrada.
2. Se abre **WhatsApp** en el teléfono del cliente con un mensaje ya escrito
   hacia tu número, con todos los datos: equipo, modelo, fallas y su nombre.
3. El cliente solo pulsa **Enviar** en WhatsApp y te llega el mensaje directo.

No hace falta ninguna clave ni servicio externo.

## 🔐 Panel de administración

Entra en `/admin` con la contraseña de la variable `ADMIN_PASSWORD`
(cámbiala en Vercel → Settings → Environment Variables cuando quieras).

Lo que puedes hacer ahí:

- **Registrar órdenes** y cambiar su estado con un clic. El cliente lo ve al
  instante al consultar su código.
- **Avisar al cliente** por WhatsApp: el botón abre el chat con un mensaje ya
  escrito según el estado de su equipo, con el enlace de seguimiento incluido.
  Para que funcione, guarda el WhatsApp del cliente al crear la orden.
- **Copiar enlace**: copia una dirección tipo
  `https://tu-sitio/?codigo=AV-1001`. Si se la mandas al cliente, la página se
  abre con su orden ya consultada.
- **Convertir cotizaciones en órdenes** sin volver a escribir los datos.

## 🗄️ Datos técnicos

- **Base de datos:** Neon PostgreSQL (tablas `ordenes` y `cotizaciones`).
  Las tablas y columnas **se crean solas** la primera vez que la web consulta
  la base de datos; no hay que ejecutar nada a mano al desplegar.
- **Datos de ejemplo (opcional):**
  `node --env-file=.env.local scripts/init-db.mjs`
- **Publicar cambios:** cada vez que se sube algo a GitHub, Vercel lo despliega
  solo.
