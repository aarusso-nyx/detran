import { describe, expect, it } from 'vitest';
import { isBoatPortError } from './boat-port-error.js';
import { DrawingJsonSketchAdapter } from './drawing-json-sketch.adapter.js';

async function rejection(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('a promessa deveria ter sido rejeitada');
}

describe('DrawingJsonSketchAdapter', () => {
  it('dado JSON válido quando save é chamado então resolve a mesma string sem reserializar', async () => {
    const drawing = '{ "strokes": [ [1, 2], [3,4] ],  "v": 1 }';
    const result = await new DrawingJsonSketchAdapter().save(drawing);
    expect(result).toEqual({ drawing });
    expect(result.drawing).toBe(drawing);
  });

  it.each(['', '   ', '\n\t'])(
    'dado desenho vazio %j quando save é chamado então rejeita com invalid-input',
    async (drawing) => {
      const error = await rejection(
        new DrawingJsonSketchAdapter().save(drawing),
      );
      expect(isBoatPortError(error)).toBe(true);
      expect(error).toMatchObject({
        port: 'SketchPort',
        code: 'invalid-input',
      });
    },
  );

  it('dado JSON inválido quando save é chamado então rejeita com invalid-input e preserva a causa', async () => {
    const error = await rejection(
      new DrawingJsonSketchAdapter().save('{"strokes": ['),
    );
    expect(error).toMatchObject({ port: 'SketchPort', code: 'invalid-input' });
    expect((error as Error).cause).toBeDefined();
  });

  it('dado entradas inválidas quando save falha então nunca ocorrem permission-denied nem unavailable (não se aplicam)', async () => {
    const codes = new Set<string>();
    for (const drawing of ['', '{', 'not json']) {
      const error = await rejection(
        new DrawingJsonSketchAdapter().save(drawing),
      );
      codes.add((error as { code: string }).code);
    }
    expect([...codes]).toEqual(['invalid-input']);
  });

  it('dado o adaptador de homologação quando inspecionado então traz rótulo explícito e identificável', () => {
    const adapter = new DrawingJsonSketchAdapter();
    expect(adapter.adapterName).toBe('boat-web-drawing-json');
    expect(adapter.mode).toBe('homologacao');
    expect(adapter.securityLevel).toBe('browser-canvas');
  });
});
