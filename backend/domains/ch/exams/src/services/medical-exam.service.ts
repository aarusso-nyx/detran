// Generated from BP-CH-EXAMS-001 v1.0.0 sha256:4768197f351ea702628ed5198543624eb79b54621bfc8fb4c6383ecc414b17b9
import { Injectable } from '@nestjs/common';
import { MedicalExamRepository } from '../repositories/medical-exam.repository.js';
import type { MedicalExam } from '../entities/medical-exam.entity.js';
import type { CreateMedicalExamDto } from '../dto/create-medical-exam.dto.js';

@Injectable()
export class MedicalExamService {
  constructor(private readonly repository: MedicalExamRepository) {}
  findAll(): Promise<MedicalExam[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<MedicalExam> {
    return this.repository.findOne(id);
  }
  create(dto: CreateMedicalExamDto): Promise<MedicalExam> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateMedicalExamDto>): Promise<MedicalExam> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
