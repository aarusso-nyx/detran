import { describe, expect, it, vi } from 'vitest';

import { CouncilVerificationHttpAdapter } from '../../src/council-verification.http-adapter.js';
import { ProfessionalLifecycleService } from '../../src/professional-lifecycle.service.js';

const professionalInput = {
  clinic_id: ' clinic-1 ',
  person_name: ' Dr Example ',
  document_cpf: '123.456.789-00',
  professional_kind: 'MEDICO',
  council_type: 'crm',
  council_number: ' 1234 ',
  council_state: 'sp',
  email: ' DOCTOR@EXAMPLE.COM ',
  phone: ' 11999999999 ',
};

const activeReceipt = {
  professionalName: 'Dr Example',
  status: 'ACTIVE' as const,
  providerCheckedAt: '2026-08-31T12:00:00.000Z',
  responseSha256: 'a'.repeat(64),
};

function subject(
  query: ReturnType<typeof vi.fn>,
  council = { verify: vi.fn() },
  current?: Record<string, unknown>,
) {
  const repository = {
    transaction: async <T>(work: (transaction: unknown) => Promise<T>) =>
      work({ query }),
    create: vi.fn(async (input) => ({ id: 'professional-1', ...input })),
    update: vi.fn(async (id, input) => ({ id, ...current, ...input })),
    findOne: vi.fn(async () => current),
  };
  return {
    service: new ProfessionalLifecycleService(
      repository as never,
      council as never,
    ),
    repository,
    council,
  };
}

describe('ProfessionalLifecycleService', () => {
  it('rejects a medical professional without the required CRM identity', async () => {
    const query = vi.fn();
    const { service, council } = subject(query);

    await expect(
      service.create({ ...professionalInput, council_type: 'CRP' }),
    ).rejects.toThrow('require an active CRM council');
    expect(council.verify).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
  });

  it('uses a tenant-scoped active cache record and normalizes persisted identity', async () => {
    const query = vi.fn(async (sql: string) => {
      if (sql.includes('integration.professional_council_cache'))
        return { rows: [{ status: 'ACTIVE' }] };
      if (sql.includes('from ch.clinic')) return { rows: [{ id: 'clinic-1' }] };
      throw new Error(`Unexpected query: ${sql}`);
    });
    const { service, repository, council } = subject(query);

    await expect(service.create(professionalInput)).resolves.toMatchObject({
      id: 'professional-1',
      clinic_id: 'clinic-1',
      person_name: 'Dr Example',
      document_cpf: '12345678900',
      council_type: 'CRM',
      council_number: '1234',
      council_state: 'SP',
      email: 'doctor@example.com',
    });
    expect(council.verify).not.toHaveBeenCalled();
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ council_type: 'CRM', council_state: 'SP' }),
      expect.anything(),
    );
  });

  it('calls the provider on cache miss and persists only a reduced receipt', async () => {
    let cacheReads = 0;
    const query = vi.fn(async (sql: string) => {
      if (sql.startsWith('select status from integration')) {
        cacheReads += 1;
        return { rows: cacheReads === 1 ? [] : [{ status: 'ACTIVE' }] };
      }
      if (sql.includes('insert into integration.professional_council_cache'))
        return { rows: [] };
      if (sql.includes('from ch.clinic')) return { rows: [{ id: 'clinic-1' }] };
      throw new Error(`Unexpected query: ${sql}`);
    });
    const council = { verify: vi.fn(async () => activeReceipt) };
    const { service } = subject(query, council);

    await service.create(professionalInput);

    expect(council.verify).toHaveBeenCalledWith({
      councilType: 'CRM',
      councilNumber: '1234',
      councilState: 'SP',
      professionalName: 'Dr Example',
    });
    const insert = query.mock.calls.find(([sql]) =>
      String(sql).includes(
        'insert into integration.professional_council_cache',
      ),
    ) as unknown as [string, readonly unknown[]] | undefined;
    expect(insert?.[1]).toEqual([
      'CRM',
      '1234',
      'SP',
      'Dr Example',
      'ACTIVE',
      activeReceipt.providerCheckedAt,
      activeReceipt.responseSha256,
    ]);
    expect(String(insert?.[0])).not.toContain('raw_payload');
  });

  it.each(['INACTIVE', 'SUSPENDED'] as const)(
    'rejects cached council status %s without calling the provider',
    async (status) => {
      const query = vi.fn().mockResolvedValueOnce({ rows: [{ status }] });
      const { service, council, repository } = subject(query);

      await expect(service.create(professionalInput)).rejects.toThrow(
        'Professional council status is not active',
      );
      expect(council.verify).not.toHaveBeenCalled();
      expect(repository.create).not.toHaveBeenCalled();
    },
  );

  it('persists an inactive provider receipt before rejecting activation', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });
    const council = {
      verify: vi.fn(async () => ({
        ...activeReceipt,
        status: 'INACTIVE' as const,
      })),
    };
    const { service, repository } = subject(query, council);

    await expect(service.create(professionalInput)).rejects.toThrow(
      'Professional council status is not active',
    );
    expect(query.mock.calls[1]?.[0]).toContain(
      'insert into integration.professional_council_cache',
    );
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('revalidates merged council identity when a professional is updated', async () => {
    const current = {
      id: 'professional-1',
      tenant_id: 'tenant-1',
      clinic_id: 'clinic-1',
      person_name: 'Dr Example',
      professional_kind: 'MEDICO',
      council_type: 'CRM',
      council_number: '1234',
      council_state: 'SP',
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: null,
    };
    const query = vi.fn(async (sql: string) => {
      if (sql.includes('integration.professional_council_cache'))
        return { rows: [{ status: 'ACTIVE' }] };
      if (sql.includes('from ch.professional')) return { rows: [current] };
      if (sql.includes('from ch.clinic')) return { rows: [{ id: 'clinic-1' }] };
      throw new Error(`Unexpected query: ${sql}`);
    });
    const { service, repository } = subject(query, undefined, current);

    await service.update('professional-1', { email: ' NEW@EXAMPLE.COM ' });

    expect(repository.update).toHaveBeenCalledWith(
      'professional-1',
      { email: 'new@example.com' },
      expect.anything(),
    );
    expect(
      query.mock.calls.some(([sql]) => String(sql).includes('for update')),
    ).toBe(true);
  });

  it('fails closed when the council provider is not configured', async () => {
    const previousUrl = process.env.DETRAN_COUNCIL_VERIFICATION_URL;
    const previousToken = process.env.DETRAN_COUNCIL_VERIFICATION_TOKEN;
    delete process.env.DETRAN_COUNCIL_VERIFICATION_URL;
    delete process.env.DETRAN_COUNCIL_VERIFICATION_TOKEN;
    try {
      await expect(
        new CouncilVerificationHttpAdapter().verify({
          councilType: 'CRM',
          councilNumber: '1234',
          councilState: 'SP',
          professionalName: 'Dr Example',
        }),
      ).rejects.toThrow(
        'Professional council verification service is not configured',
      );
    } finally {
      if (previousUrl)
        process.env.DETRAN_COUNCIL_VERIFICATION_URL = previousUrl;
      if (previousToken)
        process.env.DETRAN_COUNCIL_VERIFICATION_TOKEN = previousToken;
    }
  });
});
