import type { MetadataRoute } from "next";
import { EQUIPOS } from "@/lib/catalogo";
import { baseURL } from "@/lib/qr";

export default function sitemap(): MetadataRoute.Sitemap {
  const b = baseURL();
  const paginas = ["/inicio", "/catalogo", "/presentacion", "/turnero", "/contacto"].map((p) => ({ url: `${b}${p}`, changeFrequency: "weekly" as const, priority: p === "/inicio" ? 1 : 0.8 }));
  const equipos = EQUIPOS.map((e) => ({ url: `${b}/catalogo/${e.slug}`, changeFrequency: "monthly" as const, priority: 0.6 }));
  return [...paginas, ...equipos];
}
