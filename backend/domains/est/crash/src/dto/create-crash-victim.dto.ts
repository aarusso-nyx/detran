// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
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
