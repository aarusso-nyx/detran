// Generated from BP-INF-ALCOHOL-001 v1.2.0 sha256:f54fa6e2f04e73d65b7b187ded6fe373d6b14c80f840688310d1f09b9420e20f
export interface CreatePsychomotorSignDto {
  procedure_id: string;
  sign_code: string;
  description: string;
  observed?: boolean;
  sign_group?: string | null;
  sign_status?: string | null;
  method?: string | null;
}
