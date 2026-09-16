// Generated from BP-PORTAL-IDENTITY-001 v1.0.2 sha256:bbfa6f4431768ff2ab5f9af097062b47775c79afb1a954ff7fb21b2c7743e4ea
export interface CreateSubjectDto {
  cpf_hash: string;
  name?: string | null;
  govbr_level_observed?: string | null;
  assurance_level_observed: string;
  observed_at: string;
  version?: number;
}
