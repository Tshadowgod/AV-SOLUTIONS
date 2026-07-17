# 📋 AV SOLUTIONS — Guía rápida

## 🔔 Cotizaciones por WhatsApp (¡ya funciona, sin configurar nada!)

Cuando un cliente llena el formulario de cotización y pulsa **Enviar**:

1. La cotización se **guarda en tu panel** (`/admin`) para que quede registrada.
2. Se abre **WhatsApp** en el teléfono/computadora del cliente con un mensaje
   ya escrito hacia **tu número** (`+591 65073163`), con todos los datos:
   equipo, modelo, problema y su nombre.
3. El cliente solo pulsa **Enviar** en WhatsApp y te llega el mensaje directo.

Así puedes responderle de inmediato desde tu WhatsApp. No hace falta ninguna
clave ni servicio externo.

> **¿Quieres cambiar el número que recibe las cotizaciones?**
> Está en el archivo `components/Cotizacion.tsx`, en la línea
> `const WHATSAPP_NEGOCIO = "59165073163";` (código de país + número, sin «+»).

## 🔐 Panel de administración

- Entra en `/admin`. La contraseña está en la variable `ADMIN_PASSWORD`
  (cámbiala en Vercel → Settings → Environment Variables cuando quieras).
- Ahí ves las **órdenes** y las **cotizaciones recibidas**.
- Botón **«🔄 Convertir a orden»**: pasa una cotización a órdenes registradas.

## 🗄️ Datos técnicos

- **Base de datos:** Neon PostgreSQL (tablas `ordenes` y `cotizaciones`).
- **Publicar cambios:** cada vez que se sube algo a GitHub, Vercel lo despliega solo.
