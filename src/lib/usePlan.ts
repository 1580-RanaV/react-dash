import { useState, useEffect } from "react";

export type Plan = "free" | "pro" | "org" | "enterprise" | "error";

export const PLAN_LIMITS: Record<Plan, number> = {
  free: 10,
  pro: 30,
  org: 60,
  enterprise: Infinity,
  error: Infinity,
};

export const PLAN_LABELS: Record<Plan, string> = {
  free: "Free",
  pro: "Pro",
  org: "Org",
  enterprise: "Enterprise",
  error: "Error",
};

const PLAN_KEY = "intempt:plan";
const PLAN_EV  = "intempt:plan-change";

function readPlan(): Plan {
  const saved = localStorage.getItem(PLAN_KEY);
  return (saved as Plan) ?? "free";
}

export function usePlan() {
  const [plan, setPlanState] = useState<Plan>(readPlan);

  useEffect(() => {
    function sync() { setPlanState(readPlan()); }
    window.addEventListener(PLAN_EV, sync);
    return () => window.removeEventListener(PLAN_EV, sync);
  }, []);

  function setPlan(p: Plan) {
    localStorage.setItem(PLAN_KEY, p);
    window.dispatchEvent(new Event(PLAN_EV));
  }

  return { plan, setPlan, limit: PLAN_LIMITS[plan] };
}
