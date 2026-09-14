// Marco de ciência por canal (RN-RAIT-104,
// `inf.notification_channel_ref.ciencia_rule` de
// backend/database/ddl/14-inf-lifecycle-vocabulary.sql;
// work/rounds/R-0006/contracts/CTG-0001.md §6.2). A função não conta prazo por
// conta própria: o número de dias e a unidade da ciência ficta do SNE vêm de
// `T-SNE-CIENCIA` no catálogo de timers e a soma usa a aritmética de
// `@detran/inf-deadlines` (rait-deadline-engine.md §1: é o único lugar do
// sistema que sabe contar prazo).
import { addCalendarDays, StaticTimerCatalog } from '@detran/inf-deadlines';
import type { LocalDate } from '@detran/inf-deadlines';

/** `inf.notification_channel_ref.code` (6 canais). */
export type NoticeChannel =
  'sne' | 'postal' | 'pessoal' | 'edital' | 'portal' | 'balcao';

/** `inf.notice_acknowledgement.evidence_kind` (M12, um por canal com marco). */
export type AcknowledgementEvidenceKind =
  | 'ar_postal'
  | 'recibo_sne'
  | 'publicacao_edital'
  | 'assinatura'
  | 'registro_balcao';

export interface AcknowledgementMarks {
  /** postal: entrega à ECT (Res. 918/2022 art. 30 I). */
  dispatchedOn?: LocalDate;
  /** sne: disponibilização (Res. 931/2022 art. 5º). */
  availableOn?: LocalDate;
  /** sne: leitura, quando houver. */
  readOn?: LocalDate;
  /** edital: publicação. */
  publishedOn?: LocalDate;
  /** pessoal: assinatura. */
  signedOn?: LocalDate;
  /** balcao: protocolo presencial. */
  protocolledOn?: LocalDate;
}

export interface AcknowledgementMark {
  /** `null` = o canal não conta prazo legal. */
  effectiveOn: LocalDate | null;
  fictitious: boolean;
  evidenceKind: AcknowledgementEvidenceKind | null;
  /** Base legal do marco (`notification_channel_ref.legal_basis`). */
  basis: string;
}

/** `legal_basis` de `inf.notification_channel_ref`, por canal. */
const CHANNEL_BASIS: Readonly<Record<NoticeChannel, string>> = {
  sne: 'CTB art. 282-A §2º; Res. 931/2022 art. 4º §6º',
  postal: 'CTB art. 282 §1º; Res. 918/2022 art. 4º',
  pessoal: 'Res. 918/2022 art. 3º §5º',
  edital: 'CTB art. 282 §1º; Res. 918/2022 art. 4º §3º',
  portal: 'WF-PORTAL-001',
  balcao: 'Res. 900/2022 art. 6º',
};

const CATALOG = new StaticTimerCatalog();

/** Ciência ficta do SNE: `availableOn` + `T-SNE-CIENCIA` (30 dias corridos). */
function fictitiousSneMark(availableOn: LocalDate): LocalDate {
  const definition = CATALOG.get('T-SNE-CIENCIA');
  return addCalendarDays(availableOn, definition.durationValue ?? 0);
}

function markOf(
  channel: NoticeChannel,
  marks: AcknowledgementMarks,
): Pick<AcknowledgementMark, 'effectiveOn' | 'fictitious' | 'evidenceKind'> {
  switch (channel) {
    // Expedição = data de postagem.
    case 'postal':
      return {
        effectiveOn: marks.dispatchedOn ?? null,
        fictitious: false,
        evidenceKind: 'ar_postal',
      };
    // Leitura ou ficta em 30 dias da disponibilização, o que vier antes.
    case 'sne': {
      const ficta = marks.availableOn
        ? fictitiousSneMark(marks.availableOn)
        : null;
      if (marks.readOn && (!ficta || marks.readOn <= ficta)) {
        return {
          effectiveOn: marks.readOn,
          fictitious: false,
          evidenceKind: 'recibo_sne',
        };
      }
      return {
        effectiveOn: ficta,
        fictitious: ficta !== null,
        evidenceKind: 'recibo_sne',
      };
    }
    case 'edital':
      return {
        effectiveOn: marks.publishedOn ?? null,
        fictitious: false,
        evidenceKind: 'publicacao_edital',
      };
    // AIT assinado vale como NA (Res. 918/2022 art. 3º §5º).
    case 'pessoal':
      return {
        effectiveOn: marks.signedOn ?? null,
        fictitious: false,
        evidenceKind: 'assinatura',
      };
    case 'balcao':
      return {
        effectiveOn: marks.protocolledOn ?? null,
        fictitious: false,
        evidenceKind: 'registro_balcao',
      };
    // O Portal não substitui SNE/postal para o prazo legal (RN-RAIT-104).
    case 'portal':
      return { effectiveOn: null, fictitious: false, evidenceKind: null };
  }
}

/**
 * Marco de ciência de um aviso, por canal. Devolve o marco e a prova; quem
 * arma o timer a partir dele é o comando de expedição, sempre pelo
 * `DeadlineEngine` (CTG-0001 §6.2).
 */
export function acknowledgementMark(
  channel: NoticeChannel,
  marks: AcknowledgementMarks,
): AcknowledgementMark {
  return { ...markOf(channel, marks), basis: CHANNEL_BASIS[channel] };
}
