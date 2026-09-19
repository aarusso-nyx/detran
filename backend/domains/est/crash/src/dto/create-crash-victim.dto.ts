// Generated from BP-EST-CRASH-001 v1.0.0 sha256:b47af7c82f17c4a1fa3e3eefb69f476ee022559780b97f30285d2582d18c8231
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
