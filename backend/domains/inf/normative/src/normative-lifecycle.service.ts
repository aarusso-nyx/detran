import { BadRequestException, Injectable } from '@nestjs/common';
import type { Transaction } from '@stynx-nyx/data';

import type { MobileNormativePackage } from './entities/mobile-normative-package.entity.js';
import type { NormativeCatalog } from './entities/normative-catalog.entity.js';
import type { NormativeFraming } from './entities/normative-framing.entity.js';
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
  ) {}

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

  publishCatalog(id: string, publishedAt = today()): Promise<NormativeCatalog> {
    return this.catalogs.transaction(async (tx) => {
      const catalog = await this.catalogs.findOne(id, tx);
      if (!['draft', 'active'].includes(catalog.status))
        throw new BadRequestException(
          `Catalog ${id} cannot be published from ${catalog.status}`,
        );
      return this.catalogs.update(
        id,
        { status: 'active', published_at: publishedAt },
        tx,
      );
    });
  }

  retireCatalog(id: string, validTo = today()): Promise<NormativeCatalog> {
    return this.catalogs.transaction(async (tx) => {
      const catalog = await this.catalogs.findOne(id, tx);
      if (catalog.status !== 'active')
        throw new BadRequestException(
          `Catalog ${id} cannot be retired from ${catalog.status}`,
        );
      return this.catalogs.update(
        id,
        { status: 'retired', valid_to: validTo },
        tx,
      );
    });
  }

  publishPackage(id: string): Promise<MobileNormativePackage> {
    return this.packages.transaction(async (tx) => {
      const sourcePackage = await this.packages.findOne(id, tx);
      await this.assertCatalogActive(sourcePackage.catalog_id, tx);
      return this.packages.update(
        id,
        { status: 'published', published_at: new Date().toISOString() },
        tx,
      );
    });
  }

  retirePackage(
    id: string,
    validUntil = today(),
  ): Promise<MobileNormativePackage> {
    return this.packages.transaction(async (tx) => {
      const sourcePackage = await this.packages.findOne(id, tx);
      if (sourcePackage.status !== 'published')
        throw new BadRequestException(`Package ${id} is not published`);
      return this.packages.update(
        id,
        { status: 'retired', valid_until: validUntil },
        tx,
      );
    });
  }

  async validatePackage(
    id: string,
    expected: { package_version: string; manifest_hash: string },
  ): Promise<{ valid: boolean; reason: string | null }> {
    const sourcePackage = await this.packages.findOne(id);
    if (sourcePackage.status !== 'published')
      return { valid: false, reason: 'not-published' };
    if (sourcePackage.package_version !== expected.package_version)
      return { valid: false, reason: 'version-mismatch' };
    if (sourcePackage.manifest_hash !== expected.manifest_hash)
      return { valid: false, reason: 'hash-mismatch' };
    if (sourcePackage.valid_until && sourcePackage.valid_until < today())
      return { valid: false, reason: 'expired' };
    return { valid: true, reason: null };
  }

  private async assertCatalogActive(
    id: string,
    tx: Transaction,
  ): Promise<void> {
    const catalog = await this.catalogs.findOne(id, tx);
    if (catalog.status !== 'active')
      throw new BadRequestException(`Normative catalog ${id} is not active`);
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
