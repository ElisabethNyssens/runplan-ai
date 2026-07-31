export type Objectif = "5km" | "10km" | "semi" | "marathon" | "reprise";
export type Niveau = "debutant" | "intermediaire" | "confirme";
export type DateMode = "semaines" | "date";
export type ViewMode = "liste" | "calendrier";
export type SessionType = "footing" | "fractionne" | "longue" | "recup" | "repos";
export type Screen = "form" | "plan";

export interface Profile {
  objectif: Objectif;
  niveau: Niveau;
  seances: number;
  dateMode: DateMode;
  semaines: number;
  dateValue: string;
  contraintes: string;
}

export interface Session {
  id: string;
  day: number;
  type: SessionType;
  title: string;
  meta: string;
  description: string;
}

export interface Week {
  number: number;
  sessions: Session[];
}

export interface Plan {
  weeks: Week[];
}

export const OBJECTIF_OPTIONS: { value: Objectif; label: string }[] = [
  { value: "5km", label: "5 km" },
  { value: "10km", label: "10 km" },
  { value: "semi", label: "Semi-marathon" },
  { value: "marathon", label: "Marathon" },
  { value: "reprise", label: "Reprise en douceur" },
];

export const NIVEAU_OPTIONS: { value: Niveau; label: string }[] = [
  { value: "debutant", label: "Débutant" },
  { value: "intermediaire", label: "Intermédiaire" },
  { value: "confirme", label: "Confirmé" },
];

export const OBJECTIF_LABELS: Record<Objectif, string> = Object.fromEntries(
  OBJECTIF_OPTIONS.map((o) => [o.value, o.label]),
) as Record<Objectif, string>;

export const NIVEAU_LABELS: Record<Niveau, string> = Object.fromEntries(
  NIVEAU_OPTIONS.map((o) => [o.value, o.label]),
) as Record<Niveau, string>;

export const TYPE_STYLES: Record<SessionType, { label: string; badgeClass: string }> = {
  footing: { label: "Footing", badgeClass: "bg-[oklch(92%_0.03_250)] text-[oklch(38%_0.06_250)]" },
  fractionne: { label: "Fractionné", badgeClass: "bg-[oklch(93%_0.09_40)] text-[oklch(45%_0.19_35)]" },
  longue: { label: "Sortie longue", badgeClass: "bg-[oklch(92%_0.07_20)] text-[oklch(45%_0.16_20)]" },
  recup: { label: "Récup", badgeClass: "bg-[oklch(92%_0.05_195)] text-[oklch(42%_0.09_195)]" },
  repos: { label: "Repos", badgeClass: "bg-[oklch(93%_0.04_150)] text-[oklch(42%_0.09_150)]" },
};

export const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

// Mock plan — swap the body of generatePlan() for a real API call later.
// Structure kept identical (weeks -> sessions) so the UI never needs to change.
export const MOCK_WEEKS: Week[] = [
  {
    number: 1,
    sessions: [
      { id: "w1-1", day: 0, type: "footing", title: "Footing tranquille", meta: "30 min", description: "Course facile pour lancer la semaine, allure conversationnelle." },
      { id: "w1-2", day: 2, type: "fractionne", title: "Fractionné 6x400m", meta: "6 x 400 m", description: "6 x 400 m à allure vive, 1min30 de récupération entre chaque." },
      { id: "w1-3", day: 5, type: "longue", title: "Sortie longue", meta: "8 km", description: "Sortie longue à allure modérée, pense à bien t'hydrater." },
    ],
  },
  {
    number: 2,
    sessions: [
      { id: "w2-1", day: 0, type: "footing", title: "Footing tranquille", meta: "35 min", description: "Allure facile, concentre-toi sur ta foulée." },
      { id: "w2-2", day: 2, type: "fractionne", title: "Fractionné 8x400m", meta: "8 x 400 m", description: "8 x 400 m à allure vive, 1min15 de récupération entre chaque." },
      { id: "w2-3", day: 5, type: "longue", title: "Sortie longue", meta: "9 km", description: "Légère progression, garde une allure régulière du début à la fin." },
    ],
  },
  {
    number: 3,
    sessions: [
      { id: "w3-1", day: 0, type: "footing", title: "Footing tranquille", meta: "35 min", description: "Semaine la plus chargée du plan, reste à l'écoute de tes sensations." },
      { id: "w3-2", day: 3, type: "fractionne", title: "Fractionné 10x300m", meta: "10 x 300 m", description: "10 x 300 m soutenu, 1min de récupération entre chaque." },
      { id: "w3-3", day: 5, type: "longue", title: "Sortie longue", meta: "10 km", description: "Pic de distance du plan avant la phase d'affûtage." },
    ],
  },
  {
    number: 4,
    sessions: [
      { id: "w4-1", day: 0, type: "recup", title: "Footing de récupération", meta: "25 min", description: "Très facile, l'objectif est de relâcher les jambes." },
      { id: "w4-2", day: 2, type: "fractionne", title: "Fractionné léger 5x400m", meta: "5 x 400 m", description: "Volume réduit pour rester affûté sans fatigue supplémentaire." },
      { id: "w4-3", day: 5, type: "longue", title: "Sortie affûtage", meta: "6 km", description: "Sortie courte et fluide, tu es prêt pour l'objectif." },
    ],
  },
];

export async function generatePlan(_profile: Profile): Promise<Plan> {
  return { weeks: MOCK_WEEKS };
}
