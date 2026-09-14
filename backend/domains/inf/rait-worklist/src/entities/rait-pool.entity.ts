// Generated from BP-INF-RAIT-WORKLIST-001 v1.1.0 sha256:972161ec1957bb785b269fd1714f3431aae529393cf58c5a2ef7fa2984a65f8f
export interface RaitPool {
  id: string;
  tenant_id: string;
  name: string;
  instance: string;
  circuit: number;
  strategy: string;
  active: boolean;
  unit_id?: string | null;
  priority_policy: string;
  created_at: string;
  updated_at?: string | null;
}
