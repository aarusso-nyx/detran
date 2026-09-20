// Generated from BP-INTEGRATION-RENAEST-MIRROR-001 v1.0.0 sha256:101ecde2758bd6092f78463c18aa9048dc08acfb0893cd998dacadb3b06f5956
import { Injectable } from '@nestjs/common';
import { RenaestMirrorRepository } from '../repositories/renaest-mirror.repository.js';
import type { RenaestMirror } from '../entities/renaest-mirror.entity.js';
import type { CreateRenaestMirrorDto } from '../dto/create-renaest-mirror.dto.js';

@Injectable()
export class RenaestMirrorService {
  constructor(private readonly repository: RenaestMirrorRepository) {}
  findAll(): Promise<RenaestMirror[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RenaestMirror> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRenaestMirrorDto): Promise<RenaestMirror> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRenaestMirrorDto>,
  ): Promise<RenaestMirror> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
