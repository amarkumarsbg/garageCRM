"use client";

import { Badge } from "@/components/ui/badge";
import type { JobCardStatus, InvoiceStatus } from "@/types";

const JOB_CARD_STATUS_CONFIG: Record<JobCardStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" }> = {
  RECEIVED: { label: "Received", variant: "info" },
  INSPECTION: { label: "Inspection", variant: "warning" },
  AWAITING_APPROVAL: { label: "Awaiting Approval", variant: "warning" },
  IN_SERVICE: { label: "In Service", variant: "default" },
  QUALITY_CHECK: { label: "Quality Check", variant: "secondary" },
  READY: { label: "Ready", variant: "success" },
  DELIVERED: { label: "Delivered", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  ISSUED: { label: "Issued", variant: "info" },
  PARTIALLY_PAID: { label: "Partial", variant: "warning" },
  PAID: { label: "Paid", variant: "success" },
};

export function JobCardStatusBadge({ status }: { status: JobCardStatus }) {
  const config = JOB_CARD_STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const config = INVOICE_STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
