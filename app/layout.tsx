import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AV SOLUTIONS — Reparación y Mantenimiento de Computadoras",
  description:
    "Servicio técnico de computadoras. Consulta en línea el estado de tu equipo y entérate cuándo puedes pasar a recogerlo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Fondo con blobs flotantes */}
        <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="blob w-[480px] h-[480px] bg-violet-800 -top-36 -left-24" />
          <div className="blob w-[420px] h-[420px] bg-cyan-800 top-[30%] -right-40 [animation-delay:-6s]" />
          <div className="blob w-[380px] h-[380px] bg-violet-950 -bottom-28 left-[30%] [animation-delay:-12s]" />
        </div>
        {children}
      </body>
    </html>
  );
}
