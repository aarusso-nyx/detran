// Generated from BP-CH-EXAMS-001 v1.0.0 sha256:4768197f351ea702628ed5198543624eb79b54621bfc8fb4c6383ecc414b17b9
export interface CreatePsychInstrumentDto {
  code: string;
  name: string;
  version: string;
  satepsi_status: string;
  valid_from: string;
  valid_to?: string | null;
  source_reference: string;
  is_active?: boolean;
}
