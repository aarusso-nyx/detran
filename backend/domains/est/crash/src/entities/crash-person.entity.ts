// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
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
