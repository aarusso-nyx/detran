// Generated from BP-INF-RAIT-ORG-001 v1.0.1 sha256:7ece9578325dfb4c1a393f1ce7805146a621d5e7b4b843176533126efd74d55d
import { Injectable } from '@nestjs/common';
import { RaitCapacityPlanRepository } from '../repositories/rait-capacity-plan.repository.js';
import type { RaitCapacityPlan } from '../entities/rait-capacity-plan.entity.js';
import type { CreateRaitCapacityPlanDto } from '../dto/create-rait-capacity-plan.dto.js';

@Injectable()
export class RaitCapacityPlanService {
  constructor(private readonly repository: RaitCapacityPlanRepository) {}
  findAll(): Promise<RaitCapacityPlan[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitCapacityPlan> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitCapacityPlanDto): Promise<RaitCapacityPlan> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitCapacityPlanDto>,
  ): Promise<RaitCapacityPlan> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
