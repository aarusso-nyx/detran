import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const blueprint = JSON.parse(
  readFileSync(
    new URL(
      '../../../../../docs/framework/blueprints/BP-INF-ALCOHOL-001.json',
      import.meta.url,
    ),
    'utf8',
  ),
) as {
  module: { version: string };
  database: {
    entities: Array<{
      table: string;
      fields?: Array<{ name: string }>;
      checks?: Array<{ expression: string }>;
    }>;
  };
};

describe('BP-INF-ALCOHOL-001 v1.1.0', () => {
  it('dado uma alcoolemia quando inspecionada então preserva o par de medição e distingue recusa de impossibilidade técnica', () => {
    expect(blueprint.module.version).toBe('1.1.0');
    const test = blueprint.database.entities.find(
      (entity) => entity.table === 'alcohol_test',
    );
    expect(test?.fields?.map((column) => column.name)).toEqual(
      expect.arrayContaining(['considered_mg_l', 'max_error_mg_l']),
    );
    expect(
      test?.checks?.some(
        (check) =>
          check.expression.includes('considered_mg_l') &&
          check.expression.includes('max_error_mg_l'),
      ),
    ).toBe(true);
    const refusal = blueprint.database.entities.find(
      (entity) => entity.table === 'alcohol_refusal',
    );
    expect(
      refusal?.checks?.some(
        (check) =>
          check.expression.includes("'refusal'") &&
          check.expression.includes("'technical_impossibility'"),
      ),
    ).toBe(true);
  });
});
