// Generated from BP-PORTAL-REQUESTS-001 v1.0.1 sha256:7d0a55a7a82e70ee07788622c4eec34061cd514ce99ee2f768622565ca290904
export interface RequestDraft {
  id: string;
  tenant_id: string;
  request_id: string;
  version: number;
  payload_json: Record<string, unknown>;
  saved_at: string;
  created_at: string;
  updated_at?: string | null;
}
