// Nombres comerciales en un solo lugar.
export const MARCA = "Monitor"; // software de mantenimiento
export const GRUPO = process.env.NEXT_PUBLIC_MARCA_GRUPO || "Ornaghi Tecnología Médica"; // marca paraguas (provisoria)
export const TURNERO = "Turnero"; // nombre del producto de turnos (provisorio)

// Contacto comercial (cargar en Vercel).
export const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || "5493584390961"; // solo dígitos: 54 + 9 + característica + número

export function enlaceWhatsApp(texto: string) {
  return WHATSAPP ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}` : "";
}
