// CTG-0003 §6 (M13, R-0008, TASK-0007) — comandos e consultas do catálogo e
// do pacote normativo sob `v1/inf/normative`.
//
// As rotas literais (`mobile-packages/sync-metadata`, `.../generate`,
// `.../{id}/content`) vencem o `:id` do CRUD gerado porque o gerador registra
// os controladores manuscritos antes (adenda CTG-0003 §12 item 1).
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import type { GeneratePackageInput } from './handwritten/generate-package.command.js';
import { NormativeCommandsService } from './handwritten/normative-commands.service.js';
import type {
  PublishCatalogInput,
  RetireCatalogInput,
} from './handwritten/publish-catalog.command.js';
import type {
  PublishPackageInput,
  RetirePackageInput,
} from './handwritten/publish-package.command.js';
import type { ValidatePackageInput } from './handwritten/validate-package.command.js';

/**
 * Superfície mínima da resposta HTTP usada pelo 304 da §14.2 — evita amarrar
 * o módulo de domínio ao tipo concreto do adaptador HTTP.
 */
interface HttpResponseLike {
  setHeader(name: string, value: string): unknown;
  status(code: number): unknown;
}

/**
 * `If-None-Match` do RFC 9110 §13.1.2: lista separada por vírgula, `*`,
 * aspas e o prefixo fraco `W/` são todos aceitos na comparação.
 */
function matchesEtag(
  ifNoneMatch: string | undefined,
  manifestHash: string,
): boolean {
  if (!ifNoneMatch) return false;
  return ifNoneMatch
    .split(',')
    .map((candidate) =>
      candidate.trim().replace(/^W\//iu, '').replace(/"/gu, ''),
    )
    .some((candidate) => candidate === '*' || candidate === manifestHash);
}

@Controller('v1/inf/normative')
@Resource('inf:normative-catalog')
export class NormativeCommandsController {
  constructor(private readonly commands: NormativeCommandsService) {}

  @Post('catalogs/:id/publish')
  @HttpCode(200)
  @Action('publish')
  @Audit({
    action: 'INF_NORMATIVE_CATALOG_PUBLISH',
    entity: 'inf.normative_catalog',
  })
  publishCatalog(@Param('id') id: string, @Body() body: PublishCatalogInput) {
    return this.commands.publishCatalog(id, body ?? {});
  }

  @Post('catalogs/:id/retire')
  @HttpCode(200)
  @Action('retire')
  @Audit({
    action: 'INF_NORMATIVE_CATALOG_RETIRE',
    entity: 'inf.normative_catalog',
  })
  retireCatalog(@Param('id') id: string, @Body() body: RetireCatalogInput) {
    return this.commands.retireCatalog(id, body ?? {});
  }

  @Get('mobile-packages/sync-metadata')
  @Resource('inf:mobile-normative-package')
  @Action('read')
  syncMetadata() {
    return this.commands.packageSyncMetadata();
  }

  @Post('mobile-packages/generate')
  @Resource('inf:mobile-normative-package')
  @Action('publish')
  @Audit({
    action: 'INF_NORMATIVE_PACKAGE_GENERATE',
    entity: 'inf.normative_mobile_package',
  })
  generatePackage(@Body() body: GeneratePackageInput) {
    return this.commands.generate(body);
  }

  /**
   * §6.5 e §14.2: a resposta carrega `ETag: "<manifest_hash>"`; um
   * `If-None-Match` igual ao hash devolve 304 sem corpo. A guarda de
   * integridade do manifesto corre antes de qualquer resposta — inclusive
   * antes do 304 —, porque quem revalida precisa saber que o pacote deixou de
   * bater com o catálogo.
   */
  @Get('mobile-packages/:id/content')
  @Resource('inf:mobile-normative-package')
  @Action('read')
  async packageContent(
    @Param('id') id: string,
    @Headers('if-none-match') ifNoneMatch: string | undefined,
    @Res({ passthrough: true }) response: HttpResponseLike,
  ) {
    const content = await this.commands.packageContent(id);
    response.setHeader('ETag', `"${content.manifest_hash}"`);
    if (matchesEtag(ifNoneMatch, content.manifest_hash)) {
      response.status(304);
      return undefined;
    }
    return content;
  }

  @Post('mobile-packages/:id/publish')
  @HttpCode(200)
  @Resource('inf:mobile-normative-package')
  @Action('publish')
  @Audit({
    action: 'INF_NORMATIVE_PACKAGE_PUBLISH',
    entity: 'inf.normative_mobile_package',
  })
  publishPackage(@Param('id') id: string, @Body() body: PublishPackageInput) {
    return this.commands.publishPackage(id, body ?? {});
  }

  @Post('mobile-packages/:id/retire')
  @HttpCode(200)
  @Resource('inf:mobile-normative-package')
  @Action('retire')
  @Audit({
    action: 'INF_NORMATIVE_PACKAGE_RETIRE',
    entity: 'inf.normative_mobile_package',
  })
  retirePackage(@Param('id') id: string, @Body() body: RetirePackageInput) {
    return this.commands.retirePackage(id, body ?? {});
  }

  @Post('mobile-packages/:id/validate')
  @HttpCode(200)
  @Resource('inf:mobile-normative-package')
  @Action('validate')
  @Audit({
    action: 'INF_NORMATIVE_PACKAGE_VALIDATE',
    entity: 'inf.normative_mobile_package',
  })
  validatePackage(@Param('id') id: string, @Body() body: ValidatePackageInput) {
    return this.commands.validatePackage(id, body);
  }
}
