// Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1 sha256:fc1505677703646b1e55dc6283e1e0cce5331627fd5b9bd0ed732c1a77c00430
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
