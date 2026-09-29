import type { SignaturePort } from '../ports.js';
import {
  BoatPortError,
  type BoatHomologationAdapter,
} from './boat-port-error.js';

export type BoatSignatureSurface = Pick<
  HTMLCanvasElement,
  'getContext' | 'toDataURL' | 'addEventListener' | 'removeEventListener'
>;

export interface CanvasSignatureAdapterOptions {
  readonly now?: () => Date;
}

type SignatureCapture = Awaited<ReturnType<SignaturePort['capture']>>;
type PointerEventName =
  'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel';

/**
 * Porta de assinatura web de homologação sobre canvas. É desenho de
 * demonstração, não assinatura de ato (ADR-0033 §Fronteira 2).
 */
export class CanvasSignatureAdapter
  implements SignaturePort, BoatHomologationAdapter
{
  readonly adapterName = 'boat-web-canvas-signature';
  readonly mode = 'homologacao';
  readonly securityLevel = 'browser-canvas';
  private surface?: BoatSignatureSurface;
  private strokes = 0;
  private pointerDown = false;
  private readonly listeners: Readonly<Record<PointerEventName, () => void>> = {
    pointerdown: () => {
      this.pointerDown = true;
    },
    pointermove: () => undefined,
    pointerup: () => {
      if (this.pointerDown) this.strokes += 1;
      this.pointerDown = false;
    },
    pointercancel: () => {
      this.pointerDown = false;
    },
  };

  constructor(private readonly options: CanvasSignatureAdapterOptions = {}) {}

  attach(surface: BoatSignatureSurface): void {
    this.detach();
    this.surface = surface;
    for (const [type, listener] of this.entries()) {
      surface.addEventListener(type, listener);
    }
  }

  detach(): void {
    const surface = this.surface;
    if (surface !== undefined) {
      for (const [type, listener] of this.entries()) {
        surface.removeEventListener(type, listener);
      }
    }
    this.surface = undefined;
    this.clear();
  }

  clear(): void {
    this.strokes = 0;
    this.pointerDown = false;
  }

  async capture(): Promise<SignatureCapture> {
    const surface = this.surface;
    if (surface === undefined) {
      throw new BoatPortError('SignaturePort', 'unavailable');
    }
    let context: unknown;
    try {
      context = surface.getContext('2d');
    } catch (error) {
      throw new BoatPortError('SignaturePort', 'unavailable', { cause: error });
    }
    if (context === null || context === undefined) {
      throw new BoatPortError('SignaturePort', 'unavailable');
    }
    if (this.strokes === 0) {
      throw new BoatPortError('SignaturePort', 'cancelled');
    }
    try {
      const now = this.options.now ?? (() => new Date());
      return {
        signature: surface.toDataURL('image/png'),
        signedAt: now().toISOString(),
      };
    } catch (error) {
      throw new BoatPortError('SignaturePort', 'unavailable', { cause: error });
    }
  }

  private entries(): [PointerEventName, () => void][] {
    return Object.entries(this.listeners) as [PointerEventName, () => void][];
  }
}
