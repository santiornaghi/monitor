import QRCode from "qrcode";

export function urlQR(token: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}/q/${token}`;
}

export async function svgQR(token: string) {
  return QRCode.toString(urlQR(token), { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#14242b", light: "#ffffff" } });
}
