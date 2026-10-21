// Generated from BP-PORTAL-REQUESTS-001 v1.0.2 sha256:5473ac653449e703579b07347c595f918249dd6308961a12198eab656de781ae
export interface RequestAttachment {
  id: string;
  tenant_id: string;
  request_id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  sha256: string;
  upload_state: string;
  storage_ref?: string | null;
  created_at: string;
  updated_at?: string | null;
}
