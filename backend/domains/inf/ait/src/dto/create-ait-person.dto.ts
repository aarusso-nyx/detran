// Generated from BP-INF-AIT-001 v1.0.0 sha256:ef69813e9ad97641c04b7bbbdb8110fe97446523d552fdf17da429d55de0b510
export interface CreateAitPersonDto {
  ait_id: string;
  person_id: string;
  role: string;
  identified_by: string;
  external_query_id?: string | null;
  signed?: boolean;
  refused_signature?: boolean;
  notes?: string | null;
}
