import { z } from "zod";

export const ObjectifSchema = z.enum(["5km", "10km", "semi", "marathon", "reprise"]);
export const NiveauSchema = z.enum(["debutant", "intermediaire", "confirme"]);
export const DateModeSchema = z.enum(["semaines", "date"]);
export const SessionTypeSchema = z.enum(["footing", "fractionne", "longue", "recup", "repos"]);

export const ProfileSchema = z.object({
  objectif: ObjectifSchema,
  niveau: NiveauSchema,
  seances: z.number().int().min(2).max(6),
  dateMode: DateModeSchema,
  semaines: z.number().int().min(1).max(24),
  dateValue: z.string(),
  contraintes: z.string(),
});
export type Profile = z.infer<typeof ProfileSchema>;

export const SessionSchema = z.object({
  id: z.string(),
  day: z.number().int().min(0).max(6),
  type: SessionTypeSchema,
  title: z.string(),
  meta: z.string(),
  description: z.string(),
});
export type Session = z.infer<typeof SessionSchema>;

export const WeekSchema = z.object({
  number: z.number().int(),
  sessions: z.array(SessionSchema),
});
export type Week = z.infer<typeof WeekSchema>;

export const PlanSchema = z.object({
  weeks: z.array(WeekSchema),
});
export type Plan = z.infer<typeof PlanSchema>;

export type Objectif = z.infer<typeof ObjectifSchema>;
export type Niveau = z.infer<typeof NiveauSchema>;
export type DateMode = z.infer<typeof DateModeSchema>;
export type SessionType = z.infer<typeof SessionTypeSchema>;
