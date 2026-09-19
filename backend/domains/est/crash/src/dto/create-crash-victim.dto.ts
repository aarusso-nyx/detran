// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
export interface CreateCrashVictimDto {
  crash_record_id: string;
  crash_person_id: string;
  severity: string;
  death_at_scene?: boolean | null;
  medical_care?: boolean | null;
  hospital_destination?: string | null;
  death_at?: string | null;
  health_notes?: string | null;
}
