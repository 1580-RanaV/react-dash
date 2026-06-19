

import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const CLS =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 shadow-sm transition-colors hover:bg-stone-50 dark:border-stone-700 dark:bg-white/5 dark:text-stone-400 dark:hover:bg-white/10";

export default function BackButton({
  href,
  onClick,
}: {
  href?: string;
  onClick?: () => void;
}) {
  if (href) {
    return (
      <Link to={href} className={CLS}>
        <ChevronLeft size={15} />
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={CLS}>
      <ChevronLeft size={15} />
    </button>
  );
}
