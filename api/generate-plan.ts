import { GoogleGenAI } from "@google/genai";
import * as z from "zod";
import { PlanSchema, type Profile, ProfileSchema } from "../src/runplan/schemas.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const OBJECTIF_TEXT: Record<Profile["objectif"], string> = {
  "5km": "un 5 km",
  "10km": "un 10 km",
  semi: "un semi-marathon",
  marathon: "un marathon",
  reprise: "une reprise en douceur",
};

const NIVEAU_TEXT: Record<Profile["niveau"], string> = {
  debutant: "débutant",
  intermediaire: "intermédiaire",
  confirme: "confirmé",
};

function buildPrompt(profile: Profile): string {
  const echeance =
    profile.dateMode === "semaines"
      ? `sur ${profile.semaines} semaines`
      : `d'ici le ${profile.dateValue}`;
  const contraintes = profile.contraintes.trim()
    ? `Contraintes à prendre en compte : ${profile.contraintes.trim()}.`
    : "";

  return `Tu es un coach de course à pied. Génère un plan d'entraînement personnalisé
pour un coureur ${NIVEAU_TEXT[profile.niveau]} qui prépare ${OBJECTIF_TEXT[profile.objectif]},
à raison de ${profile.seances} séances par semaine, ${echeance}. ${contraintes}

Règles :
- Une semaine = un objet avec "number" (1, 2, 3...) et "sessions" (${profile.seances} séances par semaine).
- Chaque séance a : "id" (string unique), "day" (0 = lundi ... 6 = dimanche), "type"
  (uniquement "footing", "fractionne", "longue", "recup" ou "repos"), "title",
  "meta" (ex. "30 min" ou "6 x 400 m"), "description" (1-2 phrases, en français).
- Adapte le volume et l'intensité au niveau et à l'objectif, avec une progression
  cohérente semaine après semaine.

Réponds uniquement avec un JSON valide de cette forme, sans texte autour :
{ "weeks": [ { "number": 1, "sessions": [ { "id": "w1-1", "day": 0, "type": "footing",
"title": "...", "meta": "...", "description": "..." } ] } ] }`;
}

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const interaction = await ai.interactions.create({
    model: "gemini-3.6-flash",
    input: buildPrompt(ProfileSchema.parse(body)),
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: z.toJSONSchema(PlanSchema),
    },
  });
  if (!interaction.output_text) {
    return Response.json({ error: "Empty response from model" }, { status: 502 });
  }
  try {
    return Response.json(PlanSchema.parse(JSON.parse(interaction.output_text)));
  } catch (err) {
    return Response.json(
      {
        error: "Invalid response from model",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}
