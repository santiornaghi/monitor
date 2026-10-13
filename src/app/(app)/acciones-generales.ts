"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function elegirOrg(formData: FormData) {
  (await cookies()).set("org", String(formData.get("org") ?? "todas"), { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/", "layout");
}
