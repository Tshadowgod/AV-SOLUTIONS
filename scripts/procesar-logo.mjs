/* Procesa el logo original (negro sobre blanco) y genera:
   - public/logo-blanco.png : logo blanco con fondo transparente (para la web oscura)
   - app/icon.png           : favicon (logo blanco sobre chip oscuro redondeado)
   Uso: node scripts/procesar-logo.mjs                              */

import sharp from "sharp";

const ORIGEN = "logo-original.png";

// 1. Aplanar sobre blanco, recortar márgenes y dejar UN solo canal de gris
const recortado = await sharp(ORIGEN)
  .flatten({ background: "#ffffff" })
  .trim()
  .greyscale()
  .toColourspace("b-w")
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = recortado.info;
console.log(`ℹ️  Logo recortado: ${width}x${height}, ${channels} canal(es)`);

// 2. Convertir: pixel oscuro → blanco opaco; pixel claro → transparente
const salida = Buffer.alloc(width * height * 4);
for (let i = 0; i < width * height; i++) {
  const luminosidad = recortado.data[i * channels];
  salida[i * 4] = 255;
  salida[i * 4 + 1] = 255;
  salida[i * 4 + 2] = 255;
  salida[i * 4 + 3] = 255 - luminosidad; // más oscuro = más opaco
}

const logoBlanco = await sharp(salida, { raw: { width, height, channels: 4 } })
  .png()
  .toBuffer();

await sharp(logoBlanco).toFile("public/logo-blanco.png");
console.log(`✅ public/logo-blanco.png (${width}x${height})`);

// 3. Favicon: logo blanco centrado sobre un chip oscuro redondeado
const fondo = Buffer.from(
  `<svg width="512" height="512"><rect width="512" height="512" rx="110" fill="#0b1020"/></svg>`
);
const logoParaIcono = await sharp(logoBlanco)
  .resize(360, 360, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toBuffer();

await sharp(fondo)
  .composite([{ input: logoParaIcono, gravity: "centre" }])
  .png()
  .toFile("app/icon.png");
console.log("✅ app/icon.png (favicon 512x512)");
