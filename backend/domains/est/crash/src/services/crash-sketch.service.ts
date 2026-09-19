// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
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
