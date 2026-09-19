import type { ArgumentsHost } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { DetranError } from '@detran/shared';
import { describe, expect, it, vi } from 'vitest';

type FilterConstructor = new () => {
  catch(exception: unknown, host: ArgumentsHost): void;
};

const modulePath = './detran-error.filter.js';

async function subject() {
  const module = (await import(modulePath)) as {
    DetranErrorFilter: FilterConstructor;
  };
  return new module.DetranErrorFilter();
}

function host() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return {
    argumentsHost: {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({}),
        getNext: () => undefined,
      }),
      getArgs: () => [],
      getArgByIndex: () => undefined,
      switchToRpc: () => ({
        getContext: () => undefined,
        getData: () => undefined,
      }),
      switchToWs: () => ({
        getClient: () => undefined,
        getData: () => undefined,
        getPattern: () => undefined,
      }),
      getType: () => 'http',
    } as unknown as ArgumentsHost,
    json,
    status,
  };
}

describe('CTG-0001 §10.9 — envelope HTTP local de DetranError', () => {
  it('serializa todos os campos estáveis, incluindo status, messageKey e requestId', async () => {
    const filter = await subject();
    const response = host();
    filter.catch(
      new DetranError('RAIT.FORBIDDEN_ACTION', {
        status: 403,
        messageKey: 'rait.errors.forbidden_action',
        message: 'Ação não permitida.',
        requestId: 'req-r7-filter',
        context: { action: 'admit' },
      }),
      response.argumentsHost,
    );

    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith({
      code: 'RAIT.FORBIDDEN_ACTION',
      status: 403,
      message: 'Ação não permitida.',
      messageKey: 'rait.errors.forbidden_action',
      requestId: 'req-r7-filter',
      context: { action: 'admit' },
    });
  });

  it('preserva campos opcionais de modo determinístico sem inventar requestId', async () => {
    const filter = await subject();
    const response = host();
    filter.catch(
      new DetranError('RAIT.VALIDATION_FAILED', {
        status: 400,
        messageKey: 'rait.errors.validation_failed',
        message: 'Entrada inválida.',
      }),
      response.argumentsHost,
    );

    expect(response.json).toHaveBeenCalledWith({
      code: 'RAIT.VALIDATION_FAILED',
      status: 400,
      message: 'Entrada inválida.',
      messageKey: 'rait.errors.validation_failed',
      context: {},
    });
  });

  it('é restrito a DetranError e deixa HttpException para o filtro STYNX', async () => {
    const filter = await subject();
    const response = host();
    const exception = new HttpException({ code: 'NON_RAIT' }, 409);

    expect(() => filter.catch(exception, response.argumentsHost)).toThrow(
      exception,
    );
    expect(response.status).not.toHaveBeenCalled();
  });
});
