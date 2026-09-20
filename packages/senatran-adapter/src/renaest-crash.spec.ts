import { describe, expect, it, vi } from 'vitest';

import type { SenatranClient } from './client.js';
import { createSenatranPorts } from './ports.js';

describe('RenaestPort — contrato BOAT de sinistro', () => {
  it('dado CrashReportInput quando submitCrash é chamado então C-2-06 e C-2-15 usam somente a operação RENAEST e o mapeamento nacional', async () => {
    const request = vi.fn().mockResolvedValue({
      protocolo: 'REN-BOAT-001',
      idSinistro: 'crash-001',
      situacao: 'RECEBIDO',
    });
    const ports = createSenatranPorts({ request } as unknown as SenatranClient);

    await expect(
      ports.renaest.submitCrash({
        occurredAt: '2026-09-14T10:00:00.000Z',
        state: 'AM',
        municipalityCode: '1302603',
        severity: 'NO_VICTIMS',
        location: 'BR-174, km 12',
        responsibleAgency: 'AM-DET',
        layoutVersion: 'source_pending',
      }),
    ).resolves.toMatchObject({
      protocol: 'REN-BOAT-001',
      crashId: 'crash-001',
      status: 'RECEBIDO',
    });

    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0]?.[0]).toMatchObject({
      surface: 'renaest',
      operation: 'submit-crash',
      method: 'POST',
      path: '/v1/renaest/sinistros',
      write: true,
      body: {
        dataHoraSinistro: '2026-09-14T10:00:00.000Z',
        uf: 'AM',
        codigoMunicipio: '1302603',
        gravidade: 'SEM_VITIMA',
        local: 'BR-174, km 12',
        orgaoResponsavel: 'AM-DET',
        versaoLeiaute: 'source_pending',
      },
    });
  });

  it('dado complemento e correção quando RenaestPort é chamado então C-2-07 separa as operações e preserva o motivo', async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce({
        idRetificacao: 'ret-001',
        idSinistro: 'crash-001',
        tipo: 'COMPLEMENTO',
        protocolo: 'REN-C-001',
        situacao: 'EM_ANALISE',
      })
      .mockResolvedValueOnce({
        idRetificacao: 'ret-002',
        idSinistro: 'crash-001',
        tipo: 'CORRECAO',
        protocolo: 'REN-R-001',
        situacao: 'EM_ANALISE',
      });
    const ports = createSenatranPorts({ request } as unknown as SenatranClient);
    const correction = {
      reason: 'correção do local informado no registro',
      layoutVersion: 'source_pending',
    };

    await expect(
      ports.renaest.complementCrash('crash-001', correction),
    ).resolves.toMatchObject({ type: 'COMPLEMENT', status: 'EM_ANALISE' });
    await expect(
      ports.renaest.correctCrash('crash-001', correction),
    ).resolves.toMatchObject({ type: 'CORRECTION', status: 'EM_ANALISE' });

    expect(request.mock.calls.map(([call]) => call.path)).toEqual([
      '/v1/renaest/sinistros/crash-001/complementos',
      '/v1/renaest/sinistros/crash-001/correcoes',
    ]);
    for (const [call] of request.mock.calls) {
      expect(call).toMatchObject({
        surface: 'renaest',
        write: true,
        body: {
          motivo: correction.reason,
          versaoLeiaute: 'source_pending',
        },
      });
    }
  });
});
