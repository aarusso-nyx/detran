import { describe, expect, it, vi } from 'vitest';

import type { SenatranClient } from './client.js';
import { createSenatranPorts } from './ports.js';

describe('RenachPort clinical-result boundary', () => {
  it('AC-PEC-009-1 maps only the minimum medical result contract', async () => {
    const request = vi.fn().mockResolvedValue({
      protocolo: 'protocol-1',
      idExame: 'exam-1',
      resultado: 'APTO_COM_RESTRICOES',
      restricoes: [{ codigo: 'A', descricao: 'Corrective lenses' }],
    });
    const ports = createSenatranPorts({ request } as unknown as SenatranClient);

    await expect(
      ports.renach.submitMedicalExam({
        renachNumber: 'RN123',
        appointmentId: 'appointment-1',
        clinic: { code: 'clinic-1', cnpj: '12345678000199' },
        examiner: {
          cpf: '52998224725',
          councilNumber: 'CRM-1',
          state: 'AM',
        },
        driver: {
          cpf: '11144477735',
          name: 'Candidate',
          birthDate: '1980-01-01',
        },
        process: { type: 'RENEWAL', currentCategory: 'B' },
        performedAt: '2026-08-31T12:00:00.000Z',
        result: 'APTO_COM_RESTRICOES',
        validUntil: '2031-08-31',
        restrictions: [{ code: 'A', description: 'Corrective lenses' }],
        signature: {
          hash: 'a'.repeat(64),
          signedAt: '2026-08-31T12:01:00.000Z',
        },
      }),
    ).resolves.toMatchObject({ examId: 'exam-1' });

    const outbound = request.mock.calls[0]?.[0];
    expect(outbound).toMatchObject({
      operation: 'submit-medical-exam',
      path: '/v1/renach/processos/RN123/examesMedicos',
      write: true,
      body: {
        exame: {
          resultado: 'APTO_COM_RESTRICOES',
          dataValidade: '2031-08-31',
        },
      },
    });
    expect(JSON.stringify(outbound)).not.toMatch(
      /anamnes|protocolos?|conteudo|bateriaTestes/iu,
    );
  });

  it('maps a psychological result without test-battery or clinical content', async () => {
    const request = vi.fn().mockResolvedValue({
      protocolo: 'protocol-2',
      idExame: 'exam-2',
      resultado: 'APTO',
    });
    const ports = createSenatranPorts({ request } as unknown as SenatranClient);

    await ports.renach.submitPsychologicalEvaluation({
      renachNumber: 'RN123',
      appointmentId: 'appointment-2',
      clinic: { code: 'clinic-1', cnpj: '12345678000199' },
      examiner: {
        cpf: '52998224725',
        councilNumber: 'CRP-1',
        state: 'AM',
      },
      performedAt: '2026-08-31T12:00:00.000Z',
      result: 'APTO',
      signature: {
        hash: 'b'.repeat(64),
        signedAt: '2026-08-31T12:01:00.000Z',
      },
    });

    const outbound = request.mock.calls[0]?.[0];
    expect(outbound.path).toBe(
      '/v1/renach/processos/RN123/avaliacoesPsicologicas',
    );
    expect(outbound.body.avaliacao).toEqual({
      dataRealizacao: '2026-08-31T12:00:00.000Z',
      resultado: 'APTO',
    });
    expect(outbound.body).not.toHaveProperty('bateriaTestes');
  });

  it('fails closed before transport for a non-federal result', async () => {
    const request = vi.fn();
    const ports = createSenatranPorts({ request } as unknown as SenatranClient);
    const input = {
      renachNumber: 'RN123',
      appointmentId: 'appointment-1',
      clinic: { code: 'clinic-1', cnpj: '12345678000199' },
      examiner: {
        cpf: '52998224725',
        councilNumber: 'CRM-1',
        state: 'AM',
      },
      driver: {
        cpf: '11144477735',
        name: 'Candidate',
        birthDate: '1980-01-01',
      },
      process: { type: 'RENEWAL' as const },
      performedAt: '2026-08-31T12:00:00.000Z',
      result: 'INVALID_RESULT',
      signature: {
        hash: 'a'.repeat(64),
        signedAt: '2026-08-31T12:01:00.000Z',
      },
    };

    await expect(
      ports.renach.submitMedicalExam(input as never),
    ).rejects.toThrow('Unsupported RENACH exam result');
    expect(request).not.toHaveBeenCalled();
  });
});
