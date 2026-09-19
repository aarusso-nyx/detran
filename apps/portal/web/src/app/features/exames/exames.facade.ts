// ExamesFacade (contrato CTG-0003c §3.5; T-20, junta; [RN-PEC-105]; [UC-PORTAL-014]; OD-P19):
// os exames de aptidão (`GET exams`) e o detalhe (`GET exams/{id}`, vínculo `exam`). O
// `legalLabel` é exibido TAL COMO o servidor manda — o cliente não mapeia, não renomeia e não
// contém os rótulos legais em código; a janela da junta é decidida pelo servidor (`boardDueOn`
// presente → ação disponível; ausente → nenhuma). O contexto da página de junta segue o padrão do
// par 2 (`WizardTarget` + retomada + disponibilidade do serviço), com o alvo fixado ao entrar —
// o detalhe só acrescenta o prazo (`DeadlineCard`). Nenhum cálculo de prazo aqui.
import { Injectable, computed, inject, signal } from '@angular/core';
import {
  presentError,
  type ErrorPresentation,
} from '../../core/error-boundary';
import { ResumeService } from '../../core/resume.service';
import {
  ServiceCatalogFacade,
  type ServiceAvailability,
} from '../../core/service-catalog.facade';
import { PortalClient } from '../../data/portal.client';
import type { ExamDetail, ExamSummary } from '../../data/portal-read.models';
import { readStatusFor, type ReadStatus } from '../../data/read-status';
import type {
  WizardResumeDraft,
  WizardTarget,
} from '../../shared/service-wizard.store';
import { resumePointFor } from '../../shared/wizard-resume';

/** Prazo da junta como o `DeadlineCard` o recebe (data do servidor; `kind` = token do prazo). */
export interface BoardDeadline {
  readonly kind: 'junta';
  readonly dueOn: string;
  readonly ownedBy: 'citizen';
}

const SERVICE_KEY = 'junta_medica';

@Injectable()
export class ExamesFacade {
  private readonly client = inject(PortalClient);
  private readonly resumeService = inject(ResumeService);
  private readonly catalog = inject(ServiceCatalogFacade);

  private readonly statusState = signal<ReadStatus>('idle');
  private readonly errorState = signal<ErrorPresentation | null>(null);
  private readonly itemsState = signal<readonly ExamSummary[]>([]);
  private readonly detailStatusState = signal<ReadStatus>('idle');
  private readonly detailState = signal<ExamDetail | null>(null);
  private readonly detailErrorState = signal<ErrorPresentation | null>(null);
  private readonly targetState = signal<WizardTarget | null>(null);
  private readonly resumeState = signal<WizardResumeDraft | null>(null);
  private readonly availabilityState = signal<ServiceAvailability | null>(null);
  private listSequence = 0;
  private detailSequence = 0;

  readonly status = this.statusState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly items = this.itemsState.asReadonly();
  readonly detailStatus = this.detailStatusState.asReadonly();
  readonly detail = this.detailState.asReadonly();
  readonly detailError = this.detailErrorState.asReadonly();
  /** `{ serviceKey: 'junta_medica', targetKind: 'exam', targetId: examId }`. */
  readonly target = this.targetState.asReadonly();
  /** `resumePointFor(...)` do par 2. */
  readonly resume = this.resumeState.asReadonly();
  /** `ServiceCatalogFacade.availability('junta_medica')`. */
  readonly availability = this.availabilityState.asReadonly();
  /** `boardDueOn` do servidor → `[{ kind: 'junta', dueOn, ownedBy: 'citizen' }]`; ausente → `[]`. */
  readonly deadlines = computed<readonly BoardDeadline[]>(() => {
    const boardDueOn = this.detailState()?.boardDueOn ?? null;
    return boardDueOn
      ? [{ kind: 'junta', dueOn: boardDueOn, ownedBy: 'citizen' }]
      : [];
  });

  /** GET exams; `empty` → `portal.screens.t20.state.vazio`. */
  async loadList(): Promise<void> {
    this.statusState.set('loading');
    this.errorState.set(null);
    const sequence = ++this.listSequence;
    try {
      const page = await this.client.listExams();
      if (sequence !== this.listSequence) return;
      const items = page.items ?? [];
      this.itemsState.set(items);
      this.statusState.set(items.length === 0 ? 'empty' : 'ready');
    } catch (error: unknown) {
      if (sequence !== this.listSequence) return;
      const presentation = presentError(error);
      this.errorState.set(presentation);
      this.statusState.set(readStatusFor(presentation));
    }
  }

  /** GET exams/{id}; entitlement { kind: 'exam', id }. */
  async loadDetail(examId: string): Promise<void> {
    this.detailStatusState.set('loading');
    this.detailErrorState.set(null);
    const sequence = ++this.detailSequence;
    try {
      const detail = await this.client.getExam(examId);
      if (sequence !== this.detailSequence) return;
      this.detailState.set(detail);
      this.detailStatusState.set('ready');
    } catch (error: unknown) {
      if (sequence !== this.detailSequence) return;
      const presentation = presentError(error, {
        entitlement: { kind: 'exam', id: examId },
      });
      this.detailState.set(null);
      this.detailErrorState.set(presentation);
      this.detailStatusState.set(readStatusFor(presentation));
    }
  }

  /**
   * Contexto da página de junta (padrão `ActFacadeState`, CTG-0003b §3.4): o alvo é fixado de
   * imediato a partir do `examId`; a disponibilidade e o detalhe (prazo) chegam em seguida.
   */
  async loadBoardContext(examId: string, resumeRoute: string): Promise<void> {
    const target: WizardTarget = {
      serviceKey: SERVICE_KEY,
      targetKind: 'exam',
      targetId: examId,
    };
    this.targetState.set(target);
    this.resumeState.set(
      resumePointFor(this.resumeService, resumeRoute, target),
    );
    const detail = this.loadDetail(examId);
    try {
      this.availabilityState.set(await this.catalog.availability(SERVICE_KEY));
    } catch {
      this.availabilityState.set(null);
    }
    await detail;
  }
}
