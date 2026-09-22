// IntegrationFacade (contrato CTG-0002b §4.3; M9): integracoes/* (páginas L0 — a facade existe
// para os comandos M8 e a busca de conciliações). Sem linha na tabela §4.2 → só `tick$`/`resync$`.
import { Injectable, inject } from '@angular/core';
import { IntegrationClient } from '../api/integration.client';
import { RaitClock } from '../clock';
import type { CommandBody, ListQuery, RaitReconciliation } from '../models';
import { createCommandRunner, type CommandOutcome } from './command';
import { createListFacade } from './list.facade';
import { bindStream } from './stream';

@Injectable({ providedIn: 'root' })
export class IntegrationFacade {
  private readonly integration = inject(IntegrationClient);
  private readonly clock = inject(RaitClock);

  readonly conciliacoes = createListFacade<RaitReconciliation>(
    (query) => this.integration.listRaitReconciliation(query),
    this.clock,
  );
  readonly command = createCommandRunner();

  constructor() {
    bindStream({
      types: [],
      onEvent: () => undefined,
      slots: [this.conciliacoes],
    });
  }

  loadReconciliations(query: ListQuery = {}): Promise<void> {
    return this.conciliacoes.load(query);
  }

  retry(
    reconciliationId: string,
    body: CommandBody,
  ): Promise<CommandOutcome<RaitReconciliation>> {
    return this.command.run('rait-integration:retry', () =>
      this.integration.retry(
        reconciliationId,
        body,
        this.integration.etagOf('reconciliations', reconciliationId),
      ),
    );
  }

  reconcile(
    reconciliationId: string,
    body: CommandBody,
  ): Promise<CommandOutcome<RaitReconciliation>> {
    return this.command.run('rait-integration:reconcile', () =>
      this.integration.reconcile(
        reconciliationId,
        body,
        this.integration.etagOf('reconciliations', reconciliationId),
      ),
    );
  }
}
