import { http, HttpResponse } from "msw";
import { USERS_DATA } from "./data/users";
import { INTEGRATIONS_DATA } from "./data/integrations";
import { EVENT_DEFINITIONS_DATA } from "./data/eventDefinitions";
import { LIVE_EVENTS_DATA } from "./data/liveEvents";

export const handlers = [
  http.get("/api/users", () => {
    return HttpResponse.json(USERS_DATA);
  }),
  http.get("/api/integrations", () => {
    return HttpResponse.json(INTEGRATIONS_DATA);
  }),
  http.get("/api/events", () => {
    return HttpResponse.json(EVENT_DEFINITIONS_DATA);
  }),
  http.get("/api/events/live", () => {
    return HttpResponse.json(LIVE_EVENTS_DATA);
  }),
];
