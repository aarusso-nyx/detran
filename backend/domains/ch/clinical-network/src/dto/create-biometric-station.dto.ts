// Generated from BP-CH-CLINICAL-NETWORK-001 v1.0.0 sha256:243dd2a69921d6544f3664d22ea24b32a34148a32d18659ca5d926815bfbe154
export interface CreateBiometricStationDto {
  clinic_id: string;
  name: string;
  fingerprint_hash: string;
  camera_serial?: string | null;
  provider_code: string;
  device_certificate_fingerprint: string;
  lfd_capable?: boolean;
  ip_address?: unknown | null;
  location_hint?: string | null;
  is_active?: boolean;
  last_seen_at?: string | null;
}
