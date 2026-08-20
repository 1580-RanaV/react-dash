export type UILocale = "en" | "lt" | "ru";

const en: Record<string, string> = {
  // top nav
  Home: "Home",
  Brand: "Brand",
  "Asset Library": "Asset Library",
  Attributes: "Attributes",
  Users: "Users",
  Events: "Events",
  Subscribers: "Subscribers",
  Integrations: "Integrations",
  // Design section
  Design: "Design",
  Studio: "Studio",
  // Marketing section
  Marketing: "Marketing",
  Catalog: "Catalog",
  Feeds: "Feeds",
  Journeys: "Journeys",
  Experiences: "Experiences",
  // Sales section
  Sales: "Sales",
  Accounts: "Accounts",
  Deals: "Deals",
  Tasks: "Tasks",
  Meetings: "Meetings",
  Scheduler: "Scheduler",
  // Analytics section
  Analytics: "Analytics",
  Boards: "Boards",
  Subscription: "Subscription",
  // topbar
  Upgrade: "Upgrade",
};

const lt: Record<string, string> = {
  // top nav
  Home: "Pradžia",
  Brand: "Prekės ženklas",
  "Asset Library": "Turto biblioteka",
  Attributes: "Atributai",
  Users: "Vartotojai",
  Events: "Įvykiai",
  Subscribers: "Prenumeratoriai",
  Integrations: "Integracijos",
  // Design section
  Design: "Dizainas",
  Studio: "Studija",
  // Marketing section
  Marketing: "Rinkodara",
  Catalog: "Katalogas",
  Feeds: "Srautai",
  Journeys: "Kelionės",
  Experiences: "Patirtys",
  // Sales section
  Sales: "Pardavimai",
  Accounts: "Paskyros",
  Deals: "Sandoriai",
  Tasks: "Užduotys",
  Meetings: "Susitikimai",
  Scheduler: "Planuoklis",
  // Analytics section
  Analytics: "Analizė",
  Boards: "Lentos",
  Subscription: "Prenumerata",
  // topbar
  Upgrade: "Atnaujinti",
};

const ru: Record<string, string> = {
  // top nav
  Home: "Главная",
  Brand: "Бренд",
  "Asset Library": "Библиотека активов",
  Attributes: "Атрибуты",
  Users: "Пользователи",
  Events: "События",
  Subscribers: "Подписчики",
  Integrations: "Интеграции",
  // Design section
  Design: "Дизайн",
  Studio: "Студия",
  // Marketing section
  Marketing: "Маркетинг",
  Catalog: "Каталог",
  Feeds: "Фиды",
  Journeys: "Сценарии",
  Experiences: "Кампании",
  // Sales section
  Sales: "Продажи",
  Accounts: "Аккаунты",
  Deals: "Сделки",
  Tasks: "Задачи",
  Meetings: "Встречи",
  Scheduler: "Планировщик",
  // Analytics section
  Analytics: "Аналитика",
  Boards: "Дашборды",
  Subscription: "Подписка",
  // topbar
  Upgrade: "Улучшить",
};

export const translations: Record<UILocale, Record<string, string>> = { en, lt, ru };
