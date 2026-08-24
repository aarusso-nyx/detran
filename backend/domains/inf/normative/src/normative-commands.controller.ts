import { Body, Controller, Param, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import { NormativeLifecycleService } from './normative-lifecycle.service.js';

@Controller('v1/inf/normative')
@Resource('inf:normative-catalog')
export class NormativeCommandsController {
  constructor(private readonly lifecycle: NormativeLifecycleService) {}

  @Post('catalogs/:id/publish')
  @Action('publish')
  @Audit({
    action: 'INF_NORMATIVE_CATALOG_PUBLISH',
    entity: 'inf.normative_catalog',
  })
  publishCatalog(
    @Param('id') id: string,
    @Body() body: { published_at?: string },
  ) {
    return this.lifecycle.publishCatalog(id, body.published_at);
  }

  @Post('catalogs/:id/retire')
  @Action('retire')
  @Audit({
    action: 'INF_NORMATIVE_CATALOG_RETIRE',
    entity: 'inf.normative_catalog',
  })
  retireCatalog(@Param('id') id: string, @Body() body: { valid_to?: string }) {
    return this.lifecycle.retireCatalog(id, body.valid_to);
  }

  @Post('mobile-packages/:id/publish')
  @Resource('inf:mobile-normative-package')
  @Action('publish')
  @Audit({
    action: 'INF_NORMATIVE_PACKAGE_PUBLISH',
    entity: 'inf.normative_mobile_package',
  })
  publishPackage(@Param('id') id: string) {
    return this.lifecycle.publishPackage(id);
  }

  @Post('mobile-packages/:id/retire')
  @Resource('inf:mobile-normative-package')
  @Action('retire')
  @Audit({
    action: 'INF_NORMATIVE_PACKAGE_RETIRE',
    entity: 'inf.normative_mobile_package',
  })
  retirePackage(
    @Param('id') id: string,
    @Body() body: { valid_until?: string },
  ) {
    return this.lifecycle.retirePackage(id, body.valid_until);
  }

  @Post('mobile-packages/:id/validate')
  @Resource('inf:mobile-normative-package')
  @Action('validate')
  @Audit({
    action: 'INF_NORMATIVE_PACKAGE_VALIDATE',
    entity: 'inf.normative_mobile_package',
  })
  validatePackage(
    @Param('id') id: string,
    @Body() body: { package_version: string; manifest_hash: string },
  ) {
    return this.lifecycle.validatePackage(id, body);
  }
}
