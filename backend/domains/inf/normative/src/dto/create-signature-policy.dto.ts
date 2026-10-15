// Generated from BP-INF-NORMATIVE-001 v1.2.0 sha256:ce4605cd48d6677dc9c5dd6373c5e2500e57fbd2f114d497422e06914a937588
export interface CreateSignaturePolicyDto {
  traffic_agency_id?: string | null;
  document_kind: string;
  required_signers_json: Record<string, unknown>;
  pades_level: string;
  tsa_required?: boolean;
  pdfa_required?: boolean;
  govbr_level?: string | null;
  valid_from?: string | null;
  valid_to?: string | null;
  minimum_signature_level?: string | null;
  require_lta?: boolean | null;
  revocation?: string | null;
  at_time?: string | null;
  accepted_policies?: string[] | null;
  trust_anchors_pem?: string[] | null;
  source_ref?: string | null;
}
