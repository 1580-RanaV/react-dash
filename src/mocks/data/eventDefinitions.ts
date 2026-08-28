import { faker } from "@faker-js/faker";

faker.seed(11);

export type EventUser = { initials: string; color: string; name: string; timestamp: string };

export type EventDefinition = {
  id: string;
  name: string;
  intentEvent: boolean;
  totalUsers: number;
  totalEvents: number;
  source: string;
  status: "Ingested" | "Pending";
  lastUpdated: string;
  lastUpdatedSort: string;
  createdBy: { initial: string; color: string; name: string };
  users: EventUser[];
};

// Faker has no notion of a believable product-analytics event name, so this pool
// is curated (mix of snake_case tracking calls and human-readable business events)
// and Faker handles everything else: which one fires, how often, by whom, when.
const EVENT_NAME_POOL = [
  "free_tool_generated", "subscribed v2", "book-a-demo", "free_tool_lead", "Newsletter Signup",
  "Team member invited to a project", "Submit on", "signup_completed", "page_scrolled_50",
  "button_clicked", "form_submitted", "video_played", "file_downloaded", "search_performed",
  "filter_applied", "item_added_to_cart", "checkout_started", "payment_failed", "trial_started",
  "trial_ended", "plan_upgraded", "plan_downgraded", "invoice_paid", "password_reset_requested",
  "email_verified", "onboarding_completed", "feature_flag_enabled", "api_key_created",
  "webhook_triggered", "export_requested", "report_generated", "dashboard_viewed",
  "widget_added", "comment_posted", "notification_dismissed", "session_replay_viewed",
  "survey_submitted", "referral_sent", "coupon_applied", "subscription_cancelled",
  "subscription_renewed", "seat_added", "seat_removed", "sso_login_succeeded",
  "two_factor_enabled", "data_import_completed", "integration_connected", "integration_disconnected",
  "Demo Requested", "Support Ticket Opened", "Feedback Submitted", "Account Deleted", "Payment Method Added",
];

const USER_COLORS = ["#DB2777", "#0D9488", "#7C3AED", "#2563EB", "#D97706", "#059669", "#0EA5E9", "#DC2626", "#8B5CF6", "#0080FF"];

function randomCreator(): { initial: string; color: string; name: string } {
  if (faker.datatype.boolean({ probability: 0.12 })) {
    return { initial: "R", color: "#8B5CF6", name: "Removed User" };
  }
  const name = faker.person.fullName();
  return { initial: name[0].toUpperCase(), color: faker.helpers.arrayElement(USER_COLORS), name };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(d: Date): string {
  const hours24 = d.getHours();
  const hours12 = String(hours24 % 12 || 12).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours24 >= 12 ? "PM" : "AM";
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${hours12}:${minutes} ${ampm}`;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function randomUsers(count: number, before: Date): EventUser[] {
  return Array.from({ length: count }, () => {
    const name = faker.person.fullName();
    const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    return {
      initials,
      color: faker.helpers.arrayElement(USER_COLORS),
      name,
      timestamp: formatDate(faker.date.recent({ days: 30, refDate: before })),
    };
  });
}

function buildEventDefinitions(count: number): EventDefinition[] {
  const now = new Date("2026-06-17T10:00:00");

  return Array.from({ length: count }, (_, i) => {
    const totalUsers = faker.number.int({ min: 0, max: 300 });
    const totalEvents = totalUsers === 0 ? 0 : totalUsers + faker.number.int({ min: 0, max: totalUsers * 4 });
    const lastUpdated = faker.date.recent({ days: 90, refDate: now });

    return {
      id: `e${i + 1}`,
      name: faker.helpers.arrayElement(EVENT_NAME_POOL),
      intentEvent: faker.datatype.boolean({ probability: 0.25 }),
      totalUsers,
      totalEvents,
      source: faker.helpers.weightedArrayElement([
        { weight: 7, value: "JS" },
        { weight: 1, value: "API" },
        { weight: 1, value: "iOS" },
        { weight: 1, value: "Android" },
      ]),
      status: faker.helpers.weightedArrayElement([
        { weight: 8, value: "Ingested" as const },
        { weight: 2, value: "Pending" as const },
      ]),
      lastUpdated: formatDate(lastUpdated),
      lastUpdatedSort: isoDate(lastUpdated),
      createdBy: randomCreator(),
      users: randomUsers(Math.min(totalUsers, faker.number.int({ min: 0, max: 6 })), lastUpdated),
    };
  });
}

export const EVENT_DEFINITIONS_DATA: EventDefinition[] = buildEventDefinitions(100);
