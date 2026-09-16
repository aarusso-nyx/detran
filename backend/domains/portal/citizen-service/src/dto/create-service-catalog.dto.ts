// Generated from BP-PORTAL-CITIZEN-SERVICE-001 v1.0.0 sha256:adb8933e9c3c31077273c68bff12efa5e0bfefa8843cdc29798c6d43fa63a246
export interface CreateServiceCatalogDto {
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
  version?: number;
  effective_from: string;
}
