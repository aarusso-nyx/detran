import { Module } from '@nestjs/common';
import { CdtController } from './cdt.controller.js';
import { CdtService } from './cdt.service.js';
import { RenainfModule } from '../../../renainf/api/src/renainf.module.js';

@Module({
  imports: [RenainfModule],
  controllers: [CdtController],
  providers: [CdtService],
})
export class CdtModule {}
