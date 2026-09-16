// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:41cbbec5aa5c5c6aa56495204f1b421d456abe78852bb03fd76a03715cbde6b1
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';
import type { CreateMobileNormativePackageDto } from '../dto/create-mobile-normative-package.dto.js';
import { MobileNormativePackageService } from '../services/mobile-normative-package.service.js';

@Controller('v1/inf/normative/mobile-packages')
@Resource('inf:mobile-normative-package')
export class MobileNormativePackageController {
  constructor(private readonly service: MobileNormativePackageService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_NORMATIVE_MOBILE_PACKAGE_CREATE',
    entity: 'inf.normative_mobile_package',
  })
  create(@Body() dto: CreateMobileNormativePackageDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_NORMATIVE_MOBILE_PACKAGE_UPDATE',
    entity: 'inf.normative_mobile_package',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateMobileNormativePackageDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_NORMATIVE_MOBILE_PACKAGE_DELETE',
    entity: 'inf.normative_mobile_package',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
