import type {
  Objectif,
  Niveau,
  DateMode,
  SessionType,
  Profile,
  Session,
  Week,
  Plan,
} from "./schemas";

export type { Objectif, Niveau, DateMode, SessionType, Profile, Session, Week, Plan };

export type ViewMode = "liste" | "calendrier";
export type Screen = "form" | "plan";

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
  fractionne: {
    label: "Fractionné",
    badgeClass: "bg-[oklch(93%_0.09_40)] text-[oklch(45%_0.19_35)]",
  },
  longue: {
    label: "Sortie longue",
    badgeClass: "bg-[oklch(92%_0.07_20)] text-[oklch(45%_0.16_20)]",
  },
  recup: { label: "Récup", badgeClass: "bg-[oklch(92%_0.05_195)] text-[oklch(42%_0.09_195)]" },
  repos: { label: "Repos", badgeClass: "bg-[oklch(93%_0.04_150)] text-[oklch(42%_0.09_150)]" },
};

export const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
