// Generated from BP-CH-CLINICAL-NETWORK-001 v1.1.1 sha256:cf3ec339cc0ca843606bd21a0fdf72f4b789898c5953117bfb9bf4fef54c191d
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
