// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
export interface AlcoholForwarding {
  id: string;
  tenant_id: string;
  procedure_id: string;
  forwarding_type: string;
  destination: string;
  forwarded_at: string;
  protocol?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
}
