// Generated from BP-OPS-AGENCY-001 v1.0.0 sha256:afec0eee717d2c38412377687b43b37d2bc04ae65291d2f8a69cd1c15189af7f
import { Module } from '@nestjs/common';
import { AgencyUnitController } from './controllers/agency-unit.controller.js';
import { AgencyUnitService } from './services/agency-unit.service.js';
import { AgencyUnitRepository } from './repositories/agency-unit.repository.js';
import { AgencyJurisdictionController } from './controllers/agency-jurisdiction.controller.js';
import { AgencyJurisdictionService } from './services/agency-jurisdiction.service.js';
import { AgencyJurisdictionRepository } from './repositories/agency-jurisdiction.repository.js';
import { AgencyCompetenceController } from './controllers/agency-competence.controller.js';
import { AgencyCompetenceService } from './services/agency-competence.service.js';
import { AgencyCompetenceRepository } from './repositories/agency-competence.repository.js';

@Module({
  controllers: [
    AgencyUnitController,
    AgencyJurisdictionController,
    AgencyCompetenceController,
  ],
  providers: [
    AgencyUnitService,
    AgencyUnitRepository,
    AgencyJurisdictionService,
    AgencyJurisdictionRepository,
    AgencyCompetenceService,
    AgencyCompetenceRepository,
  ],
})
export class AgencyModule {}
