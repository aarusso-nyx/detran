import { describe, expect, it } from 'vitest';
import { VeraPdfDockerValidator } from '@stynx-nyx/pdf-a-vera-docker';

import { WeasyPrintPdfABackend } from '../../src/boat-documents.js';

const IMAGE =
  'verapdf/cli@sha256:20202b4bcc2410a25db1f637c7b461a2e0dda1d97dd8a6df658286b30d56c842';

describe('C-2-13 — caminho real PDF/A-2b', () => {
  it('dado relatório D1 quando gera e valida então produz PDF/A-2b real', async () => {
    const backend = new WeasyPrintPdfABackend(
      new VeraPdfDockerValidator({ image: IMAGE, timeoutMs: 120_000 }),
    );
    const result = await backend.render({
      tenantId: '00000000-0000-7000-8000-00000000a001',
      template: {
        id: 'est.crash.report.preliminary',
        engine: 'html',
        version: '1.0.0',
        source:
          '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Relatório preliminar</title><body><h1>Relatório preliminar de sinistro</h1><p>Documento informativo sujeito a complementação e validação. Não constitui Boletim de Acidente de Trânsito (BAT) oficial.</p></body></html>',
      },
      data: {},
      output: { profile: 'pdf-a' },
    });
    expect(Buffer.from(result.bytes).subarray(0, 5).toString()).toBe('%PDF-');
    expect(result.metadata).toMatchObject({ profile: 'pdf-a' });
  }, 180_000);

  it('dado bytes que apenas começam com PDF quando valida então rejeita', async () => {
    const validator = new VeraPdfDockerValidator({
      image: IMAGE,
      timeoutMs: 120_000,
    });
    await expect(
      validator.validate(Buffer.from('%PDF-falso\n%%EOF'), {
        version: 'A-2',
        conformance: 'b',
      }),
    ).rejects.toThrow('veraPDF Docker validation failed');
  }, 180_000);
});
