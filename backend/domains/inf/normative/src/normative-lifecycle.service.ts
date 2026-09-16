// CTG-0003 §6 (R-0008, TASK-0007) — o ciclo de vida do catálogo e do pacote
// passou para os comandos de `src/handwritten/` (`publish-catalog`,
// `generate-package`, `publish-package`, `validate-package`), que erram com
// `DetranError` e os códigos do `teat-error-catalog.md` §9. O que sobra aqui
// é a porta de referência normativa consumida por `@detran/inf-ait`.
import { BadRequestException, Injectable } from '@nestjs/common';
import type { Transaction } from '@stynx-nyx/data';

import { MobileNormativePackageRepository } from './repositories/mobile-normative-package.repository.js';
import { NormativeCatalogRepository } from './repositories/normative-catalog.repository.js';
import { NormativeFramingRepository } from './repositories/normative-framing.repository.js';

export interface NormativeReferencePort {
  assertActive(
    catalogId: string,
    framingId: string,
    transaction?: Transaction,
  ): Promise<void>;
}

@Injectable()
export class NormativeLifecycleService implements NormativeReferencePort {
  constructor(
    private readonly catalogs: NormativeCatalogRepository,
    private readonly framings: NormativeFramingRepository,
    private readonly packages: MobileNormativePackageRepository,
  ) {
    void this.packages;
  }

  /**
   * Guarda de referência do AIT (`@detran/inf-ait`): enquadramento `active`
   * dentro de catálogo `active`. Continua em `BadRequestException` porque o
   * código dela não está entre os da §6 deste contrato — a conversão para
   * `DetranError` é decisão do enquadramento do AIT, não desta tarefa.
   */
  async assertActive(
    catalogId: string,
    framingId: string,
    transaction?: Transaction,
  ): Promise<void> {
    const [catalog, framing] = await Promise.all([
      this.catalogs.findOne(catalogId, transaction),
      this.framings.findOne(framingId, transaction),
    ]);
    if (catalog.status !== 'active')
      throw new BadRequestException(
        `Normative catalog ${catalogId} is not active`,
      );
    if (framing.catalog_id !== catalogId || framing.status !== 'active')
      throw new BadRequestException(
        `Framing ${framingId} is not active in catalog ${catalogId}`,
      );
  }
}
