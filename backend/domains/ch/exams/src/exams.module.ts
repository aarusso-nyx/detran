// Generated from BP-CH-EXAMS-001 v1.1.0 sha256:bc8c0fd1f8e0a5a9684ebb7d2165df727ebdb3730cb7cf8f3bb8b106f2990fa9
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
    ExamCommandsController,
    PsychInstrumentController,
    MedicalExamController,
    PsychologicalExamController,
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
