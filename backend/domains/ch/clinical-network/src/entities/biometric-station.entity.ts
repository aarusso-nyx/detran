// Generated from BP-CH-CLINICAL-NETWORK-001 v1.0.0 sha256:17207db7ca179e913375c7645edcf4c43c3e309891634856e04a72dd4a4d8f54
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
