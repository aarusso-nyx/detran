import { Body, Controller, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import {
  type CreateMedicalExamInput,
  type CreatePsychologicalExamInput,
  ExamLifecycleService,
} from './exam-lifecycle.service.js';

@Controller('v1/ch/exams')
@Resource('ch:exam')
export class ExamCommandsController {
  constructor(private readonly lifecycle: ExamLifecycleService) {}

  @Post('medical')
  @Action('create')
  @Audit({ action: 'CH_MEDICAL_EXAM_CREATE', entity: 'ch.medical_exam' })
  createMedical(@Body() input: CreateMedicalExamInput) {
    return this.lifecycle.createMedical(input);
  }

  @Post('psychological')
  @Action('create')
  @Audit({
    action: 'CH_PSYCHOLOGICAL_EXAM_CREATE',
    entity: 'ch.psychological_exam',
  })
  createPsychological(@Body() input: CreatePsychologicalExamInput) {
    return this.lifecycle.createPsychological(input);
  }
}
