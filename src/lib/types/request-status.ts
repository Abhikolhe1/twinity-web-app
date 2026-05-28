/**
 * Request lifecycle statuses — transitions must match VALID_TRANSITIONS in backend.
 */
export const RequestStatus = {
  DRAFT: "draft",
  PENDING_PAYMENT: "pending_payment",
  PAYMENT_AUTHORIZED: "payment_authorized",
  PENDING_VALIDATION: "pending_validation",
  VALIDATION_FAILED: "validation_failed",
  PROCESSING_FAILED: "processing_failed",
  PENDING_COMPLIANCE: "pending_compliance",
  COMPLIANCE_CLEARED: "compliance_cleared",
  PENDING_APPROVAL: "pending_approval",
  EDIT_REQUESTED: "edit_requested",
  APPROVED: "approved",
  REJECTED: "rejected",
  PROVIDER_QUEUED: "provider_queued",
  PROVIDER_PROCESSING: "provider_processing",
  PROVIDER_COMPLETE: "provider_complete",
  PREVIEW_REVIEW: "preview_review",
  PENDING_CAPTURE: "pending_capture",
  LICENSE_ACTIVATING: "license_activating",
  DELIVERED: "delivered",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
} as const;

export type RequestStatusValue = (typeof RequestStatus)[keyof typeof RequestStatus];
