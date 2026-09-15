// Generated from BP-INF-AIT-001 v1.1.0 sha256:de3a429b81e860fb45d3abba728570d01cdfd3b886f55ff770273d4d6fff365f
export interface CreateAitPrintEventDto {
  ait_id: string;
  event_type: string;
  event_at?: string;
  device_id?: string | null;
  printer_identifier?: string | null;
  receipt_hash?: string | null;
  failure_reason?: string | null;
}
