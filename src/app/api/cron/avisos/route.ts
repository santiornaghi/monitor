import { enviarResumenes } from "@/lib/resumen";

// Vercel Cron llama a esta ruta (ver vercel.json) con el encabezado Authorization: Bearer <CRON_SECRET>.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto || request.headers.get("authorization") !== `Bearer ${secreto}`) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const r = await enviarResumenes();
  return Response.json(r);
}
