// Generated from BP-INTEGRATION-RENAEST-MIRROR-001 v1.0.0 sha256:101ecde2758bd6092f78463c18aa9048dc08acfb0893cd998dacadb3b06f5956
import { Module } from '@nestjs/common';
import { RenaestMirrorController } from './controllers/renaest-mirror.controller.js';
import { RenaestMirrorService } from './services/renaest-mirror.service.js';
import { RenaestMirrorRepository } from './repositories/renaest-mirror.repository.js';
import { RenaestMirrorAppliedEventController } from './controllers/renaest-mirror-applied-event.controller.js';
import { RenaestMirrorAppliedEventService } from './services/renaest-mirror-applied-event.service.js';
import { RenaestMirrorAppliedEventRepository } from './repositories/renaest-mirror-applied-event.repository.js';
import { RenaestMirrorProjection } from './handwritten/renaest-mirror.projection.js';

@Module({
  controllers: [RenaestMirrorController, RenaestMirrorAppliedEventController],
  providers: [
    RenaestMirrorService,
    RenaestMirrorRepository,
    RenaestMirrorAppliedEventService,
    RenaestMirrorAppliedEventRepository,
    RenaestMirrorProjection,
  ],
})
export class RenaestMirrorModule {}
