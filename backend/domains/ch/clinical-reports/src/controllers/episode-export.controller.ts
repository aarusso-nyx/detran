// Generated from BP-CH-REPORTS-001 v1.1.0 sha256:beee4caafe2a85a62db62a7c64f47b7e234388f5606028dbc331786eb1e2f350
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
