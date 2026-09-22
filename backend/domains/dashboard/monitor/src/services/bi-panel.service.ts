// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
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
