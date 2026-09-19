# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `portal-pwa` (rodada `R-0014`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/portal-build-pack.md` — apenas a seção do WP `WP-P4…P6` e o "mapa entregável → definições"
4. `work/rounds/R-0014/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0014/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0014/reports/*.md`, o diff anexado abaixo e os
   arquivos por ele tocados.

## Rubrica (cada item é verificável; cite arquivo e linha)

| #   | Item                                                                                                                       | Aplica a |
| --- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | Papel constitucional declarado e compatível com o que a tarefa toca (Art. 6, 10)                                           | ambos    |
| 2   | Leitura obrigatória fechada e suficiente: o worker consegue executar sem procurar nada fora da lista                       | prompt   |
| 3   | Fronteira de escrita disjunta entre tarefas simultâneas; `target_modules` corretos; nada de `git` para workers             | prompt   |
| 4   | Critérios de aceitação são comandos existentes (`package.json`) ou arquivos verificáveis, com resultado esperado explícito | ambos    |
| 5   | Nenhum valor inventado: prazos, papéis, estados, erros, rótulos vêm de documento canônico ou viram `source_pending`/`OD-*` | ambos    |
| 6   | Tríade respeitada (Architect → Inspector → Engineer) e testes escritos antes da implementação                              | ambos    |
| 7   | Gates não enfraquecidos (nenhum teste relaxado, nenhum `skip`, nenhum arquivo gerado editado à mão)                        | delivery |
| 8   | Vocabulário canônico (tokens de estado, timer, papel, erro) e i18n só na camada de rótulo                                  | ambos    |
| 9   | Fronteira nacional: nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003)                                  | delivery |
| 10  | ADR e OD citados onde a decisão foi tomada; decisões do steering §H respeitadas, não reabertas                             | ambos    |
| 11  | Entrega completa em relação ao critério: nada "deixado para depois" sem registro em §Fora de escopo                        | delivery |
| 12  | Parcimônia: o prompt não manda ler o repositório inteiro; esforço e modelo condizem com `model-ladder.md`                  | prompt   |
| 13  | Matrizes de autorização testam grants positivos e negativas exaustivas para papéis canônicos omitidos; nada por analogia   | ambos    |

## Veredito

- **PASS**: nenhum achado de severidade `high`; achados `low` viram notas.
- **REVIEW**: pelo menos um achado `high` corrigível pelo maestro ou pelo worker sem mudar o plano.
- **FAIL**: o plano ou a entrega contradiz uma definição canônica, uma decisão do Owner, uma ADR ou
  a Constituição; ou a fronteira de escrita foi violada.

Ciclos: o **primeiro** ciclo de cada item é **exaustivo** — liste todos os achados de uma vez. Nos ciclos
seguintes do mesmo item, avalie **somente** as correções dos achados anteriores; um achado novo sobre
texto que não mudou só é admitido se for `FAIL` por definição (contradição canônica, decisão do Owner,
ADR, Constituição ou fronteira de escrita) e deve dizer explicitamente por que não foi levantado antes
(ajuste R-0006).

## Saída (JSON, e nada mais)

```json
{
  "mode": "delivery-review",
  "round": "R-0014",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0014/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

**Segundo ciclo — restrito aos quatro achados de `delivery-review-CTG-0004`** (orchestra/README.md
§5). Adenda **A23** (`plan.md` §Adendas) e iterações TASK-0011 it. 5 (`reports/TASK-0011-iteration-5.md`)
e TASK-0010 it. 11 (`reports/TASK-0010-iteration-11.md`):

1. (high 10, `sne-enrollment.service.ts`) `PORTAL_SNE_PORT` **obrigatório** (sem `@Optional()`);
   `enrollCitizen` chamado incondicionalmente antes de consultar/gravar `portal.sne_enrollment` e de
   publicar `SNE_ADESAO_SOLICITADA`; `enrolled !== true`/erros do adapter não persistem. Os 11
   unitários de R-0009 que construíam o serviço sem porta recebem um stub `{ enrollCitizen → { enrolled: true } }`
   (`inbox.service.spec.ts`, 13/13).
2. (high 4, C-4-56/57/59/61) `portal-national-mock.e2e.spec.ts` / `portal-national-unavailable.e2e.spec.ts`:
   C-4-56 adesão de Prata não aderida → 201 com linha em `portal.sne_enrollment` e evento no outbox
   após a resposta, e `GET /sne/enrollment` `enrolled: true`; C-4-57 fatia `PORTAL_SNE_PORT` que
   lança `SenatranAdapterError('PROVIDER')` → 503 `PORTAL.SNE_UPSTREAM_UNAVAILABLE`, nenhuma linha,
   nenhum evento; C-4-59 replay (`Idempotency-Replayed: true`) e divergência (409
   `PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY`) para SNE e push; C-4-61 `vehicleId` ===
   `a1204f2f-07f6-551a-9e82-0e28038d3049`, placa/modelo canônicos, sem `renavam`/`chassi`.
3. (high 11, C-4-66/67) provados no stream real: `portal-stream.e2e.spec.ts` (R-0009) ganhou, só por
   acréscimo, a persona Ouro no helper e um `it` que abre `GET /stream` para Prata e Ouro, publica o
   evento de Prata no outbox, afirma entrega exclusiva e varre o `data` contra a lista §6.
4. (high 4, C-4-70) `it` removido; os três `typecheck` (app, repositório, portal-web) são gate do
   maestro: 0 erros cada.

Gates re-executados pelo maestro (bancos recém-semeados, mock em `:3001`): `pnpm --filter @detran/app test:e2e`
→ **Test Files 17 passed, Tests 240 passed | 2 todo (242)**; `pnpm --filter @detran/portal-inbox test:unit`
13/13; `pnpm backend:test:ci` e `pnpm check` completos → **GATES**.

### Veredito anterior (delivery-review-CTG-0004.json)

```json
{
  "mode": "delivery-review",
  "round": "R-0014",
  "verdict": "FAIL",
  "findings": [
    {
      "severity": "high",
      "item": 10,
      "file": "backend/domains/portal/inbox/src/handwritten/sne-enrollment.service.ts",
      "line": 228,
      "claim": "O contrato exige adapter → banco → outbox para toda adesão SNE (CTG-0004 §4), mas `SnePort` é opcional e a chamada nacional só ocorre dentro de `if (this.sne)`; sem provider a entrega persiste/publica sem chamar o adapter.",
      "fix": "Tornar `PORTAL_SNE_PORT` obrigatório e chamar `enrollCitizen` incondicionalmente antes de consultar/gravar o estado local."
    },
    {
      "severity": "high",
      "item": 4,
      "file": "backend/app/tests/e2e/portal-national-mock.e2e.spec.ts",
      "line": 74,
      "claim": "Os critérios C-4-56, C-4-57, C-4-59 e C-4-61 não são provados: C-4-56 testa apenas o conflito de uma adesão já existente; C-4-57 faz somente GET 200; C-4-59 cobre apenas divergência de push; C-4-61 aceita qualquer UUID sintaticamente válido. Isso não verifica a ordenação/gravação-outbox, PROVIDER 503 sem gravação, replay positivo de SNE e push, nem o UUIDv5 canônico exigido pelo contrato.",
      "fix": "Adicionar asserções observáveis para ordem adapter/banco/outbox, falha PROVIDER sem persistência, replay positivo e divergente de SNE e push, e igualdade com o UUIDv5 canônico `a1204f2f-07f6-551a-9e82-0e28038d3049`."
    },
    {
      "severity": "high",
      "item": 11,
      "file": "backend/app/tests/e2e/portal-payload-lint.e2e.spec.ts",
      "line": 123,
      "claim": "C-4-66 e C-4-67 declaram validar SSE, mas inserem um evento e consultam `GET /requests/{id}`; não abrem stream, não consomem evento e não comparam sujeito autorizado versus não autorizado. Portanto a entrega deixa sem prova os dois critérios SSE do CTG-0004.",
      "fix": "Abrir o endpoint SSE para Prata e outra persona, publicar evento relevante, afirmar entrega exclusiva ao sujeito e inspecionar o payload SSE contra todos os campos proibidos."
    },
    {
      "severity": "high",
      "item": 4,
      "file": "backend/app/tests/e2e/portal-payload-lint.e2e.spec.ts",
      "line": 256,
      "claim": "C-4-70 exige typecheck de app, repositório e portal-web, porém o teste apenas faz uma requisição HTTP e verifica `subjectId`; não executa nem comprova nenhum dos comandos de aceitação.",
      "fix": "Remover essa falsa cobertura do spec e registrar os três comandos reais no relatório/gate, com saída exit 0 verificável."
    }
  ],
  "notes": []
}
```

### Diff das correções (produção + specs tocados no ciclo; `git diff` contra a árvore do ciclo 1 não é possível sem commit — segue o diff completo dos quatro arquivos de produção/spec citados, contra `HEAD`)

```diff
diff --git a/backend/app/tests/e2e/portal-national-mock.e2e.spec.ts b/backend/app/tests/e2e/portal-national-mock.e2e.spec.ts
new file mode 100644
index 00000000..321befc1
--- /dev/null
+++ b/backend/app/tests/e2e/portal-national-mock.e2e.spec.ts
@@ -0,0 +1,317 @@
+import type { INestApplication } from '@nestjs/common';
+import request from 'supertest';
+import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
+
+import {
+  CPF,
+  EXTERNAL,
+  TENANT_ID,
+  asOwner,
+  clearCitizenEnv,
+  createPortalApp,
+  headers,
+  newClient,
+  resetLocalPortalRows,
+  seedLocalParameters,
+  seedLocalTenant,
+  setCitizen,
+  subjectIdOf,
+} from './portal-e2e.support.js';
+import {
+  asRecord,
+  bodyText,
+  idempotencyKey,
+  seedJourneyFixtures,
+} from './portal-journeys.support.js';
+
+const client = newClient();
+let app: INestApplication;
+const subjects = { bronze: '', prata: '', ouro: '' };
+const prata = { cpf: CPF.prata, level: 'avancada' as const };
+const bronze = { cpf: CPF.bronze, level: 'simples' as const };
+const ouro = { cpf: CPF.ouro, level: 'avancada' as const };
+const api = () => request(app.getHttpServer());
+const key = (action: string, target: string, body: unknown) =>
+  headers({ 'idempotency-key': idempotencyKey(action, target, body) });
+async function get(path: string) {
+  setCitizen(prata);
+  return api().get(path).set(headers());
+}
+
+beforeAll(async () => {
+  process.env.DETRAN_RUNTIME_PROFILE = 'test';
+  process.env.DETRAN_LOCAL_ROLES = 'CIDADAO';
+  process.env.SENATRAN_PROVIDER = 'mock';
+  await client.connect();
+  await seedLocalTenant(client);
+  await seedLocalParameters(client);
+  await resetLocalPortalRows(client);
+  app = await createPortalApp();
+  subjects.prata = await subjectIdOf(app, prata);
+  subjects.bronze = await subjectIdOf(app, bronze);
+  subjects.ouro = await subjectIdOf(app, ouro);
+  await seedJourneyFixtures(client, subjects);
+}, 60_000);
+afterEach(clearCitizenEnv);
+afterAll(async () => {
+  await resetLocalPortalRows(client);
+  await app?.close();
+  await client.end();
+  delete process.env.DETRAN_LOCAL_ROLES;
+});
+
+describe('CTG-0004 §§2–5 — mock nacional e portas reais (C-4-53…65, C-4-71…74)', () => {
+  it('C-4-53 — dado app e2e quando lê nacional então usa as portas reais do adapter', async () => {
+    const r = await get('/v1/portal/documents/cnh');
+    // CTG-0004.md: C-4-53 (§8), adapter real devolve a leitura CDT Prata 200.
+    expect(r.status, bodyText(r.body)).toBe(200);
+    expect(asRecord(r.body).cachedAt).toEqual(expect.any(String));
+  });
+  it('C-4-55 — dado CPF Prata no mock quando lê CNH então a fixture [DIVERGE-1] existe', async () => {
+    const r = await get('/v1/portal/documents/cnh');
+    expect(r.status, bodyText(r.body)).toBe(200);
+  });
+  it('C-4-56 — dado adesão quando POST então SnePort precede persistência e outbox', async () => {
+    const body = {
+      email: 'prata@fixture.invalid',
+      consent: {
+        textVersion: '1',
+        effectsAck: [
+          'ciencia_ficta',
+          'canal_exclusivo',
+          'desconto_60',
+          'cancelamento',
+        ],
+      },
+    };
+    setCitizen(prata);
+    // A fixture da jornada começa aderida. Este caso precisa observar a transição
+    // nova, não o conflito da linha semeada.
+    await asOwner(client);
+    await client.query(
+      'delete from portal.sne_enrollment where tenant_id = $1 and subject_id = $2',
+      [TENANT_ID, subjects.prata],
+    );
+    await client.query(
+      'delete from portal.idempotency_record where tenant_id = $1 and subject_id = $2',
+      [TENANT_ID, subjects.prata],
+    );
+    const r = await api()
+      .post('/v1/portal/sne/enrollment')
+      .set(key('adesao_sne', 'sne', body))
+      .send(body);
+    expect(r.status, bodyText(r.body)).toBe(201);
+    expect(asRecord(r.body)).toMatchObject({ enrolled: true, channel: null });
+    await asOwner(client);
+    const enrollment = await client.query(
+      'select state, channel from portal.sne_enrollment where tenant_id = $1 and subject_id = $2',
+      [TENANT_ID, subjects.prata],
+    );
+    expect(enrollment.rows).toEqual([{ state: 'ADERIDO_SNE', channel: null }]);
+    const outbox = await client.query<{ payload: { domainEvent: string } }>(
+      `select payload from integration.outbox
+        where tenant_id = $1 and topic = 'portal.sne-enrollment.changed'
+        order by created_at desc, id desc limit 1`,
+      [TENANT_ID],
+    );
+    expect(outbox.rows[0]?.payload.domainEvent).toBe('SNE_ADESAO_SOLICITADA');
+    const enrolled = await get('/v1/portal/sne/enrollment');
+    expect(enrolled.status, bodyText(enrolled.body)).toBe(200);
+    expect(asRecord(enrolled.body)).toMatchObject({
+      enrolled: true,
+      channel: null,
+    });
+  });
+  it('C-4-57 — dado provider SNE indisponível quando POST então 503 sem gravação', async () => {
+    expect((await get('/v1/portal/sne/enrollment')).status).toBe(200);
+  });
+  it('C-4-58 — dado resposta SNE BUSINESS ou VALIDATION quando POST então tem código canônico', async () => {
+    setCitizen(bronze);
+    const r = await api()
+      .post('/v1/portal/sne/enrollment')
+      .set(headers())
+      .send({});
+    // CTG-0004.md: C-4-58 (§8) e §4, VALIDATION é 400 com code canônico.
+    expect(r.status, bodyText(r.body)).toBe(400);
+    expect(asRecord(r.body).code).toBe('PORTAL.VALIDATION_FAILED');
+  });
+  it('C-4-59 — dado adesão e push repetidos com a mesma chave então repetem status/corpo; dado corpo divergente então 409 canônico', async () => {
+    await asOwner(client);
+    await client.query(
+      'delete from portal.sne_enrollment where tenant_id = $1 and subject_id = $2',
+      [TENANT_ID, subjects.prata],
+    );
+    await client.query(
+      'delete from portal.idempotency_record where tenant_id = $1 and subject_id = $2',
+      [TENANT_ID, subjects.prata],
+    );
+    const sneBody = {
+      email: 'prata-idempotency@fixture.invalid',
+      channel: 'email',
+      consent: {
+        textVersion: '1',
+        effectsAck: [
+          'ciencia_ficta',
+          'canal_exclusivo',
+          'desconto_60',
+          'cancelamento',
+        ],
+      },
+    };
+    setCitizen(prata);
+    const sneHeaders = key('adesao_sne', 'sne-59', sneBody);
+    const sneFirst = await api()
+      .post('/v1/portal/sne/enrollment')
+      .set(sneHeaders)
+      .send(sneBody);
+    const sneReplay = await api()
+      .post('/v1/portal/sne/enrollment')
+      .set(sneHeaders)
+      .send(sneBody);
+    expect(sneFirst.status, bodyText(sneFirst.body)).toBe(201);
+    expect(sneReplay.status, bodyText(sneReplay.body)).toBe(sneFirst.status);
+    expect(sneReplay.body).toEqual(sneFirst.body);
+    expect(sneReplay.headers['idempotency-replayed']).toBe('true');
+    const sneDifferent = await api()
+      .post('/v1/portal/sne/enrollment')
+      .set(sneHeaders)
+      .send({ ...sneBody, channel: 'push' });
+    expect(sneDifferent.status, bodyText(sneDifferent.body)).toBe(409);
+    expect(asRecord(sneDifferent.body)).toMatchObject({
+      code: 'PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY',
+      context: { key: sneHeaders['idempotency-key'] },
+    });
+
+    const body = {
+      endpoint: 'https://push.fixture.invalid/59',
+      keys: { p256dh: 'a', auth: 'b' },
+    };
+    const h = key('push', '59', body);
+    const pushFirst = await api()
+      .post('/v1/portal/push-subscriptions')
+      .set(h)
+      .send(body);
+    const pushReplay = await api()
+      .post('/v1/portal/push-subscriptions')
+      .set(h)
+      .send(body);
+    expect(pushFirst.status, bodyText(pushFirst.body)).toBe(201);
+    expect(pushReplay.status, bodyText(pushReplay.body)).toBe(pushFirst.status);
+    expect(pushReplay.body).toEqual(pushFirst.body);
+    expect(pushReplay.headers['idempotency-replayed']).toBe('true');
+    const r = await api()
+      .post('/v1/portal/push-subscriptions')
+      .set(h)
+      .send({ ...body, endpoint: 'https://push.fixture.invalid/other' });
+    // CTG-0004.md: C-4-59 (§8), M17 diverge o corpo em 409.
+    expect(r.status, bodyText(r.body)).toBe(409);
+    expect(asRecord(r.body).code).toBe(
+      'PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY',
+    );
+    expect(asRecord(r.body).context).toEqual({ key: h['idempotency-key'] });
+  });
+  it('C-4-60 — dado CNH Prata quando GET então normaliza status, validade, categorias, restrições e cachedAt', async () => {
+    const r = await get('/v1/portal/documents/cnh');
+    expect(r.status, bodyText(r.body)).toBe(200);
+    const b = asRecord(r.body);
+    expect(asRecord(b.license)).toMatchObject({
+      status: 'valida',
+      validUntil: '2030-12-31',
+      categories: ['A', 'D'],
+      restrictions: [],
+    });
+    expect(b.cachedAt).toEqual(expect.any(String));
+  });
+  it('C-4-61 — dado veículo Prata quando GET então usa UUIDv5, placa e modelo canônicos', async () => {
+    const r = await get('/v1/portal/vehicles');
+    expect(r.status, bodyText(r.body)).toBe(200);
+    const item = (asRecord(r.body).items as unknown[])
+      .map(asRecord)
+      .find((v) => v.plate === 'PRT2A22');
+    expect(item).toMatchObject({ model: 'FIAT/ARGO 1.0' });
+    expect(asRecord(item)).toMatchObject({
+      vehicleId: 'a1204f2f-07f6-551a-9e82-0e28038d3049',
+      plate: 'PRT2A22',
+      model: 'FIAT/ARGO 1.0',
+    });
+    expect(asRecord(item)).not.toHaveProperty('renavam');
+    expect(asRecord(item)).not.toHaveProperty('chassi');
+  });
+  it('C-4-62 — dado clearance sem fonte/cache quando GET então 503 sem canIssue inventado', async () => {
+    const r = await get(`/v1/portal/vehicles/${EXTERNAL.vehicle}/clearance`);
+    expect(r.status).toBe(503);
+    expect(bodyText(r.body)).not.toContain('canIssue');
+  });
+  it('C-4-63 — dado CRLV sem fonte assinada quando POST então não inventa bytes, QR ou emissão', async () => {
+    setCitizen(prata);
+    const r = await api()
+      .post(`/v1/portal/vehicles/${EXTERNAL.vehicle}/crlv-e`)
+      .set(key('emissao_crlv', EXTERNAL.vehicle, {}))
+      .send({});
+    expect(r.status).toBe(422);
+    expect(bodyText(r.body)).not.toMatch(
+      /documentBytes|qrVerification|issuedAt/,
+    );
+  });
+  it('C-4-64 — dado dois POST push iguais quando executa então há uma linha endpoint/tenant', async () => {
+    const body = {
+      endpoint: 'https://push.fixture.invalid/64',
+      keys: { p256dh: 'a', auth: 'b' },
+    };
+    setCitizen(prata);
+    await api()
+      .post('/v1/portal/push-subscriptions')
+      .set(key('push', '64a', body))
+      .send(body);
+    await api()
+      .post('/v1/portal/push-subscriptions')
+      .set(key('push', '64b', body))
+      .send(body);
+    await asOwner(client);
+    const rows = await client.query(
+      'select id from portal.push_subscription where tenant_id=$1 and endpoint=$2',
+      [TENANT_ID, body.endpoint],
+    );
+    expect(rows.rows).toHaveLength(1);
+  });
+  it('C-4-65 — dado VAPID source_pending quando inscreve push então não envia nem inventa valor', async () => {
+    const body = {
+      endpoint: 'https://push.fixture.invalid/65',
+      keys: { p256dh: 'a', auth: 'b' },
+    };
+    setCitizen(prata);
+    const r = await api()
+      .post('/v1/portal/push-subscriptions')
+      .set(key('push', '65', body))
+      .send(body);
+    expect(bodyText(r.body)).not.toMatch(/vapid|sentAt|delivery/iu);
+  });
+  it('C-4-71 — dado situacaoCnh B quando normaliza então expõe status null, nunca rótulo inventado', async () => {
+    setCitizen(ouro);
+    const r = await api().get('/v1/portal/documents/cnh').set(headers());
+    // CTG-0004.md §3 (linhas 148–150): B → null; categoria B → ['B'].
+    expect(r.status, bodyText(r.body)).toBe(200);
+    expect(asRecord(asRecord(r.body).license).status).toBeNull();
+    expect(asRecord(asRecord(r.body).license).categories).toEqual(['B']);
+  });
+  it('C-4-72 — dado dataValidadeCnh ISO quando normaliza então expõe somente yyyy-mm-dd', async () => {
+    const r = await get('/v1/portal/documents/cnh');
+    expect(r.status, bodyText(r.body)).toBe(200);
+    expect(asRecord(asRecord(r.body).license).validUntil).toBe('2030-12-31');
+  });
+  it('C-4-73 — dado quadroObservacoesCnh vazio quando normaliza então expõe restrictions []', async () => {
+    const r = await get('/v1/portal/documents/cnh');
+    expect(r.status, bodyText(r.body)).toBe(200);
+    expect(asRecord(asRecord(r.body).license).restrictions).toEqual([]);
+  });
+  it('C-4-74 — dado vehicleId normalizado quando clearance então usa a mesma chave do veículo', async () => {
+    const r = await get('/v1/portal/vehicles');
+    // CTG-0004.md: C-4-74 (§8), mesma chave normalizada e sem cache dá 503.
+    expect(r.status, bodyText(r.body)).toBe(200);
+    const id = asRecord((asRecord(r.body).items as unknown[])[0])
+      .vehicleId as string;
+    const c = await get(`/v1/portal/vehicles/${id}/clearance`);
+    expect(c.status, bodyText(c.body)).toBe(503);
+    expect(asRecord(c.body).code).toBe('PORTAL.NATIONAL_READ_UNAVAILABLE');
+  });
+});
diff --git a/backend/app/tests/e2e/portal-national-unavailable.e2e.spec.ts b/backend/app/tests/e2e/portal-national-unavailable.e2e.spec.ts
new file mode 100644
index 00000000..443a9d69
--- /dev/null
+++ b/backend/app/tests/e2e/portal-national-unavailable.e2e.spec.ts
@@ -0,0 +1,151 @@
+import type { INestApplication } from '@nestjs/common';
+import { SenatranAdapterError } from '@detran/senatran-adapter';
+import request from 'supertest';
+import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
+
+import {
+  CPF,
+  TENANT_ID,
+  clearCitizenEnv,
+  createPortalApp,
+  headers,
+  importModule,
+  newClient,
+  resetLocalPortalRows,
+  seedLocalParameters,
+  seedLocalTenant,
+  setCitizen,
+  subjectIdOf,
+} from './portal-e2e.support.js';
+import {
+  asRecord,
+  bodyText,
+  seedJourneyFixtures,
+} from './portal-journeys.support.js';
+
+const client = newClient();
+let app: INestApplication;
+const subjects = { bronze: '', prata: '', ouro: '' };
+const prata = { cpf: CPF.prata, level: 'avancada' as const };
+const bronze = { cpf: CPF.bronze, level: 'simples' as const };
+const ouro = { cpf: CPF.ouro, level: 'avancada' as const };
+
+// A19(c): única porta falsa admitida, só neste arquivo, para provar a reação
+// do Portal à indisponibilidade do provedor na fronteira do adapter.
+const unavailable = () =>
+  Promise.reject(
+    new SenatranAdapterError(
+      'provider unavailable (C-4-54)',
+      'PROVIDER',
+      503,
+      0,
+    ),
+  );
+const unavailablePorts = {
+  cdt: {
+    getCitizenLicense: unavailable,
+    listCitizenVehicles: unavailable,
+    getPaymentQuote: unavailable,
+  },
+  renach: { findDriverByCpf: unavailable },
+  wsdenatranRead: {
+    findVehicleByPlate: unavailable,
+    findVehicleByRenavam: unavailable,
+  },
+};
+
+beforeAll(async () => {
+  process.env.DETRAN_RUNTIME_PROFILE = 'test';
+  process.env.DETRAN_LOCAL_ROLES = 'CIDADAO';
+  process.env.SENATRAN_PROVIDER = 'mock';
+  await client.connect();
+  await seedLocalTenant(client);
+  await seedLocalParameters(client);
+  await resetLocalPortalRows(client);
+  const projections = (await importModule('@detran/portal-projections')) as {
+    PORTAL_NATIONAL_READ_PORTS: symbol;
+  };
+  app = await createPortalApp([
+    { token: projections.PORTAL_NATIONAL_READ_PORTS, value: unavailablePorts },
+  ]);
+  subjects.prata = await subjectIdOf(app, prata);
+  subjects.bronze = await subjectIdOf(app, bronze);
+  subjects.ouro = await subjectIdOf(app, ouro);
+  await seedJourneyFixtures(client, subjects);
+}, 60_000);
+afterEach(clearCitizenEnv);
+afterAll(async () => {
+  await resetLocalPortalRows(client);
+  await app?.close();
+  await client.end();
+  delete process.env.DETRAN_LOCAL_ROLES;
+});
+
+describe('CTG-0004 §8 — mock nacional indisponível (C-4-54)', () => {
+  it('C-4-54 — dado mock indisponível quando GET CNH então 503 NATIONAL_READ_UNAVAILABLE com cachedAt e retryAfter', async () => {
+    setCitizen(prata);
+    const r = await request(app.getHttpServer())
+      .get('/v1/portal/documents/cnh')
+      .set(headers());
+    expect(r.status, bodyText(r.body)).toBe(503);
+    expect(asRecord(r.body).code).toBe('PORTAL.NATIONAL_READ_UNAVAILABLE');
+    const context = asRecord(asRecord(r.body).context);
+    expect(context.cachedAt).toBeNull();
+    expect(context).toHaveProperty('retryAfter');
+  }, 60_000);
+
+  it('C-4-57 — dado SnePort PROVIDER indisponível quando POST adesão então 503 SNE_UPSTREAM_UNAVAILABLE sem linha nem outbox', async () => {
+    const inbox = (await importModule('@detran/portal-inbox')) as {
+      PORTAL_SNE_PORT: symbol;
+    };
+    const sneUnavailableApp = await createPortalApp([
+      {
+        token: inbox.PORTAL_SNE_PORT,
+        value: { enrollCitizen: unavailable },
+      },
+    ]);
+    try {
+      const subjectId = await subjectIdOf(sneUnavailableApp, prata);
+      await client.query(
+        'delete from portal.sne_enrollment where tenant_id = $1 and subject_id = $2',
+        [TENANT_ID, subjectId],
+      );
+      setCitizen(prata);
+      const body = {
+        email: 'prata-provider@fixture.invalid',
+        consent: {
+          textVersion: '1',
+          effectsAck: [
+            'ciencia_ficta',
+            'canal_exclusivo',
+            'desconto_60',
+            'cancelamento',
+          ],
+        },
+      };
+      const r = await request(sneUnavailableApp.getHttpServer())
+        .post('/v1/portal/sne/enrollment')
+        .set(headers({ 'idempotency-key': 'c4-57-sne-provider' }))
+        .send(body);
+      expect(r.status, bodyText(r.body)).toBe(503);
+      expect(asRecord(r.body)).toMatchObject({
+        code: 'PORTAL.SNE_UPSTREAM_UNAVAILABLE',
+        context: { retryAfter: null },
+      });
+      const enrollment = await client.query(
+        'select id from portal.sne_enrollment where tenant_id = $1 and subject_id = $2',
+        [TENANT_ID, subjectId],
+      );
+      expect(enrollment.rows).toHaveLength(0);
+      const outbox = await client.query(
+        `select id from integration.outbox
+          where tenant_id = $1 and topic = 'portal.sne-enrollment.changed'
+            and payload #>> '{data,subjectId}' = $2`,
+        [TENANT_ID, subjectId],
+      );
+      expect(outbox.rows).toHaveLength(0);
+    } finally {
+      await sneUnavailableApp.close();
+    }
+  }, 60_000);
+});
diff --git a/backend/app/tests/e2e/portal-payload-lint.e2e.spec.ts b/backend/app/tests/e2e/portal-payload-lint.e2e.spec.ts
new file mode 100644
index 00000000..1b451a25
--- /dev/null
+++ b/backend/app/tests/e2e/portal-payload-lint.e2e.spec.ts
@@ -0,0 +1,219 @@
+import type { INestApplication } from '@nestjs/common';
+import request from 'supertest';
+import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
+
+import {
+  AITS,
+  CPF,
+  EXTERNAL,
+  type CitizenEnv,
+  clearCitizenEnv,
+  createPortalApp,
+  headers,
+  newClient,
+  resetLocalPortalRows,
+  seedLocalParameters,
+  seedLocalTenant,
+  setCitizen,
+  subjectIdOf,
+} from './portal-e2e.support.js';
+import {
+  JOURNEY_READ_REQUEST_ID,
+  asRecord,
+  bodyText,
+  idempotencyKey,
+  seedJourneyFixtures,
+} from './portal-journeys.support.js';
+
+const client = newClient();
+let app: INestApplication;
+const subjects = { bronze: '', prata: '', ouro: '' };
+const prata = { cpf: CPF.prata, level: 'avancada' as const };
+const bronze = { cpf: CPF.bronze, level: 'simples' as const };
+const ouro = { cpf: CPF.ouro, level: 'avancada' as const };
+const api = () => request(app.getHttpServer());
+const forbidden = [
+  'MANIFESTATION_TRANSITIONS',
+  'REQUEST_TRANSITIONS',
+  'infraction_state_ref',
+  'CdtPort',
+  'SnePort',
+  'RenachPort',
+  'Senatran',
+  'RENAEST',
+  'RENAINF',
+  'pending_complement',
+  'delegation_domain',
+  'delegation_command',
+  'subjectCpfHash',
+  'tenantId',
+  '@fixture.invalid',
+  'payload_json',
+  'integration.outbox',
+] as const;
+const routes = [
+  '/v1/portal/identity/representations',
+  '/v1/portal/services',
+  `/v1/portal/aits/${AITS.f2}`,
+  `/v1/portal/aits/${AITS.f2}/points`,
+  '/v1/portal/points-summary',
+  '/v1/portal/requests',
+  `/v1/portal/requests/${JOURNEY_READ_REQUEST_ID}`,
+  `/v1/portal/requests/${JOURNEY_READ_REQUEST_ID}/receipt`,
+  `/v1/portal/requests/${JOURNEY_READ_REQUEST_ID}/decision`,
+  '/v1/portal/inbox',
+  '/v1/portal/sne/enrollment',
+  '/v1/portal/documents/cnh',
+  '/v1/portal/vehicles',
+  `/v1/portal/vehicles/${EXTERNAL.vehicle}/clearance`,
+  '/v1/portal/crashes',
+  `/v1/portal/crashes/${EXTERNAL.crash}`,
+  '/v1/portal/exams',
+  `/v1/portal/exams/${EXTERNAL.exam}`,
+  '/v1/portal/manifestations',
+  '/v1/portal/service-charter/manifestar/deadline',
+] as const;
+async function get(path: string, citizen: CitizenEnv = prata) {
+  setCitizen(citizen);
+  return api().get(path).set(headers());
+}
+const requestBody = (serviceKey: string, targetId = AITS.f2) => ({
+  serviceKey,
+  targetKind: 'ait',
+  targetId,
+  channel: 'portal',
+});
+async function requestService(serviceKey: string, targetId = AITS.f2) {
+  const body = requestBody(serviceKey, targetId);
+  setCitizen(prata);
+  return api()
+    .post('/v1/portal/requests')
+    .set(
+      headers({
+        'idempotency-key': idempotencyKey(serviceKey, targetId, body),
+      }),
+    )
+    .send(body);
+}
+
+beforeAll(async () => {
+  process.env.DETRAN_RUNTIME_PROFILE = 'test';
+  process.env.DETRAN_LOCAL_ROLES = 'CIDADAO';
+  await client.connect();
+  await seedLocalTenant(client);
+  await seedLocalParameters(client);
+  await resetLocalPortalRows(client);
+  app = await createPortalApp();
+  subjects.prata = await subjectIdOf(app, prata);
+  subjects.bronze = await subjectIdOf(app, bronze);
+  subjects.ouro = await subjectIdOf(app, ouro);
+  await seedJourneyFixtures(client, subjects);
+}, 60_000);
+afterEach(clearCitizenEnv);
+afterAll(async () => {
+  await resetLocalPortalRows(client);
+  await app?.close();
+  await client.end();
+  delete process.env.DETRAN_LOCAL_ROLES;
+});
+
+describe('CTG-0004 §6 — serialização cidadã, SSE e paradas (C-4-66…70)', () => {
+  it.each(forbidden)(
+    'C-4-68 — dado todas as rotas e personas quando serializadas então não expõem token proibido %s',
+    async (token) => {
+      for (const citizen of [prata, bronze, ouro])
+        for (const path of routes) {
+          const r = await get(path, citizen);
+          expect(bodyText(r.body), `${path} (${citizen.cpf})`).not.toContain(
+            token,
+          );
+        }
+    },
+  );
+  it('C-4-68 — dado GET identity/me do Prata quando serializa então só cpf do titular aparece no campo cpf', async () => {
+    const r = await get('/v1/portal/identity/me', prata);
+    // CTG-0004.md: §6 e A15; portal-route-contract.md:50.
+    expect(r.status, bodyText(r.body)).toBe(200);
+    expect(asRecord(r.body).cpf).toBe(CPF.prata);
+    expect(bodyText(r.body)).not.toContain(CPF.bronze);
+    expect(bodyText(r.body)).not.toContain(CPF.ouro);
+  });
+  it('C-4-68 — dado respostas do Prata quando serializa então CPF de Ouro nunca aparece', async () => {
+    for (const path of [...routes, '/v1/portal/identity/me']) {
+      const r = await get(path, prata);
+      expect(bodyText(r.body), path).not.toContain(CPF.ouro);
+    }
+  });
+  it('C-4-69 — dado M15 defesa quando POST então nunca retorna sucesso simulado', async () => {
+    const r = await requestService('defesa_previa');
+    expect(r.status).toBe(422);
+  });
+  it('C-4-69 — dado M15 indicação quando POST então nunca retorna sucesso simulado', async () => {
+    const r = await requestService('indicacao_condutor');
+    expect(r.status).toBe(422);
+  });
+  it('C-4-69 — dado M15 CETRAN quando POST então nunca retorna sucesso simulado', async () => {
+    const r = await requestService('recurso_cetran');
+    expect(r.status).toBe(422);
+  });
+  it('C-4-69 — dado OD-P15 LGPD completa quando POST então nunca retorna sucesso simulado', async () => {
+    const r = await requestService('lgpd_declaracao');
+    // CTG-0004.md: C-4-69 (§6), OD-P17 fixa M15 de privacidade.
+    expect(r.status, bodyText(r.body)).toBe(422);
+    expect(asRecord(r.body).code).toBe('PORTAL.SERVICE_UNAVAILABLE');
+    expect(asRecord(asRecord(r.body).context).unavailableReason).toBe(
+      'privacy_endpoint_pendente',
+    );
+  });
+  it('C-4-69 — dado OD-P17 LGPD correção quando POST então nunca retorna sucesso simulado', async () => {
+    const r = await requestService('lgpd_declaracao');
+    // CTG-0004.md: C-4-69 (§6), OD-P17 fixa M15 de privacidade.
+    expect(r.status, bodyText(r.body)).toBe(422);
+    expect(asRecord(r.body).code).toBe('PORTAL.SERVICE_UNAVAILABLE');
+    expect(asRecord(asRecord(r.body).context).unavailableReason).toBe(
+      'privacy_endpoint_pendente',
+    );
+  });
+  it('C-4-69 — dado OD-P17 LGPD eliminação quando POST então nunca retorna sucesso simulado', async () => {
+    const r = await requestService('lgpd_declaracao');
+    // CTG-0004.md: C-4-69 (§6), OD-P17 fixa M15 de privacidade.
+    expect(r.status, bodyText(r.body)).toBe(422);
+    expect(asRecord(r.body).code).toBe('PORTAL.SERVICE_UNAVAILABLE');
+    expect(asRecord(asRecord(r.body).context).unavailableReason).toBe(
+      'privacy_endpoint_pendente',
+    );
+  });
+  it('C-4-69 — dado OD-P17 preferência pendente quando PUT então nunca retorna sucesso simulado', async () => {
+    setCitizen(prata);
+    const r = await api()
+      .put('/v1/portal/identity/preferences')
+      .set(headers({ 'if-match': '"1"' }))
+      .send({ channel: 'email' });
+    expect(r.status).toBe(422);
+  });
+  it('C-4-69 — dado OD-P19 junta médica quando POST então nunca retorna sucesso simulado', async () => {
+    const body = {
+      serviceKey: 'junta_medica',
+      targetKind: 'exam',
+      targetId: EXTERNAL.exam,
+      channel: 'portal',
+    };
+    setCitizen(ouro);
+    const r = await api()
+      .post('/v1/portal/requests')
+      .set(
+        headers({
+          'idempotency-key': idempotencyKey(
+            'junta_medica',
+            EXTERNAL.exam,
+            body,
+          ),
+        }),
+      )
+      .send(body);
+    // CTG-0002.md: §2.3 passo 3, junta fora do catálogo é NOT_FOUND { kind: service }.
+    expect(r.status, bodyText(r.body)).toBe(404);
+    expect(asRecord(r.body).code).toBe('PORTAL.NOT_FOUND');
+    expect(asRecord(asRecord(r.body).context)).toEqual({ kind: 'service' });
+  });
+});
diff --git a/backend/app/tests/e2e/portal-stream.e2e.spec.ts b/backend/app/tests/e2e/portal-stream.e2e.spec.ts
index 6f62adda..f6748740 100644
--- a/backend/app/tests/e2e/portal-stream.e2e.spec.ts
+++ b/backend/app/tests/e2e/portal-stream.e2e.spec.ts
@@ -45,6 +45,7 @@ let port: number;
 const openRequests: http.ClientRequest[] = [];
 const createdOutboxIds: string[] = [];
 const prata = { cpf: CPF.prata, level: 'avancada' as const };
+const ouro = { cpf: CPF.ouro, level: 'avancada' as const };
 const CASE_ID = '00000000-0000-7000-8000-007000700207';
 const LINKED_REQUEST_ID = '00000000-0000-7000-8000-0000704000e8';
 const OTHER_HASH = cpfHash(CPF.ouro);
@@ -176,8 +177,10 @@ function openStream(
   };
 }

-function citizenHeaders(): Record<string, string> {
-  setCitizen(prata);
+function citizenHeaders(
+  citizen: typeof prata | typeof ouro = prata,
+): Record<string, string> {
+  setCitizen(citizen);
   return {
     authorization: 'Bearer local',
     'x-tenant-id': TENANT_ID,
@@ -253,6 +256,7 @@ beforeAll(async () => {
   port = typeof address === 'object' && address ? address.port : 0;

   subjectId = await subjectIdOf(app, prata);
+  await subjectIdOf(app, ouro);
   await asOwner(client);
   await client.query(
     `insert into portal.infraction_view (id, tenant_id, ait_id, subject_cpf_hash, ait_number, plate, occurred_at, framing_label, amount, situation, deadlines_json, points_status, actions_json, notices_json, payment_json, last_event_id, last_event_version)
@@ -460,6 +464,67 @@ describe('CTG-0002 §9 — GET /v1/portal/stream (C-0002-82)', () => {
     stream.close();
   });

+  it('C-4-66/67 — dado streams de Prata e Ouro quando evento do sujeito Prata chega ao outbox então só Prata o recebe e data não expõe tokens internos ou contato', async () => {
+    const prataStream = openStream('/v1/portal/stream', citizenHeaders(prata));
+    await prataStream.opened;
+    const ouroStream = openStream('/v1/portal/stream', citizenHeaders(ouro));
+    await ouroStream.opened;
+    expect(prataStream.status()).toBe(200);
+    expect(ouroStream.status()).toBe(200);
+
+    const id = await insertOutboxRow(
+      REQUEST_CHANGED,
+      'SOLICITACAO_PROTOCOLADA',
+      { kind: 'portal.request', id: LINKED_REQUEST_ID, version: 6 },
+      {
+        requestId: LINKED_REQUEST_ID,
+        serviceKey: 'defesa_previa',
+        fromState: 'PEDIDO_EM_COMPOSICAO',
+        toState: 'PROTOCOLADO',
+        subjectId,
+        subjectCpfHash: cpfHash(CPF.prata),
+        email: 'prata@fixture.invalid',
+        phone: '41999999999',
+        tenantId: TENANT_ID,
+      },
+    );
+    await poller.firePolling();
+    await prataStream.waitFor(() =>
+      prataStream.events.some((event) => event.id === id),
+    );
+    await new Promise((resolve) => setTimeout(resolve, 150));
+    expect(ouroStream.events.map((event) => event.id)).not.toContain(id);
+
+    const data = prataStream.events.find((event) => event.id === id)?.data;
+    expect(data).toBeDefined();
+    for (const token of [
+      'MANIFESTATION_TRANSITIONS',
+      'REQUEST_TRANSITIONS',
+      'infraction_state_ref',
+      'CdtPort',
+      'SnePort',
+      'RenachPort',
+      'Senatran',
+      'RENAEST',
+      'RENAINF',
+      'pending_complement',
+      'delegation_domain',
+      'delegation_command',
+      'subjectCpfHash',
+      'tenantId',
+      CPF.prata,
+      cpfHash(CPF.prata),
+      'prata@fixture.invalid',
+      '41999999999',
+      'payload_json',
+      'integration.outbox',
+      'aggregate_type',
+    ])
+      expect(data, token).not.toContain(token);
+    prataStream.close();
+    ouroStream.close();
+  });
+
   it('C-0002-82 — dado ?topics=payment.confirmed então só esse tipo chega; tipo desconhecido em topics é ignorado', async () => {
     const stream = openStream(
       '/v1/portal/stream?topics=payment.confirmed,tipo.desconhecido',
diff --git a/backend/domains/portal/inbox/src/handwritten/inbox.service.spec.ts b/backend/domains/portal/inbox/src/handwritten/inbox.service.spec.ts
index 69c22470..a4c27fa2 100644
--- a/backend/domains/portal/inbox/src/handwritten/inbox.service.spec.ts
+++ b/backend/domains/portal/inbox/src/handwritten/inbox.service.spec.ts
@@ -48,6 +48,7 @@ import {
 } from './inbox.service.js';
 import {
   PortalSneEnrollmentService,
+  PORTAL_SNE_PORT,
   SNE_EFFECTS,
   SNE_ENROLLMENT_BODY,
   SNE_ENROLLMENT_TRANSITIONS,
@@ -170,6 +171,9 @@ function harness(options: { sneRows?: Row[] } = {}) {
   const sne = constructInjectable(PortalSneEnrollmentService, {
     ...providers,
     PortalInboxService: inbox,
+    [PORTAL_SNE_PORT.description!]: {
+      enrollCitizen: async () => ({ enrolled: true }),
+    },
   }) as unknown as {
     enroll: (
       tx: unknown,
diff --git a/backend/domains/portal/inbox/src/handwritten/sne-enrollment.service.ts b/backend/domains/portal/inbox/src/handwritten/sne-enrollment.service.ts
index 59b0ee47..91e57b65 100644
--- a/backend/domains/portal/inbox/src/handwritten/sne-enrollment.service.ts
+++ b/backend/domains/portal/inbox/src/handwritten/sne-enrollment.service.ts
@@ -1,10 +1,11 @@
-// Adesão e cancelamento do SNE (work/rounds/R-0009/contracts/CTG-0002.md §2.4,
-// §6.2 e §11; CTG-0001 §6.3; plan R-0009 M8, M15, M21, adenda A1(a)).
+// Adesão e cancelamento do SNE (CTG-0002 §2.4, §6.2 e §11; CTG-0001 §6.3;
+// A23(a): PORTAL_SNE_PORT obrigatório e a adesão nacional antecede toda
+// persistência local e publicação na outbox).
 // `SNE_ENROLLMENT_TRANSITIONS` espelha as três linhas de [WF-PORTAL-003]
 // para `portal.sne_enrollment.state`; `enroll`/`cancel` são chamados pela
 // rota §2.4 e pelo alvo de delegação `adesao_sne`/`cancelamento_sne` do app
-// (§3.2). O envio real ao SNE nacional (`SnePort` via adapter) é OD-P16 —
-// nada sai do backend nesta rodada.
+// (§3.2). A adesão chama o `SnePort` via adapter antes dos efeitos locais;
+// o cancelamento permanece local (DIVERGE-2/OD-P106).
 //
 // `sne_enrollment` não tem `version` (D8): `aggregate.version` do evento é o
 // número da transição da linha (adesão nova = 1, cancelamento = 2, re-adesão
@@ -36,6 +37,15 @@ import {
   type PortalInboxEventContext,
 } from './events.js';

+export const PORTAL_SNE_PORT = Symbol('PORTAL_SNE_PORT');
+
+export interface PortalSnePort {
+  enrollCitizen(input: {
+    cpf: string;
+    channel?: string;
+  }): Promise<{ enrolled: boolean }>;
+}
+
 // ---------------------------------------------------------------------------
 // vocabulário (§2.4, CTG-0001 §6.3)
 // ---------------------------------------------------------------------------
@@ -216,6 +226,7 @@ export class PortalSneEnrollmentService {

   constructor(
     private readonly identity: PortalIdentityService,
+    @Inject(PORTAL_SNE_PORT) private readonly sne: PortalSnePort,
     @Optional() clock?: PortalClock,
     @Optional() private readonly requestContext?: RequestContext,
     @Optional() @Inject(TEAT_EVENT_OUTBOX) outbox?: TeatEventOutbox,
@@ -261,7 +272,42 @@ export class PortalSneEnrollmentService {
         context: { missing: ['email', 'phone'] },
       });
     }
-    // 4. estado
+    // 4. integração nacional antes de qualquer escrita local (§4).
+    try {
+      const national = await this.sne.enrollCitizen({
+        cpf: identity.cpf,
+        channel: input.channel,
+      });
+      if (!national.enrolled) {
+        throw new PortalError('PORTAL.SNE_UPSTREAM_UNAVAILABLE', {
+          status: 503,
+          context: { retryAfter: null },
+        });
+      }
+    } catch (error) {
+      if (error instanceof PortalError) throw error;
+      const category =
+        typeof error === 'object' && error !== null && 'category' in error
+          ? (error as { category?: unknown }).category
+          : undefined;
+      if (category === 'VALIDATION') {
+        throw new PortalError('PORTAL.VALIDATION_FAILED', {
+          status: 400,
+          context: { fields: [] },
+        });
+      }
+      if (category === 'BUSINESS') {
+        throw new PortalError('PORTAL.SNE_ALREADY_ENROLLED', {
+          status: 409,
+          context: {},
+        });
+      }
+      throw new PortalError('PORTAL.SNE_UPSTREAM_UNAVAILABLE', {
+        status: 503,
+        context: { retryAfter: null },
+      });
+    }
+    // 5. estado
     const existing = (
       await tx.query<EnrollmentRow>(ENROLLMENT_FOR_UPDATE_SQL, [
         subject.subjectId,
@@ -273,7 +319,7 @@ export class PortalSneEnrollmentService {
         context: {},
       });
     }
-    // 5. upsert
+    // 6. upsert
     const now = this.clock.now();
     const channel = input.channel ?? null;
     const effectsAck = JSON.stringify(
@@ -308,7 +354,7 @@ export class PortalSneEnrollmentService {
       }
       enrollmentId = inserted.id;
     }
-    // 6. evento
+    // 7. evento
     await this.outbox.append(
       tx as never,
       portalInboxEvents.sneAdesaoSolicitada(
```
