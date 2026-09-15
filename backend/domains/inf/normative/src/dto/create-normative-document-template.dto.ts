// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
export interface CreateNormativeDocumentTemplateDto {
  traffic_agency_id: string;
  document_kind: string;
  domain_scope?: string;
  name: string;
  version: string;
  template_body: string;
  valid_from: string;
  status?: string;
}
