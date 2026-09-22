// ArchiveFacade (contrato CTG-0002b §4.2/§4.3; M9): módulo arquivo. `busca` = casos arquivados
// (ficha 057); `dossie` = `SealedDossier` (ficha 058); `retencao` = arquivados com `closed_at`
// (ficha 059 — o prazo de retenção não se calcula, OD-018: só `closed_at` é exibido). SSE:
// `case.changed` → `busca`, `dossie` do `caseId`. Sem comandos (ficha 058/059 sem comando
// sourceado → OD-R12-017; `rait.action.seal`/`apply-retention` da semente não ganham método).
import { Injectable, inject } from '@angular/core';
import type { RaitStreamEvent } from '../../core/sse.service';
import { CaseClient } from '../api/case.client';
import { RaitClock } from '../clock';
import type { ListPage, ListQuery, RaitCase } from '../models';
import type { SealedDossier } from './bundles';
import { createListFacade } from './list.facade';
import { createReadStore } from './read-store';
import { bindStream, caseIdOf, refreshIfLoaded } from './stream';

const ARCHIVED = 'true';

function withArchived(query: ListQuery): ListQuery {
  return { ...query, filtro: { archived: ARCHIVED, ...(query.filtro ?? {}) } };
}

@Injectable({ providedIn: 'root' })
export class ArchiveFacade {
  private readonly cases = inject(CaseClient);
  private readonly clock = inject(RaitClock);

  readonly busca = createListFacade<RaitCase>(
    (query) => this.cases.listRaitCase(query),
    this.clock,
  );
  readonly dossie = createReadStore<SealedDossier>(this.clock);
  readonly retencao = createListFacade<RaitCase>(
    (query) => this.loadRetentionPage(query),
    this.clock,
  );

  constructor() {
    bindStream({
      types: ['case.changed'],
      onEvent: (event) => this.onStreamEvent(event),
      slots: [this.busca, this.dossie, this.retencao],
    });
  }

  loadArchiveSearch(query: ListQuery = {}): Promise<void> {
    return this.busca.load(withArchived(query));
  }

  loadSealedDossier(caseId: string): Promise<void> {
    return this.dossie.load(caseId, () => this.readDossier(caseId));
  }

  loadRetentionQueue(query: ListQuery = {}): Promise<void> {
    return this.retencao.load(withArchived(query));
  }

  private async readDossier(caseId: string): Promise<SealedDossier> {
    const filtro = { case_id: caseId };
    const [item, documents, decisions, communications, events] =
      await Promise.all([
        this.cases.getRaitCase(caseId),
        this.cases.listRaitDocument({ filtro }),
        this.cases.listRaitDecision({ filtro }),
        this.cases.listRaitCommunication({ filtro }),
        this.cases.listRaitCaseEvent({ filtro }),
      ]);
    return {
      case: item,
      documents: documents.items,
      decisions: decisions.items,
      communications: communications.items,
      events: events.items,
    };
  }

  private async loadRetentionPage(
    query: ListQuery,
  ): Promise<ListPage<RaitCase>> {
    const page = await this.cases.listRaitCase(query);
    const items = page.items.filter(
      (item) => item.closed_at !== null && item.closed_at !== undefined,
    );
    return { ...page, items, total: items.length };
  }

  private onStreamEvent(event: RaitStreamEvent): void {
    for (const slot of [this.busca, this.retencao]) {
      if (slot.key() === null) continue;
      slot.invalidate();
      refreshIfLoaded(slot);
    }
    const caseId = caseIdOf(event);
    if (caseId !== null && this.dossie.key() === caseId) {
      this.dossie.invalidate(caseId);
      refreshIfLoaded(this.dossie);
    }
  }
}
