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
import type { CreateNormativeValidationRuleDto } from '../dto/create-normative-validation-rule.dto.js';
import { NormativeValidationRuleService } from '../services/normative-validation-rule.service.js';

@Controller('v1/inf/normative/validation-rules')
@Resource('inf:validation-rule')
export class NormativeValidationRuleController {
  constructor(private readonly service: NormativeValidationRuleService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_NORMATIVE_VALIDATION_RULE_CREATE',
    entity: 'inf.normative_validation_rule',
  })
  create(@Body() dto: CreateNormativeValidationRuleDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_NORMATIVE_VALIDATION_RULE_UPDATE',
    entity: 'inf.normative_validation_rule',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateNormativeValidationRuleDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_NORMATIVE_VALIDATION_RULE_DELETE',
    entity: 'inf.normative_validation_rule',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
