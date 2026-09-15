import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const blueprint = JSON.parse(
  readFileSync(
    new URL(
      '../../../../../docs/framework/blueprints/BP-INF-NORMATIVE-001.json',
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

describe('BP-INF-NORMATIVE-001 v1.1.0', () => {
  it('dado o blueprint normativo quando inspecionado então expõe a tabela metrológica e os campos de framing', () => {
    expect(blueprint.module.version).toBe('1.1.0');
    expect(
      blueprint.database.entities.some(
        (entity) => entity.table === 'normative_metrological_table',
      ),
    ).toBe(true);
    const framing = blueprint.database.entities.find(
      (entity) => entity.table === 'normative_framing',
    );
    expect(framing?.fields?.map((column) => column.name)).toEqual(
      expect.arrayContaining([
        'approach_class',
        'required_fields',
        'required_instrument',
        'points_label',
      ]),
    );
    expect(
      framing?.checks?.some(
        (check) =>
          check.expression.includes('caso_1') &&
          check.expression.includes('caso_2') &&
          check.expression.includes('caso_3'),
      ),
    ).toBe(true);
  });
});
