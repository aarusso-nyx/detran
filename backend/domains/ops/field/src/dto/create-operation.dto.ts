// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:0cecb280a562a6d26c2ea7af68a781de3cfa2ce054d9cae2cc6c1a6c06cc1082
export interface CreateOperationDto {
  traffic_agency_id: string;
  name: string;
  operation_type: string;
  description?: string | null;
  planned_start_at?: string | null;
  planned_end_at?: string | null;
  status?: string;
  objectives?: string | null;
}
