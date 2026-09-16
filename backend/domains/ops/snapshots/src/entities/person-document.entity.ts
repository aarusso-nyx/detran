// Generated from BP-OPS-SNAPSHOTS-001 v1.1.0 sha256:be057438a0ae6bba679549fa27603002919b4035701f4ea81d9ed853b9c00734
export interface PersonDocument {
  id: string;
  tenant_id: string;
  person_id: string;
  document_type: string;
  document_number: string;
  issuing_uf?: string | null;
  valid_until?: string | null;
  license_category?: string | null;
  status?: string | null;
  source: string;
  created_at: string;
  updated_at?: string | null;
}
