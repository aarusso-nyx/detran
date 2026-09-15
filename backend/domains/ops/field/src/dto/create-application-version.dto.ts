// Generated from BP-OPS-FIELD-001 v1.1.0 sha256:5a59c7ce8135a9525483148958cce1459ea0402e62977f6e952298cd8d4b281e
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
