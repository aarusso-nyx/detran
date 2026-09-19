// Generated from BP-PORTAL-REQUESTS-001 v1.0.2 sha256:1861cc41e71895a553a106b4be9f7f02958d1829af65885904d1c8f6a9aeb07c
export interface Evaluation {
  id: string;
  tenant_id: string;
  subject_kind: string;
  subject_id: string;
  scores_json: Record<string, unknown>;
  comment?: string | null;
  submitted_at: string;
  created_at: string;
  updated_at?: string | null;
}
