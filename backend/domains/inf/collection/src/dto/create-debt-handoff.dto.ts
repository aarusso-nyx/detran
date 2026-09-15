// Generated from BP-INF-COLLECTION-001 v1.0.0 sha256:9553391da82dfaf5acf236128822deb730f18b660ab5416e12bdbb0014ca1c7f
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
