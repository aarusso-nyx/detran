// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:18decd0fa5855e93f40ce052c3ffb2ec4ad022530cd5da983fadf681a45bd246
export interface CreateAlcoholForwardingDto {
  procedure_id: string;
  forwarding_type: string;
  destination: string;
  forwarded_at: string;
  protocol?: string | null;
  notes?: string | null;
}
