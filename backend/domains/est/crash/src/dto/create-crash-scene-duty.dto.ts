// Generated from BP-EST-CRASH-001 v1.0.0 sha256:4a862a5d1fd8f24a085897b18c3eb15f3c8e9d822d978efc8d07229f4c13b655
export interface CreateCrashSceneDutyDto {
  crash_record_id: string;
  regime: string;
  duty_code: string;
  crash_person_id?: string | null;
  crash_vehicle_id?: string | null;
  complied: boolean;
  note?: string | null;
}
