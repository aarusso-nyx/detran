import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';

const CASE = '00000000-0000-7000-8000-000010000005';
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

describe('CETRAN receipt command controller', () => {
  it('dado recebimento CETRAN quando receive é executado então preserva o corpo canônico e devolve a ETag do serviço', async () => {
    const { RaitCaseCommandsController } =
      await import('../../src/handwritten/rait-case-commands.controller.js');
    const execute = vi.fn(async () => ({
      data: {
        id: CASE,
        instance: 'cetran',
        cetran_received_at: '2026-09-14T12:00:00.000Z',
      },
      events: [],
      etag: '"3"',
    }));
    const response = { setHeader: vi.fn() };
    const controller = new RaitCaseCommandsController({ execute } as never);

    await expect(
      controller.receive(
        CASE,
        { receivedOn: '2026-09-14', body: 'cetran' },
        '"2"',
        'opaque-cetran-receipt',
        response,
      ),
    ).resolves.toMatchObject({ data: { instance: 'cetran' } });
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        command: 'receive',
        targetId: CASE,
        payload: { receivedOn: '2026-09-14', body: 'cetran' },
        headers: {
          'If-Match': '"2"',
          'Idempotency-Key': 'opaque-cetran-receipt',
        },
      }),
    );
    expect(response.setHeader).toHaveBeenCalledWith('ETag', '"3"');
  });
});
