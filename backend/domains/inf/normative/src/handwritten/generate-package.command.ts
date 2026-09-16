// CTG-0003 §3 e §6.2 (M13, R-0008, TASK-0007) — `POST
// /v1/inf/normative/mobile-packages/generate`.
//
// Gerar rascunho não publica: §8 só nomeia `PACOTE_MOBILE_PUBLICADO`, então
// nenhum envelope sai daqui.
import { randomUUID } from 'node:crypto';

import { DetranError } from '@detran/shared';

import { buildManifest, manifestHashOf } from './manifest.js';
import {
  agencyOfPrincipal,
  catalogNotActive,
  inTenantTransaction,
  insertRow,
  readRow,
  readRows,
  stringOf,
  tenantMismatch,
  tenantScope,
  validationFailed,
  type NormativeDeps,
  type NormativeRow,
} from './normative-runtime.js';

export interface GeneratePackageInput {
  catalog_id: string;
  package_version: string;
  valid_until?: string;
  traffic_agency_id?: string;
}

export interface GeneratePackageResult {
  id: string;
  status: 'draft';
  package_version: string;
  manifest_hash: string;
  catalog_id: string;
  valid_until: string | null;
}

export class GeneratePackageCommand {
  constructor(private readonly deps: NormativeDeps) {}

  async execute(input: GeneratePackageInput): Promise<GeneratePackageResult> {
    const catalogId = stringOf(input?.catalog_id ?? '').trim();
    const packageVersion = stringOf(input?.package_version ?? '').trim();
    const fields = [
      ...(catalogId ? [] : [{ path: 'catalog_id', rule: 'required' }]),
      ...(packageVersion && packageVersion.length <= 80
        ? []
        : [{ path: 'package_version', rule: 'required' }]),
    ];
    if (fields.length > 0) throw validationFailed(fields);

    const catalog = await readRow(this.deps, 'catalogs', catalogId);
    if (!catalog) throw tenantMismatch({ catalogId });
    const currentState = stringOf(catalog.status);
    if (currentState !== 'active')
      throw catalogNotActive(catalogId, currentState);

    const { actorId } = tenantScope(this.deps);
    const agencyId = await this.resolveAgency(input, catalog, actorId);
    const manifest = await buildManifest(this.deps, catalog, agencyId);
    const manifestHash = manifestHashOf(manifest);
    const validUntil = input?.valid_until
      ? stringOf(input.valid_until).slice(0, 10)
      : null;

    const existing = (
      await readRows(
        this.deps,
        'packages',
        (row) => stringOf(row.package_version) === packageVersion,
      )
    )[0];
    if (existing) {
      if (stringOf(existing.manifest_hash) === manifestHash)
        throw new DetranError('TEAT.IDEMPOTENCY_REPLAY', {
          status: 409,
          context: { packageVersion },
          message: 'Já existe pacote com esta versão e o mesmo manifesto.',
        });
      throw validationFailed([{ path: 'package_version', rule: 'unique' }]);
    }

    const id = randomUUID();
    return inTenantTransaction(this.deps, async (tx) => {
      await insertRow(this.deps, tx, 'packages', {
        id,
        traffic_agency_id: agencyId,
        catalog_id: catalogId,
        package_version: packageVersion,
        manifest_hash: manifestHash,
        // §11.11: a coluna é `not null` e o conteúdo mora nesta rota.
        package_uri: `/v1/inf/normative/mobile-packages/${id}/content`,
        published_at: null,
        valid_until: validUntil,
        status: 'draft',
      });

      return {
        id,
        status: 'draft' as const,
        package_version: packageVersion,
        manifest_hash: manifestHash,
        catalog_id: catalogId,
        valid_until: validUntil,
      };
    });
  }

  /**
   * §14.3 — a DTO da §6.2 não carrega o órgão e
   * `normative_mobile_package.traffic_agency_id` é `not null`. Ordem fixada:
   * corpo → perfil do principal (`ops_agent_profile.user_ref = actorId`) →
   * `catalog.traffic_agency_id`. Sem nenhuma das três fontes, 422: o id do
   * tenant nunca é usado como órgão, e nenhum identificador é inventado.
   */
  private async resolveAgency(
    input: GeneratePackageInput,
    catalog: NormativeRow,
    actorId: string,
  ): Promise<string> {
    const fromBody = stringOf(input?.traffic_agency_id ?? '').trim();
    if (fromBody) return fromBody;

    const fromProfile = await agencyOfPrincipal(this.deps, actorId);
    if (fromProfile) return fromProfile;

    const fromCatalog = stringOf(catalog.traffic_agency_id ?? '').trim();
    if (fromCatalog) return fromCatalog;

    throw validationFailed([{ path: 'traffic_agency_id', rule: 'required' }]);
  }
}
