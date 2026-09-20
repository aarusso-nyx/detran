import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

const portSource = new URL(
  '../../src/handwritten/rait-case-transition.port.ts',
  import.meta.url,
);
const publicIndex = new URL('../../src/index.ts', import.meta.url);

describe('TASK-0049 — porta pública de transição do caso para sessão', () => {
  it('dado a sessão que proclama e publica quando usa a fronteira do caso então a porta pública declara somente as transições fechadas JULGADO_SESSAO e COMUNICADO', async () => {
    await expect(readFile(publicIndex, 'utf8')).resolves.toContain(
      'rait-case-transition.port',
    );
    const source = await readFile(portSource, 'utf8');

    expect(source).toContain('proclaimSessionDecision');
    expect(source).toContain('publishSessionDecision');
    expect(source).toContain("'PAUTADO'");
    expect(source).toContain("'JULGADO_SESSAO'");
    expect(source).toContain("'COMUNICADO'");
  });

  it('dado uma transação de comando existente quando a porta transita o caso então recebe tx, bloqueia estado e não abre Database.tx ou withTenantContext próprios', async () => {
    const source = await readFile(portSource, 'utf8');

    expect(source).toMatch(/tx:\s*Transaction/u);
    expect(source).toContain('for update');
    expect(source).not.toMatch(/\.tx\s*\(/u);
    expect(source).not.toContain('withTenantContext(');
  });

  it('dado falha de uma transição de item quando a porta é usada pela sessão então preserva RAIT.CASE_STATE_INVALID e RAIT.TENANT_MISMATCH sem auditoria HTTP interna', async () => {
    const source = await readFile(portSource, 'utf8');

    expect(source).toContain('RAIT.CASE_STATE_INVALID');
    expect(source).toContain('RAIT.TENANT_MISMATCH');
    expect(source).not.toMatch(/audit/i);
  });
});
