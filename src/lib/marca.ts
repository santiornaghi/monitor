// Nombres comerciales en un solo lugar.
export const MARCA = "QR"; // software de mantenimiento (antes Monitor)
export const GRUPO = process.env.NEXT_PUBLIC_MARCA_GRUPO || "NAYA LAB"; // marca paraguas
export const TURNERO = "Turnero"; // nombre del producto de turnos
export const EQUIPOS_LINEA = "Equipos"; // venta de equipamiento
/** Nombre completo del software de mantenimiento, para contextos sin la marca al lado (emails, pestaña del navegador). */
export const MARCA_COMPLETA = `${MARCA} de NAYA LAB`;

// Contacto comercial (cargar en Vercel).
export const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || "5493584390961"; // solo dígitos: 54 + 9 + característica + número

export function enlaceWhatsApp(texto: string) {
  return WHATSAPP ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}` : "";
}
