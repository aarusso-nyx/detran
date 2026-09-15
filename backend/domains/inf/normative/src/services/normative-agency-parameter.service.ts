// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
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
