// Generated from BP-INTEGRATION-RENAEST-MIRROR-001 v1.0.0 sha256:101ecde2758bd6092f78463c18aa9048dc08acfb0893cd998dacadb3b06f5956
export interface RenaestMirrorAppliedEvent {
  id: string;
  tenant_id: string;
  projection_name: string;
  event_id: string;
  event_schema_version: number;
  aggregate_version: number;
  applied_at: string;
  created_at: string;
  updated_at?: string | null;
}
