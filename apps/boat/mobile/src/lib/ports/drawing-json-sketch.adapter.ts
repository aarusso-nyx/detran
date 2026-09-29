import type { SketchPort } from '../ports.js';
import {
  BoatPortError,
  type BoatHomologationAdapter,
} from './boat-port-error.js';

type SketchSave = Awaited<ReturnType<SketchPort['save']>>;

/**
 * Porta de croqui web de homologação: valida o JSON do desenho e o devolve
 * sem reserializar. A persistência é do agregado `crash-record`.
 */
export class DrawingJsonSketchAdapter
  implements SketchPort, BoatHomologationAdapter
{
  readonly adapterName = 'boat-web-drawing-json';
  readonly mode = 'homologacao';
  readonly securityLevel = 'browser-canvas';

  async save(drawing: string): Promise<SketchSave> {
    if (typeof drawing !== 'string' || drawing.trim() === '') {
      throw new BoatPortError('SketchPort', 'invalid-input');
    }
    try {
      JSON.parse(drawing);
    } catch (error) {
      throw new BoatPortError('SketchPort', 'invalid-input', { cause: error });
    }
    return { drawing };
  }
}
