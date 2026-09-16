// CTG-0003 §3 e §6.5 (M13, ADR-0018, R-0008, TASK-0007) — `GET
// /v1/inf/normative/mobile-packages/{id}/content`.
//
// Recompõe o manifesto do catálogo e compara com o `manifest_hash` gravado:
// divergente → 422 `TEAT.PACKAGE_MANIFEST_MISMATCH` (o pacote foi adulterado
// ou o catálogo mudou sob ele). A assinatura vem da porta
// `PackageSignerPort`; no perfil local ela é `local-unsigned` (OD-T16).
import {
  buildManifest,
  manifestHashOf,
  type NormativeManifest,
} from './manifest.js';
import { LocalPackageSigner } from './package-signer.js';
import {
  manifestMismatch,
  packageStateInvalid,
  readRow,
  stringOf,
  tenantMismatch,
  type NormativeDeps,
  type PackageSignature,
} from './normative-runtime.js';

const READABLE = ['published'] as const;

export interface PackageContentResult {
  manifest: NormativeManifest;
  manifest_hash: string;
  signature: PackageSignature;
}

export class PackageContentQuery {
  constructor(private readonly deps: NormativeDeps) {}

  async execute(packageId: string): Promise<PackageContentResult> {
    const row = await readRow(this.deps, 'packages', packageId);
    if (!row) throw tenantMismatch({ packageId });
    const currentState = stringOf(row.status);
    if (!(READABLE as readonly string[]).includes(currentState))
      throw packageStateInvalid(packageId, currentState, READABLE);

    const catalogId = stringOf(row.catalog_id);
    const catalog = await readRow(this.deps, 'catalogs', catalogId);
    if (!catalog) throw tenantMismatch({ packageId, catalogId });

    const agencyId = row.traffic_agency_id
      ? stringOf(row.traffic_agency_id)
      : null;
    const manifest = await buildManifest(this.deps, catalog, agencyId);
    const manifestHash = manifestHashOf(manifest);
    // §6.5 / OD-T52 (adenda §13): a guarda corre **sempre**; não há exceção
    // por proveniência do pacote.
    const storedHash = stringOf(row.manifest_hash);
    if (manifestHash !== storedHash)
      throw manifestMismatch(packageId, manifestHash, storedHash);

    const signer = this.deps.packageSigner ?? new LocalPackageSigner();
    const signature = await signer.sign(manifestHash);
    return { manifest, manifest_hash: manifestHash, signature };
  }
}
