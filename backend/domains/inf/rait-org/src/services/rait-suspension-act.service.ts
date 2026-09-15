// Generated from BP-INF-RAIT-ORG-001 v1.0.0 sha256:4f035821c870a58065e91330193c1d2d97076255109085c6a40e5b30690a8ba5
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
