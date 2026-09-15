// Generated from BP-INF-COLLECTION-001 v1.0.1 sha256:eb2537783873c7670d66ebe362abad2fe79a9d8e834a0fd30145389f995741d6
export interface CreateDebtHandoffDto {
  infraction_id: string;
  fazenda_reference?: string | null;
  dossier_document_id?: string | null;
  status?: string;
  prepared_at?: string;
  sent_at?: string | null;
  acknowledged_at?: string | null;
  cancel_reason?: string | null;
}
