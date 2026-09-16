// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:41cbbec5aa5c5c6aa56495204f1b421d456abe78852bb03fd76a03715cbde6b1
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
