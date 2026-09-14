// Generated from BP-OPS-PARAMETER-001 v1.0.0 sha256:3259251ebb1dfaccd776e889a446ca45db209b824d7760cc132d20c015e3e39e
export interface CreateParameterDto {
  traffic_agency_id?: string | null;
  scope: string;
  surface: string;
  key: string;
  value_json: Record<string, unknown>;
  value_type: string;
  status: string;
  source_pending: boolean;
  legal_readonly: boolean;
  decision_ref: string;
  legal_basis?: string | null;
  reason: string;
  version: number;
  effective_from: string;
  effective_to?: string | null;
  changed_by: string;
}
