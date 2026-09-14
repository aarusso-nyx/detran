// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
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
