// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:9312d2d0009dca8a9a345b86aa4cda330d2bed8e98072f5036909160f5017d1c
import { Injectable } from '@nestjs/common';
import { NormativeAgencyParameterRepository } from '../repositories/normative-agency-parameter.repository.js';
import type { NormativeAgencyParameter } from '../entities/normative-agency-parameter.entity.js';
import type { CreateNormativeAgencyParameterDto } from '../dto/create-normative-agency-parameter.dto.js';

@Injectable()
export class NormativeAgencyParameterService {
  constructor(
    private readonly repository: NormativeAgencyParameterRepository,
  ) {}
  findAll(): Promise<NormativeAgencyParameter[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<NormativeAgencyParameter> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateNormativeAgencyParameterDto,
  ): Promise<NormativeAgencyParameter> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateNormativeAgencyParameterDto>,
  ): Promise<NormativeAgencyParameter> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
