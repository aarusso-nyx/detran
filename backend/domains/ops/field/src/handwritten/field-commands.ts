// CTG-0002 §5 (R-0008, TASK-0005) — fachada dos comandos manuscritos de campo.
// Um único provider manuscrito no módulo gerado; cada comando continua
// construtível isolado nos testes.
import { CancelHomologationCommand } from './cancel-homologation.command.js';
import { CloseShiftCommand } from './close-shift.command.js';
import { DevicePostureCommand } from './device-posture.command.js';
import { HandoffSessionCommand } from './handoff-session.command.js';
import { MobileBootstrapService } from './mobile-bootstrap.service.js';
import { OpenShiftCommand } from './open-shift.command.js';
import { RenewHomologationCommand } from './renew-homologation.command.js';
import type { FieldDeps } from './field-runtime.js';

export class FieldCommands {
  readonly bootstrap: MobileBootstrapService;
  readonly openShift: OpenShiftCommand;
  readonly closeShift: CloseShiftCommand;
  readonly handoffSession: HandoffSessionCommand;
  readonly devicePosture: DevicePostureCommand;
  readonly renewHomologation: RenewHomologationCommand;
  readonly cancelHomologation: CancelHomologationCommand;

  constructor(deps: FieldDeps) {
    this.bootstrap = new MobileBootstrapService(deps);
    this.openShift = new OpenShiftCommand(deps);
    this.closeShift = new CloseShiftCommand(deps);
    this.handoffSession = new HandoffSessionCommand(deps);
    this.devicePosture = new DevicePostureCommand(deps);
    this.renewHomologation = new RenewHomologationCommand(deps);
    this.cancelHomologation = new CancelHomologationCommand(deps);
  }
}
