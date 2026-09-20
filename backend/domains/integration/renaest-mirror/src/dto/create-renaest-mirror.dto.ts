// Generated from BP-INTEGRATION-RENAEST-MIRROR-001 v1.0.0 sha256:101ecde2758bd6092f78463c18aa9048dc08acfb0893cd998dacadb3b06f5956
export interface CreateRenaestMirrorDto {
  crash_id: string;
  protocol?: string | null;
  national_status?: string | null;
  rectifications_json?: Record<string, unknown>;
  last_event_id: string;
  event_schema_version: number;
  aggregate_version: number;
}
