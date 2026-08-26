// Generated from BP-INF-SPEED-001 v1.0.0 sha256:621c9dd37f71bc7fbb14a32b3df72d186e5f6f5d513de297d5559c3ac37ae44e
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
