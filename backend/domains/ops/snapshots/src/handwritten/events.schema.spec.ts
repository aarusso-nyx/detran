// CTG-0005 §9 adenda item 19 (C-5-25′, TASK-0012 iteração 3) — spec do
// oitavo módulo listado no critério. `ops/snapshots` é o único dos oito sem
// `type` técnico nesta rodada: CTG-0005 §5.4 regra 6 ("`snapshots` não
// publica evento (`SNAPSHOT_EVENT_TYPES = []`): nenhum arquivo") e
// `./events.ts` (§11.7/OD-T21, CTG-0003 §5.1) — a consulta externa de
// veículo/pessoa não tem token de domínio no route contract §8 nesta
// rodada. Este spec não produz envelope nenhum (não há helper de envelope
// para chamar) e prova a própria premissa: os dois vetores exportados por
// `./events.js` ficam vazios, então a ausência de um
// `events/*.schema.json` para este módulo é decisão de contrato, não
// omissão.
//
// `type` cobertos por este spec: nenhum (zero de dezesseis; ver
// CTG-0005 §5.4 regra 6).
import { readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { SNAPSHOT_EVENT_SCHEMAS, SNAPSHOT_EVENT_TYPES } from './events.js';

const root = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../../..',
);
const eventsSchemaDir = join(root, 'docs/framework/schemas/events');

describe('C-5-25′ — ops/snapshots events.ts não publica evento nesta rodada (types: nenhum)', () => {
  it('dado o módulo snapshots quando SNAPSHOT_EVENT_TYPES/SNAPSHOT_EVENT_SCHEMAS são lidos então ambos ficam vazios', () => {
    expect(SNAPSHOT_EVENT_TYPES).toEqual([]);
    expect(Object.keys(SNAPSHOT_EVENT_SCHEMAS)).toEqual([]);
  });

  it('dado o diretório de schemas de evento quando listado então nenhum arquivo é de ops/snapshots (nenhum type deste módulo em CTG-0005 §5.4)', () => {
    // Os dezesseis arquivos de §5.4 pertencem aos outros sete módulos; este
    // teste apenas documenta que a lista não teria como incluir um arquivo
    // "snapshot" — o diretório existe e é lido do disco, sem suposição sobre
    // seu conteúdo além de ele ser uma lista de `*.schema.json`.
    const files = readdirSync(eventsSchemaDir).filter((name) =>
      name.endsWith('.schema.json'),
    );
    expect(files.some((name) => name.startsWith('snapshot'))).toBe(false);
  });
});
