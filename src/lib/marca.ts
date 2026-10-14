// Nombres comerciales en un solo lugar.
export const MARCA = "Monitor"; // software de mantenimiento
export const GRUPO = process.env.NEXT_PUBLIC_MARCA_GRUPO || "Ornaghi Tecnología Médica"; // marca paraguas (provisoria)
export const TURNERO = "Turnero"; // nombre del producto de turnos (provisorio)

// Contacto comercial (cargar en Vercel).
export const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? ""; // solo dígitos, con código de país: 5493584123456

export function enlaceWhatsApp(texto: string) {
  return WHATSAPP ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}` : "";
}
