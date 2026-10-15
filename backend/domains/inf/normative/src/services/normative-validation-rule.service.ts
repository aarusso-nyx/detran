// Generated from BP-INF-NORMATIVE-001 v1.2.0 sha256:ce4605cd48d6677dc9c5dd6373c5e2500e57fbd2f114d497422e06914a937588
import { Injectable } from '@nestjs/common';
import { NormativeValidationRuleRepository } from '../repositories/normative-validation-rule.repository.js';
import type { NormativeValidationRule } from '../entities/normative-validation-rule.entity.js';
import type { CreateNormativeValidationRuleDto } from '../dto/create-normative-validation-rule.dto.js';

@Injectable()
export class NormativeValidationRuleService {
  constructor(private readonly repository: NormativeValidationRuleRepository) {}
  findAll(): Promise<NormativeValidationRule[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<NormativeValidationRule> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateNormativeValidationRuleDto,
  ): Promise<NormativeValidationRule> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateNormativeValidationRuleDto>,
  ): Promise<NormativeValidationRule> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
