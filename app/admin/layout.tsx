import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel del taller — AV SOLUTIONS",
  description: "Panel de administración de órdenes y cotizaciones de AV SOLUTIONS.",
  // El panel es privado: no debe aparecer en buscadores.
  robots: { index: false, follow: false },
};

export default function LayoutAdmin({ children }: { children: React.ReactNode }) {
  return children;
}
