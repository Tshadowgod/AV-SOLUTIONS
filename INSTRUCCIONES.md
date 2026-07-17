# 🔔 Activar el aviso por WhatsApp de las cotizaciones

Cuando un cliente envía una cotización desde la página, tu sitio puede
mandarte un mensaje automático a **tu** WhatsApp con los datos. Usa un
servicio gratuito llamado **CallMeBot**. Actívalo una sola vez así:

## Paso 1 — Autoriza tu número (desde tu teléfono)

1. Agrega este número a tus contactos: **+34 644 84 71 89**
   (es el bot de CallMeBot).
2. Desde WhatsApp, envíale este mensaje exacto a ese contacto:

   ```
   I allow callmebot to send me messages
   ```

3. Te responderá con tu **API key** (una clave tipo `123456`).
   Guárdala.

> Si no responde en 2 minutos, espera un poco y reintenta; a veces
> el bot tarda.

## Paso 2 — Pon la clave en la web (dímela y yo la configuro, o hazlo tú)

En Vercel:
1. Entra a vercel.com → proyecto **av-solutions** → **Settings** →
   **Environment Variables**.
2. Crea una variable:
   - **Name:** `CALLMEBOT_APIKEY`
   - **Value:** la clave que te dio CallMeBot
   - Marca **Production**.
3. También confirma que exista `WHATSAPP_NOTIFY_PHONE` con valor
   `59165073163` (tu número con código de país, sin el «+»).
4. Vuelve a desplegar (Deployments → ⋯ → Redeploy) o dime y lo hago yo.

¡Listo! Desde ese momento, cada cotización te llegará como mensaje de
WhatsApp con el nombre del cliente, el equipo, el problema y su número.

---

## Otros datos útiles

- **Panel de administración:** `/admin` — contraseña en la variable
  `ADMIN_PASSWORD` (cámbiala en Vercel cuando quieras).
- **Base de datos:** Neon PostgreSQL. Tabla `cotizaciones` y `ordenes`.
- **Convertir cotización en orden:** botón «🔄 Convertir a orden» en el panel.
