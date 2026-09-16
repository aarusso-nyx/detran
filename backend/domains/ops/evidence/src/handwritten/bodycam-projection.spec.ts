import { describe, expect, it } from 'vitest';

/**
 * CTG-0003 §4.8 e §10 (R-0008, TASK-0006) — C-0003-14: a regra de projeção de
 * leitura de bodycam (RN-TEAT-142), aplicada a toda leitura de
 * `ops.evidence_evidence` e às respostas dos comandos de evidência.
 * `handwritten/bodycam-projection.ts` nasce em TASK-0007 (CTG-0003 §11 lista
 * o arquivo `{bodycam-projection,manifest}.ts`).
 *
 * Nome esperado do export: função `projectEvidenceForRole` (ou
 * `projectEvidence`), assinatura `(evidence, hasDeliveredAccess: boolean) =>
 * evidence projetada`. O carregador tolera qualquer export de função.
 *
 * Canônico (CTG-0003 §4.8): `evidence_type='bodycam'` e o principal **sem**
 * uma `evidence_access_request` `delivered` sua para esta evidência →
 * `storage_uri`/`location_json` saem `null`; os demais metadados saem
 * íntegros; qualquer papel (inclusive `AUDITOR`, `technical-admin` e
 * `field-agent`) recebe a mesma restrição — o critério é "entrega
 * registrada", não papel.
 */

const BODYCAM_EVIDENCE = {
  id: '00000000-0000-7000-8000-0000ef000001',
  tenant_id: '00000000-0000-7000-8000-00000000a001',
  traffic_agency_id: '00000000-0000-7000-8000-0000e2000001',
  evidence_type: 'bodycam',
  origin: 'campo',
  storage_uri:
    'evidence/00000000-0000-7000-8000-00000000a001/00000000-0000-7000-8000-0000ef000001',
  mime_type: 'video/mp4',
  size_bytes: 5242880,
  hash_algorithm: 'sha256',
  hash_value:
    'sha256:fb517525e4db0c44027f342617250edf975383e949b8d1fab2670b3120c8b038',
  captured_at: '2026-09-10T10:00:00-04:00',
  location_json: { latitude: -3.1019, longitude: -60.025, accuracy_m: 6 },
  status: 'validated',
} as const;

const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

type Projector = (
  evidence: Record<string, unknown>,
  hasDeliveredAccess: boolean,
) => Record<string, unknown>;

async function loadProjector(): Promise<Projector> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule('./bodycam-projection.js')) as Record<
      string,
      unknown
    >;
  } catch (cause) {
    throw new Error(
      'ops/evidence/src/handwritten/bodycam-projection.ts ainda não existe (TASK-0007, CTG-0003 §11)',
      { cause },
    );
  }
  const exported =
    (loaded.projectEvidenceForRole as unknown) ??
    (loaded.projectEvidence as unknown) ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      'bodycam-projection.ts não exporta uma função de projeção (CTG-0003 §4.8)',
    );
  }
  return exported as Projector;
}

describe('CTG-0003 §4.8 — projeção de leitura de bodycam (C-0003-14)', () => {
  it('C-0003-14 — dada a leitura da evidência …ef000001 (bodycam) sem entrega registrada então storage_uri e location_json saem null e os demais metadados saem íntegros', async () => {
    const project = await loadProjector();
    const projected = project({ ...BODYCAM_EVIDENCE }, false);
    expect(projected.storage_uri).toBeNull();
    expect(projected.location_json).toBeNull();
    expect(projected.id).toBe(BODYCAM_EVIDENCE.id);
    expect(projected.evidence_type).toBe('bodycam');
    expect(projected.status).toBe('validated');
    expect(projected.hash_value).toBe(BODYCAM_EVIDENCE.hash_value);
    expect(projected.mime_type).toBe(BODYCAM_EVIDENCE.mime_type);
    expect(projected.captured_at).toBe(BODYCAM_EVIDENCE.captured_at);
  });

  it('dado uma entrega registrada (evidence-access-request delivered) então storage_uri e location_json saem íntegros', async () => {
    const project = await loadProjector();
    const projected = project({ ...BODYCAM_EVIDENCE }, true);
    expect(projected.storage_uri).toBe(BODYCAM_EVIDENCE.storage_uri);
    expect(projected.location_json).toEqual(BODYCAM_EVIDENCE.location_json);
  });

  it('dado evidence_type diferente de bodycam então a projeção nunca oculta storage_uri/location_json', async () => {
    const project = await loadProjector();
    const nonBodycam = {
      ...BODYCAM_EVIDENCE,
      id: '00000000-0000-7000-8000-0000ef000003',
      evidence_type: 'foto',
    };
    const projected = project(nonBodycam, false);
    expect(projected.storage_uri).toBe(nonBodycam.storage_uri);
    expect(projected.location_json).toEqual(nonBodycam.location_json);
  });
});
