import { describe, expect, it, vi } from 'vitest';

import {
  INFRACTION_COMMANDS,
  InfractionCommandService,
  InfractionEventConsumer,
  triggerForCommand,
} from '../../src/handwritten/index.js';

describe('CTG-0003 — comandos da infração', () => {
  it('dada a superfície quando inventariada então contém exatamente os cinco comandos contratados', () => {
    expect(INFRACTION_COMMANDS).toEqual([
      'issue-notice',
      'indicate-driver',
      'declare-extinction',
      'authority-appeal',
      'waive-appeal',
    ]);
  });

  it('dada emissão de NA e NP quando mapeada então usa o gatilho e qualificador canônicos', () => {
    expect(triggerForCommand('issue-notice', { noticeKind: 'NA' })).toEqual({
      kind: 'evento',
      code: 'NOTIFICACAO_EXPEDIDA',
      qualifier: 'NA',
    });
    expect(
      triggerForCommand('issue-notice', {
        noticeKind: 'NP',
        recognition: true,
      }),
    ).toEqual({
      kind: 'evento',
      code: 'NOTIFICACAO_EXPEDIDA',
      qualifier: 'reconhecimento',
    });
  });

  it('dados os comandos legais quando mapeados então nenhum cliente escolhe estado de destino', () => {
    expect(triggerForCommand('indicate-driver', {})).toEqual({
      kind: 'evento',
      code: 'CONDUTOR_INDICADO',
    });
    expect(triggerForCommand('declare-extinction', {})).toEqual({
      kind: 'timer',
      code: 'T-JUL-24M',
    });
    expect(triggerForCommand('authority-appeal', {})).toEqual({
      kind: 'ato',
      code: 'RECURSO_AUTORIDADE',
    });
    expect(triggerForCommand('waive-appeal', {})).toEqual({
      kind: 'timer',
      code: 'T-R2',
    });
  });

  it('dado comando sem Idempotency-Key quando executado então falha antes de qualquer I/O', () => {
    const service = new InfractionCommandService({} as never, {} as never);
    expect(() =>
      service.execute({
        command: 'declare-extinction',
        infractionId: 'x',
        payload: {},
        ifMatch: '"1"',
      }),
    ).toThrow(
      expect.objectContaining({
        code: 'RAIT.IDEMPOTENCY_KEY_REQUIRED',
        status: 428,
      }),
    );
  });

  it('dado payload tentando fornecer tenant quando executado então falha fechado antes de qualquer I/O', () => {
    const service = new InfractionCommandService({} as never, {} as never);
    expect(() =>
      service.execute({
        command: 'issue-notice',
        infractionId: 'x',
        payload: { noticeKind: 'NA', tenant_id: 'forged' },
        ifMatch: '"1"',
        idempotencyKey: 'k',
      }),
    ).toThrow(
      expect.objectContaining({ code: 'RAIT.VALIDATION_FAILED', status: 400 }),
    );
  });

  it('dado evento suportado quando consumido então deriva chave idempotente do id do evento', async () => {
    const execute = vi
      .fn()
      .mockResolvedValue({ data: {}, events: [], etag: '"2"' });
    const consumer = new InfractionEventConsumer({ execute } as never);
    await consumer.consume({
      id: 'event-1',
      type: 'NOTIFICACAO_EXPEDIDA',
      aggregateId: 'inf-1',
      payload: { noticeKind: 'NA' },
      version: 1,
    });
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({ idempotencyKey: 'event:event-1' }),
    );
  });
});
