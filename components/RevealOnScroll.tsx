"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Variante = "arriba" | "izquierda" | "derecha" | "escala";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  variante?: Variante;
};

const CLASE_VARIANTE: Record<Variante, string> = {
  arriba: "scroll-reveal--arriba",
  izquierda: "scroll-reveal--izquierda",
  derecha: "scroll-reveal--derecha",
  escala: "scroll-reveal--escala",
};

export default function RevealOnScroll({
  children,
  className = "",
  delay = 0,
  variante = "arriba",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${CLASE_VARIANTE[variante]} ${visible ? "scroll-reveal--visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
