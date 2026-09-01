// Generated from BP-CH-EXAMS-001 v1.1.0 sha256:bc8c0fd1f8e0a5a9684ebb7d2165df727ebdb3730cb7cf8f3bb8b106f2990fa9
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
