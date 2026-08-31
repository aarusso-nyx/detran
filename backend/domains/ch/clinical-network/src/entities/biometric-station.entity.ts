// Generated from BP-CH-CLINICAL-NETWORK-001 v1.1.0 sha256:6257f652f4d63bb50c213e96f5977765a32de34bf9f211bea0c1d69d6f2a54db
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
