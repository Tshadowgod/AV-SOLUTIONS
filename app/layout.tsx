import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { NEGOCIO } from "@/lib/negocio";
import { URL_SITIO } from "@/lib/sitio";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const DESCRIPCION =
  "Servicio técnico de laptops y PCs: mantenimiento, reparación, formateo y mejoras. " +
  "Consulta en línea con tu código de orden si tu equipo ya está listo para recoger.";

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITIO),
  title: {
    default: `${NEGOCIO.nombre} — ${NEGOCIO.rubro}`,
    template: `%s · ${NEGOCIO.nombre}`,
  },
  description: DESCRIPCION,
  applicationName: NEGOCIO.nombre,
  keywords: [
    "reparación de computadoras",
    "servicio técnico",
    "mantenimiento de laptops",
    "formateo de PC",
    "cambio de pantalla",
    "instalación de SSD",
    NEGOCIO.nombre,
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_BO",
    url: "/",
    siteName: NEGOCIO.nombre,
    title: `${NEGOCIO.nombre} — ${NEGOCIO.rubro}`,
    description: DESCRIPCION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${NEGOCIO.nombre} — ${NEGOCIO.rubro}`,
    description: DESCRIPCION,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: true },
};

export const viewport: Viewport = {
  themeColor: "#070b14",
  colorScheme: "dark",
};

// Datos estructurados: ayudan a que el negocio salga bien en Google Maps y
// en los resultados de búsqueda locales.
const datosDelNegocio = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: NEGOCIO.nombre,
  description: DESCRIPCION,
  url: URL_SITIO,
  telephone: `+${NEGOCIO.whatsapp}`,
  address: {
    "@type": "PostalAddress",
    streetAddress: NEGOCIO.direccion,
    addressCountry: "BO",
  },
  openingHours: "Mo-Su 00:00-23:59",
  areaServed: "Bolivia",
  knowsLanguage: "es",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Fondo: malla tipo placa electrónica + manchas de color */}
        <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="malla-fondo" />
          <div className="blob -left-24 -top-36 h-[480px] w-[480px] bg-violet-800" />
          <div className="blob -right-40 top-[30%] h-[420px] w-[420px] bg-cyan-800 [animation-delay:-6s]" />
          <div className="blob -bottom-28 left-[30%] h-[380px] w-[380px] bg-violet-950 [animation-delay:-12s]" />
        </div>

        <a href="#contenido" className="saltar-contenido">
          Saltar al contenido
        </a>

        {children}

        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(datosDelNegocio) }}
        />
      </body>
    </html>
  );
}
