

import { X } from "lucide-react";
import { useEffect, useState } from "react";

export default function SlidingSidebar({
  title,
  description,
  children,
  footer,
  footerBorder = true,
  contentClassName,
  headerActions,
  onClose,
}: {
  title: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode | ((close: () => void) => React.ReactNode);
  footerBorder?: boolean;
  contentClassName?: string;
  headerActions?: React.ReactNode;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function close() {
    setVisible(false);
    window.setTimeout(onClose, 320);
  }

  return (
    <>
      <div
        className="absolute inset-0 z-20 bg-black/20 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={close}
      />

      <aside
        className="absolute bottom-0 right-0 top-0 z-30 flex flex-col w-[70vw] sm:w-[54%] sm:max-w-115"
        style={{
          background: "var(--content-bg)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "-10px 0 34px rgba(0,0,0,0.1)",
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.34s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div className="shrink-0 px-5 pb-4 pt-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {typeof title === "string"
                ? <h2 className="mb-1 text-lg font-bold text-stone-900 dark:text-stone-100">{title}</h2>
                : title}
              {description ? <p className="text-sm leading-5 text-stone-500 dark:text-stone-400">{description}</p> : null}
            </div>
            {headerActions && (
              <div className="mt-0.5 flex shrink-0 items-center gap-1">{headerActions}</div>
            )}
            <button
              onClick={close}
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 shadow-sm transition-colors hover:bg-stone-50 hover:text-stone-800 dark:border-white/10 dark:bg-white/6 dark:text-stone-300 dark:hover:bg-white/10 dark:hover:text-stone-100"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto ${contentClassName ?? "px-5 pb-5"}`}>{children}</div>

        {footer ? (
          <div className="flex shrink-0 items-center justify-end gap-3 px-5 py-4">
            {typeof footer === "function" ? footer(close) : footer}
          </div>
        ) : null}
      </aside>
    </>
  );
}
