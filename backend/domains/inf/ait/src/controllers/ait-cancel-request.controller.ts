// Generated from BP-INF-AIT-001 v1.2.0 sha256:7501ee3ae148ed392c384119fcce2158f0accb353d0ce4c4406b3863321a28ea
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
import type { CreateAitCancelRequestDto } from '../dto/create-ait-cancel-request.dto.js';
import { AitCancelRequestService } from '../services/ait-cancel-request.service.js';

@Controller('v1/inf/ait/cancel-requests')
@Resource('inf:ait-cancel-request')
export class AitCancelRequestController {
  constructor(private readonly service: AitCancelRequestService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_AIT_CANCEL_REQUEST_CREATE',
    entity: 'inf.ait_cancel_request',
  })
  create(@Body() dto: CreateAitCancelRequestDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_AIT_CANCEL_REQUEST_UPDATE',
    entity: 'inf.ait_cancel_request',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAitCancelRequestDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_AIT_CANCEL_REQUEST_DELETE',
    entity: 'inf.ait_cancel_request',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
