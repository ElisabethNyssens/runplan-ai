import { useEffect } from "react";
import { Header } from "./runplan/Header";
import { PlanForm } from "./runplan/PlanForm";
import { PlanView } from "./runplan/PlanView";
import { useRunPlanState } from "./runplan/useRunPlanState";

function App() {
  const api = useRunPlanState();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [api.screen]);

  return (
    <div className="min-h-screen bg-[oklch(97%_0.015_60)] font-['Inter'] text-[oklch(22%_0.02_50)]">
      <Header screen={api.screen} hasPlan={api.hasPlan} onGoToForm={api.goToForm} onGoToPlan={api.goToPlan} />
      {api.screen === "form" ? <PlanForm api={api} /> : <PlanView api={api} />}
    </div>
  );
}

export default App;
