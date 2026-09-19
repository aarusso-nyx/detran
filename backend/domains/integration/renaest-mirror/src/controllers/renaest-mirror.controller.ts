// Generated from BP-INTEGRATION-RENAEST-MIRROR-001 v1.0.0 sha256:101ecde2758bd6092f78463c18aa9048dc08acfb0893cd998dacadb3b06f5956
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
import type { CreateRenaestMirrorDto } from '../dto/create-renaest-mirror.dto.js';
import { RenaestMirrorService } from '../services/renaest-mirror.service.js';

@Controller('v1/integration/renaest-mirror/mirrors')
@Resource('integration:renaest-mirror')
export class RenaestMirrorController {
  constructor(private readonly service: RenaestMirrorService) {}
}
