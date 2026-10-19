// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
export interface CreateRaitPoolDto {
  name: string;
  instance: string;
  circuit: number;
  strategy: string;
  active?: boolean;
  unit_id?: string | null;
  priority_policy?: string;
}
