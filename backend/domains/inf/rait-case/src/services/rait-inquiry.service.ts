// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:badca32b76e1022606203a012cf996ec5b175c2226d13b99d80123cb84352167
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
