// Generated from BP-INF-AIT-001 v1.1.0 sha256:de3a429b81e860fb45d3abba728570d01cdfd3b886f55ff770273d4d6fff365f
export interface CreateAitCancelRequestDto {
  ait_id: string;
  kind: string;
  target_local_act_id?: string | null;
  origin_status: string;
  addressed_to: string;
  status?: string;
  decision?: string | null;
  requested_at?: string;
  decided_at?: string | null;
}
