// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:0cecb280a562a6d26c2ea7af68a781de3cfa2ce054d9cae2cc6c1a6c06cc1082
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
