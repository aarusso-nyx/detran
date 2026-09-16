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
import type { CreateSignaturePolicyDto } from '../dto/create-signature-policy.dto.js';
import { SignaturePolicyService } from '../services/signature-policy.service.js';

@Controller('v1/inf/normative/signature-policies')
@Resource('inf:signature-policy')
export class SignaturePolicyController {
  constructor(private readonly service: SignaturePolicyService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_SIGNATURE_POLICY_CREATE',
    entity: 'inf.signature_policy',
  })
  create(@Body() dto: CreateSignaturePolicyDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_SIGNATURE_POLICY_UPDATE',
    entity: 'inf.signature_policy',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateSignaturePolicyDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_SIGNATURE_POLICY_DELETE',
    entity: 'inf.signature_policy',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
