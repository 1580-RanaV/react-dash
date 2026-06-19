

import { useEffect, useState } from "react";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Greeting({ name = "Rana" }: { name?: string }) {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setGreeting(getGreeting());
    const now = new Date();
    const msToNextHour =
      (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000;
    const t = setTimeout(() => setGreeting(getGreeting()), msToNextHour);
    return () => clearTimeout(t);
  }, []);

  if (!greeting) return null;

  return (
    <h1
      className="text-2xl font-semibold tracking-tight text-stone-800 dark:text-stone-100 select-none"
      style={{ letterSpacing: "-0.02em" }}
    >
      {greeting},{" "}
      <span className="text-blue-500">{name}</span>.
    </h1>
  );
}
