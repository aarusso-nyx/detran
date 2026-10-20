// Generated from BP-EST-CRASH-001 v1.0.0 sha256:4a862a5d1fd8f24a085897b18c3eb15f3c8e9d822d978efc8d07229f4c13b655
import { Injectable } from '@nestjs/common';
import { CrashSketchRepository } from '../repositories/crash-sketch.repository.js';
import type { CrashSketch } from '../entities/crash-sketch.entity.js';
import type { CreateCrashSketchDto } from '../dto/create-crash-sketch.dto.js';

@Injectable()
export class CrashSketchService {
  constructor(private readonly repository: CrashSketchRepository) {}
  findAll(): Promise<CrashSketch[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<CrashSketch> {
    return this.repository.findOne(id);
  }
  create(dto: CreateCrashSketchDto): Promise<CrashSketch> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateCrashSketchDto>): Promise<CrashSketch> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
