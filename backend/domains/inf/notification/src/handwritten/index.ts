// API pública manuscrita de @detran/inf-notification
// (work/rounds/R-0006/contracts/CTG-0001.md §6.2), reexportada pelo `src/index.ts`
// gerado via `module.handwrittenExports` do BP-INF-NOTIFICATION-001 (ADR-0007).
// Nesta rodada só a regra de ciência: nenhuma rota, nenhum acesso a banco.
export { acknowledgementMark } from './acknowledgement-mark.js';
export type {
  AcknowledgementEvidenceKind,
  AcknowledgementMark,
  AcknowledgementMarks,
  NoticeChannel,
} from './acknowledgement-mark.js';
