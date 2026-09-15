// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
export interface NormativeMetrologicalTable {
  id: string;
  tenant_id: string;
  catalog_id: string;
  table_name: string;
  version: string;
  table_json: Record<string, unknown>;
  valid_from: string;
  valid_to?: string | null;
  status: string;
  created_at: string;
  updated_at?: string | null;
}
