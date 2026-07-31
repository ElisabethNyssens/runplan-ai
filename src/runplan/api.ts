import { PlanSchema } from "./schemas";
import { type Plan, type Profile } from "./types";

export async function generatePlan(profile: Profile): Promise<Plan> {
  const res = await fetch("/api/generate-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Erreur ${res.status}`);
  }
  return PlanSchema.parse(await res.json());
}
