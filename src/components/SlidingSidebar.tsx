

import { X } from "lucide-react";
import { useEffect, useState } from "react";

export default function SlidingSidebar({
  title,
  description,
  children,
  footer,
  footerBorder = true,
  contentClassName,
  onClose,
}: {
  title: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode | ((close: () => void) => React.ReactNode);
  footerBorder?: boolean;
  contentClassName?: string;
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
        className="absolute bottom-0 right-0 top-0 z-30 flex flex-col"
        style={{
          width: "min(460px, 54%)",
          background: "var(--content-bg)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "-10px 0 34px rgba(0,0,0,0.1)",
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.34s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div className="shrink-0 px-7 pb-5 pt-7">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0 flex-1">
              {typeof title === "string"
                ? <h2 className="mb-1 text-lg font-bold text-stone-900 dark:text-stone-100">{title}</h2>
                : title}
              {description ? <p className="text-sm leading-5 text-stone-500 dark:text-stone-400">{description}</p> : null}
            </div>
            <button
              onClick={close}
              className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-white/8 dark:hover:text-stone-200"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto ${contentClassName ?? "px-7 pb-5"}`}>{children}</div>

        {footer ? (
          <div className="flex shrink-0 items-center justify-end gap-3 px-7 py-5">
            {typeof footer === "function" ? footer(close) : footer}
          </div>
        ) : null}
      </aside>
    </>
  );
}
