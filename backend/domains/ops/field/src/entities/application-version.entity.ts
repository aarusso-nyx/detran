// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:852642f2217b56455f370f0d31299a708cd2582a04621d30461180596cf1de03
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
