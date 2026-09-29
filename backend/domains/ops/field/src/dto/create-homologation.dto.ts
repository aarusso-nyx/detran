// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:0cecb280a562a6d26c2ea7af68a781de3cfa2ce054d9cae2cc6c1a6c06cc1082
export interface CreateHomologationDto {
  traffic_agency_id: string;
  homologation_number: string;
  scope: string;
  issued_at: string;
  valid_until?: string | null;
  document_uri?: string | null;
  status?: string;
  laudo_emitido_em?: string | null;
  laudo_valido_ate?: string | null;
  emissor_independente?: string | null;
  descricao_publicada_em?: string | null;
  descricao_publicacao_local?: string | null;
  senatran_notificado_em?: string | null;
  senatran_prazo_notificacao?: string | null;
  cancelled_reason?: string | null;
}
