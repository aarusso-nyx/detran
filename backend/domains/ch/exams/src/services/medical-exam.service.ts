// Generated from BP-CH-EXAMS-001 v1.1.0 sha256:bc8c0fd1f8e0a5a9684ebb7d2165df727ebdb3730cb7cf8f3bb8b106f2990fa9
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
