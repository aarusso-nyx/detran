// Generated from BP-PORTAL-CITIZEN-SERVICE-001 v1.0.1 sha256:81c05ec48ec8ab36465ae1b250c4a59f59931b99835bfd1ef52f3b10520f9029
export interface ServiceCatalog {
  id: string;
  tenant_id: string;
  service_key: string;
  route: string;
  category: string;
  title: string;
  summary: string;
  requirements_json: Record<string, unknown>;
  delivery_channel: string;
  legal_deadline: string;
  cost: string;
  accessibility_note: string;
  responsible_party: string;
  normative_reference: string;
  availability: string;
  unavailable_reason?: string | null;
  alternative_channel_note?: string | null;
  minimum_assurance: string;
  version: number;
  effective_from: string;
  created_at: string;
  updated_at?: string | null;
}
