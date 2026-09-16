// Generated from BP-PORTAL-REQUESTS-001 v1.0.1 sha256:7d0a55a7a82e70ee07788622c4eec34061cd514ce99ee2f768622565ca290904
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
import type { CreateEvaluationDto } from '../dto/create-evaluation.dto.js';
import { EvaluationService } from '../services/evaluation.service.js';

@Controller('v1/portal/requests/evaluations')
@Resource('portal:evaluation')
export class EvaluationController {
  constructor(private readonly service: EvaluationService) {}
}
