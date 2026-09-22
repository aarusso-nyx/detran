// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 "forms/schemas-matrix.spec.ts" (C-02-93; 9/9).
// Único spec que importa `forms/` e `shared/models.ts` juntos (§12).
import { describe, expect, expectTypeOf, it } from 'vitest';
import { FORM_SCHEMAS } from './index.js';
import type {
  DutyEvidenceBody,
  ExportarBody,
  FinalidadeN2Body,
} from './index.js';
import { COMMAND_MATRIX_FIXTURE } from '../../testing/command-matrix.fixture.js';
import type {
  DutyEvidence,
  ExportRequest,
  PurposeDeclaration,
} from '../shared/models.js';

/** Remove `readonly` em profundidade (nunca `?`) — só para neutralizar a mutabilidade
 * cosmética entre `z.infer` (nunca readonly) e os view-models (`readonly` por convenção)
 * na comparação estrutural abaixo; campo/tipo/opcionalidade continuam checados exatamente. */
type DeepWritable<T> = T extends readonly (infer U)[]
  ? DeepWritable<U>[]
  : T extends object
    ? { -readonly [K in keyof T]: DeepWritable<T[K]> }
    : T;

const FORM_SLUGS = [
  'ack-alerta',
  'encerrar-alerta',
  'causa-raiz',
  'avancar-ciclo',
  'finalidade-n2',
  'exportar',
  'configurar-indicador',
  'solicitar-relatorio',
  'auditoria-transparencia',
] as const;

describe('forms/schemas-matrix.spec.ts (C-02-93)', () => {
  it('dado DashboardFormSlug (9) quando FORM_SCHEMAS então 9 chaves, uma por slug, cada valor um ZodType', () => {
    const keys = Object.keys(FORM_SCHEMAS);
    expect(keys).toHaveLength(9);
    expect([...keys].sort()).toEqual([...FORM_SLUGS].sort());
    for (const schema of Object.values(FORM_SCHEMAS)) {
      expect(typeof schema.safeParse).toBe('function');
    }
  });

  it('dado cada gate exportado quando lido então policy ∈ chaves de COMMAND_MATRIX_FIXTURE ∪ {null} (null só em finalidade-n2 e nos 3 estados de sistema de avancar-ciclo)', async () => {
    const [
      { ACK_ALERTA_GATE },
      { ENCERRAR_ALERTA_GATE },
      { CAUSA_RAIZ_GATE },
      { AVANCAR_CICLO_GATES },
      { FINALIDADE_N2_GATE },
      { EXPORTAR_GATE },
      { CONFIGURAR_INDICADOR_GATES },
      { SOLICITAR_RELATORIO_GATE },
      { AUDITORIA_TRANSPARENCIA_GATE },
    ] = await Promise.all([
      import('./ack-alerta.schema.js'),
      import('./encerrar-alerta.schema.js'),
      import('./causa-raiz.schema.js'),
      import('./avancar-ciclo.schema.js'),
      import('./finalidade-n2.schema.js'),
      import('./exportar.schema.js'),
      import('./configurar-indicador.schema.js'),
      import('./solicitar-relatorio.schema.js'),
      import('./auditoria-transparencia.schema.js'),
    ]);

    const commandKeys = Object.keys(COMMAND_MATRIX_FIXTURE);
    const simpleGates = [
      ACK_ALERTA_GATE,
      ENCERRAR_ALERTA_GATE,
      CAUSA_RAIZ_GATE,
      EXPORTAR_GATE,
      SOLICITAR_RELATORIO_GATE,
      AUDITORIA_TRANSPARENCIA_GATE,
      CONFIGURAR_INDICADOR_GATES.update,
      CONFIGURAR_INDICADOR_GATES.publish,
    ];
    for (const gate of simpleGates) {
      expect(gate.policy).not.toBeNull();
      expect(commandKeys, gate.policy as string).toContain(gate.policy);
      expect(gate.command).not.toBeNull();
    }
    expect(FINALIDADE_N2_GATE.policy).toBeNull();
    expect(FINALIDADE_N2_GATE.command).toBeNull();

    for (const [state, gate] of Object.entries(AVANCAR_CICLO_GATES)) {
      const isSystemState = [
        'JANELA_ABERTA',
        'ATRASADO',
        'NAO_CUMPRIDO',
      ].includes(state);
      if (isSystemState) {
        expect(gate.policy, state).toBeNull();
        expect(gate.command, state).toBeNull();
      } else {
        expect(gate.policy, state).not.toBeNull();
        expect(commandKeys, `${state}: ${gate.policy}`).toContain(gate.policy);
      }
    }
  });

  it('dado expectTypeOf então z.infer dos schemas equivale aos view-models de shared/models.ts', () => {
    // `z.infer` nunca marca campos como `readonly` (zod não anota mutabilidade); os
    // view-models de `shared/models.ts` são `readonly` por convenção (CODESTYLE §Frontend).
    // `toEqualTypeOf` (vitest 4/expect-type) é sensível a essa diferença cosmética — sem
    // afrouxar a checagem de campo/tipo/opcionalidade, comparamos as duas pontas já sem
    // `readonly` (em profundidade, dos dois lados) com o parâmetro de tipo (forma exigida
    // pelo vitest 4: `expectTypeOf<T>()`, nunca passando um valor).
    expectTypeOf<DeepWritable<FinalidadeN2Body>>().toEqualTypeOf<
      DeepWritable<PurposeDeclaration>
    >();
    expectTypeOf<DeepWritable<ExportarBody>>().toEqualTypeOf<
      DeepWritable<ExportRequest>
    >();
    expectTypeOf<DeepWritable<DutyEvidenceBody>>().toEqualTypeOf<
      DeepWritable<DutyEvidence>
    >();
  });
});
