// Generated from BP-PORTAL-COMPLAINTS-001 v1.0.0 sha256:8c3bc3ce59e94126c71a50e9fad090538fbbb36536ce8c56fca3e2c64e93b60c
export interface CreateComplaintDto {
  complainant_name?: string | null;
  contact?: string | null;
  category: string;
  description: string;
  payload?: Record<string, unknown>;
}
