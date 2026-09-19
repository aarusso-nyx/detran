// CTG-0003 §4 (M11, R-0008, TASK-0007) — fachada dos comandos manuscritos de
// evidência e custódia usada pelos dois controladores. Cada comando é uma
// classe própria (`src/handwritten/*.command.ts`, CTG-0002 §13.3); aqui só
// mora a composição e a leitura projetada da §4.8.
import {
  AddCustodyEventCommand,
  type AddCustodyEventInput,
  type AddCustodyEventResult,
} from './add-custody-event.command.js';
import {
  hasDeliveredAccess,
  projectEvidenceForRole,
} from './bodycam-projection.js';
import {
  CompleteUploadCommand,
  type CompleteUploadInput,
  type CompleteUploadResult,
} from './complete-upload.command.js';
import {
  CreateAccessRequestCommand,
  type CreateAccessRequestInput,
  type CreateAccessRequestResult,
} from './create-access-request.command.js';
import {
  DecideAccessRequestCommand,
  type AccessDecision,
  type DecideAccessRequestInput,
  type DecideAccessRequestResult,
} from './decide-access-request.command.js';
import {
  DeliverAccessRequestCommand,
  type DeliverAccessRequestInput,
  type DeliverAccessRequestResult,
} from './deliver-access-request.command.js';
import {
  inTenantTransaction,
  findRow,
  listRows,
  stringOf,
  tenantMismatch,
  type EvidenceDeps,
  type EvidenceRow,
} from './evidence-runtime.js';
import {
  GenerateProbativePackageCommand,
  type GenerateProbativePackageInput,
  type GenerateProbativePackageResult,
} from './generate-probative-package.command.js';
import {
  InitiateUploadCommand,
  type InitiateUploadInput,
  type InitiateUploadResult,
} from './initiate-upload.command.js';
import {
  LinkEvidenceCommand,
  type LinkEvidenceInput,
  type LinkEvidenceResult,
} from './link-evidence.command.js';
import {
  PurgeUnverifiedCommand,
  type PurgeUnverifiedInput,
  type PurgeUnverifiedResult,
} from './purge-unverified.command.js';
import {
  ValidateEvidenceCommand,
  type ValidateEvidenceInput,
  type ValidateEvidenceResult,
} from './validate-evidence.command.js';

export class EvidenceCommandsService {
  private readonly initiateUpload: InitiateUploadCommand;
  private readonly completeUpload: CompleteUploadCommand;
  private readonly validateEvidence: ValidateEvidenceCommand;
  private readonly linkEvidence: LinkEvidenceCommand;
  private readonly addCustodyEvent: AddCustodyEventCommand;
  private readonly generatePackage: GenerateProbativePackageCommand;
  private readonly purgeUnverified: PurgeUnverifiedCommand;
  private readonly createAccessRequest: CreateAccessRequestCommand;
  private readonly decideAccessRequest: DecideAccessRequestCommand;
  private readonly deliverAccessRequest: DeliverAccessRequestCommand;

  constructor(private readonly deps: EvidenceDeps) {
    this.initiateUpload = new InitiateUploadCommand(deps);
    this.completeUpload = new CompleteUploadCommand(deps);
    this.validateEvidence = new ValidateEvidenceCommand(deps);
    this.linkEvidence = new LinkEvidenceCommand(deps);
    this.addCustodyEvent = new AddCustodyEventCommand(deps);
    this.generatePackage = new GenerateProbativePackageCommand(deps);
    this.purgeUnverified = new PurgeUnverifiedCommand(deps);
    this.createAccessRequest = new CreateAccessRequestCommand(deps);
    this.decideAccessRequest = new DecideAccessRequestCommand(deps);
    this.deliverAccessRequest = new DeliverAccessRequestCommand(deps);
  }

  initiate(input: InitiateUploadInput): Promise<InitiateUploadResult> {
    return this.initiateUpload.execute(input);
  }

  complete(
    evidenceId: string,
    input: CompleteUploadInput,
  ): Promise<CompleteUploadResult> {
    return this.completeUpload.execute(evidenceId, input);
  }

  validate(
    evidenceId: string,
    input: ValidateEvidenceInput,
  ): Promise<ValidateEvidenceResult> {
    return this.validateEvidence.execute(evidenceId, input);
  }

  link(
    evidenceId: string,
    input: LinkEvidenceInput,
  ): Promise<LinkEvidenceResult> {
    return this.linkEvidence.execute(evidenceId, input);
  }

  custodyEvent(
    evidenceId: string,
    input: AddCustodyEventInput,
  ): Promise<AddCustodyEventResult> {
    return this.addCustodyEvent.execute(evidenceId, input);
  }

  probativePackage(
    input: GenerateProbativePackageInput,
  ): Promise<GenerateProbativePackageResult> {
    return this.generatePackage.execute(input);
  }

  purge(input: PurgeUnverifiedInput): Promise<PurgeUnverifiedResult> {
    return this.purgeUnverified.execute(input);
  }

  requestAccess(
    input: CreateAccessRequestInput,
  ): Promise<CreateAccessRequestResult> {
    return this.createAccessRequest.execute(input);
  }

  decideAccess(
    requestId: string,
    decision: AccessDecision,
    input: DecideAccessRequestInput,
  ): Promise<DecideAccessRequestResult> {
    return this.decideAccessRequest.execute(requestId, decision, input);
  }

  deliverAccess(
    requestId: string,
    input: DeliverAccessRequestInput,
  ): Promise<DeliverAccessRequestResult> {
    return this.deliverAccessRequest.execute(requestId, input);
  }

  /** §4.8 — toda leitura de evidência passa pela projeção de bodycam. */
  list(): Promise<EvidenceRow[]> {
    return inTenantTransaction(this.deps, async (tx) => {
      const rows = await listRows(this.deps, tx, 'evidence');
      const accessRequests = await listRows(this.deps, tx, 'accessRequests');
      return rows.map((row) =>
        projectEvidenceForRole(
          row,
          hasDeliveredAccess(accessRequests, stringOf(row.id)),
        ),
      );
    });
  }

  get(evidenceId: string): Promise<EvidenceRow> {
    return inTenantTransaction(this.deps, async (tx) => {
      const row = await findRow(this.deps, tx, 'evidence', evidenceId);
      if (!row) throw tenantMismatch({ evidenceId });
      const accessRequests = await listRows(this.deps, tx, 'accessRequests');
      return projectEvidenceForRole(
        row,
        hasDeliveredAccess(accessRequests, evidenceId),
      );
    });
  }
}
