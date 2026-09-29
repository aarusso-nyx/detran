import { describe, expect, it } from 'vitest';
import { BOAT_PORTS } from '../ports.js';
import {
  BOAT_PORT_ERROR_CODES,
  BoatPortError,
  isBoatPortError,
} from './boat-port-error.js';

describe('BoatPortError (CTG-0002 §Erro de máquina comum)', () => {
  it('dado o catálogo de tokens quando lido então traz os sete tokens provisórios na ordem do contrato', () => {
    expect([...BOAT_PORT_ERROR_CODES]).toEqual([
      'permission-denied',
      'unavailable',
      'timeout',
      'cancelled',
      'invalid-input',
      'integrity-failure',
      'unattested',
    ]);
  });

  it('dado cada porta e cada token quando o erro é criado então expõe name, port, code e message igual ao token', () => {
    for (const port of BOAT_PORTS) {
      for (const code of BOAT_PORT_ERROR_CODES) {
        const error = new BoatPortError(port, code);
        expect.soft(error).toBeInstanceOf(Error);
        expect.soft(error.name).toBe('BoatPortError');
        expect.soft(error.port).toBe(port);
        expect.soft(error.code).toBe(code);
        expect.soft(error.message).toBe(code);
      }
    }
  });

  it('dado uma causa original quando o erro é criado então a causa é preservada em cause', () => {
    const cause = new DOMException('negado', 'NotAllowedError');
    const error = new BoatPortError('CameraPort', 'permission-denied', {
      cause,
    });
    expect(error.cause).toBe(cause);
    expect(
      new BoatPortError('CameraPort', 'unavailable').cause,
    ).toBeUndefined();
  });

  it('dado valores de origens diversas quando isBoatPortError é avaliado então só instâncias do erro passam', () => {
    expect(isBoatPortError(new BoatPortError('GpsPort', 'unavailable'))).toBe(
      true,
    );
    expect(isBoatPortError(new Error('unavailable'))).toBe(false);
    expect(isBoatPortError({ code: 'unavailable', port: 'GpsPort' })).toBe(
      false,
    );
    expect(isBoatPortError('unavailable')).toBe(false);
    expect(isBoatPortError(null)).toBe(false);
    expect(isBoatPortError(undefined)).toBe(false);
  });
});
