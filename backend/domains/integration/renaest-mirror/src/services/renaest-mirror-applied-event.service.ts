// Generated from BP-INTEGRATION-RENAEST-MIRROR-001 v1.0.0 sha256:101ecde2758bd6092f78463c18aa9048dc08acfb0893cd998dacadb3b06f5956
import { Injectable } from '@nestjs/common';
import { RenaestMirrorAppliedEventRepository } from '../repositories/renaest-mirror-applied-event.repository.js';
import type { RenaestMirrorAppliedEvent } from '../entities/renaest-mirror-applied-event.entity.js';
import type { CreateRenaestMirrorAppliedEventDto } from '../dto/create-renaest-mirror-applied-event.dto.js';

@Injectable()
export class RenaestMirrorAppliedEventService {
  constructor(
    private readonly repository: RenaestMirrorAppliedEventRepository,
  ) {}
  findAll(): Promise<RenaestMirrorAppliedEvent[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RenaestMirrorAppliedEvent> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateRenaestMirrorAppliedEventDto,
  ): Promise<RenaestMirrorAppliedEvent> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRenaestMirrorAppliedEventDto>,
  ): Promise<RenaestMirrorAppliedEvent> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
