// Generated from BP-INF-NORMATIVE-001 v1.2.0 sha256:ce4605cd48d6677dc9c5dd6373c5e2500e57fbd2f114d497422e06914a937588
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
