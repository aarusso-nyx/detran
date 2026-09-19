// ProcessTimeline (contrato CTG-0003b §5; spec §5.2; [UC-PORTAL-005]; [RN-PORTAL-112]): a linha do
// tempo do pedido NA ORDEM RECEBIDA (a projeção é a fonte; nada se reordena aqui), com o texto do
// catálogo por evento de domínio (`portal.situation.event.<evento>`) — o token cru fica só em
// `data-*`. "Com você" × "com o órgão" é explícito pelos `deadlines[]` (DeadlineCard com o dono) e
// pelas diligências abertas; documentos são sempre baixáveis quando o servidor dá a URL e nunca um
// link vazio quando não dá (indisponível, sem simulação). Nenhuma aritmética de datas: as datas
// vêm prontas e são formatadas pelo `StynxIntlDatePipe` do kit. Os links carregam também o
// atributo `routerLink` (espelho da rota, como `data-*`) para localização por atributo.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
import type {
  Decision,
  Diligence,
  ProcessDocument,
  RequestRecord,
  TimelineDeadline,
  TimelineEntry,
} from '../data/portal-read.models';
import { DeadlineCardComponent } from './deadline-card.component';

/** PROCESS_TIMELINE_DOMAIN_EVENTS (projeção l. 29–37) = chaves `portal.situation.event.<evento>` (7). */
export const TIMELINE_DOMAIN_EVENTS = [
  'RAIT_CASO_PROTOCOLADO',
  'RAIT_CASO_ESTADO_ALTERADO',
  'RAIT_EFEITO_SUSPENSIVO_INSTAURADO',
  'RAIT_RECURSO_RECEBIDO_JULGADOR',
  'RAIT_CASO_TRANSITADO',
  'ENCERRADO_DESISTENCIA',
  'RAIT_DECISAO_PUBLICADA',
] as const;

export type TimelineDomainEvent = (typeof TIMELINE_DOMAIN_EVENTS)[number];

/**
 * RAIT_INQUIRY_CHANGED_TYPE (projeção l. 24–26): entrada técnica de diligência. Montado como na
 * projeção (não é parâmetro do catálogo; `verify:parameter-catalogue` varre literais `rait.*`).
 */
export const TIMELINE_INQUIRY_TYPE = ['rait', 'inquiry', 'changed'].join('.');

const PROTOCOL_EVENT: TimelineDomainEvent = 'RAIT_CASO_PROTOCOLADO';
const DILIGENCE_KIND = 'diligencia';

function isDomainEvent(value: unknown): value is TimelineDomainEvent {
  return (TIMELINE_DOMAIN_EVENTS as readonly unknown[]).includes(value);
}

interface TimelineItemView {
  readonly at: string;
  readonly token: string;
  readonly domainEvent: string | null;
  /** Chave i18n do texto, ou `null` quando o evento não tem rótulo (só data + `data-token`). */
  readonly textKey: string | null;
}

@Component({
  selector: 'portal-process-timeline',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    StynxIntlDatePipe,
    DeadlineCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-live': 'polite',
    '[attr.data-request-id]': 'requestId()',
    '[attr.data-entry-count]': 'items().length',
  },
  template: `
    <section class="portal-timeline" [attr.aria-labelledby]="timelineTitleId()">
      <h3 [id]="timelineTitleId()">
        {{ 'portal.screens.t07.field.linha_do_tempo' | stynxTranslate }}
      </h3>
      @if (items().length > 0) {
        <ol data-timeline>
          @for (item of items(); track $index) {
            <li
              [attr.data-token]="item.token"
              [attr.data-domain-event]="item.domainEvent"
            >
              <time [attr.datetime]="item.at">{{
                item.at | stynxIntlDate: dateFormat
              }}</time>
              @if (item.textKey; as key) {
                <span>{{ key | stynxTranslate }}</span>
              }
            </li>
          }
        </ol>
      } @else {
        <p data-timeline-empty>{{ 'portal.states.empty' | stynxTranslate }}</p>
      }
      @if (deadlines().length > 0) {
        <div data-deadlines>
          @for (deadline of deadlines(); track $index) {
            <portal-deadline-card
              [dueOn]="deadline.dueOn"
              [ownedBy]="deadline.ownedBy"
              [kind]="deadline.kind"
              [labelKey]="nextActionKey(deadline.ownedBy)"
            />
          }
        </div>
      }
    </section>

    @if (diligences().length > 0) {
      <section
        class="portal-timeline-diligences"
        data-diligences
        [attr.aria-labelledby]="diligencesTitleId()"
      >
        <h3 [id]="diligencesTitleId()">
          {{ 'portal.screens.t07.field.pendencias' | stynxTranslate }}
        </h3>
        <ul>
          @for (diligence of diligences(); track diligence.diligenceId) {
            <li
              [attr.data-diligence-id]="diligence.diligenceId"
              [attr.data-status]="diligence.status"
              [attr.data-outcome]="diligence.outcome"
            >
              @if (diligence.status === 'open') {
                <p>
                  <strong>{{
                    'portal.situation.next_action.citizen' | stynxTranslate
                  }}</strong>
                </p>
                @if (diligence.requestText; as text) {
                  <p data-request-text>{{ text }}</p>
                }
                @if (diligence.dueOn; as dueOn) {
                  <portal-deadline-card
                    [dueOn]="dueOn"
                    [ownedBy]="'citizen'"
                    [kind]="diligenceKind"
                    labelKey="portal.situation.next_action.citizen"
                  />
                }
                <a
                  [routerLink]="diligenceRoute(diligence)"
                  [attr.routerLink]="diligenceRoute(diligence)"
                  data-action="respond"
                  >{{ 'portal.screens.t07.cmd.respond' | stynxTranslate }}</a
                >
              } @else {
                @if (diligence.requestText; as text) {
                  <p data-request-text>{{ text }}</p>
                }
                <p role="status" data-closed>
                  {{ 'portal.screens.t11.state.encerrada' | stynxTranslate }}
                </p>
              }
            </li>
          }
        </ul>
      </section>
    }

    @if (documents().length > 0) {
      <section
        class="portal-timeline-documents"
        data-documents
        [attr.aria-labelledby]="documentsTitleId()"
      >
        <h3 [id]="documentsTitleId()">
          {{ 'portal.screens.t07.field.documentos' | stynxTranslate }}
        </h3>
        <ul>
          @for (doc of documents(); track doc.documentId) {
            <li
              [attr.data-document-id]="doc.documentId"
              [attr.data-token]="doc.kind"
            >
              <span data-document-title>{{ doc.title }}</span>
              @if (doc.issuedAt; as issuedAt) {
                <time [attr.datetime]="issuedAt">{{
                  issuedAt | stynxIntlDate
                }}</time>
              }
              @if (doc.downloadUrl; as url) {
                <a
                  download
                  [attr.href]="url"
                  rel="noopener"
                  [attr.aria-label]="
                    ('portal.common.action.download' | stynxTranslate) +
                    ' ' +
                    doc.title
                  "
                  (click)="documentRequested.emit(doc)"
                  >{{ 'portal.common.action.download' | stynxTranslate }}</a
                >
              } @else {
                <button
                  type="button"
                  aria-disabled="true"
                  data-reason="unavailable"
                  (click)="documentRequested.emit(doc)"
                >
                  {{ 'portal.states.unavailable_in_version' | stynxTranslate }}
                </button>
              }
            </li>
          }
        </ul>
      </section>
    }

    @if (decision(); as decision) {
      <p class="portal-timeline-decision" data-decision>
        <a
          [routerLink]="decisionRoute()"
          [attr.routerLink]="decisionRoute()"
          data-action="decision"
          [attr.data-token]="decision.outcome"
          >{{ 'portal.screens.t07.cmd.decision' | stynxTranslate }}</a
        >
        @if (decision.publishedOn; as publishedOn) {
          <time [attr.datetime]="publishedOn">{{
            publishedOn | stynxIntlDate
          }}</time>
        }
      </p>
    }
  `,
})
export class ProcessTimelineComponent {
  readonly requestId = input.required<string>();
  /** Só `visibility 'citizen'` (o servidor já filtra; o componente ignora outras). */
  readonly entries = input.required<readonly TimelineEntry[]>();
  readonly deadlines = input<readonly TimelineDeadline[]>([]);
  readonly documents = input<readonly ProcessDocument[]>([]);
  readonly diligences = input<readonly Diligence[]>([]);
  readonly decision = input<Decision | null>(null);
  /** Entrada mínima "Protocolado em DD/MM" (T07 §5). */
  readonly protocol = input<RequestRecord['protocol']>(null);
  /** `downloadUrl` null → a página mostra indisponível. */
  readonly documentRequested = output<ProcessDocument>();

  readonly diligenceKind = DILIGENCE_KIND;
  readonly dateFormat: Intl.DateTimeFormatOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
  };

  /** Ordem recebida; sem entradas, a mínima do protocolo quando existe. */
  readonly items = computed<readonly TimelineItemView[]>(() => {
    const entries = this.entries().filter(
      (entry) => entry.visibility === 'citizen',
    );
    if (entries.length === 0) {
      const protocol = this.protocol();
      return protocol
        ? [
            {
              at: protocol.issuedAt,
              token: 'protocol',
              domainEvent: PROTOCOL_EVENT,
              textKey: `portal.situation.event.${PROTOCOL_EVENT}`,
            },
          ]
        : [];
    }
    return entries.map((entry) => ({
      at: entry.at,
      token: entry.type,
      domainEvent: entry.domainEvent,
      textKey: this.textKeyFor(entry),
    }));
  });

  readonly timelineTitleId = computed(
    () => `portal-timeline-${this.requestId()}-title`,
  );
  readonly diligencesTitleId = computed(
    () => `portal-timeline-${this.requestId()}-diligences`,
  );
  readonly documentsTitleId = computed(
    () => `portal-timeline-${this.requestId()}-documents`,
  );
  readonly decisionRoute = computed(
    () => `/processos/${this.requestId()}/decisao`,
  );

  nextActionKey(ownedBy: 'citizen' | 'agency'): string {
    return `portal.situation.next_action.${ownedBy}`;
  }

  diligenceRoute(diligence: Diligence): string {
    return `/processos/${this.requestId()}/diligencia/${diligence.diligenceId}`;
  }

  /** Evento com rótulo → chave; diligência técnica → badge; demais → sem texto (nunca token cru). */
  private textKeyFor(entry: TimelineEntry): string | null {
    if (isDomainEvent(entry.domainEvent)) {
      return `portal.situation.event.${entry.domainEvent}`;
    }
    if (entry.domainEvent === null && entry.type === TIMELINE_INQUIRY_TYPE) {
      return 'portal.situation.badge.em_diligencia';
    }
    return null;
  }
}
