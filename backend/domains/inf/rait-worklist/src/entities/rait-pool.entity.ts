// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.2 sha256:dbdb30cf6d6e61f8180f89ece1cf3a2b22b13e3bb2d41e3480c7d13f917688f5
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
