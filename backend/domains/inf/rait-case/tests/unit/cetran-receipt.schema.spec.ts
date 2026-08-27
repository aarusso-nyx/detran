import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ddlPath = fileURLToPath(
  new URL('../../../../../database/ddl/34-inf-rait-case.sql', import.meta.url),
);

describe('CETRAN receipt milestone schema', () => {
  it('captures a CETRAN-specific receipt date and rejects it on another instance', () => {
    const ddl = readFileSync(ddlPath, 'utf8');

    expect(ddl).toContain('cetran_received_at timestamptz');
    expect(ddl).toContain("cetran_received_at is null or instance = 'cetran'");
    expect(ddl).toContain('ix_inf_rait_case_cetran_received');
  });
});
