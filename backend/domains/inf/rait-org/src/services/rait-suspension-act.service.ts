// Generated from BP-INF-RAIT-ORG-001 v1.0.1 sha256:7ece9578325dfb4c1a393f1ce7805146a621d5e7b4b843176533126efd74d55d
import { Injectable } from '@nestjs/common';
import { RaitSuspensionActRepository } from '../repositories/rait-suspension-act.repository.js';
import type { RaitSuspensionAct } from '../entities/rait-suspension-act.entity.js';
import type { CreateRaitSuspensionActDto } from '../dto/create-rait-suspension-act.dto.js';

@Injectable()
export class RaitSuspensionActService {
  constructor(private readonly repository: RaitSuspensionActRepository) {}
  findAll(): Promise<RaitSuspensionAct[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitSuspensionAct> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitSuspensionActDto): Promise<RaitSuspensionAct> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitSuspensionActDto>,
  ): Promise<RaitSuspensionAct> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
