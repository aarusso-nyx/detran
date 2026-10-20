// Generated from BP-EST-CRASH-001 v1.0.0 sha256:4a862a5d1fd8f24a085897b18c3eb15f3c8e9d822d978efc8d07229f4c13b655
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
