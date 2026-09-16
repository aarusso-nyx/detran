// Generated from BP-PORTAL-IDENTITY-001 v1.0.1 sha256:1a840b3372310d8bdecab94f05cd0978fdb1f53e677cc55361bf6d6f479c723c
export interface CreateEntitlementDto {
  subject_id: string;
  target_kind: string;
  target_id: string;
  relation: string;
  origin: string;
  valid_from: string;
  valid_until?: string | null;
}
