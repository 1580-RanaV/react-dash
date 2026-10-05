import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Palette,
  Users,
  Zap,
  UserCheck,
  Plug,
  Library,
  Aperture,
  Package,
  Rss,
  Route,
  Shuffle,
  Building2,
  Handshake,
  SquareCheck,
  CalendarDays,
  CalendarClock,
  Database,
  LayoutDashboard,
  ChevronRight,
  Check,
  ChefHat,
  CreditCard,
  ChevronsUpDown,
  Sparkles,
  BadgeCheck,
  Bell,
  LogOut,
  Sun,
  Moon,
  Search,
  Workflow,
  Waypoints,
  GitBranch,
} from "lucide-react";
import AskBluButton from "./AskBluButton";
import GlideMenu from "./GlideMenu";
import { useLocale } from "../lib/LocaleContext";
import { useBluMessages, MAX_CREDITS } from "./BluMessagesContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "./ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

// ── Nav data ──────────────────────────────────────────────────────────────────
// Same shape/content as the previous hand-rolled Sidebar.tsx — only the
// rendering underneath (shadcn's Sidebar primitives) changed.

type NavItem = {
  label: string;
  icon: React.ReactNode;
  children?: NavItem[];
};

type NavSection = {
  heading?: string;
  items: NavItem[];
};

const nav: NavSection[] = [
  {
    items: [
      { label: "Home", icon: <Home size={16} /> },
      { label: "Brand", icon: <Palette size={16} /> },
      { label: "Asset Library", icon: <Library size={16} /> },
      { label: "Attributes", icon: <Database size={16} /> },
      {
        label: "Users",
        icon: <Users size={16} />,
        children: [
          { label: "Events", icon: <Zap size={16} /> },
          { label: "Subscribers", icon: <UserCheck size={16} /> },
        ],
      },
      { label: "Integrations", icon: <Plug size={16} /> },
      { label: "Recipes", icon: <ChefHat size={16} /> },
    ],
  },
  {
    heading: "Design",
    items: [{ label: "Studio", icon: <Aperture size={16} /> }],
  },
  {
    heading: "Marketing",
    items: [
      {
        label: "Catalog",
        icon: <Package size={16} />,
        children: [{ label: "Feeds", icon: <Rss size={16} /> }],
      },
      { label: "Journeys", icon: <Route size={16} /> },
      { label: "Experiences", icon: <Shuffle size={16} /> },
    ],
  },
  {
    heading: "Sales",
    items: [
      {
        label: "Accounts",
        icon: <Building2 size={16} />,
        children: [
          { label: "Tasks", icon: <SquareCheck size={16} /> },
          { label: "Deals", icon: <Handshake size={16} /> },
        ],
      },
      {
        label: "Meetings",
        icon: <CalendarDays size={16} />,
        children: [{ label: "Scheduler", icon: <CalendarClock size={16} /> }],
      },
    ],
  },
  {
    heading: "Analytics",
    items: [
      { label: "Boards", icon: <LayoutDashboard size={16} /> },
      { label: "Subscriptions", icon: <CreditCard size={16} /> },
    ],
  },
];

const NAV_VIEWS: Record<string, string> = {
  Brand: "brand",
  Users: "users",
  Events: "events",
  Subscribers: "subscribers",
  Attributes: "attributes",
  Integrations: "integrations",
  Recipes: "recipes",
  "Asset Library": "asset-library",
  Studio: "studio",
  Catalog: "catalog",
  Feeds: "feeds",
  Journeys: "journeys",
  Experiences: "experiences",
  Accounts: "accounts",
  Deals: "deals",
  Tasks: "tasks",
  Meetings: "meetings",
  Scheduler: "scheduler",
  Boards: "boards",
  Subscriptions: "subscription",
};

// ── Workspace (org / project) switcher ───────────────────────────────────────

const projects = [
  { name: "Dev Playground", initials: "DP", color: "#e05252" },
  { name: "Linea", initials: "L", color: "#818cf8" },
  { name: "StockInvest Platform", initials: "SI", color: "#16a34a" },
  { name: "Blu AI", initials: "BA", color: "#0080FF" },
  { name: "Mobile App", initials: "MA", color: "#f97316" },
  { name: "Admin Console", initials: "AC", color: "#0d9488" },
  { name: "Data Pipeline", initials: "DL", color: "#ec4899" },
  { name: "Customer Portal", initials: "CP", color: "#6366f1" },
  { name: "Analytics Hub", initials: "AH", color: "#f59e0b" },
  { name: "Staging Env", initials: "SE", color: "#64748b" },
];

const organizations = [
  { name: "fieldsusa", initials: "F", color: "#22c55e" },
  { name: "Intempt External Use", initials: "IE", color: "#6366f1" },
  { name: "Intempt Internal Use Only", initials: "II", color: "#8b5cf6" },
  { name: "Intempt Technologies", initials: "IT", color: "#0ea5e9" },
  { name: "StockInvest.us", initials: "S", color: "#16a34a" },
];

type WorkspaceItem = { name: string; initials: string; color: string };

function WorkspaceAvatar({ initials, color, size = 28 }: { initials: string; color: string; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-lg font-semibold text-white"
      style={{ width: size, height: size, background: color, fontSize: Math.max(10, size * 0.38) }}
    >
      {initials}
    </span>
  );
}

function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const [selectedProject, setSelectedProject] = useState<WorkspaceItem>(projects[1]);
  const [selectedOrg, setSelectedOrg] = useState<WorkspaceItem>(organizations[2]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="active:scale-[0.96] data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <WorkspaceAvatar initials={selectedProject.initials} color={selectedProject.color} />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{selectedProject.name}</span>
                <span className="truncate text-xs">{selectedOrg.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">Organizations</DropdownMenuLabel>
            {organizations.map((o) => (
              <DropdownMenuItem key={o.name} onClick={() => setSelectedOrg(o)} className="gap-2.5 p-2 active:scale-[0.96]">
                <WorkspaceAvatar initials={o.initials} color={o.color} size={22} />
                <span className="flex-1 truncate">{o.name}</span>
                {selectedOrg.name === o.name && <Check className="size-3.5 shrink-0 text-blue-500" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">Projects</DropdownMenuLabel>
            {projects.map((p) => (
              <DropdownMenuItem key={p.name} onClick={() => setSelectedProject(p)} className="gap-2.5 p-2 active:scale-[0.96]">
                <WorkspaceAvatar initials={p.initials} color={p.color} size={22} />
                <span className="flex-1 truncate">{p.name}</span>
                {selectedProject.name === p.name && <Check className="size-3.5 shrink-0 text-blue-500" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// ── Ask Blu — full pill when expanded, mascot icon only when icon-collapsed ──

function AskBluSlot({ bluOpen }: { bluOpen?: boolean }) {
  const { state } = useSidebar();
  if (state === "collapsed") {
    return (
      <button
        onClick={() => window.dispatchEvent(new Event("toggle-blu-chat"))}
        title="Ask Blu"
        className="flex w-full items-center justify-center rounded-md py-2 transition-colors hover:bg-sidebar-accent"
        style={bluOpen ? { color: "#0080FF" } : { color: "#78716c" }}
      >
        <img src="/mascot.png" alt="Blu" width={20} height={20} className="object-contain" />
      </button>
    );
  }
  return <AskBluButton isOpen={!!bluOpen} />;
}

// ── User menu (sidebar footer) ───────────────────────────────────────────────

// Moved here from the header's ProfileMenu/NotificationsMenu/CreditsMeter and
// the public-recipe/public-workflow icon buttons — everything that used to
// live top-right now lives in this one card, per the user's request to
// "club all of them" into the sidebar's user menu.

type HomeState = "empty" | "partial" | "full";

const HOME_STATE_TABS: { key: HomeState; label: string }[] = [
  { key: "empty", label: "New" },
  { key: "partial", label: "No data" },
  { key: "full", label: "Loaded" },
];

const HOME_TAB_KEYS = new Set(["design", "marketing", "sales", "analytics"]);

const notifications = [
  {
    id: 1,
    icon: <Users size={14} className="text-blue-500" />,
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    title: "New user joined your workspace",
    body: "markiian@intempt.com accepted the invite.",
    time: "2h ago",
  },
  {
    id: 2,
    icon: <GitBranch size={14} className="text-violet-500" />,
    iconBg: "bg-violet-50 dark:bg-violet-500/10",
    title: "Journey published",
    body: '"Summer Re-engagement" went live in Experiences.',
    time: "5h ago",
  },
  {
    id: 3,
    icon: <Zap size={14} className="text-amber-500" />,
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    title: "Catalog sync completed",
    body: "Feeds updated with 142 new products from your catalog.",
    time: "1d ago",
  },
];

function NotificationsSubmenu() {
  const [read, setRead] = useState<number[]>([]);
  const unreadCount = notifications.length - read.length;

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="active:scale-[0.96]">
        <Bell />
        Notifications
        {unreadCount > 0 && (
          <span className="ml-auto mr-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-semibold leading-none text-white">
            {unreadCount}
          </span>
        )}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-80 rounded-lg p-0 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
          <span className="text-sm font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setRead(notifications.map((n) => n.id)); }}
              className="text-xs font-medium text-blue-500 transition-colors hover:text-blue-600"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="py-1">
          {notifications.map((n) => {
            const isUnread = !read.includes(n.id);
            return (
              <button
                key={n.id}
                onClick={(e) => { e.stopPropagation(); setRead((r) => [...r, n.id]); }}
                className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors active:scale-[0.96] hover:bg-accent"
              >
                <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${n.iconBg}`}>
                  {n.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm leading-snug ${isUnread ? "font-semibold" : "font-normal text-muted-foreground"}`}>
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-snug text-muted-foreground line-clamp-2">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">{n.time}</p>
                </div>
                {isUnread && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />}
              </button>
            );
          })}
        </div>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

function NavUser() {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const onHome = location.pathname === "/home";
  const { credits } = useBluMessages();

  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  function toggleTheme(next: boolean) {
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setDark(next);
  }

  const searchParams = new URLSearchParams(location.search);
  const rawTab = searchParams.get("tab") ?? "analytics/full";
  const [rawHomeTab, rawState] = rawTab.split("/");
  const homeTab = HOME_TAB_KEYS.has(rawHomeTab) ? rawHomeTab : "analytics";
  const homeState: HomeState =
    rawState === "1" || rawState === "empty" ? "empty" : rawState === "partial" ? "partial" : "full";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="active:scale-[0.96] data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src="/dp.png" alt="Rana V" />
                <AvatarFallback className="rounded-lg">RV</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Rana V</span>
                <span className="truncate text-xs">rana@intempt.com</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src="/dp.png" alt="Rana V" />
                  <AvatarFallback className="rounded-lg">RV</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Rana V</span>
                  <span className="truncate text-xs">rana@intempt.com</span>
                </div>
              </div>
            </DropdownMenuLabel>

            {/* Appearance — plain buttons, not DropdownMenuItems, so picking
                one doesn't close the menu */}
            <div className="px-1 pb-1.5 pt-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-0.5 rounded-md bg-muted p-0.5">
                <button
                  onClick={() => toggleTheme(false)}
                  className={`flex h-7 flex-1 items-center justify-center gap-1.5 rounded text-xs font-medium transition-[background-color,color,box-shadow] active:scale-[0.96] ${
                    !dark ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sun size={12} />
                  Light
                </button>
                <button
                  onClick={() => toggleTheme(true)}
                  className={`flex h-7 flex-1 items-center justify-center gap-1.5 rounded text-xs font-medium transition-[background-color,color,box-shadow] active:scale-[0.96] ${
                    dark ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Moon size={12} />
                  Dark
                </button>
              </div>
            </div>

            {/* Home data-state switcher — dev utility, only meaningful on /home */}
            {onHome && (
              <div className="px-1 pb-1.5" onClick={(e) => e.stopPropagation()}>
                <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Home data state
                </p>
                <div className="flex items-center gap-0.5 rounded-md bg-muted p-0.5">
                  {HOME_STATE_TABS.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => navigate(`/home?tab=${homeTab}/${item.key}`, { replace: true })}
                      className={`h-7 flex-1 rounded text-xs font-medium transition-[background-color,color,box-shadow] active:scale-[0.96] ${
                        homeState === item.key
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <DropdownMenuGroup className="mt-1.5">
              <DropdownMenuItem className="active:scale-[0.96]" onClick={() => navigate("/settings/billing")}>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuGroup className="mt-1.5">
              <DropdownMenuItem className="active:scale-[0.96]" onClick={() => navigate("/settings/about")}>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem className="active:scale-[0.96]" onClick={() => navigate("/settings/billing")}>
                <CreditCard />
                Billing
                <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                  {credits > 0 ? `${credits}/${MAX_CREDITS}` : "Out"}
                </span>
              </DropdownMenuItem>
              <NotificationsSubmenu />
            </DropdownMenuGroup>
            <DropdownMenuGroup className="mt-1.5">
              <DropdownMenuItem className="active:scale-[0.96]">
                <Search />
                Search
              </DropdownMenuItem>
              <DropdownMenuItem className="active:scale-[0.96]" onClick={() => window.open("/public-recipe", "_blank")}>
                <Workflow />
                Public recipe
              </DropdownMenuItem>
              <DropdownMenuItem className="active:scale-[0.96]" onClick={() => window.open("/public-workflow", "_blank")}>
                <Waypoints />
                Public workflow
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuItem className="active:scale-[0.96] mt-1.5">
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// ── Nav rows ──────────────────────────────────────────────────────────────────

function NavItemRow({ item, currentView }: { item: NavItem; currentView: string }) {
  const { t } = useLocale();
  const hasChildren = !!item.children?.length;
  const view = NAV_VIEWS[item.label];
  const href = item.label === "Home" ? "/home" : view ? `/${view}` : "#";
  const isActive = currentView === item.label;
  const childActive = hasChildren && item.children!.some((c) => c.label === currentView);

  if (!hasChildren) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive} tooltip={t(item.label)} data-row className="hover:bg-transparent active:scale-[0.96]">
          <Link to={href}>
            {item.icon}
            <span>{t(item.label)}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible defaultOpen={isActive || childActive} className="group/collapsible">
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive} tooltip={t(item.label)} data-row className="hover:bg-transparent active:scale-[0.96]">
          <Link to={href}>
            {item.icon}
            <span>{t(item.label)}</span>
          </Link>
        </SidebarMenuButton>
        <CollapsibleTrigger asChild>
          <SidebarMenuAction className="active:scale-[0.96] transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90">
            <ChevronRight />
          </SidebarMenuAction>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children!.map((child) => {
              const childView = NAV_VIEWS[child.label];
              const childHref = childView ? `/${childView}` : "#";
              return (
                <SidebarMenuSubItem key={child.label}>
                  <SidebarMenuSubButton asChild isActive={currentView === child.label} className="active:scale-[0.96]">
                    <Link to={childHref}>
                      {child.icon}
                      <span>{t(child.label)}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

// ── App sidebar ───────────────────────────────────────────────────────────────

export default function AppSidebar({ bluOpen }: { bluOpen?: boolean }) {
  const location = useLocation();
  const pathname = location.pathname;
  const currentView =
    pathname === "/home" ? "Home" : Object.entries(NAV_VIEWS).find(([, view]) => pathname === `/${view}`)?.[0] ?? "";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher />
        <div className="px-2 group-data-[collapsible=icon]:px-0">
          <AskBluSlot bluOpen={bluOpen} />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {nav.map((section, i) => (
          <SidebarGroup key={section.heading ?? `section-${i}`}>
            {section.heading && <SidebarGroupLabel>{section.heading}</SidebarGroupLabel>}
            <GlideMenu rowSelector="[data-row]" highlightClassName="rounded-md bg-sidebar-accent">
              <SidebarMenu>
                {section.items.map((item) => (
                  <NavItemRow key={item.label} item={item} currentView={currentView} />
                ))}
              </SidebarMenu>
            </GlideMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
