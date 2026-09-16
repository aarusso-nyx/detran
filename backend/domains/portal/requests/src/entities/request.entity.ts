// Generated from BP-PORTAL-REQUESTS-001 v1.0.1 sha256:7d0a55a7a82e70ee07788622c4eec34061cd514ce99ee2f768622565ca290904
export interface Request {
  id: string;
  tenant_id: string;
  state: string;
  service_key: string;
  subject_id: string;
  target_kind: string;
  target_id?: string | null;
  channel: string;
  delegation_domain?: string | null;
  delegation_command?: string | null;
  delegation_external_id?: string | null;
  delegation_status: string;
  delegation_error?: string | null;
  minimum_assurance: string;
  version: number;
  withdrawn_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}
