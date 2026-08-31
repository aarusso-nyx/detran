// Generated from BP-CH-CLINICAL-NETWORK-001 v1.0.0 sha256:98288e4c3b1f3ff28eef48c4d363085a60a99484a1feac9cb173c792d0ac6a3e
export interface BiometricStation {
  id: string;
  tenant_id: string;
  clinic_id: string;
  name: string;
  fingerprint_hash: string;
  camera_serial?: string | null;
  provider_code: string;
  device_certificate_fingerprint: string;
  lfd_capable: boolean;
  ip_address?: unknown | null;
  location_hint?: string | null;
  is_active: boolean;
  last_seen_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}
