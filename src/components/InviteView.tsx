import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function InviteView() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const orgName = params.get("org") ?? "Linea";
  const email = params.get("email");

  return (
    <main className="min-h-screen flex items-center px-6 sm:px-12" style={{ background: "var(--page)" }}>
      <div className="w-full max-w-md mx-auto sm:mx-0 sm:ml-[8vw]">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-stone-950 dark:text-stone-50">
          You've been invited to join
          <br />
          <span style={{ color: "var(--primary)" }}>{orgName}</span>
        </h1>

        <p className="mt-4 text-base leading-relaxed text-stone-500 dark:text-stone-400">
          Joining gives you access to {orgName}'s dashboards, journeys, and analytics
          {email ? ` as ${email}` : ""}.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => navigate("/home")}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ background: "var(--primary)" }}
          >
            Create Account & Join
            <ArrowRight size={16} />
          </button>

          <button
            onClick={() => navigate("/home")}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-white text-sm font-semibold text-stone-800 shadow-sm transition-colors hover:bg-stone-50 dark:bg-white/6 dark:text-stone-100 dark:hover:bg-white/10"
            style={{ border: "1px solid var(--border)" }}
          >
            Sign In to Join
          </button>
        </div>
      </div>
    </main>
  );
}
