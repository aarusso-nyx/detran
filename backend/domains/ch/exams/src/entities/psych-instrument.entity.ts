// Generated from BP-CH-EXAMS-001 v1.0.0 sha256:b8585266a2e5ca4734d9b60ec5bade83fc01a1b209d3b3dbd1729a16a6b03734
export interface PsychInstrument {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  version: string;
  satepsi_status: string;
  valid_from: string;
  valid_to?: string | null;
  source_reference: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}
