// Generated from BP-OPS-EXAMPLE-001 v1.0.0 sha256:a70ca6e407f469de7c4926ee3eea5364795e84c1934982d0662dcaf70341cb29
import { Controller, Get, Param } from '@nestjs/common';
import { Action, Resource } from '@detran/shared';
import { ExampleRecordService } from '../services/example-record.service.js';

@Controller('v1/example-records')
@Resource('ops:example-record')
export class ExampleRecordController {
  constructor(private readonly service: ExampleRecordService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
