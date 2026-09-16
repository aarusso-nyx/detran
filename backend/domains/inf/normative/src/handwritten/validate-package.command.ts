// CTG-0003 §6.4 (M13, [WF-TEAT-003], R-0008, TASK-0007) — `POST
// /v1/inf/normative/mobile-packages/{id}/validate`.
//
// Diagnóstico, não transição: idempotente, nunca muda `status`, e nunca
// expõe detalhe interno de armazenamento — a divergência sai em `reason`,
// não em exceção. `VALIDADO_PKG` do workflow é nome de domínio e não
// persiste (§2).
import {
  dateOf,
  readRow,
  stringOf,
  tenantMismatch,
  todayOf,
  type NormativeDeps,
} from './normative-runtime.js';

export const PACKAGE_VALIDATION_REASONS = [
  'version_mismatch',
  'hash_mismatch',
  'not_published',
  'expired',
] as const;

export type PackageValidationReason =
  (typeof PACKAGE_VALIDATION_REASONS)[number];

export interface ValidatePackageInput {
  package_version: string;
  manifest_hash: string;
}

export interface ValidatePackageResult {
  valid: boolean;
  reason: PackageValidationReason | null;
}

export class ValidatePackageCommand {
  constructor(private readonly deps: NormativeDeps) {}

  async execute(
    packageId: string,
    input: ValidatePackageInput,
  ): Promise<ValidatePackageResult> {
    const row = await readRow(this.deps, 'packages', packageId);
    if (!row) throw tenantMismatch({ packageId });

    // Ordem de avaliação fixada pela §6.4: versão → hash → estado → vigência.
    if (stringOf(row.package_version) !== stringOf(input?.package_version))
      return { valid: false, reason: 'version_mismatch' };
    if (stringOf(row.manifest_hash) !== stringOf(input?.manifest_hash))
      return { valid: false, reason: 'hash_mismatch' };
    if (row.status !== 'published')
      return { valid: false, reason: 'not_published' };
    const validUntil = row.valid_until ? dateOf(row.valid_until) : null;
    if (validUntil && validUntil < todayOf(this.deps.clock))
      return { valid: false, reason: 'expired' };
    return { valid: true, reason: null };
  }
}
