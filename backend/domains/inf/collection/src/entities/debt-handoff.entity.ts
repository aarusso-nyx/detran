// Generated from BP-INF-COLLECTION-001 v1.0.2 sha256:10fb057463797bde8609b1b2a33435d80259cd90c69c2e991c5f42e355f924cd
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
