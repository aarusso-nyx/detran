// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:1d733dedb438b939c5b6cbebda82dc6accf415c792fb8da4e82bab6e90a36220
export interface CreateApplicationVersionDto {
  app_type: string;
  version: string;
  build_number?: string | null;
  status?: string;
  homologation_id?: string | null;
  altera_funcionalidade?: boolean;
  valid_from: string;
  valid_to?: string | null;
}
