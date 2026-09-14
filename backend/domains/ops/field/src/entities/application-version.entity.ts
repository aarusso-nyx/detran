// Generated from BP-OPS-FIELD-001 v1.0.0 sha256:b5a54db524ac2a7fb0bb450442e2aef89132ee0ff1592f87be4837294e197177
export interface ApplicationVersion {
  id: string;
  tenant_id: string;
  app_type: string;
  version: string;
  build_number?: string | null;
  status: string;
  homologation_id?: string | null;
  altera_funcionalidade: boolean;
  valid_from: string;
  valid_to?: string | null;
  created_at: string;
  updated_at?: string | null;
}
