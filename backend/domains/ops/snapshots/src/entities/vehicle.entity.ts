// Generated from BP-OPS-SNAPSHOTS-001 v1.1.0 sha256:c995962d248172eeb08cd92993fc4cafac0eada70cdbf240c54a4c69ce94edc4
export interface Vehicle {
  id: string;
  tenant_id: string;
  plate: string;
  renavam?: string | null;
  chassis?: string | null;
  uf?: string | null;
  municipality_code?: string | null;
  make_model?: string | null;
  species?: string | null;
  category?: string | null;
  color?: string | null;
  source: string;
  created_at: string;
  updated_at?: string | null;
}
