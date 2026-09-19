// Anexos (contrato CTG-0003a §6.3; spec §7 "PDF/JPEG/PNG ≤ 10 MB"). Ambos só orientam a
// pré-checagem de forma no cliente: o servidor responde `ATTACHMENT_INVALID { allowed[], maxBytes }`
// e esses valores prevalecem quando chegam. Convenção de bytes (10 · 1024 · 1024): OD-P66.
export const ATTACHMENT_ACCEPT = [
  'application/pdf',
  'image/jpeg',
  'image/png',
] as const;

export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
