// Marco de ciência por canal (RN-RAIT-104, inf.notification_channel_ref.ciencia_rule;
// work/rounds/R-0006/contracts/CTG-0001.md §6.2). Relógio das fixtures: hoje =
// 2026-09-14, fuso America/Manaus (rait-test-strategy.md §6); a função é pura e
// não consulta relógio — recebe os marcos e devolve o marco de ciência.
import { describe, expect, it } from 'vitest';

import { acknowledgementMark } from '../../src/handwritten/index.js';

describe('acknowledgementMark — marco de ciência por canal (RN-RAIT-104)', () => {
  it('dado o canal postal quando a NA é expedida em 2026-09-14 então o marco é a expedição com AR postal e sem ficção', () => {
    const mark = acknowledgementMark('postal', { dispatchedOn: '2026-09-14' });

    expect(mark.effectiveOn).toBe('2026-09-14');
    expect(mark.fictitious).toBe(false);
    expect(mark.evidenceKind).toBe('ar_postal');
    expect(mark.basis.length).toBeGreaterThan(0);
  });

  it('dado o canal sne disponibilizado em 2026-09-14 sem leitura quando o marco é calculado então a ciência é ficta em 2026-10-14 (caso 7 do §7)', () => {
    const mark = acknowledgementMark('sne', { availableOn: '2026-09-14' });

    // disponibilização + 30 dias corridos (T-SNE-CIENCIA); 2026-10-14 é dia útil.
    expect(mark.effectiveOn).toBe('2026-10-14');
    expect(mark.fictitious).toBe(true);
    expect(mark.evidenceKind).toBe('recibo_sne');
  });

  it('dado o canal sne disponibilizado em 2026-09-14 e lido em 2026-09-20 quando o marco é calculado então a ciência é a leitura (caso 8 do §7)', () => {
    const mark = acknowledgementMark('sne', {
      availableOn: '2026-09-14',
      readOn: '2026-09-20',
    });

    // min(leitura, disponibilização + 30): a leitura vem antes da ficta.
    expect(mark.effectiveOn).toBe('2026-09-20');
    expect(mark.fictitious).toBe(false);
    expect(mark.evidenceKind).toBe('recibo_sne');
  });

  it('dado o canal edital quando o edital é publicado em 2026-09-14 então o marco é a publicação', () => {
    const mark = acknowledgementMark('edital', { publishedOn: '2026-09-14' });

    expect(mark.effectiveOn).toBe('2026-09-14');
    expect(mark.fictitious).toBe(false);
    expect(mark.evidenceKind).toBe('publicacao_edital');
  });

  it('dado o canal pessoal quando a entrega é assinada em 2026-09-14 então o marco é a assinatura', () => {
    const mark = acknowledgementMark('pessoal', { signedOn: '2026-09-14' });

    expect(mark.effectiveOn).toBe('2026-09-14');
    expect(mark.fictitious).toBe(false);
    expect(mark.evidenceKind).toBe('assinatura');
  });

  it('dado o canal balcao quando a ciência é protocolada em 2026-09-14 então o marco é o protocolo de balcão', () => {
    const mark = acknowledgementMark('balcao', {
      protocolledOn: '2026-09-14',
    });

    expect(mark.effectiveOn).toBe('2026-09-14');
    expect(mark.fictitious).toBe(false);
    expect(mark.evidenceKind).toBe('registro_balcao');
  });

  it('dado o canal portal quando a notificação é disponibilizada então não há marco de prazo legal', () => {
    const mark = acknowledgementMark('portal', {
      availableOn: '2026-09-14',
    });

    expect(mark.effectiveOn).toBeNull();
    expect(mark.fictitious).toBe(false);
    expect(mark.evidenceKind).toBeNull();
  });
});
