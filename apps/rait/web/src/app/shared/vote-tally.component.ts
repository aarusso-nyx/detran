// VoteTally (contrato CTG-0002b §5.15; WF-RAIT-003; ficha 034): `<stynx-table>` com colunas
// `member_id`, voto (`'rait.decision.' + vote`), voto de qualidade (`rait.action.casting-vote` |
// ''), `cast_at` (data); contagem por valor de voto = contagem de EXIBIÇÃO (`'rait.decision.' +
// token`: n); empate = `sessionState 'DESEMPATE_PRESIDENTE'` (token do servidor →
// `tokenKey('sessionState', …)`); resultado = `item.outcome` → `'rait.decision.' + outcome`.
// NUNCA decide maioria no cliente: sem `outcome` → sem resultado. Texto das células já traduzido
// por `StynxI18nService.translate` (o kit renderiza só texto; OD-R12-024).
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import {
  StynxI18nService,
  StynxIntlDatePipe,
  StynxTableComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import type { TableColumn } from './table-column';
import { tokenKey } from '../core/i18n-token-key';
import {
  RAIT_VOTE_VALUES,
  type RaitAgendaItem,
  type RaitSessionState,
  type RaitVote,
  type RaitVoteValue,
} from '../data/models';

const DECISION_KEY_PREFIX = 'rait.decision.';
const CASTING_VOTE_KEY = 'rait.action.casting-vote';
const TIE_STATE: RaitSessionState = 'DESEMPATE_PRESIDENTE';

interface VoteRow extends Record<string, unknown> {
  readonly id: string;
  readonly member: string;
  readonly vote: string;
  readonly casting: string;
  readonly castAt: string;
}

interface TallyEntry {
  readonly value: RaitVoteValue;
  readonly count: number;
}

@Component({
  selector: 'rait-vote-tally',
  imports: [StynxTranslatePipe, StynxTableComponent],
  providers: [StynxIntlDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rait-vote-tally',
    '[attr.data-item-id]': 'item().id',
    '[attr.data-token]': 'item().outcome ?? null',
    '[attr.data-session-state]': 'sessionState()',
  },
  template: `
    <stynx-table
      [columns]="columns()"
      [rows]="rows()"
      [rowTrackBy]="trackRow"
    />
    <ul class="rait-vote-tally__counts">
      @for (entry of tally(); track entry.value) {
        <li [attr.data-vote]="entry.value" [attr.data-count]="entry.count">
          <span>{{ decisionKeyPrefix + entry.value | stynxTranslate }}</span>
          <span>{{ entry.count }}</span>
        </li>
      }
    </ul>
    @if (sessionState() === tieState) {
      <p class="rait-vote-tally__tie" [attr.data-token]="sessionState()">
        {{ tieKey | stynxTranslate }}
      </p>
    }
    @if (item().outcome; as outcome) {
      <p class="rait-vote-tally__outcome" [attr.data-token]="outcome">
        {{ decisionKeyPrefix + outcome | stynxTranslate }}
      </p>
    }
  `,
})
export class VoteTallyComponent {
  private readonly i18n = inject(StynxI18nService);
  private readonly datePipe = inject(StynxIntlDatePipe);

  readonly item = input.required<RaitAgendaItem>();
  readonly votes = input.required<readonly RaitVote[]>();
  readonly sessionState = input.required<RaitSessionState>();

  readonly decisionKeyPrefix = DECISION_KEY_PREFIX;
  readonly tieState = TIE_STATE;
  readonly tieKey = tokenKey('sessionState', TIE_STATE);

  /** Rótulos das colunas: campos do contrato (não são chaves de tela). */
  readonly columns = computed<TableColumn<VoteRow>[]>(() => [
    { key: 'member', label: 'member_id' },
    { key: 'vote', label: 'vote' },
    { key: 'casting', label: 'casting_vote' },
    { key: 'castAt', label: 'cast_at' },
  ]);

  /** Ordem = `votes` recebida (nunca reordena). */
  readonly rows = computed<VoteRow[]>(() =>
    this.votes().map((vote) => ({
      id: vote.id,
      member: vote.member_id,
      vote: this.i18n.translate(`${DECISION_KEY_PREFIX}${vote.vote}`),
      casting: vote.casting_vote ? this.i18n.translate(CASTING_VOTE_KEY) : '',
      castAt: this.datePipe.transform(vote.cast_at),
    })),
  );

  /** Contagem de exibição por valor de voto (ordem do contrato). */
  readonly tally = computed<readonly TallyEntry[]>(() =>
    RAIT_VOTE_VALUES.map((value) => ({
      value,
      count: this.votes().filter((vote) => vote.vote === value).length,
    })).filter((entry) => entry.count > 0),
  );

  readonly trackRow = (row: VoteRow): string => row.id;
}
