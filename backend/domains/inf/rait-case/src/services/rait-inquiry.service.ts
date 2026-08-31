// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:9d98d9786bc2f4b27bd75cb5516d4a00b6d74e520f3dbc52c39f33effb27f60e
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
