// Generated from BP-PORTAL-IDENTITY-001 v1.0.1 sha256:1a840b3372310d8bdecab94f05cd0978fdb1f53e677cc55361bf6d6f479c723c
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
