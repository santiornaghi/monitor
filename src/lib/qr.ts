import QRCode from "qrcode";

/**
 * URL pública de la app, que va dentro de los QR. Prioridad:
 * 1. SITE_URL: dominio propio, cuando exista (por ejemplo https://app.monitor.com.ar)
 * 2. VERCEL_PROJECT_PRODUCTION_URL: dominio de producción que Vercel informa solo
 * 3. NEXT_PUBLIC_SITE_URL o localhost, para desarrollo
 */
export function baseURL() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function urlQR(token: string) {
  return `${baseURL()}/q/${token}`;
}

export async function svgQR(token: string) {
  return QRCode.toString(urlQR(token), { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#14242b", light: "#ffffff" } });
}
