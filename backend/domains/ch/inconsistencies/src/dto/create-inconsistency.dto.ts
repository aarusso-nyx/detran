// Generated from BP-CH-INCONSISTENCIES-001 v1.0.0 sha256:8d41845822fa8f12974a6647c408a271a91454cc1edf96a2d24a695385b1f72e
export interface CreateInconsistencyDto {
  encounter_id?: string | null;
  source_system: string;
  severity: string;
  detection_reason: string;
  detection_payload?: Record<string, unknown>;
}
