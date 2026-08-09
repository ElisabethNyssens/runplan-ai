import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { generatePlan } from "./api";
import {
  type DateMode,
  type Niveau,
  type Objectif,
  type Plan,
  type Screen,
  type SessionType,
  type ViewMode,
  type Week,
} from "./types";

const OBJECTIF_TO_DB: Record<Objectif, string> = {
  "5km": "5k",
  "10km": "10k",
  semi: "half_marathon",
  marathon: "marathon",
  reprise: "return_to_running",
};

const NIVEAU_TO_DB: Record<Niveau, string> = {
  debutant: "beginner",
  intermediaire: "intermediate",
  confirme: "advanced",
};

const SESSIONTYPE_TO_DB: Record<SessionType, string> = {
  footing: "easy_run",
  fractionne: "intervals",
  longue: "long_run",
  recup: "recovery",
  repos: "rest",
};

const DB_TO_OBJECTIF = Object.fromEntries(
  Object.entries(OBJECTIF_TO_DB).map(([front, db]) => [db, front]),
) as Record<string, Objectif>;

const DB_TO_NIVEAU = Object.fromEntries(
  Object.entries(NIVEAU_TO_DB).map(([front, db]) => [db, front]),
) as Record<string, Niveau>;

const DB_TO_SESSIONTYPE = Object.fromEntries(
  Object.entries(SESSIONTYPE_TO_DB).map(([front, db]) => [db, front]),
) as Record<string, SessionType>;

interface SessionRow {
  id: string;
  week_number: number;
  day: number;
  type: string;
  title: string;
  meta: string;
  description: string;
  completed: boolean;
}

interface PersistedState {
  screen: Screen;
  objectif: Objectif;
  niveau: Niveau;
  seances: number;
  dateMode: DateMode;
  semaines: number;
  dateValue: string;
  contraintes: string;
  completed: string[];
  hasPlan: boolean;
}

interface RunPlanState extends PersistedState {
  plan: Plan | null;
}

const initialState: RunPlanState = {
  screen: "form",
  objectif: "10km",
  niveau: "intermediaire",
  seances: 3,
  dateMode: "semaines",
  semaines: 8,
  dateValue: "",
  contraintes: "",
  completed: [],
  plan: null,
  hasPlan: false,
};

const VIEW_MODE_STORAGE_KEY = "runplan_view_mode";

function loadViewMode(): ViewMode {
  try {
    const raw = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return raw === "liste" || raw === "calendrier" ? raw : "liste";
  } catch {
    return "liste";
  }
}

export function useRunPlanState() {
  const [state, setState] = useState<RunPlanState>(initialState);
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewModeState] = useState<ViewMode>(loadViewMode);

  function setViewMode(viewMode: ViewMode) {
    setViewModeState(viewMode);
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
    } catch {
      // localStorage unavailable (private mode, quota) — viewMode just won't survive a reload.
    }
  }

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession();
      let session = data.session;

      if (!session) {
        const { data: signInData } = await supabase.auth.signInAnonymously();
        session = signInData.session;
      }
      if (!session) return;

      setUserId(session.user.id);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileData) {
        setState((s) => ({
          ...s,
          objectif: DB_TO_OBJECTIF[profileData.objective],
          niveau: DB_TO_NIVEAU[profileData.level],
          seances: profileData.sessions_per_week,
          dateMode: profileData.date_mode === "weeks" ? "semaines" : "date",
          semaines: profileData.weeks ?? s.semaines,
          dateValue: profileData.target_date ?? "",
          contraintes: profileData.constraints ?? "",
        }));
      }

      const { data: planData } = await supabase
        .from("plans")
        .select("*, sessions(*)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (planData) {
        const sessionRows = planData.sessions as SessionRow[];

        const weeksByNumber = new Map<number, Week>();
        for (const row of sessionRows) {
          if (!weeksByNumber.has(row.week_number)) {
            weeksByNumber.set(row.week_number, { number: row.week_number, sessions: [] });
          }
          weeksByNumber.get(row.week_number)!.sessions.push({
            id: row.id,
            day: row.day,
            type: DB_TO_SESSIONTYPE[row.type],
            title: row.title,
            meta: row.meta,
            description: row.description,
          });
        }
        const weeks = [...weeksByNumber.values()].sort((a, b) => a.number - b.number);
        const completedIds = sessionRows.filter((row) => row.completed).map((row) => row.id);

        setState((s) => ({
          ...s,
          plan: { weeks },
          hasPlan: true,
          completed: completedIds,
        }));
      }
    }

    init();
  }, []);

  async function handleSubmit() {
    const { objectif, niveau, seances, dateMode, semaines, dateValue, contraintes } = state;
    setSubmitting(true);
    setError(null);
    try {
      if (!userId) throw new Error("No authenticated user.");

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          objective: OBJECTIF_TO_DB[objectif],
          level: NIVEAU_TO_DB[niveau],
          sessions_per_week: seances,
          date_mode: dateMode === "semaines" ? "weeks" : "date",
          weeks: dateMode === "semaines" ? semaines : null,
          target_date: dateMode === "date" && dateValue ? dateValue : null,
          constraints: contraintes,
        })
        .select();
      if (profileError) throw profileError;

      const plan = await generatePlan({
        objectif,
        niveau,
        seances,
        dateMode,
        semaines,
        dateValue,
        contraintes,
      });

      const { data: newPlan, error: planError } = await supabase
        .from("plans")
        .insert({ user_id: userId })
        .select()
        .single();
      if (planError) throw planError;

      const sessionRows = plan.weeks.flatMap((week) =>
        week.sessions.map((session) => ({
          plan_id: newPlan.id,
          week_number: week.number,
          day: session.day,
          type: SESSIONTYPE_TO_DB[session.type],
          title: session.title,
          meta: session.meta,
          description: session.description,
        })),
      );

      const { error: sessionsError } = await supabase.from("sessions").insert(sessionRows);
      if (sessionsError) throw sessionsError;

      setState((s) => ({ ...s, screen: "plan", plan, hasPlan: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  function toggleSession(id: string) {
    const nowCompleted = !state.completed.includes(id);

    setState((s) => ({
      ...s,
      completed: nowCompleted ? [...s.completed, id] : s.completed.filter((x) => x !== id),
    }));

    supabase
      .from("sessions")
      .update({ completed: nowCompleted })
      .eq("id", id)
      .then(({ error }) => {
        if (error) console.error("Failed to update session completion:", error);
      });
  }

  const weeks: Week[] = state.plan?.weeks ?? [];
  const completed = useMemo(() => new Set(state.completed), [state.completed]);

  return {
    screen: state.screen,
    goToForm: () => setState((s) => ({ ...s, screen: "form" })),
    goToPlan: () => setState((s) => (s.hasPlan ? { ...s, screen: "plan" } : s)),
    hasPlan: state.hasPlan,

    objectif: state.objectif,
    setObjectif: (objectif: Objectif) => setState((s) => ({ ...s, objectif })),
    niveau: state.niveau,
    setNiveau: (niveau: Niveau) => setState((s) => ({ ...s, niveau })),
    seances: state.seances,
    incSeances: () => setState((s) => ({ ...s, seances: Math.min(6, s.seances + 1) })),
    decSeances: () => setState((s) => ({ ...s, seances: Math.max(2, s.seances - 1) })),
    dateMode: state.dateMode,
    setDateMode: (dateMode: DateMode) => setState((s) => ({ ...s, dateMode })),
    semaines: state.semaines,
    incSemaines: () => setState((s) => ({ ...s, semaines: Math.min(24, s.semaines + 1) })),
    decSemaines: () => setState((s) => ({ ...s, semaines: Math.max(1, s.semaines - 1) })),
    dateValue: state.dateValue,
    setDateValue: (dateValue: string) => setState((s) => ({ ...s, dateValue })),
    contraintes: state.contraintes,
    setContraintes: (contraintes: string) => setState((s) => ({ ...s, contraintes })),
    submitting,
    handleSubmit,

    weeks,
    completed,
    toggleSession,
    viewMode,
    setViewMode,

    error,
  };
}

export type RunPlanApi = ReturnType<typeof useRunPlanState>;
