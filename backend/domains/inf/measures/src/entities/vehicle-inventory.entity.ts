// Generated from BP-INF-MEASURES-001 v1.2.0 sha256:f6d05352d77e9c4f6fc86a4c3453ea23771ab90fc5f1cdb0482a10c0cb5dfb8b
export interface VehicleInventory {
  id: string;
  tenant_id: string;
  measure_id: string;
  vehicle_snapshot_id: string;
  inventory_json: Record<string, unknown>;
  damage_description?: string | null;
  signed_by_person_id?: string | null;
  created_at: string;
  updated_at?: string | null;
}
