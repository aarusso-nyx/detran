// Generated from BP-INF-COLLECTION-001 v1.0.0 sha256:72e0af13a687dd9bcaa3931941707644a2214b4ece8daa63d55712fee4ad0243
export interface DebtHandoff {
  id: string;
  tenant_id: string;
  infraction_id: string;
  fazenda_reference?: string | null;
  dossier_document_id?: string | null;
  status: string;
  prepared_at: string;
  sent_at?: string | null;
  acknowledged_at?: string | null;
  cancel_reason?: string | null;
  created_at: string;
  updated_at?: string | null;
}
