// Generated from BP-CH-PROCESS-BLOCKS-001 v1.0.0 sha256:4e56ae0c6ab4db581d4cd4f3b88014f634c022cc45f8f991a54976b7da46feab
export interface CreateProcessBlockDto {
  encounter_id: string;
  block_kind: string;
  source_system?: string;
  message?: string | null;
  active?: boolean;
}
