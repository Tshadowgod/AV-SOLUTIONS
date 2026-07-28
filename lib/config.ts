export const NEGOCIO = {
  nombre: "AV SOLUTIONS",
  telefonoVisible: "+591 65073163",
  whatsapp: "59165073163",
  direccion: "Radial 10, calle Godofredo Núñez",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Radial%2010%2C%20calle%20Godofredo%20N%C3%BA%C3%B1ez%2C%20Santa%20Cruz%2C%20Bolivia",
} as const;

export function crearEnlaceWhatsApp(mensaje?: string) {
  const base = `https://wa.me/${NEGOCIO.whatsapp}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}
