


import AskBluButton from "./AskBluButton";
import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Home,
  Palette,
  Users,
  Activity,
  UserCheck,
  Plug,
  Library,
  UserCircle,
  Clapperboard,
  PersonStanding,
  PenTool,
  Package,
  PackageOpen,
  Rss,
  Route,
  Shuffle,
  Building2,
  Handshake,
  CalendarDays,
  CalendarClock,
  BarChart2,
  Database,
  LayoutDashboard,
  CreditCard,
  ChevronRight,
  ChevronDown,
  Check,
  Settings,
} from "lucide-react";

type NavItem = {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  children?: NavItem[];
};

type NavSection = {
  heading?: string;
  items: NavItem[];
};

const nav: NavSection[] = [
  {
    items: [
      { label: "Home", icon: <Home size={15} /> },
      { label: "Brand", icon: <Palette size={15} /> },
      { label: "Asset Library", icon: <Library size={15} /> },
      { label: "Attributes", icon: <Database size={15} /> },
      {
        label: "Users",
        icon: <Users size={15} />,
        children: [
          { label: "Events", icon: <Activity size={15} /> },
          { label: "Subscribers", icon: <UserCheck size={15} /> },
        ],
      },
      { label: "Connections", icon: <Plug size={15} /> },
    ],
  },
  {
    heading: "Design",
    items: [
      { label: "Avatars", icon: <UserCircle size={15} /> },
      { label: "Scenes", icon: <Clapperboard size={15} /> },
      { label: "Poses", icon: <PersonStanding size={15} /> },
      { label: "Design System", icon: <PenTool size={15} /> },
    ],
  },
  {
    heading: "Marketing",
    items: [
      {
        label: "Catalog",
        icon: <Package size={15} />,
        children: [{ label: "Feeds", icon: <Rss size={15} /> }],
      },
      { label: "Journeys", icon: <Route size={15} /> },
      { label: "Experiences", icon: <Shuffle size={15} /> },
    ],
  },
  {
    heading: "Sales",
    items: [
      {
        label: "Accounts",
        icon: <Building2 size={15} />,
        children: [{ label: "Deals", icon: <Handshake size={15} /> }],
      },
      {
        label: "Meetings",
        icon: <CalendarDays size={15} />,
        children: [{ label: "Scheduler", icon: <CalendarClock size={15} /> }],
      },
    ],
  },
  {
    heading: "Analytics",
    items: [
      { label: "Out-of-the-box", icon: <PackageOpen size={15} /> },
      { label: "Boards", icon: <LayoutDashboard size={15} /> },
      { label: "Subscription", icon: <CreditCard size={15} /> },
    ],
  },
];

const projects = [
  { name: "Dev Playground",    initials: "DP", color: "#e05252" },
  { name: "Linea",             initials: "L",  color: "#818cf8" },
  { name: "StockInvest Platform", initials: "SI", color: "#16a34a" },
  { name: "Blu AI",            initials: "BA", color: "#0080FF" },
  { name: "Mobile App",        initials: "MA", color: "#f97316" },
  { name: "Admin Console",     initials: "AC", color: "#0d9488" },
  { name: "Data Pipeline",     initials: "DL", color: "#ec4899" },
  { name: "Customer Portal",   initials: "CP", color: "#6366f1" },
  { name: "Analytics Hub",     initials: "AH", color: "#f59e0b" },
  { name: "Staging Env",       initials: "SE", color: "#64748b" },
];

const organizations = [
  { name: "fieldsusa",                  initials: "F",  color: "#22c55e" },
  { name: "Intempt External Use",       initials: "IE", color: "#6366f1" },
  { name: "Intempt Internal Use Only",  initials: "II", color: "#8b5cf6" },
  { name: "Intempt Technologies",       initials: "IT", color: "#0ea5e9" },
  { name: "StockInvest.us",             initials: "S",  color: "#16a34a" },
];

function Avatar({
  initials,
  color,
  size = 22,
}: {
  initials: string;
  color: string;
  size?: number;
}) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-white font-semibold shrink-0"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.38,
      }}
    >
      {initials}
    </span>
  );
}

type WorkspaceItem = { name: string; initials: string; color: string; active?: boolean };

function WorkspaceSwitcher() {
  const [open, setOpen]                     = useState(false);
  const [selectedProject, setSelectedProject] = useState<WorkspaceItem>(projects[1]);
  const [selectedOrg, setSelectedOrg]         = useState<WorkspaceItem>(organizations[2]);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative px-3 pt-3 pb-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-stone-200/60 dark:hover:bg-white/6 transition-colors"
      >
        <Avatar initials={selectedProject.initials} color={selectedProject.color} size={22} />
        <div className="flex-1 min-w-0 text-left">
          <div className="text-sm font-semibold text-stone-800 dark:text-stone-100 truncate leading-tight">
            {selectedProject.name}
          </div>
          <div className="text-xs text-stone-600 dark:text-stone-400 truncate leading-tight">
            {selectedOrg.name}
          </div>
        </div>
        <ChevronDown
          size={13}
          className={`text-stone-400 dark:text-stone-500 transition-transform duration-150 shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute left-2 top-[calc(100%-4px)] z-50 w-64 animate-card-in"
          style={{
            background: "var(--content-bg)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
          }}
        >
          {/* Organizations */}
          <div className="px-2 pt-2.5 pb-1">
            <p className="px-2 mb-1 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-600">
              Organizations
            </p>
            {organizations.map((o) => (
              <button
                key={o.name}
                onClick={() => { setSelectedOrg(o); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-white/6 transition-colors group"
              >
                <Avatar initials={o.initials} color={o.color} size={20} />
                <span className="flex-1 text-left text-sm text-stone-700 dark:text-stone-300 truncate">
                  {o.name}
                </span>
                {selectedOrg.name === o.name && (
                  <Check size={12} className="text-blue-500 shrink-0" />
                )}
              </button>
            ))}
          </div>

          <div className="mx-2 border-t border-stone-100 dark:border-(--border)" />

          {/* Projects */}
          <div className="px-2 pt-2 pb-2.5">
            <p className="px-2 mb-1 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-600">
              Projects
            </p>
            <div className="max-h-48 overflow-y-auto">
              {projects.map((p) => (
                <button
                  key={p.name}
                  onClick={() => { setSelectedProject(p); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-white/6 transition-colors group"
                >
                  <Avatar initials={p.initials} color={p.color} size={20} />
                  <span className="flex-1 text-left text-sm text-stone-700 dark:text-stone-300 truncate">
                    {p.name}
                  </span>
                  {selectedProject.name === p.name && (
                    <Check size={12} className="text-blue-500 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Nav items that map to dedicated views
const NAV_VIEWS: Record<string, string> = {
  Brand: "brand",
  Users: "users",
  Events: "events",
  Subscribers: "subscribers",
  Attributes: "attributes",
  Connections: "connections",
  "Asset Library": "asset-library",
  Avatars: "avatars",
  Scenes: "scenes",
  Poses: "poses",
  "Design System": "design-system",
  Catalog: "catalog",
  Feeds: "feeds",
  Journeys: "journeys",
  Experiences: "experiences",
  Accounts: "accounts",
  Deals: "deals",
  Meetings: "meetings",
  Scheduler: "scheduler",
  "Out-of-the-box": "out-of-the-box",
  Boards: "boards",
  Subscription: "subscription",
};

function NavItemRow({
  item,
  depth = 0,
  activeItem,
}: {
  item: NavItem;
  depth?: number;
  activeItem: string;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isActive = activeItem === item.label;
  const view = NAV_VIEWS[item.label];
  const href = item.label === "Home" ? "/home" : view ? `/${view}` : "#";
  const rowClassName = `
    w-full flex items-center gap-2.5 px-3 py-1.25 rounded-md text-left
    text-sm font-[450] transition-colors duration-100 group
    ${isActive
      ? "bg-white dark:bg-white/8 text-stone-800 dark:text-stone-100 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
      : "text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-white/6 hover:text-stone-800 dark:hover:text-stone-100"
    }
  `;
  const rowContent = (
    <>
      <span
        key={isActive ? "active" : "idle"}
        className={isActive
          ? "text-blue-600 animate-nav-pop"
          : "text-stone-500 dark:text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-300"}
      >
        {item.icon}
      </span>
      <span className="flex-1 leading-none">{item.label}</span>
    </>
  );

  return (
    <div>
      {view || item.label === "Home" ? (
        <Link to={href} className={rowClassName}>{rowContent}</Link>
      ) : (
        <button className={rowClassName}>{rowContent}</button>
      )}

      {hasChildren && (
        <div className="mt-0.5 mb-1.5">
          {item.children!.map((child, idx) => {
            const isLast = idx === item.children!.length - 1;
            return (
              <div key={child.label} className="relative ml-5.5 pl-4">
                <span className="pointer-events-none absolute left-0 top-0 w-3.5 h-3.25 border-l-2 border-b-2 border-stone-400/60 dark:border-stone-500/50 rounded-bl-[5px]" />
                {!isLast && (
                  <span className="pointer-events-none absolute left-0 top-3.25 bottom-0 border-l-2 border-stone-400/60 dark:border-stone-500/50" />
                )}
                <NavItemRow
                  item={child}
                  depth={depth + 1}
                  activeItem={activeItem}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CollapsibleSection({
  section,
  activeItem,
  forcedCollapsed = false,
  draggable: isDraggable = false,
  isDragOver = false,
  isDragSrc = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  section: NavSection;
  activeItem: string;
  forcedCollapsed?: boolean;
  draggable?: boolean;
  isDragOver?: boolean;
  isDragSrc?: boolean;
  onDragStart?: () => void;
  onDragOver?: () => void;
  onDrop?: () => void;
  onDragEnd?: () => void;
}) {
  const [open, setOpen] = useState(true);
  const showItems = open && !forcedCollapsed;

  return (
    <div
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragOver={(e) => { e.preventDefault(); onDragOver?.(); }}
      onDrop={(e) => { e.preventDefault(); onDrop?.(); }}
      onDragEnd={onDragEnd}
      className="relative"
      style={{
        opacity: isDragSrc ? 0.4 : 1,
        borderTop: isDragOver ? "2px solid #0080FF" : "2px solid transparent",
        transition: "opacity 0.15s ease, border-color 0.1s ease",
      }}
    >
      {section.heading ? (
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center gap-2 px-3 py-1.5 mb-0.5 rounded-md group hover:bg-stone-200/60 dark:hover:bg-white/6 transition-colors duration-100 cursor-grab active:cursor-grabbing"
        >
          <span className="flex-1 text-left text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
            {section.heading}
          </span>
          <ChevronRight
            size={10}
            className={`text-stone-500 dark:text-stone-400 transition-transform duration-200 ${showItems ? "rotate-90" : ""}`}
          />
        </button>
      ) : null}

      <div
        className="overflow-hidden"
        style={{
          maxHeight: showItems ? 600 : 0,
          transition: "max-height 0.22s ease",
        }}
      >
        <div className="space-y-px">
          {section.items.map((item) => (
            <NavItemRow
              key={item.label}
              item={item}
              activeItem={activeItem}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ isOpen, onClose, bluOpen }: { isOpen?: boolean; onClose?: () => void; bluOpen?: boolean }) {
  const location = useLocation(); const pathname = location.pathname;
  const currentView = pathname === "/home" ? "Home" : Object.entries(NAV_VIEWS).find(([, view]) => pathname === `/${view}`)?.[0] ?? "";

  const [navSections, setNavSections] = useState<NavSection[]>(nav);
  const [isDragging, setIsDragging] = useState(false);
  const [dragSrc, setDragSrc] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  function handleDragStart(idx: number) {
    setIsDragging(true);
    setDragSrc(idx);
  }
  function handleDragOver(idx: number) {
    if (navSections[idx].heading && idx !== dragSrc) setDragOver(idx);
  }
  function handleDrop(idx: number) {
    if (dragSrc !== null && dragSrc !== idx && navSections[idx].heading) {
      const next = [...navSections];
      const [moved] = next.splice(dragSrc, 1);
      next.splice(idx > dragSrc ? idx - 1 : idx, 0, moved);
      setNavSections(next);
    }
    setIsDragging(false);
    setDragSrc(null);
    setDragOver(null);
  }
  function handleDragEnd() {
    setIsDragging(false);
    setDragSrc(null);
    setDragOver(null);
  }

  const navRef = useRef<HTMLElement>(null);
  const [topFade, setTopFade] = useState(false);
  const [bottomFade, setBottomFade] = useState(true);

  function checkFades() {
    const el = navRef.current;
    if (!el) return;
    setTopFade(el.scrollTop > 8);
    setBottomFade(Math.ceil(el.scrollTop + el.clientHeight) < el.scrollHeight - 8);
  }

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    checkFades();
    el.addEventListener("scroll", checkFades, { passive: true });
    return () => el.removeEventListener("scroll", checkFades);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => { onClose?.(); }, [pathname]);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden transition-opacity duration-300"
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none" }}
      />

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col h-full select-none
          transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{
          width: 196,
          background: "var(--sidebar-background)",
        }}
      >
        {/* Top: workspace switcher */}
        <WorkspaceSwitcher />

        {/* Ask Blu pill */}
        <div className="px-2 pb-1">
          <AskBluButton isOpen={!!bluOpen} />
        </div>

        {/* Nav */}
        <div className="relative flex-1 min-h-0">
          <div
            className="pointer-events-none absolute top-0 inset-x-0 z-10 h-12 transition-opacity duration-300"
            style={{ opacity: topFade ? 1 : 0, background: "linear-gradient(to bottom, var(--sidebar-background) 0%, transparent 100%)" }}
          />
          <nav ref={navRef} className="h-full overflow-y-auto px-2 py-2 space-y-3">
            {navSections.map((section, si) => (
              <CollapsibleSection
                key={section.heading ?? "__top__"}
                section={section}
                activeItem={currentView}
                forcedCollapsed={isDragging && !!section.heading}
                draggable={!!section.heading}
                isDragOver={isDragging && dragOver === si}
                isDragSrc={dragSrc === si}
                onDragStart={() => handleDragStart(si)}
                onDragOver={() => handleDragOver(si)}
                onDrop={() => handleDrop(si)}
                onDragEnd={handleDragEnd}
              />
            ))}
          </nav>
          <div
            className="pointer-events-none absolute bottom-0 inset-x-0 z-10 h-4 transition-opacity duration-300"
            style={{ opacity: bottomFade ? 1 : 0, background: "linear-gradient(to top, var(--sidebar-background) 0%, transparent 100%)" }}
          />
        </div>

        {/* Bottom: Intempt branding */}
        <div className="flex items-center gap-2 px-4 py-3.5">
          <img
            src="/logo.png"
            alt="Intempt"
            width={18}
            height={18}
            className="rounded-md opacity-60"
            style={{ objectFit: "contain" }}
          />
          <span className="flex-1 text-xs font-medium text-stone-600 dark:text-stone-400 tracking-tight">
            Intempt
          </span>
          <button className="w-5 h-5 rounded-full border border-stone-300 dark:border-(--border) flex items-center justify-center hover:border-stone-400 dark:hover:border-stone-500 hover:bg-stone-100 dark:hover:bg-white/6 transition-colors shrink-0">
            <span className="text-xs font-semibold text-stone-400 dark:text-stone-500 leading-none">?</span>
          </button>
        </div>
      </aside>
    </>
  );
}
