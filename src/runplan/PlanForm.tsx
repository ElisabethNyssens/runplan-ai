import { OBJECTIF_OPTIONS, NIVEAU_OPTIONS } from "./types";
import type { RunPlanApi } from "./useRunPlanState";

function Section({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 font-['Space_Grotesk'] text-[13px] font-bold tracking-[0.06em] text-[oklch(45%_0.02_50)] uppercase">
        {index} · {title}
      </div>
      {children}
    </section>
  );
}

function Pill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "cursor-pointer rounded-full border px-[18px] py-[11px] text-[15px] font-semibold transition-all",
        selected
          ? "border-[oklch(62%_0.19_35)] bg-[oklch(62%_0.19_35)] text-white"
          : "border-[oklch(88%_0.01_60)] bg-white text-[oklch(22%_0.02_50)] hover:border-[oklch(70%_0.05_40)] hover:bg-[oklch(96%_0.01_60)]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function Stepper({
  value,
  unit,
  onInc,
  onDec,
}: {
  value: number;
  unit: string;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={onDec}
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[oklch(88%_0.01_60)] bg-white text-xl font-semibold text-[oklch(22%_0.02_50)]"
      >
        −
      </button>
      <div className="min-w-[38px] text-center font-['Space_Grotesk'] text-[26px] font-bold">
        {value}
      </div>
      <button
        type="button"
        onClick={onInc}
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[oklch(88%_0.01_60)] bg-white text-xl font-semibold text-[oklch(22%_0.02_50)]"
      >
        +
      </button>
      <span className="text-[15px] text-[oklch(45%_0.02_50)]">{unit}</span>
    </div>
  );
}

export function PlanForm({ api }: { api: RunPlanApi }) {
  return (
    <div className="mx-auto max-w-[640px] px-5 pt-9 pb-[100px]">
      <header className="mb-10">
        <h1 className="mb-2.5 font-['Space_Grotesk'] text-[38px] leading-[1.12] font-bold tracking-[-0.01em]">
          Ton plan de course, généré pour toi.
        </h1>
        <p className="text-base text-[oklch(45%_0.02_50)]">
          Réponds à quelques questions, on s'occupe du reste.
        </p>
      </header>

      <div className="flex flex-col gap-8">
        <Section index="01" title="Objectif">
          <div className="flex flex-wrap gap-2.5">
            {OBJECTIF_OPTIONS.map((opt) => (
              <Pill
                key={opt.value}
                label={opt.label}
                selected={api.objectif === opt.value}
                onClick={() => api.setObjectif(opt.value)}
              />
            ))}
          </div>
        </Section>

        <Section index="02" title="Niveau actuel">
          <div className="flex flex-wrap gap-2.5">
            {NIVEAU_OPTIONS.map((opt) => (
              <Pill
                key={opt.value}
                label={opt.label}
                selected={api.niveau === opt.value}
                onClick={() => api.setNiveau(opt.value)}
              />
            ))}
          </div>
        </Section>

        <Section index="03" title="Séances par semaine">
          <Stepper
            value={api.seances}
            unit="séances / semaine"
            onInc={api.incSeances}
            onDec={api.decSeances}
          />
        </Section>

        <Section index="04" title="Échéance">
          <div className="mb-3.5 flex gap-2.5">
            <Pill
              label="Nombre de semaines"
              selected={api.dateMode === "semaines"}
              onClick={() => api.setDateMode("semaines")}
            />
            <Pill
              label="Date précise"
              selected={api.dateMode === "date"}
              onClick={() => api.setDateMode("date")}
            />
          </div>
          {api.dateMode === "semaines" ? (
            <Stepper
              value={api.semaines}
              unit="semaines"
              onInc={api.incSemaines}
              onDec={api.decSemaines}
            />
          ) : (
            <input
              type="date"
              value={api.dateValue}
              onChange={(e) => api.setDateValue(e.target.value)}
              className="rounded-xl border border-[oklch(88%_0.01_60)] bg-white px-3.5 py-3 text-base text-[oklch(22%_0.02_50)]"
            />
          )}
        </Section>

        <Section index="05" title="Contraintes (optionnel)">
          <textarea
            placeholder="Ex. petite douleur au genou, indisponible le mardi..."
            value={api.contraintes}
            onChange={(e) => api.setContraintes(e.target.value)}
            className="min-h-[88px] w-full resize-y rounded-xl border border-[oklch(88%_0.01_60)] bg-white p-3.5 text-[15px] text-[oklch(22%_0.02_50)]"
          />
        </Section>

        <button
          type="button"
          onClick={api.handleSubmit}
          disabled={api.submitting}
          className="mt-2 cursor-pointer rounded-[14px] border-none bg-[oklch(62%_0.19_35)] p-[17px] font-['Space_Grotesk'] text-[17px] font-bold tracking-[-0.01em] text-white transition-colors hover:bg-[oklch(56%_0.19_35)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {api.submitting ? "Génération..." : "Générer mon plan"}
        </button>
      </div>
    </div>
  );
}
