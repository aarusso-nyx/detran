// Generated from BP-INF-RAIT-ORG-001 v1.0.0 sha256:4f035821c870a58065e91330193c1d2d97076255109085c6a40e5b30690a8ba5
import { Module } from '@nestjs/common';
import { RaitHolidayController } from './controllers/rait-holiday.controller.js';
import { RaitHolidayService } from './services/rait-holiday.service.js';
import { RaitHolidayRepository } from './repositories/rait-holiday.repository.js';
import { RaitSuspensionActController } from './controllers/rait-suspension-act.controller.js';
import { RaitSuspensionActService } from './services/rait-suspension-act.service.js';
import { RaitSuspensionActRepository } from './repositories/rait-suspension-act.repository.js';
import { RaitJetonSheetController } from './controllers/rait-jeton-sheet.controller.js';
import { RaitJetonSheetService } from './services/rait-jeton-sheet.service.js';
import { RaitJetonSheetRepository } from './repositories/rait-jeton-sheet.repository.js';
import { RaitJetonLineController } from './controllers/rait-jeton-line.controller.js';
import { RaitJetonLineService } from './services/rait-jeton-line.service.js';
import { RaitJetonLineRepository } from './repositories/rait-jeton-line.repository.js';
import { RaitIncidentController } from './controllers/rait-incident.controller.js';
import { RaitIncidentService } from './services/rait-incident.service.js';
import { RaitIncidentRepository } from './repositories/rait-incident.repository.js';
import { RaitQualitySampleController } from './controllers/rait-quality-sample.controller.js';
import { RaitQualitySampleService } from './services/rait-quality-sample.service.js';
import { RaitQualitySampleRepository } from './repositories/rait-quality-sample.repository.js';
import { RaitCapacityPlanController } from './controllers/rait-capacity-plan.controller.js';
import { RaitCapacityPlanService } from './services/rait-capacity-plan.service.js';
import { RaitCapacityPlanRepository } from './repositories/rait-capacity-plan.repository.js';
import { RaitExportController } from './controllers/rait-export.controller.js';
import { RaitExportService } from './services/rait-export.service.js';
import { RaitExportRepository } from './repositories/rait-export.repository.js';

@Module({
  controllers: [
    RaitHolidayController,
    RaitSuspensionActController,
    RaitJetonSheetController,
    RaitJetonLineController,
    RaitIncidentController,
    RaitQualitySampleController,
    RaitCapacityPlanController,
    RaitExportController,
  ],
  providers: [
    RaitHolidayService,
    RaitHolidayRepository,
    RaitSuspensionActService,
    RaitSuspensionActRepository,
    RaitJetonSheetService,
    RaitJetonSheetRepository,
    RaitJetonLineService,
    RaitJetonLineRepository,
    RaitIncidentService,
    RaitIncidentRepository,
    RaitQualitySampleService,
    RaitQualitySampleRepository,
    RaitCapacityPlanService,
    RaitCapacityPlanRepository,
    RaitExportService,
    RaitExportRepository,
  ],
})
export class RaitOrgModule {}
