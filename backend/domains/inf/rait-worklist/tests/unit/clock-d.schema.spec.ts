import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ddlPath = fileURLToPath(
  new URL(
    '../../../../../database/ddl/35-inf-rait-worklist.sql',
    import.meta.url,
  ),
);

describe('RAIT quinquennial prescription clock schema', () => {
  it('accepts the independent D clock without changing the other clock codes', () => {
    const ddl = readFileSync(ddlPath, 'utf8');

    expect(ddl).toContain("clock_code in ('A','B','C','D')");
    expect(ddl).toContain('ux_inf_rait_clock_case_code');
    expect(ddl).toContain("'PRESCRITO_OPERACIONAL'");
  });
});
