// Generated from BP-INF-RAIT-ORG-001 v1.0.1 sha256:7ece9578325dfb4c1a393f1ce7805146a621d5e7b4b843176533126efd74d55d
import { Injectable } from '@nestjs/common';
import { RaitHolidayRepository } from '../repositories/rait-holiday.repository.js';
import type { RaitHoliday } from '../entities/rait-holiday.entity.js';
import type { CreateRaitHolidayDto } from '../dto/create-rait-holiday.dto.js';

@Injectable()
export class RaitHolidayService {
  constructor(private readonly repository: RaitHolidayRepository) {}
  findAll(): Promise<RaitHoliday[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitHoliday> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitHolidayDto): Promise<RaitHoliday> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateRaitHolidayDto>): Promise<RaitHoliday> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
