// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
export interface CreateRaitAdmissibilityDto {
  case_id: string;
  criterion: string;
  verdict: boolean;
  reason?: string | null;
  evaluated_at?: string;
  evaluated_by: string;
}
