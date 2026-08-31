import { BadRequestException, ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { BillingLifecycleService } from '../../src/billing-lifecycle.service.js';

function subject(query: ReturnType<typeof vi.fn>) {
  const items = {
    transaction: async <T>(
      work: (transaction: { query: typeof query }) => Promise<T>,
    ) => work({ query }),
  };
  const context = { snapshot: () => ({ actorId: 'actor-1' }) };
  return new BillingLifecycleService(items as never, context as never);
}

describe('BillingLifecycleService', () => {
  it('DT-100 publishes a non-overlapping federal IPCA price version', async () => {
    const price = { id: 'price-1', index_name: 'IPCA' };
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [price] });

    await expect(
      subject(query).publishExamPrice({
        examKind: 'MEDICAL',
        amountCents: 12500,
        effectiveFrom: '2026-01-01',
        ipcaReferenceYear: 2026,
        federalSourceReference: 'SENATRAN/2026',
        publishedAt: '2025-12-15',
      }),
    ).resolves.toEqual(price);
    expect(query.mock.calls[0]?.[0]).toContain('pg_advisory_xact_lock');
    expect(query.mock.calls[2]?.[0]).toContain("$5, 'IPCA'");
  });

  it('DT-100 rejects overlapping price periods', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 'existing' }] });

    await expect(
      subject(query).publishExamPrice({
        examKind: 'PSYCH',
        amountCents: 15000,
        effectiveFrom: '2026-01-01',
        ipcaReferenceYear: 2026,
        federalSourceReference: 'SENATRAN/2026',
        publishedAt: '2025-12-15',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('DT-100 derives an exam item amount from the effective price version', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [{ id: 'price-1', amount_cents: 12500 }],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'item-1',
            encounter_id: 'encounter-1',
            amount_cents: 12500,
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [] });

    await subject(query).createItem({
      encounterId: 'encounter-1',
      itemKind: 'EXAM',
      examKind: 'MEDICAL',
    });
    expect(query.mock.calls[1]?.[1]).toEqual([
      'encounter-1',
      null,
      'price-1',
      'EXAM',
      'MEDICAL',
      12500,
      null,
      '{}',
      'actor-1',
    ]);
  });

  it('DT-100 rejects a clinic-supplied exam amount before querying', () => {
    const query = vi.fn();

    expect(() =>
      subject(query).createItem({
        encounterId: 'encounter-1',
        itemKind: 'EXAM',
        examKind: 'MEDICAL',
        amountCents: 1,
      }),
    ).toThrow(/derived from the federal public price/);
    expect(query).not.toHaveBeenCalled();
  });

  it('fails closed when no effective federal exam price exists', async () => {
    const query = vi.fn().mockResolvedValueOnce({ rows: [] });

    await expect(
      subject(query).createItem({
        encounterId: 'encounter-1',
        itemKind: 'EXAM',
        examKind: 'MEDICAL',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an exam item without an encounter before querying', () => {
    const query = vi.fn();

    expect(() =>
      subject(query).createItem({
        telehealthSessionId: 'telehealth-1',
        itemKind: 'EXAM',
        examKind: 'MEDICAL',
      }),
    ).toThrow(/requires an encounter/);
    expect(query).not.toHaveBeenCalled();
  });

  it('rejects a mismatched replay of an already paid item', async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: 'item-1',
          status: 'PAID',
          amount_cents: 12500,
          reference_number: 'PAY-1',
        },
      ],
    });

    await expect(
      subject(query).validatePayment('item-1', 'PAY-2', 12500),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('closes an invoice with normalized one-invoice-per-item membership', async () => {
    const invoice = { id: 'invoice-1', status: 'CLOSED', total_cents: 300 };
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ item_count: 2, total_cents: 300 }] })
      .mockResolvedValueOnce({ rows: [invoice] })
      .mockResolvedValueOnce({ rows: [] });

    await expect(
      subject(query).closeInvoice('2026-08', ['item-1', 'item-2'], 'clinic-1'),
    ).resolves.toEqual(invoice);
    expect(query.mock.calls[2]?.[0]).toContain('ch.billing_invoice_item');
    expect(query.mock.calls[2]?.[1]).toEqual([
      'invoice-1',
      ['item-1', 'item-2'],
      'actor-1',
    ]);
  });

  it('rejects duplicate item ids before closing an invoice', () => {
    const query = vi.fn();

    expect(() =>
      subject(query).closeInvoice('2026-08', ['item-1', 'item-1']),
    ).toThrow(/non-empty and unique/);
    expect(query).not.toHaveBeenCalled();
  });

  it('enforces CLOSED to ATTESTED to PAID invoice transitions', async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [{ id: 'invoice-1', status: 'ATTESTED' }],
    });

    await subject(query).transitionInvoice('invoice-1', 'ATTESTED');
    expect(query.mock.calls[0]?.[0]).toContain('attested_at');
    expect(query.mock.calls[0]?.[1]).toEqual([
      'invoice-1',
      'ATTESTED',
      '{}',
      'CLOSED',
    ]);
  });

  it('records a divergence and marks an eligible item visibly divergent', async () => {
    const divergence = { id: 'divergence-1', status: 'OPEN' };
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [divergence] })
      .mockResolvedValueOnce({ rows: [] });

    await expect(
      subject(query).createDivergence('Amount mismatch', 'invoice-1', 'item-1'),
    ).resolves.toEqual(divergence);
    expect(query.mock.calls[1]?.[0]).toContain("status = 'DIVERGENT'");
  });

  it('resolves only an open divergence with actor attribution', async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [{ id: 'divergence-1', status: 'RESOLVED' }],
    });

    await subject(query).resolveDivergence(
      'divergence-1',
      'RESOLVED',
      'Evidence reconciled',
    );
    expect(query.mock.calls[0]?.[0]).toContain("status = 'OPEN'");
    expect(query.mock.calls[0]?.[1]).toEqual([
      'divergence-1',
      'RESOLVED',
      'Evidence reconciled',
      'actor-1',
    ]);
  });

  it('reports through normalized invoice membership', async () => {
    const row = {
      reference_period: '2026-08',
      invoices: 1,
      items: 2,
      total_cents: 300,
      paid_cents: 200,
      divergent_items: 1,
    };
    const query = vi.fn().mockResolvedValueOnce({ rows: [row] });

    await expect(subject(query).report('2026-08')).resolves.toEqual(row);
    expect(query.mock.calls[0]?.[0]).toContain('ch.billing_invoice_item');
    expect(query.mock.calls[0]?.[1]).toEqual(['2026-08', null]);
  });
});
