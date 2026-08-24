// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:8f7f7c36486cc7f2062f87bdfda6722994b3aff5dc8e5b80183ffea196fad19f
export interface CreateNormativeFramingDto {
  catalog_id: string;
  framing_code: string;
  article?: string | null;
  clause?: string | null;
  description: string;
  severity?: string | null;
  penalty?: string | null;
  administrative_measure_summary?: string | null;
  allows_no_approach?: boolean;
  requires_observation?: boolean;
  requires_equipment?: boolean;
  status?: string;
}
