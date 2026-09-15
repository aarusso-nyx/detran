import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const blueprint = JSON.parse(
  readFileSync(
    new URL(
      '../../../../../docs/framework/blueprints/BP-INF-MEASURES-001.json',
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

describe('BP-INF-MEASURES-001 v1.1.0', () => {
  it('dado uma medida administrativa quando inspecionada então separa os prazos e restringe estados e limites', () => {
    expect(blueprint.module.version).toBe('1.1.0');
    const term = blueprint.database.entities.find(
      (entity) => entity.table === 'administrative_term',
    );
    expect(term?.fields?.map((column) => column.name)).toEqual(
      expect.arrayContaining([
        'withdrawal_deadline_at',
        'ctb_deadline_at',
        'signer_name',
        'field_details_json',
      ]),
    );
    const measure = blueprint.database.entities.find(
      (entity) => entity.table === 'administrative_measure',
    );
    expect(
      measure?.checks?.some(
        (check) =>
          check.expression.includes('RETIDO') &&
          check.expression.includes('VIOLACAO_MONITORAMENTO'),
      ),
    ).toBe(true);
    const retention = blueprint.database.entities.find(
      (entity) => entity.table === 'measure_retention',
    );
    const removal = blueprint.database.entities.find(
      (entity) => entity.table === 'measure_removal',
    );
    expect(
      retention?.checks?.some((check) =>
        check.expression.includes('between 1 and 30'),
      ),
    ).toBe(true);
    expect(
      removal?.checks?.some((check) =>
        check.expression.includes('between 1 and 15'),
      ),
    ).toBe(true);
  });
});
