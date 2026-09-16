// Generated from BP-INF-SPEED-001 v1.1.0 sha256:a7576a43ce5eca2a2e93dd79ac603a578aa6e7b0127a6dc276c749cd38b02411
export interface SpeedMeasurement {
  id: string;
  tenant_id: string;
  ait_id?: string | null;
  meter_id: string;
  certificate_id: string;
  measured_kmh: number;
  max_error_kmh: number;
  considered_kmh: number;
  road_limit_kmh: number;
  measured_at: string;
  latitude: number;
  longitude: number;
  plate_image_evidence_id?: string | null;
  ocr_plate_proposed?: string | null;
  plate_validated_by_agent: boolean;
  agent_id: string;
  created_at: string;
  updated_at?: string | null;
}
