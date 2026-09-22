// Rótulos de coluna das listas de casos (`QueueTable`, contrato CTG-0002b §5.16 `columnLabelKeys`
// = "rótulos da tela chamadora"): o catálogo ainda não tem chaves de cabeçalho de tabela —
// OD-R12-028 (plan.md A10) reserva-as a `rait.forms.*` (CTG-0002c). Até lá vale o mesmo
// precedente dos componentes de `shared/` do par 1 (`VoteTally`, `BatchDrawViewer`,
// `ScheduleGrid`): o nome do campo do contrato gerado como rótulo (dado, não token), que o
// `translate` devolve inalterado por ausência de chave. Nenhum texto inventado.
import type { QueueColumnKey } from '../shared/queue-table.component';

export const QUEUE_COLUMN_LABELS: Readonly<Record<QueueColumnKey, string>> = {
  protocol: 'protocol_number',
  state: 'state',
  instance: 'instance',
  risk: 'flag',
  deadline: 'due_on',
  priority: 'priority',
};
