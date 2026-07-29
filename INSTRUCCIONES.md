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
> Está en el archivo `lib/negocio.ts`, en la constante
> `WHATSAPP_NUMERO` (código de país + número, sin «+»).

## 🔐 Panel de administración

- Entra en `/admin`. La contraseña está en la variable `ADMIN_PASSWORD`
  (cámbiala en Vercel → Settings → Environment Variables cuando quieras).
- Ahí ves las **órdenes** y las **cotizaciones recibidas**.
- Botón **«🔄 Convertir a orden»**: pasa una cotización a órdenes registradas.

## 🏠 Control de alquileres y luz (`/alquileres`)

Misma contraseña que el admin. Ahí puedes:

1. Registrar **inquilinos** (unidad, alquiler mensual, n.º de medidor y lectura anterior).
2. Cuando llegue la **factura de luz**, poner la lectura actual → el sistema resta
   `lectura actual − lectura anterior` y deja la actual como nueva lectura anterior.
3. Marcar el **alquiler del mes** como pagado o pendiente.

Las tablas (`inquilinos`, `lecturas_luz`, `pagos_alquiler`) se crean solas al
usar el panel, o con `node --env-file=.env.local scripts/init-db.mjs`.

## 🗄️ Datos técnicos

- **Base de datos:** Neon PostgreSQL (tablas `ordenes` y `cotizaciones`).
- **Publicar cambios:** cada vez que se sube algo a GitHub, Vercel lo despliega solo.
