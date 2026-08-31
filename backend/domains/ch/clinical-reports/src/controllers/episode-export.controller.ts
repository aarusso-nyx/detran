// Generated from BP-CH-REPORTS-001 v1.2.0 sha256:5045696b00b62bf7bd1c4ae7976e61f61de9954c392aed7987edaa45ba169501
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
import type { CreateEpisodeExportDto } from '../dto/create-episode-export.dto.js';
import { EpisodeExportService } from '../services/episode-export.service.js';

@Controller('v1/ch/episode-exports')
@Resource('ch:episode-export')
export class EpisodeExportController {
  constructor(private readonly service: EpisodeExportService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
