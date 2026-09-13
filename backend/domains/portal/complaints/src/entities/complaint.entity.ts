// Generated from BP-PORTAL-COMPLAINTS-001 v1.0.0 sha256:8c3bc3ce59e94126c71a50e9fad090538fbbb36536ce8c56fca3e2c64e93b60c
export interface Complaint {
  id: string;
  tenant_id: string;
  protocol: string;
  complainant_name?: string | null;
  contact?: string | null;
  category: string;
  status: string;
  description: string;
  payload: Record<string, unknown>;
  assigned_to?: string | null;
  closed_by?: string | null;
  closed_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}
