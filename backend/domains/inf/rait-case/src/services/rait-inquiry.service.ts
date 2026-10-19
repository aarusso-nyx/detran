// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
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
