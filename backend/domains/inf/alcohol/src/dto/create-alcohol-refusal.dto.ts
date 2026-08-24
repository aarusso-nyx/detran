// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
export interface CreateAlcoholRefusalDto {
  procedure_id: string;
  refused_at: string;
  refusal_description: string;
  witness_person_id?: string | null;
  evidence_id?: string | null;
}
