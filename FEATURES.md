# Intempt Platform — Feature Reference

A plain-language walkthrough of every item in the sidebar, organized by section.

---

## Top-level

### Home
The command center for the whole platform. The Home view opens to a tabbed dashboard with three lenses — **Traffic**, **Revenue**, and **Engagement** — each showing metric cards, a date-filtered line/area chart, and supporting breakdowns (channels, top pages, countries, browsers). A greeting card at the top surfaces recent designs and quick-action shortcuts into every other section (Journeys, Experiences, Boards, etc.). The bottom half of the page provides at-a-glance health checks across Design, Marketing, Sales, and Analytics domains, including a brand-readiness checklist, campaign performance, pipeline value, and plan usage bars.

---

### Brand
Where you define and maintain your brand identity. The **Identity** tab lets you fill in editable fields for Company, Offer, Story, and Voice — things like company name, website, product descriptions, mission, and communication tone. A **Knowledge Base** tab holds a paragraph of plain-text brand context that the AI (Blu) can reference when generating content. You can also upload logo files (light and dark variants), attach reference documents, and manage your approved **Design Themes** — color palettes paired to your brand that flow into the design system. The entire identity spec feeds Blu's content generation so every output stays on-brand.

---

### Asset Library
A shared repository for all reusable marketing assets: Email Plain, Email HTML, SMS templates, and Image files. Each asset shows its type badge, the team member who created it, an active/draft status, any applied tags, and its last-updated timestamp. The table supports search, sort (by name, type, or update date), and a type filter so teams can quickly find what they need. From here you can open an asset detail view, create new assets via a slide-in drawer, or delete stale ones with a confirmation step.

---

### Attributes
The schema layer — defines every data field that can be tracked on a **User**, **Account**, or **Event** object. Each attribute row shows its field name, which object it belongs to, its logical type (Profile, Behavioral, Computed), its data type (String, Number, Boolean, Date, Array), and whether it is currently Active or Inactive. Clicking a row opens a detail drawer with two tabs: **Configuration** (editable description, primary field name, and aliases for ingestion) and **Users** (a searchable list of users who have a value for that attribute). This is where you formally define the shape of your data before it flows into segments, filters, and journeys.

---

### Users
A searchable, paginated table of every individual contact in your workspace. Each row shows name, associated account, email, job title, and Intempt tags (colored chips like Customer, Lead, High Value). A **Segment Selector** at the top lets you switch between saved audience segments — All Users, Power Users, Trial Users, etc. — in one click. Clicking a row opens a full User Detail view with profile fields, event history, and timeline. An advanced **Filter Builder** panel (opened by the Filters toolbar button) lets you compose multi-condition filter groups using event, segment, consent, and attribute fields. A separate Sort button lets you sort by any column with a click-to-toggle ascending/descending direction.

#### Events (under Users)
Tracks every named action users perform — things like `book-a-demo`, `subscribed v2`, or `Submit on`. The table shows total unique users and total occurrences per event, its data source (JS, API, etc.), and ingestion status (Ingested or Pending). Clicking an event opens a detail drawer with a 30-day bar chart of daily volume, a list of users who triggered the event with timestamps, and aggregate counts. A toggle at the top of the view switches between showing all events or only those with user activity.

#### Subscribers (under Users)
A focused list of opted-in marketing contacts. Columns cover name, email, subscription status, consent type, subscribe date, and acquisition source. Intended as the canonical list for email broadcast eligibility — separate from the broader Users table, which includes contacts that may not have explicitly opted in. Board and Analytics tabs are flagged as coming soon.

---

### Integrations
Manages all connections between the platform and external tools. The **Connections** tab lists every active or available integration — Salesforce, HubSpot, Mailchimp, SendGrid, Mixpanel, Stripe, Shopify, Klaviyo, Amplitude, and more — with logos, creator, creation date, and a three-dot menu for editing or deleting. An Add Integration drawer lets you search and connect new services. The **Domains** tab manages whitelisted domains for data collection and tracking snippet deployment, with a copyable JavaScript embed code for each domain.

---

## Design

### Avatars
A library of AI-generated human personas used across marketing content. Each avatar card shows a name (Ada, Amara, Diego, etc.) with a photo and a warm gradient background. Clicking an avatar opens a full detail page with an image carousel (Main Reference, Three-quarter, Full body, Product in hand), a rich metadata panel (Identity, Demographics, Characteristics, Appearance, Wardrobe, Voice settings), and a **Remix** action that opens Blu to regenerate variations. An `avatar.md` tab exposes the full markdown specification for the avatar — including voice ID, stability, and wardrobe notes — which can be copied for use in generative pipelines.

---

### Scenes
A grid of background environments for compositing avatars into marketing visuals — Office, Street, Park, Warehouse, Rooftop, Studio, and more. Each scene card works the same way as Avatars: a clickable grid card opens a detail view where you can browse reference images and inspect or remix the scene's visual spec. Scenes are paired with Avatars and Poses to produce consistent, on-brand photorealistic imagery without a photo shoot.

---

### Poses
A library of body poses and stances (Standing, Seated, Walking, Arms Crossed, Pointing, Leaning, etc.) that define how an avatar is positioned within a scene. Like Scenes and Avatars, each pose lives in a searchable grid and has a detail view with reference imagery. The three libraries work together as building blocks: Avatar (who) + Scene (where) + Pose (how) = a composable visual asset.

---

### Design System
Manages your brand's color palettes. The grid shows all defined palettes as four-swatch cards (primary, secondary, dark, light) with the palette name. You can search existing palettes, generate a new one via Blu AI (opens the chat panel and prompts the AI to derive a palette from your brand identity), or upload a brand image file and let the system extract a palette automatically. Clicking a palette opens a full **Design Theme Detail** view where you can inspect individual hex values, rename the palette, and apply it as the active theme across the platform's generated content.

---

## Marketing

### Catalog
The product inventory layer. The **Products** tab is a table of all SKUs with a thumbnail image, full title, price, active/inactive status, last-updated timestamp, and product ID. Each row links to a product detail page. Products can be deleted from the three-dot menu. The **Feeds** child section is reached from a tab inside Catalog or directly from the sidebar.

#### Feeds (under Catalog)
Manages dynamic product recommendation feeds that power personalization slots across emails and web experiences. Each feed has a name (e.g., "Continue where you left off — items in your cart", "Popular Right Now", "New Arrivals"), a type (Regular or Algorithm-driven), status, last-updated date, and creator. A detail drawer lets you configure feed logic — source filters, ranking rules, and max items. Feeds are consumed by Journeys and Experiences to inject context-aware product blocks into customer-facing content.

---

### Journeys
Automated, multi-step marketing campaigns sent across channels over time. The table shows each journey's name, live/draft status, and performance metrics: emails Sent, Opens, Clicks, Replies, Attributed Revenue, and Revenue per Send. Metric cards at the top summarize total reach and a cumulative revenue chart for the selected date range. Clicking a journey opens a full flow-builder preview where you can inspect each step's audience, wait conditions, and message templates. A Code button exposes the journey's underlying JSON spec.

---

### Experiences
A/B tests and personalization experiments that modify what different user segments see on your site or in your app. Each experience row shows its name, running/paused status, type (Client-side Experiment, Server-side, Personalization), active duration, and creator. Metric cards track total attributed revenue alongside a cumulative chart. Clicking an experience opens a detail view with variant breakdown, audience targeting rules, and edit access. The Create Experience drawer lets you configure a new test — name, type, audience segment, and start/end dates.

---

## Sales

### Accounts
A B2B CRM view of every company or organization in your workspace. Columns show account name, last seen date, tag chips (Enterprise, SaaS, SMB, etc.), lifecycle stage (Customer, Prospect, Lead, Churned, Qualified), the assigned account owner, intent level, and number of associated users. A Segment Selector above the table switches between saved account views. The three-dot row menu supports edit and delete (with a confirmation dialog). Creating a new account opens a slide-in drawer with fields for company details and owner assignment.

#### Deals (under Accounts)
A pipeline view of all open and closed revenue opportunities. Each deal row shows the deal name, associated account, deal stage (Prospecting, Qualification, Proposal, Negotiation, Closed Won, Closed Lost), value, owner avatar, deal type (New Business, Upsell, Renewal, Existing Business), priority level, and expected close date. Stage and priority are rendered as colored chips. A Create Deal drawer opens from the action button in the toolbar.

---

### Meetings
A log of all scheduled and past meetings pulled from connected calendar integrations. Each row shows the meeting title (with a calendar icon), start and end time, the primary participant's name with a count of additional attendees, and a status badge — Scheduled (blue), Canceled (red), Not Allowed In (red), or Denied Entry (red). The status reflects real-time meeting-room or call-access state, making this useful for tracking which guests were admitted versus blocked. Clicking a row opens a meeting detail drawer with full participant list, join links, and notification settings.

#### Scheduler (under Meetings)
Manages your team's reusable booking types — the named meeting templates prospects or customers can book themselves. Each booking type has a name (e.g., "Product Demo", "Discovery Call", "Onboarding"), assigned routing type (Round Robin, All, Individual) and team, duration (15m, 30m, 1h), and a visibility toggle to publish or unpublish it. A copy-link button surfaces the shareable booking URL. Creating a new booking type opens a drawer to configure availability rules, buffer times, and routing logic.

---

## Analytics

### Boards
Custom analytics dashboards built from composable chart blocks. The table lists each board by name, type (Dashboard, Retention, Funnel, Traffic, Revenue, Engagement, Insights), creator, last-updated date, and a three-dot menu for rename, reset, or delete. Clicking a board opens a full-screen canvas view with its charts rendered. Board types reflect different analytical questions: Funnel boards track conversion drop-off step by step, Retention boards show cohort return rates, Revenue boards plot MRR/ARR trends, and so on. You can create new boards from the toolbar and inline-rename existing ones by clicking the pencil icon.

---

### Subscription
Shows your current plan's usage against its limits. Metric cards with area charts display consumed versus available quota for Events (per month), MAUs (monthly active users), Seats, and Boards. A detailed breakdown table beneath the charts covers every plan dimension, including overage pricing, with color-coded alerts when you are approaching a limit. Trend indicators show whether usage is growing or shrinking relative to the previous period, and an upgrade prompt surfaces when any dimension is above a configurable threshold.
