/**
 * Core Twinity entities (Supabase / PostgreSQL). ManagerDelegation appears in the
 * ER overview in BRD; DDL in the data-model skill covers the tables below.
 */
export type TwinityEntityName =
  | "users"
  | "business_profiles"
  | "celebrity_profiles"
  | "restriction_rules"
  | "requests"
  | "licenses"
  | "payment_transactions"
  | "approval_events"
  | "provider_jobs"
  | "uploads"
  | "audit_logs"
  | "service_templates";
