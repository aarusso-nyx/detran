// View-models de `QueueTable` (contrato CTG-0002b §5.16 `QueueItem`: montado pela página a partir
// dos recursos gerados, não é DTO) a partir de `RaitCase`, com bandeira/prazo só quando o
// servidor os traz (OD-R12-022; [RN-RAIT-005]); a ordem é sempre a recebida ([RN-RAIT-141]).
import type { RaitCase, RaitClock, RaitDeadline } from '../data/models';
import type { DeadlineKind } from '../shared/deadline-chip.component';
import type { QueueItem } from '../shared/queue-table.component';

export interface QueueItemExtras {
  readonly clock?: RaitClock | null;
  readonly deadline?: RaitDeadline | null;
  readonly deadlineKind?: DeadlineKind;
  readonly priority?: boolean;
}

export function caseToQueueItem(
  kase: RaitCase,
  extras: QueueItemExtras = {},
): QueueItem {
  const deadline = extras.deadline ?? null;
  return {
    id: kase.id,
    caseId: kase.id,
    protocol: kase.protocol_number,
    state: kase.state,
    instance: kase.instance,
    flag: extras.clock?.flag ?? null,
    daysRemaining: null,
    deadline:
      deadline === null
        ? null
        : {
            timerCode: deadline.timer_code,
            dueOn: deadline.due_on,
            legalBasis: deadline.legal_basis,
            kind: extras.deadlineKind ?? 'legal',
          },
    priority: extras.priority ?? false,
  };
}
