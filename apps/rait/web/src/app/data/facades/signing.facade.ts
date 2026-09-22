// SigningFacade (contrato CTG-0002b §4.2/§4.3; M9): módulo assinatura (aba casos/:id/decisao).
// `fila` = casos PRONTO_P_DECISAO da defesa prévia (ficha 025; "unit=…" sem fonte → sem filtro,
// OD-R12-021); `caso` = `SigningBundle` (getRaitCase + drafts/documents/admissibility/deadlines/
// decisions filtro { case_id }; `T-DEC` = deadline `timer_code 'T-DEC'`). SSE: `case.changed` →
// `fila` e `caso` do `caseId`. Comandos M8 até R-0007 CTG-0004.
import { Injectable, inject } from '@angular/core';
import type { RaitStreamEvent } from '../../core/sse.service';
import { CaseClient } from '../api/case.client';
import { WorklistClient } from '../api/worklist.client';
import { RaitClock } from '../clock';
import type {
  CommandBody,
  CreateRaitDecisionDto,
  CreateRaitImpedimentDto,
  ListQuery,
  RaitCase,
  RaitDecision,
  RaitDraft,
  RaitImpediment,
} from '../models';
import type { SigningBundle } from './bundles';
import { createCommandRunner, type CommandOutcome } from './command';
import { createListFacade } from './list.facade';
import { createReadStore } from './read-store';
import { bindStream, caseIdOf, refreshIfLoaded } from './stream';

/** Ficha 025: fila de assinatura = casos PRONTO_P_DECISAO da defesa prévia. */
const SIGNING_QUEUE_FILTER: Readonly<Record<string, string>> = {
  state: 'PRONTO_P_DECISAO',
  instance: 'defesa_previa',
};

@Injectable({ providedIn: 'root' })
export class SigningFacade {
  private readonly cases = inject(CaseClient);
  private readonly worklist = inject(WorklistClient);
  private readonly clock = inject(RaitClock);

  readonly fila = createListFacade<RaitCase>(
    (query) => this.cases.listRaitCase(query),
    this.clock,
  );
  readonly caso = createReadStore<SigningBundle>(this.clock);
  readonly command = createCommandRunner();

  constructor() {
    bindStream({
      types: ['case.changed'],
      onEvent: (event) => this.onStreamEvent(event),
      slots: [this.fila, this.caso],
    });
  }

  // --- leituras (§4.3) -------------------------------------------------------------------

  loadSigningQueue(query: ListQuery = {}): Promise<void> {
    return this.fila.load({
      ...query,
      filtro: { ...SIGNING_QUEUE_FILTER, ...(query.filtro ?? {}) },
    });
  }

  loadSigningCase(caseId: string): Promise<void> {
    return this.caso.load(caseId, () => this.readSigningBundle(caseId));
  }

  private async readSigningBundle(caseId: string): Promise<SigningBundle> {
    const filtro = { case_id: caseId };
    const [item, drafts, documents, admissibility, deadlines, decisions] =
      await Promise.all([
        this.cases.getRaitCase(caseId),
        this.cases.listRaitDraft({ filtro }),
        this.cases.listRaitDocument({ filtro }),
        this.cases.listRaitAdmissibility({ filtro }),
        this.cases.listRaitDeadline({ filtro }),
        this.cases.listRaitDecision({ filtro }),
      ]);
    return {
      case: item,
      drafts: drafts.items,
      documents: documents.items,
      admissibility: admissibility.items,
      deadlines: deadlines.items,
      decision: decisions.items[0] ?? null,
    };
  }

  private onStreamEvent(event: RaitStreamEvent): void {
    if (this.fila.key() !== null) {
      this.fila.invalidate();
      refreshIfLoaded(this.fila);
    }
    const caseId = caseIdOf(event);
    if (caseId !== null && this.caso.key() === caseId) {
      this.caso.invalidate(caseId);
      refreshIfLoaded(this.caso);
    }
  }

  // --- comandos (§3.5; M8) -----------------------------------------------------------------

  signDecision(
    caseId: string,
    body: CreateRaitDecisionDto,
  ): Promise<CommandOutcome<RaitDecision>> {
    return this.command.run('rait-decision:sign', () =>
      this.cases.signDecision(caseId, body, this.cases.etagOf('cases', caseId)),
    );
  }

  returnDraft(
    caseId: string,
    body: CommandBody & { return_guidance: string },
  ): Promise<CommandOutcome<RaitDraft>> {
    return this.command.run('rait-decision:return-draft', () =>
      this.cases.returnDraft(caseId, body, this.cases.etagOf('cases', caseId)),
    );
  }

  declareImpediment(
    body: CreateRaitImpedimentDto,
  ): Promise<CommandOutcome<RaitImpediment>> {
    return this.command.run('rait-impediment:declare', () =>
      this.worklist.declareImpediment(body),
    );
  }
}
