// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:18decd0fa5855e93f40ce052c3ffb2ec4ad022530cd5da983fadf681a45bd246
export interface PsychomotorSign {
  id: string;
  tenant_id: string;
  procedure_id: string;
  sign_code: string;
  description: string;
  observed: boolean;
  sign_group?: string | null;
  sign_status?: string | null;
  method?: string | null;
  created_at: string;
  updated_at?: string | null;
}
