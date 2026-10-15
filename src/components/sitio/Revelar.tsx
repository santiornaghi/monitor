"use client";

import { useEffect, useRef, useState } from "react";

/** Texto grande que se va "encendiendo" palabra por palabra a medida que se baja. */
export function TextoRevelado({ texto, className }: { texto: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const palabras = texto.split(" ");
  const [encendidas, setEncendidas] = useState(palabras.length);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const calcular = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (r.height + vh * 0.3)));
      setEncendidas(Math.round(p * palabras.length));
    };
    calcular();
    window.addEventListener("scroll", calcular, { passive: true });
    window.addEventListener("resize", calcular);
    return () => {
      window.removeEventListener("scroll", calcular);
      window.removeEventListener("resize", calcular);
    };
  }, [palabras.length]);

  return (
    <p ref={ref} className={className} aria-label={texto}>
      {palabras.map((w, i) => (
        <span key={i} aria-hidden="true" className={i < encendidas ? "on" : undefined}>{w} </span>
      ))}
    </p>
  );
}

/** Barra fija abajo que aparece cuando el elemento #id sale de pantalla. */
export function BarraFija({ despuesDe, children }: { despuesDe: string; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = document.getElementById(despuesDe);
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, [despuesDe]);
  return <div className={visible ? "mon-barra visible" : "mon-barra"} aria-hidden={!visible}>{children}</div>;
}
