// Generated from BP-INF-AIT-001 v1.2.0 sha256:bbea1ddf9778bda02679f21a82457ea86830dad4f230eb271a51f14f05d22f6d
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
