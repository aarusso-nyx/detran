// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
export interface Dataset {
  id: string;
  tenant_id: string;
  dataset_key: string;
  name: string;
  description?: string | null;
  classification: string;
  req_open_format: boolean;
  req_machine_readable: boolean;
  req_data_dictionary: boolean;
  req_periodic_update_history: boolean;
  req_authenticity_integrity: boolean;
  req_searchable: boolean;
  req_accessible: boolean;
  license?: string | null;
  periodicity?: string | null;
  quality_note?: string | null;
  changelog_json: Record<string, unknown>;
  suppression_applied: boolean;
  promoted_by?: string | null;
  promoted_at?: string | null;
  promotion_basis?: string | null;
  published_at?: string | null;
  version: number;
  created_at: string;
  updated_at?: string | null;
}
