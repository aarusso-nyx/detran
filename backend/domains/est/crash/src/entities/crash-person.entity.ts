// Generated from BP-EST-CRASH-001 v1.0.0 sha256:4a862a5d1fd8f24a085897b18c3eb15f3c8e9d822d978efc8d07229f4c13b655
export interface CrashPerson {
  id: string;
  tenant_id: string;
  crash_record_id: string;
  person_id?: string | null;
  name?: string | null;
  document_number?: string | null;
  document_source?: string | null;
  crash_vehicle_id?: string | null;
  role: string;
  used_seatbelt_or_helmet?: boolean | null;
  refused_data: boolean;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
}
