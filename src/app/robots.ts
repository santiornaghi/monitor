import type { MetadataRoute } from "next";
import { baseURL } from "@/lib/qr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/inicio", "/catalogo", "/presentacion", "/turnero", "/contacto", "/img/"], disallow: ["/q/", "/invitacion/", "/api/", "/login", "/auth/"] }],
    sitemap: `${baseURL()}/sitemap.xml`,
  };
}
