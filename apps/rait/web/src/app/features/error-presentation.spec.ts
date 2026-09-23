// R-0012 TASK-0014 (Inspector, iteração restrita 2). CTG-0002b.md §8 C-2B-86: apresentação do
// erro (§4.4) que depende de comandos reais (R-0007 CTG-0004) e/ou dos schemas do CTG-0002c —
// `it.todo` citando a fonte (regra "nunca skip sem OD"; `CODESTYLE.md` §Tests). Nenhum destes
// comportamentos existe nesta rodada: todo comando é M8 (`RaitCommandUnavailableError`).
import { describe, it } from 'vitest';

describe('C-2B-86 — apresentação do erro (§4.4) sobre comandos reais', () => {
  it.todo('409/412 → refresh + toast — R-0007 CTG-0004');
  it.todo('422 com legalBasis → diálogo bloqueante — R-0007 CTG-0004');
  it.todo('400 fields[] → erro inline — R-0007 CTG-0004 / CTG-0002c');
  it.todo('403 após comando → ação removida — R-0007 CTG-0004');
  it.todo('503 UPSTREAM_* → badge pending-retransmission — R-0007 CTG-0004');
});
