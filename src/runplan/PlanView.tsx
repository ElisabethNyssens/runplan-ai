import { useMemo } from "react";
import { DAY_NAMES, OBJECTIF_LABELS, NIVEAU_LABELS, TYPE_STYLES, type Session, type Week } from "./types";
import type { RunPlanApi } from "./useRunPlanState";

function CheckToggle({
  done,
  small,
  onClick,
}: {
  done: boolean;
  small?: boolean;
  onClick: () => void;
}) {
  const size = small ? "h-[22px] w-[22px] text-[11px]" : "h-[26px] w-[26px] text-sm";
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex shrink-0 cursor-pointer items-center justify-center rounded-full border-2 font-bold leading-none text-white",
        size,
        done ? "border-[oklch(60%_0.14_150)] bg-[oklch(60%_0.14_150)]" : "border-[oklch(85%_0.01_60)] bg-white",
      ].join(" ")}
    >
      {done ? "✓" : small ? "○" : ""}
    </button>
  );
}

function SessionCard({ session, done, onToggle }: { session: Session; done: boolean; onToggle: () => void }) {
  const ts = TYPE_STYLES[session.type];
  return (
    <div
      className="flex flex-col gap-3 rounded-[14px] border border-[oklch(90%_0.01_60)] bg-white p-[18px]"
      style={{ opacity: done ? 0.55 : 1 }}
    >
      <div className="flex items-start justify-between gap-2.5">
        <span className={`rounded-full px-2.5 py-[5px] text-xs font-semibold ${ts.badgeClass}`}>{ts.label}</span>
        <CheckToggle done={done} onClick={onToggle} />
      </div>
      <div
        className={`font-['Space_Grotesk'] text-base font-bold ${done ? "text-[oklch(50%_0.02_50)] line-through" : "text-[oklch(22%_0.02_50)]"}`}
      >
        {session.title}
      </div>
      <div className="text-[13px] font-medium text-[oklch(50%_0.02_50)]">
        {DAY_NAMES[session.day]} · {session.meta}
      </div>
      <div className="text-sm leading-[1.4] text-[oklch(45%_0.02_50)]">{session.description}</div>
    </div>
  );
}

function ListView({ weeks, completed, onToggle }: { weeks: Week[]; completed: Set<string>; onToggle: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-[30px]">
      {weeks.map((week) => (
        <div key={week.number}>
          <div className="mb-3.5 font-['Space_Grotesk'] text-sm font-bold tracking-[0.05em] text-[oklch(45%_0.02_50)] uppercase">
            Semaine {week.number}
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3.5">
            {week.sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                done={completed.has(session.id)}
                onToggle={() => onToggle(session.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CalendarView({ weeks, completed, onToggle }: { weeks: Week[]; completed: Set<string>; onToggle: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-[22px]">
      <div className="grid grid-cols-[70px_repeat(7,1fr)] gap-2">
        <div />
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-xs font-semibold tracking-[0.04em] text-[oklch(45%_0.02_50)] uppercase">
            {d}
          </div>
        ))}
      </div>
      {weeks.map((week) => {
        const sessionsByDay = new Map(week.sessions.map((s) => [s.day, s]));
        return (
          <div key={week.number} className="grid grid-cols-[70px_repeat(7,1fr)] items-stretch gap-2">
            <div className="flex items-center font-['Space_Grotesk'] text-[13px] font-bold text-[oklch(45%_0.02_50)]">
              S{week.number}
            </div>
            {DAY_NAMES.map((_, dayIdx) => {
              const session = sessionsByDay.get(dayIdx);
              if (!session) {
                return <div key={dayIdx} className="min-h-24 rounded-xl bg-[oklch(94%_0.008_60)]" />;
              }
              const done = completed.has(session.id);
              const ts = TYPE_STYLES[session.type];
              return (
                <div
                  key={dayIdx}
                  className="flex min-h-24 flex-col gap-1.5 rounded-xl border border-[oklch(90%_0.01_60)] bg-white p-2.5"
                  style={{ opacity: done ? 0.55 : 1 }}
                >
                  <span className={`self-start rounded-full px-[7px] py-[3px] text-[10px] font-semibold ${ts.badgeClass}`}>
                    {ts.label}
                  </span>
                  <span
                    className={`text-xs leading-[1.25] font-semibold ${done ? "text-[oklch(50%_0.02_50)] line-through" : "text-[oklch(22%_0.02_50)]"}`}
                  >
                    {session.title}
                  </span>
                  <span className="text-[11px] text-[oklch(50%_0.02_50)]">{session.meta}</span>
                  <CheckToggle done={done} small onClick={() => onToggle(session.id)} />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function PlanView({ api }: { api: RunPlanApi }) {
  const { total, done, pct } = useMemo(() => {
    const total = api.weeks.reduce((n, w) => n + w.sessions.length, 0);
    const done = api.weeks.reduce((n, w) => n + w.sessions.filter((s) => api.completed.has(s.id)).length, 0);
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [api.weeks, api.completed]);

  return (
    <div className="mx-auto max-w-[1000px] px-5 pt-9 pb-[100px]">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="mb-1.5 font-['Space_Grotesk'] text-[32px] font-bold tracking-[-0.01em]">
            Ton plan d'entraînement
          </h1>
          <p className="text-[15px] text-[oklch(45%_0.02_50)]">
            {OBJECTIF_LABELS[api.objectif]} · {NIVEAU_LABELS[api.niveau]} · {api.seances} séances/semaine
          </p>
        </div>
        <div className="flex gap-0.5 rounded-xl bg-[oklch(93%_0.01_60)] p-1">
          <button
            type="button"
            onClick={() => api.setViewMode("liste")}
            className={`flex-1 rounded-[9px] border-none px-4 py-2.5 text-sm font-semibold whitespace-nowrap ${api.viewMode === "liste" ? "bg-white text-[oklch(22%_0.02_50)] shadow-[0_1px_3px_oklch(0%_0_0/0.08)]" : "bg-transparent text-[oklch(45%_0.02_50)]"}`}
          >
            Vue liste
          </button>
          <button
            type="button"
            onClick={() => api.setViewMode("calendrier")}
            className={`flex-1 rounded-[9px] border-none px-4 py-2.5 text-sm font-semibold ${api.viewMode === "calendrier" ? "bg-white text-[oklch(22%_0.02_50)] shadow-[0_1px_3px_oklch(0%_0_0/0.08)]" : "bg-transparent text-[oklch(45%_0.02_50)]"}`}
          >
            Vue calendrier
          </button>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-[oklch(90%_0.01_60)] bg-white p-[22px_24px]">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="font-['Space_Grotesk'] text-base font-bold">
            {done}/{total} séances réalisées
          </span>
          <span className="text-sm text-[oklch(45%_0.02_50)]">{pct}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-md bg-[oklch(92%_0.01_60)]">
          <div
            className="h-full rounded-md bg-[oklch(62%_0.19_35)] transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {api.viewMode === "liste" ? (
        <ListView weeks={api.weeks} completed={api.completed} onToggle={api.toggleSession} />
      ) : (
        <CalendarView weeks={api.weeks} completed={api.completed} onToggle={api.toggleSession} />
      )}
    </div>
  );
}
