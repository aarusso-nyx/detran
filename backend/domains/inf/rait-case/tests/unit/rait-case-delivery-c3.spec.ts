import { DETRAN_RESOURCE_METADATA_KEY } from '@detran/shared';
import { Database } from '@stynx-nyx/data';
import { RequestContext } from '@stynx-nyx/core';
import { describe, expect, it, vi } from 'vitest';

import {
  RaitCaseCommandService,
  RaitDeadlineEngineFactory,
} from '../../src/handwritten/rait-case-command.service.js';
import { RaitInquiryCommandService } from '../../src/handwritten/rait-inquiry-command.service.js';
import { RaitInquiryCommandsController } from '../../src/handwritten/rait-inquiry-commands.controller.js';
import { RaitDocumentTrustVerifier } from '../../src/handwritten/rait-document-trust.verifier.js';
import { RaitOperationClock } from '../../src/handwritten/rait-operation-clock.js';

const CASE = '00000000-0000-7000-8000-000010000005';

describe('CTG-0001 §10.2 — sensores C3 de DI e identidade fail-closed', () => {
  it('dado composição Nest quando resolve serviços então todas as dependências obrigatórias estão declaradas sem canal oculto', () => {
    expect(
      Reflect.getMetadata('design:paramtypes', RaitCaseCommandService),
    ).toEqual([
      Database,
      RequestContext,
      RaitDeadlineEngineFactory,
      RaitDocumentTrustVerifier,
      RaitOperationClock,
    ]);
    expect(
      Reflect.getMetadata('design:paramtypes', RaitInquiryCommandService),
    ).toEqual([Database, RequestContext, RaitDeadlineEngineFactory]);
    expect(
      Reflect.getMetadata('design:paramtypes', RaitDeadlineEngineFactory),
    ).toEqual([]);
  });

  it('dado RequestContext ausente quando input tenta injetar identidade então falha antes de database.tx', async () => {
    const database = { tx: vi.fn() };
    const context = {
      hasActiveContext: () => false,
      tenantContext: { current: () => ({ tenantId: 'tenant-spoofed' }) },
    };
    const subject = new RaitCaseCommandService(
      database as never,
      context as never,
      {} as never,
      {} as never,
    );
    await expect(
      subject.execute({
        command: 'admit',
        targetId: CASE,
        payload: {},
        headers: {
          'If-Match': '"1"',
          'Idempotency-Key': 'r7-c3-spoof',
        },
      }),
    ).rejects.toThrow('active request context');
    expect(database.tx).not.toHaveBeenCalled();
  });

  it('dado remit com campo não contratado quando schema valida então rejeita antes de replay e SQL', async () => {
    const database = { tx: vi.fn() };
    const subject = new RaitCaseCommandService(
      database as never,
      {
        hasActiveContext: () => true,
        snapshot: () => ({
          requestId: 'r7-c3-remit-body',
          tenantId: '00000000-0000-7000-8000-00000000a001',
          actorId: '00000000-0000-4000-8000-0000b0000005',
          startedAt: new Date('2026-09-15T12:00:00Z'),
        }),
      } as never,
      {} as never,
      {} as never,
    );
    await expect(
      subject.execute({
        command: 'remit',
        targetId: CASE,
        payload: { documentIds: [] },
        headers: {
          'If-Match': '"1"',
          'Idempotency-Key': 'r7-c3-remit-body',
        },
      }),
    ).rejects.toMatchObject({ code: 'RAIT.VALIDATION_FAILED', status: 400 });
    expect(database.tx).not.toHaveBeenCalled();
  });
});

describe('CTG-0001 §10.4/§10.6/§10.7 — superfície pública C3', () => {
  it('dado answer e extend quando PolicyGuard lê metadados então ambos usam inf:rait-case', () => {
    expect(
      Reflect.getMetadata(
        DETRAN_RESOURCE_METADATA_KEY,
        RaitInquiryCommandsController.prototype.answer,
      ),
    ).toBe('inf:rait-case');
    expect(
      Reflect.getMetadata(
        DETRAN_RESOURCE_METADATA_KEY,
        RaitInquiryCommandsController.prototype.extend,
      ),
    ).toBe('inf:rait-case');
  });

  it('dado contrato documental quando desistência é verificada então a porta possui operação específica sem PAdES de autoridade', () => {
    expect(
      typeof (
        RaitDocumentTrustVerifier.prototype as unknown as {
          verifyWithdrawalEvidence?: unknown;
        }
      ).verifyWithdrawalEvidence,
    ).toBe('function');
  });

  it('dado controller HTTP quando serviço retorna resultado então ETag fica só no header e não vaza no body', async () => {
    const setHeader = vi.fn();
    const controller = new RaitInquiryCommandsController({
      execute: vi.fn(async () => ({
        data: { id: 'inquiry', caseVersion: 2 },
        events: [],
        etag: '"2"',
      })),
    } as never);
    const body = await controller.answer(
      'inquiry',
      { documentIds: ['document'], answeredOn: '2026-09-15' },
      '"1"',
      'r7-c3-controller',
      { setHeader },
    );
    expect(setHeader).toHaveBeenCalledWith('ETag', '"2"');
    expect(body).toEqual({
      data: { id: 'inquiry', caseVersion: 2 },
      events: [],
    });
  });
});
