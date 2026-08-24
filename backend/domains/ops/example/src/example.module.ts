// Generated from BP-OPS-EXAMPLE-001 v1.0.0 sha256:a70ca6e407f469de7c4926ee3eea5364795e84c1934982d0662dcaf70341cb29
import { Module } from '@nestjs/common';
import { ExampleRecordController } from './controllers/example-record.controller.js';
import { ExampleRecordService } from './services/example-record.service.js';
import { ExampleRecordRepository } from './repositories/example-record.repository.js';

@Module({
  controllers: [ExampleRecordController],
  providers: [ExampleRecordService, ExampleRecordRepository],
})
export class ExampleModule {}
