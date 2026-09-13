// Generated from BP-CH-JUNTAS-001 v1.0.0 sha256:5c7e357c88ac5886f460c789a7607211ada27acd49d6f9fd47df0da89ad064f2
export interface CreateJuntaBoardDto {
  case_id: string;
  instance: string;
  designated_by: string;
  designated_at: string;
  designation_deadline_rule?: string | null;
  designation_deadline_at?: string | null;
  decision_deadline_at?: string | null;
}
