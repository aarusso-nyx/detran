// Generated from BP-INF-AIT-001 v1.2.0 sha256:bbea1ddf9778bda02679f21a82457ea86830dad4f230eb271a51f14f05d22f6d
export interface CreateAitPrintEventDto {
  ait_id: string;
  event_type: string;
  event_at?: string;
  device_id?: string | null;
  printer_identifier?: string | null;
  receipt_hash?: string | null;
  failure_reason?: string | null;
}
