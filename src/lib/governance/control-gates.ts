/**
 * The nine cross-role control gates (B2B full sequence).
 * B2C may skip gates 4 and 7 only when explicitly configured per celebrity policy.
 */
export const CONTROL_GATES = [
  { id: 1, key: "license_scope", label: "License scope" },
  { id: 2, key: "validation", label: "Validation" },
  { id: 3, key: "payment_authorization", label: "Payment authorization" },
  { id: 4, key: "compliance_review", label: "Compliance review" },
  { id: 5, key: "celebrity_approval", label: "Celebrity approval" },
  { id: 6, key: "provider_execution", label: "Provider execution" },
  { id: 7, key: "final_preview_approval", label: "Final preview approval" },
  { id: 8, key: "payment_capture_license", label: "Payment capture + license activation" },
  { id: 9, key: "controlled_delivery", label: "Controlled delivery" },
] as const;

export type ControlGateId = (typeof CONTROL_GATES)[number]["id"];
