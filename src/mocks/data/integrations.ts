export type IntegrationStatus = {
  label: "Active" | "Syncing" | "Error" | "Disabled";
  tone: "green" | "blue" | "red" | "gray";
};

export type IntegrationRecord = {
  id: string;
  name: string;
  integration: string;
  type: "Source" | "Platform" | "Destination";
  status: IntegrationStatus;
  lastUpdated: string;
  createdBy: string;
};

export const INTEGRATIONS_DATA: IntegrationRecord[] = [
  { id: "js-sdk", name: "JavaScript",           integration: "JavaScript",       type: "Source",      status: { label: "Active",   tone: "green" }, lastUpdated: "Jun 17, 2026, 10:00 AM", createdBy: "Rana V" },
  { id: "c01",    name: "Salesforce CRM",        integration: "Salesforce",       type: "Platform",    status: { label: "Active",   tone: "green" }, lastUpdated: "Jun 15, 2026, 09:14 AM", createdBy: "Rana V" },
  { id: "c02",    name: "HubSpot Marketing",     integration: "HubSpot",          type: "Platform",    status: { label: "Syncing",  tone: "blue"  }, lastUpdated: "Jun 14, 2026, 03:42 PM", createdBy: "Somya Nayak" },
  { id: "c03",    name: "Mailchimp Campaigns",   integration: "Mailchimp",        type: "Destination", status: { label: "Disabled", tone: "gray"  }, lastUpdated: "Jun 10, 2026, 11:30 AM", createdBy: "Eric Gardner" },
  { id: "c04",    name: "SendGrid Transactional",integration: "SendGrid",         type: "Destination", status: { label: "Active",   tone: "green" }, lastUpdated: "Jun 16, 2026, 08:05 AM", createdBy: "Rana V" },
  { id: "c05",    name: "Segment Analytics",     integration: "Segment",          type: "Platform",    status: { label: "Syncing",  tone: "blue"  }, lastUpdated: "Jun 16, 2026, 07:50 AM", createdBy: "Rana V" },
  { id: "c06",    name: "Mixpanel Product",      integration: "Mixpanel",         type: "Destination", status: { label: "Active",   tone: "green" }, lastUpdated: "Jun 13, 2026, 02:17 PM", createdBy: "Somya Nayak" },
  { id: "c07",    name: "Google Analytics 4",    integration: "Google Analytics", type: "Destination", status: { label: "Error",    tone: "red"   }, lastUpdated: "Jun 16, 2026, 10:01 AM", createdBy: "Eric Gardner" },
  { id: "c08",    name: "Stripe Payments",       integration: "Stripe",           type: "Source",      status: { label: "Active",   tone: "green" }, lastUpdated: "Jun 15, 2026, 06:33 PM", createdBy: "Rana V" },
  { id: "c09",    name: "Shopify Store",         integration: "Shopify",          type: "Source",      status: { label: "Syncing",  tone: "blue"  }, lastUpdated: "Jun 14, 2026, 01:22 PM", createdBy: "Somya Nayak" },
  { id: "c10",    name: "WooCommerce Products",  integration: "WooCommerce",      type: "Source",      status: { label: "Disabled", tone: "gray"  }, lastUpdated: "May 28, 2026, 04:45 PM", createdBy: "Eric Gardner" },
  { id: "c11",    name: "Zendesk Support",       integration: "Zendesk",          type: "Source",      status: { label: "Active",   tone: "green" }, lastUpdated: "Jun 12, 2026, 09:58 AM", createdBy: "Rana V" },
  { id: "c12",    name: "Intercom Messenger",    integration: "Intercom",         type: "Destination", status: { label: "Active",   tone: "green" }, lastUpdated: "Jun 11, 2026, 03:14 PM", createdBy: "Somya Nayak" },
  { id: "c13",    name: "Slack Notifications",   integration: "Slack",            type: "Destination", status: { label: "Active",   tone: "green" }, lastUpdated: "Jun 16, 2026, 08:44 AM", createdBy: "Rana V" },
  { id: "c14",    name: "Notion Workspace",      integration: "Notion",           type: "Destination", status: { label: "Error",    tone: "red"   }, lastUpdated: "Jun 01, 2026, 11:00 AM", createdBy: "Eric Gardner" },
  { id: "c15",    name: "Airtable Data Sync",    integration: "Airtable",         type: "Destination", status: { label: "Active",   tone: "green" }, lastUpdated: "Jun 09, 2026, 05:30 PM", createdBy: "Somya Nayak" },
  { id: "c16",    name: "Google Ads Campaigns",  integration: "Google Ads",       type: "Destination", status: { label: "Active",   tone: "green" }, lastUpdated: "Jun 15, 2026, 12:00 PM", createdBy: "Rana V" },
  { id: "c17",    name: "Meta Ads Manager",      integration: "Facebook Ads",     type: "Destination", status: { label: "Error",    tone: "red"   }, lastUpdated: "Jun 16, 2026, 09:55 AM", createdBy: "Somya Nayak" },
  { id: "c18",    name: "Snowflake Warehouse",   integration: "Snowflake",        type: "Destination", status: { label: "Active",   tone: "green" }, lastUpdated: "Jun 16, 2026, 02:30 AM", createdBy: "Eric Gardner" },
  { id: "c19",    name: "BigQuery Export",       integration: "BigQuery",         type: "Destination", status: { label: "Active",   tone: "green" }, lastUpdated: "Jun 16, 2026, 03:00 AM", createdBy: "Rana V" },
  { id: "c20",    name: "Klaviyo Email Flows",   integration: "Klaviyo",          type: "Destination", status: { label: "Active",   tone: "green" }, lastUpdated: "Jun 14, 2026, 07:20 PM", createdBy: "Somya Nayak" },
  { id: "c21",    name: "Amplitude Events",      integration: "Amplitude",        type: "Destination", status: { label: "Disabled", tone: "gray"  }, lastUpdated: "May 30, 2026, 10:15 AM", createdBy: "Eric Gardner" },
  { id: "c22",    name: "Auth0 Identity",        integration: "Auth0",            type: "Source",      status: { label: "Active",   tone: "green" }, lastUpdated: "Jun 07, 2026, 04:00 PM", createdBy: "Rana V" },
  { id: "c23",    name: "Pipedrive Pipeline",    integration: "Pipedrive",        type: "Source",      status: { label: "Active",   tone: "green" }, lastUpdated: "Jun 13, 2026, 01:45 PM", createdBy: "Somya Nayak" },
];
