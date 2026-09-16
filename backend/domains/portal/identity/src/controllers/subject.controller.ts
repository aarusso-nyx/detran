// Generated from BP-PORTAL-IDENTITY-001 v1.0.2 sha256:bbfa6f4431768ff2ab5f9af097062b47775c79afb1a954ff7fb21b2c7743e4ea
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
import type { CreateSubjectDto } from '../dto/create-subject.dto.js';
import { SubjectService } from '../services/subject.service.js';

@Controller('v1/portal/identity/subjects')
@Resource('portal:subject')
export class SubjectController {
  constructor(private readonly service: SubjectService) {}
}
