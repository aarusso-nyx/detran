// Generated from BP-INF-RAIT-ORG-001 v1.0.0 sha256:4f035821c870a58065e91330193c1d2d97076255109085c6a40e5b30690a8ba5
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
