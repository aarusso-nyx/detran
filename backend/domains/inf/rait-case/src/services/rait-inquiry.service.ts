// Generated from BP-INF-RAIT-CASE-001 v1.1.0 sha256:f85c2f343d3739d77786d05e0f2f98d07e00de6ca63aa3aaa743b5b949714f62
import { Injectable } from '@nestjs/common';
import { RaitInquiryRepository } from '../repositories/rait-inquiry.repository.js';
import type { RaitInquiry } from '../entities/rait-inquiry.entity.js';
import type { CreateRaitInquiryDto } from '../dto/create-rait-inquiry.dto.js';

@Injectable()
export class RaitInquiryService {
  constructor(private readonly repository: RaitInquiryRepository) {}
  findAll(): Promise<RaitInquiry[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitInquiry> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitInquiryDto): Promise<RaitInquiry> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateRaitInquiryDto>): Promise<RaitInquiry> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
