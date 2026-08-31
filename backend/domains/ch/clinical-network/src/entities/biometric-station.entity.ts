// Generated from BP-CH-CLINICAL-NETWORK-001 v1.0.0 sha256:9e9bbc2f438a9fcb8207678f2c0927e3013d7ec0f104563fbebaf3ac446c8f7a
export interface BiometricStation {
  id: string;
  tenant_id: string;
  clinic_id: string;
  name: string;
  fingerprint_hash: string;
  camera_serial?: string | null;
  ip_address?: unknown | null;
  location_hint?: string | null;
  is_active: boolean;
  last_seen_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}
