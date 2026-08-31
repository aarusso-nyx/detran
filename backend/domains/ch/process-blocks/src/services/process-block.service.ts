// Generated from BP-CH-PROCESS-BLOCKS-001 v1.0.0 sha256:4e56ae0c6ab4db581d4cd4f3b88014f634c022cc45f8f991a54976b7da46feab
import { Injectable } from '@nestjs/common';
import { ProcessBlockRepository } from '../repositories/process-block.repository.js';
import type { ProcessBlock } from '../entities/process-block.entity.js';
import type { CreateProcessBlockDto } from '../dto/create-process-block.dto.js';

@Injectable()
export class ProcessBlockService {
  constructor(private readonly repository: ProcessBlockRepository) {}
  findAll(): Promise<ProcessBlock[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ProcessBlock> {
    return this.repository.findOne(id);
  }
  create(dto: CreateProcessBlockDto): Promise<ProcessBlock> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateProcessBlockDto>,
  ): Promise<ProcessBlock> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
