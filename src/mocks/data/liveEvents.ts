import { faker } from "@faker-js/faker";

faker.seed(7);

export type LiveRow = {
  id: string;
  name: string;
  timestamp: string;
  source: string;
  identifier: string;
  path: string | null;
  location: string | null;
  eventId: string;
  sessionId: string;
  profileId: string;
  attributes: Record<string, string | number>;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatTimestamp(d: Date): string {
  const hours24 = d.getHours();
  const hours12 = String(hours24 % 12 || 12).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  const ampm = hours24 >= 12 ? "PM" : "AM";
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${hours12}:${minutes}:${seconds} ${ampm}`;
}

const PAGES: { path: string; title: string }[] = [
  { path: "/",                     title: "Home" },
  { path: "/pricing",              title: "Pricing" },
  { path: "/docs",                 title: "Documentation" },
  { path: "/docs/getting-started", title: "Getting Started — Docs" },
  { path: "/blog",                 title: "Blog" },
  { path: "/product/dashboard",    title: "Product — Dashboard" },
  { path: "/product/integrations", title: "Product — Integrations" },
  { path: "/signup",               title: "Sign Up" },
  { path: "/login",                title: "Log In" },
  { path: "/checkout",             title: "Checkout" },
  { path: "/settings/billing",     title: "Billing Settings" },
  { path: "/changelog",            title: "Changelog" },
];

const REFERRERS = ["https://google.com", "https://twitter.com", "https://linkedin.com", "https://producthunt.com", ""];

function idBase() {
  return faker.string.alphanumeric({ length: 8 }).toLowerCase();
}
function epochId() {
  return faker.number.int({ min: 1750000000000, max: 1790000000000 }).toString();
}
function profileSuffix() {
  return faker.string.alphanumeric({ length: 10 });
}

function buildLiveEvents(targetCount: number): LiveRow[] {
  const rows: LiveRow[] = [];
  let sessionStart = new Date("2026-06-17T10:00:00");

  while (rows.length < targetCount) {
    const base = idBase();
    const epoch = epochId();
    const profileId = `prof_${base}_${epoch}_${profileSuffix()}`;
    const identifier = `prof_${base}_${epoch}_...`;
    const sessionId = `ses_${base}_${epoch}_s1`;
    const referrer = faker.helpers.arrayElement(REFERRERS);
    const pageViewCount = faker.number.int({ min: 1, max: 4 });
    const pages = Array.from({ length: pageViewCount }, () => faker.helpers.arrayElement(PAGES));

    // Build the session in chronological (oldest -> newest) order.
    const chrono: LiveRow[] = [];

    chrono.push({
      id: "",
      name: "Session start",
      timestamp: formatTimestamp(sessionStart),
      source: "web",
      identifier,
      path: null,
      location: null,
      eventId: `ses_${base}_${epoch}_ss1`,
      sessionId,
      profileId,
      attributes: { "Referrer": referrer, "Landing Page": pages[0].path },
    });

    let t = sessionStart;
    for (let i = 0; i < pageViewCount; i++) {
      t = new Date(t.getTime() + faker.number.int({ min: 2000, max: 15000 }));
      const page = pages[i];
      chrono.push({
        id: "",
        name: "View Page",
        timestamp: formatTimestamp(t),
        source: "web",
        identifier,
        path: page.path,
        location: null,
        eventId: `evt_${base}_${epoch}_vp${i + 1}`,
        sessionId,
        profileId,
        attributes: { "Page Path": page.path, "Page Title": page.title, "Referrer": i === 0 ? referrer : "" },
      });
    }

    const sessionEnd = new Date(t.getTime() + faker.number.int({ min: 1000, max: 5000 }));
    const duration = Math.round((sessionEnd.getTime() - sessionStart.getTime()) / 1000);
    chrono.push({
      id: "",
      name: "Session end",
      timestamp: formatTimestamp(sessionEnd),
      source: "web",
      identifier,
      path: null,
      location: null,
      eventId: `ses_${base}_${epoch}_end1`,
      sessionId,
      profileId,
      attributes: { "Session End Event Name": "View Page", "Session Event Count": pageViewCount, "Session Duration": duration },
    });

    // Live feed reads newest-first.
    rows.push(...chrono.reverse());

    // Next session happened earlier.
    sessionStart = new Date(sessionStart.getTime() - faker.number.int({ min: 5000, max: 60000 }));
  }

  return rows.slice(0, targetCount).map((r, i) => ({ ...r, id: `l${i + 1}` }));
}

export const LIVE_EVENTS_DATA: LiveRow[] = buildLiveEvents(100);
