// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:1d733dedb438b939c5b6cbebda82dc6accf415c792fb8da4e82bab6e90a36220
import { Module } from '@nestjs/common';
import { AgentProfileController } from './controllers/agent-profile.controller.js';
import { AgentProfileService } from './services/agent-profile.service.js';
import { AgentProfileRepository } from './repositories/agent-profile.repository.js';
import { OperationalDeviceController } from './controllers/operational-device.controller.js';
import { OperationalDeviceService } from './services/operational-device.service.js';
import { OperationalDeviceRepository } from './repositories/operational-device.repository.js';
import { HomologationController } from './controllers/homologation.controller.js';
import { HomologationService } from './services/homologation.service.js';
import { HomologationRepository } from './repositories/homologation.repository.js';
import { ApplicationVersionController } from './controllers/application-version.controller.js';
import { ApplicationVersionService } from './services/application-version.service.js';
import { ApplicationVersionRepository } from './repositories/application-version.repository.js';
import { DeviceEventController } from './controllers/device-event.controller.js';
import { DeviceEventService } from './services/device-event.service.js';
import { DeviceEventRepository } from './repositories/device-event.repository.js';
import { OperationController } from './controllers/operation.controller.js';
import { OperationService } from './services/operation.service.js';
import { OperationRepository } from './repositories/operation.repository.js';
import { TeamController } from './controllers/team.controller.js';
import { TeamService } from './services/team.service.js';
import { TeamRepository } from './repositories/team.repository.js';
import { TeamAgentController } from './controllers/team-agent.controller.js';
import { TeamAgentService } from './services/team-agent.service.js';
import { TeamAgentRepository } from './repositories/team-agent.repository.js';
import { PatrolVehicleController } from './controllers/patrol-vehicle.controller.js';
import { PatrolVehicleService } from './services/patrol-vehicle.service.js';
import { PatrolVehicleRepository } from './repositories/patrol-vehicle.repository.js';
import { MeasurementInstrumentController } from './controllers/measurement-instrument.controller.js';
import { MeasurementInstrumentService } from './services/measurement-instrument.service.js';
import { MeasurementInstrumentRepository } from './repositories/measurement-instrument.repository.js';
import { ShiftController } from './controllers/shift.controller.js';
import { ShiftService } from './services/shift.service.js';
import { ShiftRepository } from './repositories/shift.repository.js';
import { ApproachController } from './controllers/approach.controller.js';
import { ApproachService } from './services/approach.service.js';
import { ApproachRepository } from './repositories/approach.repository.js';
import { SessionHandoffController } from './controllers/session-handoff.controller.js';
import { SessionHandoffService } from './services/session-handoff.service.js';
import { SessionHandoffRepository } from './repositories/session-handoff.repository.js';
import { FieldOperationsController } from './handwritten/field-operations.controller.js';
import { MobileBootstrapController } from './handwritten/mobile-bootstrap.controller.js';
import { FieldCommandsController } from './handwritten/field-commands.controller.js';
import { FIELD_OPERATIONS_PROVIDER } from './handwritten/field-operations.provider.js';
import { MOBILE_BOOTSTRAP_PROVIDER } from './handwritten/mobile-bootstrap.provider.js';
import { ParameterModule } from '@detran/ops-parameter';

@Module({
  imports: [ParameterModule],
  controllers: [
    FieldOperationsController,
    MobileBootstrapController,
    FieldCommandsController,
    AgentProfileController,
    OperationalDeviceController,
    HomologationController,
    ApplicationVersionController,
    DeviceEventController,
    OperationController,
    TeamController,
    TeamAgentController,
    PatrolVehicleController,
    MeasurementInstrumentController,
    ShiftController,
    ApproachController,
    SessionHandoffController,
  ],
  providers: [
    AgentProfileService,
    AgentProfileRepository,
    OperationalDeviceService,
    OperationalDeviceRepository,
    HomologationService,
    HomologationRepository,
    ApplicationVersionService,
    ApplicationVersionRepository,
    DeviceEventService,
    DeviceEventRepository,
    OperationService,
    OperationRepository,
    TeamService,
    TeamRepository,
    TeamAgentService,
    TeamAgentRepository,
    PatrolVehicleService,
    PatrolVehicleRepository,
    MeasurementInstrumentService,
    MeasurementInstrumentRepository,
    ShiftService,
    ShiftRepository,
    ApproachService,
    ApproachRepository,
    SessionHandoffService,
    SessionHandoffRepository,
    FIELD_OPERATIONS_PROVIDER,
    MOBILE_BOOTSTRAP_PROVIDER,
  ],
})
export class FieldModule {}
