// Generated from BP-INF-AIT-001 v1.2.0 sha256:929e2e65586fc826e76dc66fceae7a52e7920abed66169e1291a67e2bd055f6d
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
