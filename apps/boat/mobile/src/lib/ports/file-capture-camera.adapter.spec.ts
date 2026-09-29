import { Blob as NodeBlob } from 'node:buffer';
import { createHash, webcrypto } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { isBoatPortError } from './boat-port-error.js';
import { FileCaptureCameraAdapter } from './file-capture-camera.adapter.js';

const subtle = webcrypto.subtle as unknown as SubtleCrypto;
const BYTES = Uint8Array.from([1, 2, 3, 4, 5, 250, 251]);

function blobOf(bytes: Uint8Array): Blob {
  return new NodeBlob([bytes]) as unknown as Blob;
}

async function rejection(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('a promessa deveria ter sido rejeitada');
}

describe('FileCaptureCameraAdapter', () => {
  it('dado seletor que devolve um Blob quando capture é chamado então resolve assetId e sha256 hex minúsculo de 64 caracteres', async () => {
    const pick = vi.fn(async () => blobOf(BYTES));
    const adapter = new FileCaptureCameraAdapter({
      pick,
      subtle,
      newId: () => 'asset-fixo-001',
    });
    const result = await adapter.capture();
    expect(result.assetId).toBe('asset-fixo-001');
    expect(result.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(result.sha256).toBe(
      createHash('sha256').update(BYTES).digest('hex'),
    );
    expect(pick).toHaveBeenCalledTimes(1);
  });

  it('dado captura resolvida quando o host consulta o registro então resolveAsset devolve o Blob e releaseAsset o descarta', async () => {
    const blob = blobOf(BYTES);
    const adapter = new FileCaptureCameraAdapter({
      pick: async () => blob,
      subtle,
      newId: () => 'asset-fixo-002',
    });
    const { assetId } = await adapter.capture();
    expect(adapter.resolveAsset(assetId)).toBe(blob);
    adapter.releaseAsset(assetId);
    expect(adapter.resolveAsset(assetId)).toBeUndefined();
    expect(adapter.resolveAsset('nao-existe')).toBeUndefined();
  });

  it.each(['NotAllowedError', 'SecurityError'])(
    'dado seletor que rejeita com %s quando capture é chamado então rejeita com permission-denied',
    async (name) => {
      const cause = new DOMException('negado', name);
      const adapter = new FileCaptureCameraAdapter({
        pick: async () => {
          throw cause;
        },
        subtle,
        newId: () => 'x',
      });
      const error = await rejection(adapter.capture());
      expect(isBoatPortError(error)).toBe(true);
      expect(error).toMatchObject({
        port: 'CameraPort',
        code: 'permission-denied',
      });
    },
  );

  it.each(['NotFoundError', 'NotSupportedError', 'NotReadableError'])(
    'dado seletor que rejeita com %s quando capture é chamado então rejeita com unavailable',
    async (name) => {
      const adapter = new FileCaptureCameraAdapter({
        pick: async () => {
          throw new DOMException('falha', name);
        },
        subtle,
        newId: () => 'x',
      });
      const error = await rejection(adapter.capture());
      expect(error).toMatchObject({ port: 'CameraPort', code: 'unavailable' });
    },
  );

  it('dado seletor que rejeita com exceção desconhecida quando capture é chamado então rejeita com unavailable e preserva a causa', async () => {
    const cause = new Error('boom');
    const adapter = new FileCaptureCameraAdapter({
      pick: async () => {
        throw cause;
      },
      subtle,
      newId: () => 'x',
    });
    const error = await rejection(adapter.capture());
    expect(error).toMatchObject({ code: 'unavailable' });
    expect((error as Error).cause).toBe(cause);
  });

  it('dado seletor que resolve null quando capture é chamado então rejeita com cancelled', async () => {
    const adapter = new FileCaptureCameraAdapter({
      pick: async () => null,
      subtle,
      newId: () => 'x',
    });
    expect(await rejection(adapter.capture())).toMatchObject({
      port: 'CameraPort',
      code: 'cancelled',
    });
  });

  it('dado seletor que rejeita com AbortError quando capture é chamado então rejeita com cancelled', async () => {
    const adapter = new FileCaptureCameraAdapter({
      pick: async () => {
        throw new DOMException('abortado', 'AbortError');
      },
      subtle,
      newId: () => 'x',
    });
    expect(await rejection(adapter.capture())).toMatchObject({
      code: 'cancelled',
    });
  });

  it('dado Blob vazio quando capture é chamado então rejeita com invalid-input sem foto sintética', async () => {
    const adapter = new FileCaptureCameraAdapter({
      pick: async () => blobOf(new Uint8Array()),
      subtle,
      newId: () => 'x',
    });
    expect(await rejection(adapter.capture())).toMatchObject({
      code: 'invalid-input',
    });
  });

  it('dado subtle ausente quando capture é chamado então rejeita com unavailable antes de abrir o seletor', async () => {
    const pick = vi.fn(async () => blobOf(BYTES));
    const adapter = new FileCaptureCameraAdapter({
      pick,
      subtle: undefined,
      newId: () => 'x',
    });
    expect(await rejection(adapter.capture())).toMatchObject({
      port: 'CameraPort',
      code: 'unavailable',
    });
    expect(pick).not.toHaveBeenCalled();
  });

  it('dado newId ausente quando capture é chamado então rejeita com unavailable e nunca resolve com id inventado', async () => {
    const adapter = new FileCaptureCameraAdapter({
      pick: async () => blobOf(BYTES),
      subtle,
      newId: undefined,
    });
    expect(await rejection(adapter.capture())).toMatchObject({
      port: 'CameraPort',
      code: 'unavailable',
    });
  });

  it('dado o adaptador de homologação quando inspecionado então traz rótulo explícito e identificável', () => {
    const adapter = new FileCaptureCameraAdapter();
    expect(adapter.adapterName).toBe('boat-web-file-capture');
    expect(adapter.mode).toBe('homologacao');
    expect(adapter.securityLevel).toBe('browser-file-capture');
  });
});
