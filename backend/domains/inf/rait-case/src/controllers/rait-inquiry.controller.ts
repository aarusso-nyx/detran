// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:aa7b398ec04e8ec20dddff316e606e4dc5b3dcad6348495f967681cbaf63f107
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';
import type { CreateRaitInquiryDto } from '../dto/create-rait-inquiry.dto.js';
import { RaitInquiryService } from '../services/rait-inquiry.service.js';

@Controller('v1/inf/raitinquiries')
@Resource('inf:rait-inquiry')
export class RaitInquiryController {
  constructor(private readonly service: RaitInquiryService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_RAIT_INQUIRY_CREATE', entity: 'inf.rait_inquiry' })
  create(@Body() dto: CreateRaitInquiryDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_RAIT_INQUIRY_UPDATE', entity: 'inf.rait_inquiry' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRaitInquiryDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_RAIT_INQUIRY_DELETE', entity: 'inf.rait_inquiry' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
