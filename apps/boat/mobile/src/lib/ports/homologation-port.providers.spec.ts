import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  BOAT_ATTESTATION_PORT,
  BOAT_CAMERA_PORT,
  BOAT_ENCRYPTED_STORE_PORT,
  BOAT_GPS_PORT,
  BOAT_SIGNATURE_PORT,
  BOAT_SKETCH_PORT,
} from '../ports.js';
import { BoatBrowserEncryptedStoreAdapter } from './browser-encrypted-store.adapter.js';
import { CanvasSignatureAdapter } from './canvas-signature.adapter.js';
import { DrawingJsonSketchAdapter } from './drawing-json-sketch.adapter.js';
import { FileCaptureCameraAdapter } from './file-capture-camera.adapter.js';
import { GeolocationGpsAdapter } from './geolocation-gps.adapter.js';
import { HomologationAttestationAdapter } from './homologation-attestation.adapter.js';
import { provideBoatHomologationPorts } from './homologation-port.providers.js';

const PORTS_DIR = import.meta.dirname + sep;
const SRC_DIR = resolve(import.meta.dirname, '../..') + sep;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return path.endsWith('.ts') ? [path] : [];
  });
}

const CASES = [
  ['BOAT_GPS_PORT', BOAT_GPS_PORT, GeolocationGpsAdapter],
  ['BOAT_CAMERA_PORT', BOAT_CAMERA_PORT, FileCaptureCameraAdapter],
  ['BOAT_SIGNATURE_PORT', BOAT_SIGNATURE_PORT, CanvasSignatureAdapter],
  ['BOAT_SKETCH_PORT', BOAT_SKETCH_PORT, DrawingJsonSketchAdapter],
  [
    'BOAT_ENCRYPTED_STORE_PORT',
    BOAT_ENCRYPTED_STORE_PORT,
    BoatBrowserEncryptedStoreAdapter,
  ],
  [
    'BOAT_ATTESTATION_PORT',
    BOAT_ATTESTATION_PORT,
    HomologationAttestationAdapter,
  ],
] as const;

describe('provideBoatHomologationPorts (CTG-0002 §Providers)', () => {
  it.each(CASES)(
    'dado provideBoatHomologationPorts quando %s é resolvido no TestBed então devolve a classe de homologação com o selo',
    (_name, token, adapterClass) => {
      TestBed.configureTestingModule({
        providers: provideBoatHomologationPorts(),
      });
      const instance = TestBed.inject(token as never) as {
        mode: string;
      };
      expect(instance).toBeInstanceOf(adapterClass);
      expect(instance.mode).toBe('homologacao');
    },
  );

  it('dado a função de providers quando chamada então devolve exatamente um provider por token', () => {
    const providers = provideBoatHomologationPorts();
    const provided = providers.map(
      (provider: unknown) => (provider as { provide: unknown }).provide,
    );
    expect(providers).toHaveLength(6);
    expect(new Set(provided)).toEqual(new Set(CASES.map(([, token]) => token)));
  });

  it.each(CASES)(
    'dado TestBed sem os providers quando %s é resolvido então falha, porque nada é registrado por padrão',
    (_name, token) => {
      TestBed.configureTestingModule({ providers: [] });
      expect(() => TestBed.inject(token as never)).toThrow();
    },
  );

  it('dado os arquivos de src quando varridos então nenhum importa o pacote nativo proibido (#109)', () => {
    const forbidden = '@' + 'capacitor/';
    const offenders = sourceFiles(SRC_DIR).filter((file) =>
      readFileSync(file, 'utf8').includes(forbidden),
    );
    expect(offenders).toEqual([]);
  });

  it('dado os arquivos não-spec de ports quando varridos então não há rede, providedIn nem chaves i18n de UI', () => {
    const files = sourceFiles(PORTS_DIR).filter(
      (file) => !file.endsWith('.spec.ts'),
    );
    const network = /fetch\(|HttpClient|XMLHttpRequest/;
    const i18n = /boat\.(errors|screens|legal|states)\./;
    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      expect.soft(content, `${file}: rede`).not.toMatch(network);
      expect.soft(content, `${file}: providedIn`).not.toContain('providedIn');
      expect.soft(content, `${file}: i18n`).not.toMatch(i18n);
    }
  });

  it('dado os arquivos não-spec de src/lib quando varridos então só o arquivo de providers registra os tokens de porta', () => {
    const pattern =
      /provide: BOAT_(GPS|CAMERA|SIGNATURE|SKETCH|ENCRYPTED_STORE|ATTESTATION)_PORT/;
    const owners = sourceFiles(join(SRC_DIR, 'lib'))
      .filter((file) => !file.endsWith('.spec.ts'))
      .filter((file) => pattern.test(readFileSync(file, 'utf8')))
      .map((file) => file.slice(PORTS_DIR.length));
    expect(owners).toEqual(['homologation-port.providers.ts']);
  });
});
