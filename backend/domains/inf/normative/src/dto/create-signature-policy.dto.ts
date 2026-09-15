// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
export interface CreateSignaturePolicyDto {
  traffic_agency_id: string;
  document_kind: string;
  required_signers_json: Record<string, unknown>;
  pades_level: string;
  tsa_required?: boolean;
  pdfa_required?: boolean;
  govbr_level?: string | null;
  status?: string;
}
