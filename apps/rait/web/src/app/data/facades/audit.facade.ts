// AuditFacade (contrato CTG-0002b §4.2/§4.3; M9): auditoria/trilha. `trilha` = eventos do caso
// (ficha 060; `GET audit` do kernel sem contrato → só `listRaitCaseEvent`, filtro
// `case_id`/`event_type`). SSE: `case.changed` → `trilha`. Comando: `createExport` (M8).
import { Injectable, inject } from '@angular/core';
import { CaseClient } from '../api/case.client';
import { OrgClient } from '../api/org.client';
import { RaitClock } from '../clock';
import type {
  CreateRaitExportDto,
  ListQuery,
  RaitCaseEvent,
  RaitExport,
} from '../models';
import { createCommandRunner, type CommandOutcome } from './command';
import { createListFacade } from './list.facade';
import { bindStream, refreshIfLoaded } from './stream';

@Injectable({ providedIn: 'root' })
export class AuditFacade {
  private readonly cases = inject(CaseClient);
  private readonly org = inject(OrgClient);
  private readonly clock = inject(RaitClock);

  readonly trilha = createListFacade<RaitCaseEvent>(
    (query) => this.cases.listRaitCaseEvent(query),
    this.clock,
  );
  readonly command = createCommandRunner();

  constructor() {
    bindStream({
      types: ['case.changed'],
      onEvent: () => {
        if (this.trilha.key() === null) return;
        this.trilha.invalidate();
        refreshIfLoaded(this.trilha);
      },
      slots: [this.trilha],
    });
  }

  loadTrail(query: ListQuery = {}): Promise<void> {
    return this.trilha.load(query);
  }

  /** §3.5 #46 — `create:<requested_by>` (M8). O corpo é `Partial<CreateRaitExportDto>` só na
   * facade: o spec C-2B-24 (`audit.facade.spec.ts`) chama `createExport({})` sem asserção de
   * tipo, e o DTO do comando real vem de R-0007 CTG-0004 (`.commands`); o cliente mantém o
   * `CreateRaitExportDto` gerado (§3.5). Registrado no relatório como divergência spec × §3.5. */
  createExport(
    body: Partial<CreateRaitExportDto>,
  ): Promise<CommandOutcome<RaitExport>> {
    return this.command.run('rait-export:create', () =>
      this.org.createExport(body as CreateRaitExportDto),
    );
  }
}
