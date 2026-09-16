// CTG-0002 §5 (R-0008, TASK-0005) — fachada dos comandos e leituras do
// protocolo. Existe para que o módulo gerado receba **um** provider
// manuscrito (`handwrittenProviders` do blueprint) e o controlador tenha uma
// única dependência; cada comando continua construtível isolado nos testes.
import {
  ReconcileNumberingCommand,
  NumberingConsumptionQuery,
} from './reconcile-numbering.command.js';
import { ReserveNumberingCommand } from './reserve-numbering.command.js';
import { ResolveSyncConflictCommand } from './resolve-conflict.command.js';
import { SettleNumberingCommand } from './settle-numbering.command.js';
import { SubmitBatchCommand } from './submit-batch.command.js';
import {
  SyncConflictQuery,
  SyncQueueItemQuery,
  SyncReceiptQuery,
} from './offline-sync.reads.js';
import type { OfflineSyncDeps } from './batch-protocol.js';

export class OfflineSyncCommands {
  readonly submitBatch: SubmitBatchCommand;
  readonly reserveNumbering: ReserveNumberingCommand;
  readonly settleNumbering: SettleNumberingCommand;
  readonly reconcileNumbering: ReconcileNumberingCommand;
  readonly numberingConsumption: NumberingConsumptionQuery;
  readonly resolveConflict: ResolveSyncConflictCommand;
  readonly receipts: SyncReceiptQuery;
  readonly queueItems: SyncQueueItemQuery;
  readonly conflicts: SyncConflictQuery;

  constructor(deps: OfflineSyncDeps) {
    this.submitBatch = new SubmitBatchCommand(deps);
    this.reserveNumbering = new ReserveNumberingCommand(deps);
    this.settleNumbering = new SettleNumberingCommand(deps);
    this.reconcileNumbering = new ReconcileNumberingCommand(deps);
    this.numberingConsumption = new NumberingConsumptionQuery(deps);
    this.resolveConflict = new ResolveSyncConflictCommand(deps);
    this.receipts = new SyncReceiptQuery(deps);
    this.queueItems = new SyncQueueItemQuery(deps);
    this.conflicts = new SyncConflictQuery(deps);
  }
}
