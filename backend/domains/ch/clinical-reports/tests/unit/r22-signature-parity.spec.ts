// R-0022 CTG-0006 §5.2 (M-06-P), lado clínico (TASK-0021, parte 1).
//
// M-06-P1 (clínico e junta: QUALIFIED/LTA sobre `@stynx-nyx/signature`) está
// em checkpoint por OD-R22-40 (i) e CTG-0006 Adenda A §A.3, até
// stynx-nyx/stynx#318 UPS-SIG-05: não é escrito nesta rodada. A cláusula
// clínica de M-06-P2 (`clinical-trust` up/down com LTA) também.
//
// Este arquivo prova só o que §A.3 fixa para o período de checkpoint: o
// adaptador clínico fica sem alteração e `checkCapabilities` continua exigindo
// PAdES, TSA, LTA e OCSP ou CRL. Os casos valem antes e depois de TASK-0009
// (parte C fora do despacho) e não importam o pacote STYNX. A correção de nível
// ("ADVANCED aceito com QUALIFIED pedido", §5.2) fica para o desbloqueio e não
// é afirmada aqui em nenhum sentido.
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PadesSigningHttpAdapter } from '../../src/pades-signing.http-adapter.js';

const TOKEN = 'fixture-bearer-token';

const keys = [
  'DETRAN_CLINICAL_SIGNING_HEALTH_URL',
  'DETRAN_CLINICAL_SIGNING_TOKEN',
  'DETRAN_CLINICAL_SIGNING_URL',
  'DETRAN_RUNTIME_PROFILE',
] as const;
const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

afterEach(() => {
  vi.unstubAllGlobals();
  for (const key of keys) {
    const value = original[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

function configure(): void {
  process.env.DETRAN_RUNTIME_PROFILE = 'production';
  process.env.DETRAN_CLINICAL_SIGNING_URL = 'https://trust.fixture.test/sign';
  process.env.DETRAN_CLINICAL_SIGNING_HEALTH_URL =
    'https://trust.fixture.test/health';
  process.env.DETRAN_CLINICAL_SIGNING_TOKEN = TOKEN;
}

function stubHealth(body: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn(async () => body),
    } as unknown as Response),
  );
}

const complete = {
  pades: true,
  tsa: true,
  lta: true,
  certificateValidation: ['OCSP'],
};

describe('R-0022 CTG-0006 §A.3 — adaptador clínico sob checkpoint (OD-R22-40)', () => {
  it('CTG-0006 §A.3 dado saúde clínica com PAdES, TSA, LTA e OCSP quando checkCapabilities é chamado em production então resolve', async () => {
    configure();
    stubHealth(complete);

    await expect(
      new PadesSigningHttpAdapter().checkCapabilities(),
    ).resolves.toBeUndefined();
  });

  for (const [label, health] of [
    ['sem PAdES', { ...complete, pades: false }],
    ['sem TSA', { ...complete, tsa: false }],
    ['sem LTA', { ...complete, lta: false }],
    ['sem OCSP nem CRL', { ...complete, certificateValidation: [] }],
  ] as const) {
    it(`CTG-0006 §A.3 dado saúde clínica ${label} quando checkCapabilities é chamado em production então rejeita sem expor o token`, async () => {
      configure();
      stubHealth(health);

      const error = await new PadesSigningHttpAdapter()
        .checkCapabilities()
        .then(
          () => undefined,
          (caught: unknown) => caught,
        );

      expect(error).toBeInstanceOf(Error);
      expect(
        `${JSON.stringify(error)} ${String((error as Error).message)}`,
      ).not.toContain(TOKEN);
    });
  }
});
