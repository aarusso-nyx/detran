import { describe, expect, it, vi } from 'vitest';
import { isBoatPortError } from './boat-port-error.js';
import {
  CanvasSignatureAdapter,
  type BoatSignatureSurface,
} from './canvas-signature.adapter.js';

const NOW = new Date('2026-09-29T12:00:00.000Z');
const EVENTS = ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'];

function surfaceDouble(context: unknown = {}) {
  const handlers = new Map<string, (event: unknown) => void>();
  const addEventListener = vi.fn(
    (type: string, handler: (event: unknown) => void) => {
      handlers.set(type, handler);
    },
  );
  const removeEventListener = vi.fn();
  const surface = {
    getContext: vi.fn(() => context),
    toDataURL: vi.fn(() => 'data:image/png;base64,AAAA'),
    addEventListener,
    removeEventListener,
  } as unknown as BoatSignatureSurface;
  const fire = (type: string) =>
    handlers.get(type)?.({ pointerId: 1, clientX: 1, clientY: 1 });
  return { surface, addEventListener, removeEventListener, fire };
}

async function rejection(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('a promessa deveria ter sido rejeitada');
}

function adapter() {
  return new CanvasSignatureAdapter({ now: () => NOW });
}

describe('CanvasSignatureAdapter', () => {
  it('dado superfície com um traço quando capture é chamado então resolve PNG e signedAt do relógio injetado', async () => {
    const double = surfaceDouble();
    const port = adapter();
    port.attach(double.surface);
    double.fire('pointerdown');
    double.fire('pointermove');
    double.fire('pointerup');
    const result = await port.capture();
    expect(result).toEqual({
      signature: 'data:image/png;base64,AAAA',
      signedAt: '2026-09-29T12:00:00.000Z',
    });
    expect(double.surface.toDataURL).toHaveBeenCalledWith('image/png');
  });

  it('dado attach quando chamado então escuta pointerdown, pointermove, pointerup e pointercancel', () => {
    const double = surfaceDouble();
    adapter().attach(double.surface);
    expect(
      double.addEventListener.mock.calls.map((call) => call[0]).sort(),
    ).toEqual([...EVENTS].sort());
  });

  it('dado detach quando chamado então remove os quatro ouvintes registrados e capture rejeita com unavailable', async () => {
    const double = surfaceDouble();
    const port = adapter();
    port.attach(double.surface);
    port.detach();
    expect(
      double.removeEventListener.mock.calls.map((call) => call[0]).sort(),
    ).toEqual([...EVENTS].sort());
    expect(await rejection(port.capture())).toMatchObject({
      port: 'SignaturePort',
      code: 'unavailable',
    });
  });

  it('dado pointerdown sem pointerup quando capture é chamado então rejeita com cancelled porque não há traço completo', async () => {
    const double = surfaceDouble();
    const port = adapter();
    port.attach(double.surface);
    double.fire('pointerdown');
    expect(await rejection(port.capture())).toMatchObject({
      code: 'cancelled',
    });
  });

  it('dado superfície anexada sem traços quando capture é chamado então rejeita com cancelled e nunca resolve assinatura vazia', async () => {
    const double = surfaceDouble();
    const port = adapter();
    port.attach(double.surface);
    const error = await rejection(port.capture());
    expect(isBoatPortError(error)).toBe(true);
    expect(error).toMatchObject({ port: 'SignaturePort', code: 'cancelled' });
  });

  it('dado traço desenhado e clear quando capture é chamado então rejeita com cancelled', async () => {
    const double = surfaceDouble();
    const port = adapter();
    port.attach(double.surface);
    double.fire('pointerdown');
    double.fire('pointerup');
    port.clear();
    expect(await rejection(port.capture())).toMatchObject({
      code: 'cancelled',
    });
  });

  it('dado nenhuma superfície anexada quando capture é chamado então rejeita com unavailable', async () => {
    expect(await rejection(adapter().capture())).toMatchObject({
      port: 'SignaturePort',
      code: 'unavailable',
    });
  });

  it('dado contexto 2d nulo como no jsdom quando capture é chamado então rejeita com unavailable', async () => {
    const double = surfaceDouble(null);
    const port = adapter();
    port.attach(double.surface);
    double.fire('pointerdown');
    double.fire('pointerup');
    expect(await rejection(port.capture())).toMatchObject({
      port: 'SignaturePort',
      code: 'unavailable',
    });
  });

  it('dado qualquer cenário quando capture falha então o token nunca é permission-denied (não se aplica)', async () => {
    const codes = new Set<unknown>();
    for (const context of [null, {}]) {
      const double = surfaceDouble(context);
      const port = adapter();
      port.attach(double.surface);
      codes.add(((await rejection(port.capture())) as { code: string }).code);
    }
    codes.add(
      ((await rejection(adapter().capture())) as { code: string }).code,
    );
    expect(codes.has('permission-denied')).toBe(false);
  });

  it('dado o adaptador de homologação quando inspecionado então traz rótulo explícito e identificável', () => {
    const port = new CanvasSignatureAdapter();
    expect(port.adapterName).toBe('boat-web-canvas-signature');
    expect(port.mode).toBe('homologacao');
    expect(port.securityLevel).toBe('browser-canvas');
  });
});
