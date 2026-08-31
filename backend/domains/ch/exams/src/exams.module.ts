// Generated from BP-CH-EXAMS-001 v1.0.0 sha256:4768197f351ea702628ed5198543624eb79b54621bfc8fb4c6383ecc414b17b9
import { Module } from '@nestjs/common';
import { PsychInstrumentController } from './controllers/psych-instrument.controller.js';
import { PsychInstrumentService } from './services/psych-instrument.service.js';
import { PsychInstrumentRepository } from './repositories/psych-instrument.repository.js';
import { MedicalExamController } from './controllers/medical-exam.controller.js';
import { MedicalExamService } from './services/medical-exam.service.js';
import { MedicalExamRepository } from './repositories/medical-exam.repository.js';
import { PsychologicalExamController } from './controllers/psychological-exam.controller.js';
import { PsychologicalExamService } from './services/psychological-exam.service.js';
import { PsychologicalExamRepository } from './repositories/psychological-exam.repository.js';
import { ExamCommandsController } from './exam-commands.controller.js';
import { ExamLifecycleService } from './exam-lifecycle.service.js';

@Module({
  controllers: [
    PsychInstrumentController,
    MedicalExamController,
    PsychologicalExamController,
    ExamCommandsController,
  ],
  providers: [
    PsychInstrumentService,
    PsychInstrumentRepository,
    MedicalExamService,
    MedicalExamRepository,
    PsychologicalExamService,
    PsychologicalExamRepository,
    ExamLifecycleService,
  ],
})
export class ExamsModule {}
