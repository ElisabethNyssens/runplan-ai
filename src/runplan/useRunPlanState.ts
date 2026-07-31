import { useEffect, useMemo, useState } from "react";
import { generatePlan } from "./api";
import {
  type DateMode,
  type Niveau,
  type Objectif,
  type Plan,
  type Screen,
  type ViewMode,
  type Week,
} from "./types";

const STORAGE_KEY = "runplan_ai_state_v1";

interface PersistedState {
  screen: Screen;
  objectif: Objectif;
  niveau: Niveau;
  seances: number;
  dateMode: DateMode;
  semaines: number;
  dateValue: string;
  contraintes: string;
  viewMode: ViewMode;
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
  viewMode: "liste",
  completed: [],
  plan: null,
  hasPlan: false,
};

function loadPersistedState(): Partial<PersistedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistState(state: RunPlanState) {
  const {
    screen,
    objectif,
    niveau,
    seances,
    dateMode,
    semaines,
    dateValue,
    contraintes,
    viewMode,
    completed,
    hasPlan,
  } = state;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        screen,
        objectif,
        niveau,
        seances,
        dateMode,
        semaines,
        dateValue,
        contraintes,
        viewMode,
        completed,
        hasPlan,
      }),
    );
  } catch {
    // localStorage unavailable (private mode, quota) — state just won't survive a reload.
  }
}

export function useRunPlanState() {
  const [state, setState] = useState<RunPlanState>(() => ({
    ...initialState,
    ...loadPersistedState(),
  }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    persistState(state);
  }, [state]);

  async function handleSubmit() {
    const { objectif, niveau, seances, dateMode, semaines, dateValue, contraintes } = state;
    setSubmitting(true);
    setError(null);
    try {
      const plan = await generatePlan({
        objectif,
        niveau,
        seances,
        dateMode,
        semaines,
        dateValue,
        contraintes,
      });
      setState((s) => ({ ...s, screen: "plan", plan, hasPlan: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  function toggleSession(id: string) {
    setState((s) => ({
      ...s,
      completed: s.completed.includes(id)
        ? s.completed.filter((x) => x !== id)
        : [...s.completed, id],
    }));
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
    viewMode: state.viewMode,
    setViewMode: (viewMode: ViewMode) => setState((s) => ({ ...s, viewMode })),

    error,
  };
}

export type RunPlanApi = ReturnType<typeof useRunPlanState>;
