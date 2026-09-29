import type { CameraPort } from '../ports.js';
import {
  BoatPortError,
  boatPortErrorFrom,
  type BoatHomologationAdapter,
} from './boat-port-error.js';

/** Seletor de imagem: resolve o arquivo escolhido ou `null` se cancelado. */
export type BoatImagePicker = () => Promise<Blob | null>;

export interface FileCaptureCameraAdapterOptions {
  readonly pick?: BoatImagePicker;
  readonly subtle?: SubtleCrypto;
  readonly newId?: () => string;
}

type CameraCapture = Awaited<ReturnType<CameraPort['capture']>>;

function hex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function defaultNewId(): (() => string) | undefined {
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID !== 'function') return undefined;
  return () => cryptoApi.randomUUID();
}

/** Seletor padrão: `<input type="file" accept="image/*" capture="environment">`. */
function defaultPicker(): BoatImagePicker | undefined {
  const documentRef = globalThis.document;
  if (documentRef === undefined || documentRef === null) return undefined;
  return () =>
    new Promise<Blob | null>((resolve) => {
      const input = documentRef.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.setAttribute('capture', 'environment');
      input.addEventListener(
        'change',
        () => resolve(input.files?.item(0) ?? null),
        { once: true },
      );
      input.addEventListener('cancel', () => resolve(null), { once: true });
      input.click();
    });
}

/**
 * Porta de câmera web de homologação: seleção de arquivo de imagem, SHA-256
 * em hex minúsculo (OD-R28-016) e registro em memória do `Blob` para o host.
 */
export class FileCaptureCameraAdapter
  implements CameraPort, BoatHomologationAdapter
{
  readonly adapterName = 'boat-web-file-capture';
  readonly mode = 'homologacao';
  readonly securityLevel = 'browser-file-capture';
  private readonly assets = new Map<string, Blob>();

  constructor(private readonly options: FileCaptureCameraAdapterOptions = {}) {}

  async capture(): Promise<CameraCapture> {
    const subtle =
      'subtle' in this.options
        ? this.options.subtle
        : globalThis.crypto?.subtle;
    const newId = 'newId' in this.options ? this.options.newId : defaultNewId();
    const pick = 'pick' in this.options ? this.options.pick : defaultPicker();
    if (
      subtle === undefined ||
      subtle === null ||
      typeof newId !== 'function' ||
      typeof pick !== 'function'
    ) {
      throw new BoatPortError('CameraPort', 'unavailable');
    }
    let blob: Blob | null;
    try {
      blob = await pick();
    } catch (error) {
      throw boatPortErrorFrom('CameraPort', error);
    }
    if (blob === null) throw new BoatPortError('CameraPort', 'cancelled');
    if (blob.size === 0) throw new BoatPortError('CameraPort', 'invalid-input');
    let sha256: string;
    let assetId: string;
    try {
      sha256 = hex(await subtle.digest('SHA-256', await blob.arrayBuffer()));
      assetId = newId();
    } catch (error) {
      throw new BoatPortError('CameraPort', 'unavailable', { cause: error });
    }
    if (typeof assetId !== 'string' || assetId === '') {
      throw new BoatPortError('CameraPort', 'unavailable');
    }
    this.assets.set(assetId, blob);
    return { assetId, sha256 };
  }

  resolveAsset(assetId: string): Blob | undefined {
    return this.assets.get(assetId);
  }

  releaseAsset(assetId: string): void {
    this.assets.delete(assetId);
  }
}
