// R-0014 TASK-0015 (Inspector). CTG-0003b §3.4 — `IndicacaoFacade` (T-05); arquivo inteiramente
// novo (§1) — "Cannot find module" até TASK-0016 (esperado, §9). Assunção assumida de `load()`
// (mesma nota de `defesa.facade.spec.ts`): `load({ aitId })`.
import { fileURLToPath } from 'node:url';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { IndicacaoFacade } from './indicacao.facade';
import {
  AIT_DEADLINE_FIXTURE,
  AIT_DETAIL_FIXTURE,
  AIT_ID,
} from '../../../testing/http-fixtures-reads';

function setup() {
  TestBed.configureTestingModule({
    providers: [
      IndicacaoFacade,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  });
  return {
    // IndicacaoFacade ainda não existe (§9); cast documenta a assinatura assumida (§3.4).
    facade: TestBed.inject(IndicacaoFacade) as any,
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  // A parte estática de C-3b-31 não chama setup() (nenhum HttpClientTesting provido nesse
  // TestBed) — try/catch evita NG0201, mesmo padrão de data/portal.client.reads.spec.ts.
  try {
    TestBed.inject(HttpTestingController).verify();
  } catch {
    // spec sem HttpClientTesting configurado.
  }
});

describe('facades dos atos — deadlines() sem transformação e fronteira de import (§3.4)', () => {
  it('dado IndicacaoFacade.load({ aitId }) com deadlines[] no AIT então deadlines() é exatamente o array recebido, sem transformação', async () => {
    // C-3b-31 (parte comportamental)
    const { facade, httpMock } = setup();
    const promise = (
      facade as unknown as {
        load: (params: { aitId: string }) => Promise<void>;
      }
    ).load({ aitId: AIT_ID });
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/aits/${AIT_ID}`),
    );
    req.flush({
      ...AIT_DETAIL_FIXTURE,
      deadlines: [AIT_DEADLINE_FIXTURE],
    });
    await promise;
    expect(facade.deadlines()).toEqual([AIT_DEADLINE_FIXTURE]);
  });

  it('dado defesa.facade.ts, indicacao.facade.ts e pagamento.facade.ts então nenhum importa core/guards; import de forms/* só o schema/gate do próprio ato', async () => {
    // C-3b-31 (parte estática); `dirname(fileURLToPath(...))` + `join` (não `new URL('../', …)`):
    // mesma técnica de `i18n/i18n-keys.spec.ts` (evita URL intermediário sem esquema `file:`
    // neste ambiente de teste — bloqueio 8 de reports/TASK-0016.md).
    const dir = dirname(fileURLToPath(import.meta.url)); // .../features/indicacao
    const featuresDir = join(dir, '..'); // .../features
    const files: Array<{ path: string; allowedForm: RegExp }> = [
      {
        path: join(featuresDir, 'defesa/defesa.facade.ts'),
        allowedForm:
          /forms\/(defesa-previa|recurso-jari|recurso-cetran)\.schema/,
      },
      {
        path: join(featuresDir, 'indicacao/indicacao.facade.ts'),
        allowedForm: /forms\/indicacao-condutor\.schema/,
      },
      {
        path: join(featuresDir, 'pagamento/pagamento.facade.ts'),
        allowedForm: /forms\/pagamento\.schema/,
      },
    ];
    for (const file of files) {
      let text: string;
      try {
        text = await readFile(file.path, 'utf8');
      } catch {
        continue; // ainda não existe (§9) — nada a analisar.
      }
      const importLines = text
        .split('\n')
        .filter((line) => line.trim().startsWith('import'));
      for (const line of importLines) {
        expect(line, `import de core/guards em ${file.path}`).not.toMatch(
          /core\/guards/,
        );
        if (/forms\//.test(line)) {
          expect(
            file.allowedForm.test(line),
            `import de forms/* fora do schema/gate do ato em ${file.path}: ${line}`,
          ).toBe(true);
        }
      }
    }
  });
});
