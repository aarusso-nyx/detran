// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:9a2e982eefaba2059cf30be7def3e7f3da9a6c5c6b89957df63f173a8d30afee
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
