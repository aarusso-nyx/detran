// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:41cbbec5aa5c5c6aa56495204f1b421d456abe78852bb03fd76a03715cbde6b1
export interface CreateNormativeMetrologicalTableDto {
  catalog_id: string;
  table_name: string;
  version: string;
  table_json: Record<string, unknown>;
  valid_from: string;
  valid_to?: string | null;
  status?: string;
}
