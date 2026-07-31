import type { Screen } from "./types";

function NavButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "flex-1 rounded-[9px] border-none px-4 py-2.5 text-sm font-semibold transition-colors",
        active
          ? "bg-white text-[oklch(22%_0.02_50)] shadow-[0_1px_3px_oklch(0%_0_0/0.08)]"
          : "bg-transparent text-[oklch(45%_0.02_50)]",
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export function Header({
  screen,
  hasPlan,
  onGoToForm,
  onGoToPlan,
}: {
  screen: Screen;
  hasPlan: boolean;
  onGoToForm: () => void;
  onGoToPlan: () => void;
}) {
  return (
    <div className="sticky top-0 z-10 border-b border-[oklch(90%_0.01_60)] bg-[oklch(97%_0.015_60)]">
      <div className="mx-auto flex max-w-[1000px] flex-wrap items-center justify-between gap-3.5 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[oklch(62%_0.19_35)]">
            <span className="font-['Space_Grotesk'] text-[15px] font-bold text-white">R</span>
          </div>
          <span className="font-['Space_Grotesk'] text-[17px] font-bold tracking-[-0.01em]">RunPlan AI</span>
        </div>
        <div className="flex gap-0.5 rounded-xl bg-[oklch(93%_0.01_60)] p-1">
          <NavButton label="Profil" active={screen === "form"} onClick={onGoToForm} />
          <NavButton
            label="Plan"
            active={screen === "plan"}
            disabled={!hasPlan}
            onClick={onGoToPlan}
          />
        </div>
      </div>
    </div>
  );
}
