// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
import { Injectable } from '@nestjs/common';
import { BiPanelRepository } from '../repositories/bi-panel.repository.js';
import type { BiPanel } from '../entities/bi-panel.entity.js';
import type { CreateBiPanelDto } from '../dto/create-bi-panel.dto.js';

@Injectable()
export class BiPanelService {
  constructor(private readonly repository: BiPanelRepository) {}
  findAll(): Promise<BiPanel[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<BiPanel> {
    return this.repository.findOne(id);
  }
  create(dto: CreateBiPanelDto): Promise<BiPanel> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateBiPanelDto>): Promise<BiPanel> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
