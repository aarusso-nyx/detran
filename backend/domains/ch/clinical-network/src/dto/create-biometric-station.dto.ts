// Generated from BP-CH-CLINICAL-NETWORK-001 v1.1.0 sha256:82e75f24c423a323e597e8da9f59db8f0ac0c54ce3edd34ae7e02895d71a176e
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
