// CTG-0002 §9.4 (marca d'água de [RN-DASH-172] regra 3: órgão, camada,
// usuário, data-hora, recorte, export — uma linha, campos separados por `|`)
// — C-0002-91 na camada `unit` (TASK-0014). Contrato de §14.2:
// `surface/watermark.ts` exporta `watermarkOf(...)`. Os campos são os de
// §9.4; o argumento é um objeto com esses campos (nomes camelCase dos campos
// de `export_log`: `userRef`, `userRole`, `scope`, `filters`, `exportId`;
// forma do argumento não fixada em §14.2 — OD-D60). Relógio fixo: `at` é
// entrada, nunca `Date.now()`. Fica vermelho (Cannot find module) até
// TASK-0013 criar `src/handwritten/surface/watermark.ts`.
import { describe, expect, it } from 'vitest';

import { watermarkOf } from '../../src/handwritten/surface/watermark.js';

/** Exemplo literal de CTG-0002 §9.4. */
const EXAMPLE =
  'DETRAN-AM | camada N1 | usuario 00000000-0000-4000-8000-0000b0000001 (dash-operator) | 2026-09-21T12:00:00.000Z | recorte alerts {"state":"NOTIFICADO"} | export 00000000-0000-7000-8000-000081000501';

const input = {
  agency: 'DETRAN-AM',
  layer: 'N1' as const,
  userRef: '00000000-0000-4000-8000-0000b0000001',
  userRole: 'dash-operator',
  at: new Date('2026-09-21T12:00:00.000Z'),
  scope: 'alerts',
  filters: { state: 'NOTIFICADO' },
  exportId: '00000000-0000-7000-8000-000081000501',
};

describe('CTG-0002 §9.4 — watermarkOf (C-0002-91 [unit])', () => {
  it('C-0002-91 — dado os campos do exemplo de §9.4 quando watermarkOf então exatamente a linha do contrato', () => {
    expect(watermarkOf(input)).toBe(EXAMPLE);
  });

  it('C-0002-91 — dado filters com chaves fora de ordem e espaços quando watermarkOf então o recorte é canônico (chaves ordenadas, sem espaços)', () => {
    const line = watermarkOf({
      ...input,
      filters: { state: 'NOTIFICADO', block: 'A', app: 'rait' },
    });
    expect(line).toContain(
      'recorte alerts {"app":"rait","block":"A","state":"NOTIFICADO"}',
    );
    expect(line).not.toMatch(/\{\s|,\s|:\s/);
  });

  it('C-0002-91 — dado filters vazio quando watermarkOf então recorte "<scope> {}"', () => {
    expect(watermarkOf({ ...input, filters: {} })).toContain(
      '| recorte alerts {} |',
    );
  });

  it('C-0002-91 — dado data-hora com fuso local quando watermarkOf então a linha traz o instante em ISO UTC (Z, milissegundos)', () => {
    const line = watermarkOf({
      ...input,
      at: new Date('2026-09-21T08:00:00.000-04:00'),
    });
    expect(line.split(' | ')[3]).toBe('2026-09-21T12:00:00.000Z');
  });

  it('C-0002-91 — dado camada N2 e papel rait-manager quando watermarkOf então "camada N2" e "usuario <id> (rait-manager)"', () => {
    const line = watermarkOf({
      ...input,
      layer: 'N2' as const,
      userRole: 'rait-manager',
    });
    const parts = line.split(' | ');
    expect(parts[1]).toBe('camada N2');
    expect(parts[2]).toBe(
      'usuario 00000000-0000-4000-8000-0000b0000001 (rait-manager)',
    );
  });

  it('C-0002-91 — dado qualquer entrada quando watermarkOf então uma única linha com seis campos separados por " | " e sem quebra de linha', () => {
    const line = watermarkOf(input);
    expect(line).not.toContain('\n');
    expect(line.split(' | ')).toHaveLength(6);
  });
});
