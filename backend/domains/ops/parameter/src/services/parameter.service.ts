// Generated from BP-OPS-PARAMETER-001 v1.0.0 sha256:3259251ebb1dfaccd776e889a446ca45db209b824d7760cc132d20c015e3e39e
import { Injectable } from '@nestjs/common';
import { ParameterRepository } from '../repositories/parameter.repository.js';
import type { Parameter } from '../entities/parameter.entity.js';
import type { CreateParameterDto } from '../dto/create-parameter.dto.js';

@Injectable()
export class ParameterService {
  constructor(private readonly repository: ParameterRepository) {}
  findAll(): Promise<Parameter[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Parameter> {
    return this.repository.findOne(id);
  }
  create(dto: CreateParameterDto): Promise<Parameter> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateParameterDto>): Promise<Parameter> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
