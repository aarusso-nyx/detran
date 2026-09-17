# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `portal-backend` (rodada `R-0009`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/portal-backend`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/portal-build-pack.md` — apenas a seção do WP `WP-P0…P3` e o "mapa entregável → definições"
4. `work/rounds/R-0009/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0009/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0009/reports/*.md`, o diff anexado abaixo e os
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
  "round": "R-0009",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0009/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

**Segundo ciclo — restrito** (orchestra/README.md §5): avalie somente (a) a correção da nota `low` de `delivery-review-CTG-0002` em `backend/app/src/portal-stream.controller.ts` (commit `f6a253f`) e (b) a entrega de TASK-0010 (Architect-transcrição, docs) no mesmo PR #56: `portal-build-pack.md`, ADR-0019 (status), `parameter-catalogue.md` (§Verificador, A7; artefatos regenerados por `pnpm parameters:generate` — só o hash da fonte muda), `decision-closure-plan.md`, `backlog.md`. Gates: `pnpm format:check` OK; `node tools/docs/kb/check.mjs` OK (522/446); `pnpm docs:kb:publish-check` OK; `pnpm verify:parameter-catalogue` OK; app unit 64/64 e `portal-stream.e2e` 5/5 após a correção.

### Veredito anterior

```json
{
  "mode": "delivery-review",
  "round": "R-0009",
  "verdict": "PASS",
  "findings": [
    {
      "severity": "low",
      "item": 11,
      "file": "backend/app/src/portal-stream.controller.ts",
      "line": 203,
      "claim": "Se a conexão fecha entre o registro dos handlers e a atribuição das duas inscrições do poller, cleanup marca closed e chama os no-ops iniciais; a verificação posterior chama cleanup novamente, mas ele retorna cedo. As inscrições reais ficam ativas.",
      "fix": "Separar a marcação de closed do cancelamento, ou cancelar explicitamente as inscrições recém-criadas quando closed já for true."
    }
  ],
  "notes": [
    "A entrega fecha os critérios de política com grants positivos e negativos exaustivos, mantém a integração nacional na composição via senatran-adapter e registra as divergências/ODs no contrato e nas adendas."
  ]
}
```

### Relatório TASK-0010

```markdown
Papel: Architect (transcrição)
Tarefa: TASK-0010
Arquivos criados/alterados: `docs/meta/adr/ADR-0019-*.md` (Status: Implementação PR #54/#56), `docs/framework/arch/portal-build-pack.md` (§1 estado 2026-09-16; §2 WP-P0…P3 executados + fora; gates reais; §3 nota R-0007; §4 OD-P02/P13 fechadas + seção OD-P14…P46; `updated`), `docs/framework/arch/parameter-catalogue.md` (§Verificador: exclusão de `packages/api-clients/src/generated`, A7/OD-P46), `docs/meta/knowledge-base/decision-closure-plan.md` (OD-P02/P13 fechadas), `docs/meta/knowledge-base/backlog.md` (entrega R-0009; 6 handoffs). Conferidos sem alteração: `portal-route-contract.md` §11, `orchestra/README.md` §9, ADR-0024.
Comandos: prettier + format:check OK; kb check OK (522/446, sem aumento); publish-check OK (201); verify parameters OK; nenhum processo vivo.
Critérios: format PASS; kb PASS; publish-check PASS.
Fora do escopo: WP-P4…P6; import-manifest; código/testes/blueprints/DDL/seeds/plan/waves.
OD: OD-P02/P13 fechadas; OD-P14…P46 transcritas em `portal-build-pack.md` §4.
Bloqueios: nenhum.
Consumo (subagente): ≈268 k tokens brutos, 102 chamadas, 14 min.
```

### Diff (3ceeede..HEAD, docs + correção low + gerados de parâmetros)

```diff
diff --git a/backend/app/src/generated/parameter-flags.ts b/backend/app/src/generated/parameter-flags.ts
index 71b8dc9..ea321a8 100644
--- a/backend/app/src/generated/parameter-flags.ts
+++ b/backend/app/src/generated/parameter-flags.ts
@@ -1,6 +1,6 @@
-// Generated from parameter-catalogue.md sha256:3fc4ad325b45bb66c6a9cdb281fa0210fec24b529e7271a8c376a8d0dbf7d74e
+// Generated from parameter-catalogue.md sha256:42f7f1c7f322f3a1b897a4d9f088fc55977a2f212a7c406cf952115dd9e3d529
 export const PARAMETER_FLAGS_SOURCE_SHA256 =
-  '3fc4ad325b45bb66c6a9cdb281fa0210fec24b529e7271a8c376a8d0dbf7d74e';
+  '42f7f1c7f322f3a1b897a4d9f088fc55977a2f212a7c406cf952115dd9e3d529';
 export const PARAMETER_FLAGS = {
   'rait.warning.same_machine': true,
   'session.oral_argument_enabled': false,
diff --git a/backend/app/src/portal-stream.controller.ts b/backend/app/src/portal-stream.controller.ts
index 50944af..ba5f74f 100644
--- a/backend/app/src/portal-stream.controller.ts
+++ b/backend/app/src/portal-stream.controller.ts
@@ -142,11 +142,21 @@ export class PortalStreamController {
     let closed = false;
     let unsubscribeHeartbeat: () => void = () => undefined;
     let unsubscribePoller: () => void = () => undefined;
+    // `closed` and the cancellation are kept separate on purpose
+    // (delivery-review-CTG-0002 nota low): a `close` that fires between the
+    // handler registration and the two `schedule` calls below marks the
+    // stream closed while the subscriptions still hold the initial no-ops;
+    // the explicit `cancel()` after scheduling then cancels the real ones.
+    const cancel = (): void => {
+      unsubscribeHeartbeat();
+      unsubscribePoller();
+      unsubscribeHeartbeat = () => undefined;
+      unsubscribePoller = () => undefined;
+    };
     const cleanup = (): void => {
       if (closed) return;
       closed = true;
-      unsubscribeHeartbeat();
-      unsubscribePoller();
+      cancel();
     };
     req.on('close', cleanup);
     res.on('close', cleanup);
@@ -200,7 +210,10 @@ export class PortalStreamController {
     unsubscribePoller = this.poller.schedule(() => {
       void tick();
     });
-    if (closed) cleanup();
+    if (closed) {
+      cancel();
+      return;
+    }

     await tick();
   }
diff --git a/backend/database/seed/05-parameters.sql b/backend/database/seed/05-parameters.sql
index 5a09b50..c2e8ba2 100644
--- a/backend/database/seed/05-parameters.sql
+++ b/backend/database/seed/05-parameters.sql
@@ -1,4 +1,4 @@
--- Generated from parameter-catalogue.md sha256:3fc4ad325b45bb66c6a9cdb281fa0210fec24b529e7271a8c376a8d0dbf7d74e
+-- Generated from parameter-catalogue.md sha256:42f7f1c7f322f3a1b897a4d9f088fc55977a2f212a7c406cf952115dd9e3d529
 -- Applied by backend/database/seed.sh after apply.sh: the tenant context below satisfies auth.enforce_tenant_id().
 select set_config('app.role', 'owner', false);
 select set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', false);
diff --git a/backend/domains/ops/parameter/src/generated/parameter-catalogue.ts b/backend/domains/ops/parameter/src/generated/parameter-catalogue.ts
index f61bca6..5eed4c7 100644
--- a/backend/domains/ops/parameter/src/generated/parameter-catalogue.ts
+++ b/backend/domains/ops/parameter/src/generated/parameter-catalogue.ts
@@ -1,6 +1,6 @@
-// Generated from parameter-catalogue.md sha256:3fc4ad325b45bb66c6a9cdb281fa0210fec24b529e7271a8c376a8d0dbf7d74e
+// Generated from parameter-catalogue.md sha256:42f7f1c7f322f3a1b897a4d9f088fc55977a2f212a7c406cf952115dd9e3d529
 export const PARAMETER_CATALOGUE_SOURCE_SHA256 =
-  '3fc4ad325b45bb66c6a9cdb281fa0210fec24b529e7271a8c376a8d0dbf7d74e';
+  '42f7f1c7f322f3a1b897a4d9f088fc55977a2f212a7c406cf952115dd9e3d529';
 export const PARAMETER_CATALOGUE = [
   {
     key: 'rait.wip.limit',
diff --git a/docs/framework/arch/parameter-catalogue.md b/docs/framework/arch/parameter-catalogue.md
index 8fb6188..5a52036 100644
--- a/docs/framework/arch/parameter-catalogue.md
+++ b/docs/framework/arch/parameter-catalogue.md
@@ -281,5 +281,12 @@ somente se tiver dois ou mais pontos e começar por um destes prefixos: `rait`,
 `dashboard`. Literais desconhecidos de um ponto são ambíguos com entidades de
 auditoria, como `portal.complaint`, e não são candidatos. Não existe allowlist
 silenciosa: todo candidato desconhecido falha com arquivo, linha e literal.
+`packages/api-clients/src/generated` fica fora desta varredura de uso (R-0009, A7): os
+clientes de comando gerados (`BP-PORTAL-*.commands.ts`) transcrevem, como tipos `const`, as
+chaves de rótulo i18n do Portal (`portal.requests.nextAction.<STATE>`,
+`portal.evaluations.publicIndicator`), que colidem com a heurística acima (prefixo `portal.`
+e dois ou mais pontos) sem ler nenhum parâmetro; nenhuma chave entra em allowlist, só esse
+diretório gerado sai da varredura. A colisão entre a heurística e as chaves i18n do Portal é
+`OD-P46` (`docs/framework/arch/portal-build-pack.md` §4).

 A conversão de `inf.normative_agency_parameter` em view está fora deste contrato.
diff --git a/docs/framework/arch/portal-build-pack.md b/docs/framework/arch/portal-build-pack.md
index ee3d2dc..09c31ed 100644
--- a/docs/framework/arch/portal-build-pack.md
+++ b/docs/framework/arch/portal-build-pack.md
@@ -3,7 +3,7 @@ id: ARCH-PORTAL-BUILD-PACK
 title: Pacote de construção do Portal — definições e pacotes de trabalho para a orquestra (domínio portal, projeções, PWA)
 status: draft
 apps: [portal]
-updated: 2026-09-13
+updated: 2026-09-16
 ---

 # Pacote de construção do Portal
@@ -26,6 +26,23 @@ updated: 2026-09-13
 | Integrações disponíveis                  | `CdtPort` (multas, veículos, CNH, cotação, reconhecimento), `SnePort`, `RenachPort`, RENAVAM leitura — mock-first (ADR-0008)                                                                                                                                                                               |
 | Decisões abertas que condicionam módulos | DT-050 (portaria de níveis), DT-026 (renúncia 40%), DT-027 (CRLV-e × recurso), DT-031 (cartão), DT-051 (nível da ouvidoria), DT-028 (declaração WCAG, adotada na origem em 2026-08-28), DT-066 (Lei 14.129)                                                                                                |

+### Estado em 2026-09-16 (R-0009)
+
+`work/rounds/R-0009/` (frente `portal-backend`) executou WP-P0…P3. Entregue: ADR-0024 (gov.br via
+Cognito); os cinco pacotes de workspace `@detran/portal-{identity,requests,inbox,citizen-service,
+projections}` (`BP-PORTAL-*-001`, DDL `19-portal-platform.sql`, `61…65-portal-*.sql`, timers
+`owner='portal'` no DDL `14-inf-lifecycle-vocabulary.sql`, schema `portal` em `11-auth-functions.sql`);
+fixtures `70-fixtures-portal.sql` + `71-fixtures-portal-events.sql`; controladores `/v1/portal/*`
+(`portal-route-contract.md` §2–§9), `RequestDelegationService`, as cinco projeções (ADR-0020) com
+replay, SSE `/v1/portal/stream`, política `portal:*`; contratos
+`docs/framework/contracts/BP-PORTAL-*.commands.openapi.json` (138 operações) e
+`docs/framework/schemas/portal-request-draft.schema.json`. Dois PR: **#54** (CTG-0001 — identidade +
+modelo + fixtures, mesclado em `1175f4f33015e6c0f389bb3e2ada2ef1ae5304c8`) e **#56** (CTG-0002 —
+rotas + delegações + contratos). Ficou fora desta rodada: delegações reais de
+`defesa_previa`/`recurso_jari`/`recurso_cetran`/`indicacao_condutor`/`pagamento` (R-0007 ausente de
+`main`, §3), adesão real ao SNE nacional e o endpoint de privacidade/LGPD, CNH-e/CRLV-e assinados
+(R-0014), `junta_medica` (delegação PEC sem comando, OD-P19) e WP-P4…P6 (telas, PWA, homologação).
+
 ## 2. Pacotes de trabalho

 ### WP-P0 — Identidade federada (Architect → Engineer; ADR curta)
@@ -37,6 +54,12 @@ como `sub` de negócio; grupos `CIDADAO`; representação como atributo); config
 `backend/app`; guarda que rejeita claim ausente. Gate: e2e de login com IdP simulado;
 `PORTAL.ASSURANCE_NOT_VERIFIED` fail-closed.

+**Executado em R-0009** (PR #54): ADR-0024 substitui a ADR curta prevista;
+`PortalCitizenGuard`/`assertActLevel` (`@detran/portal-identity`), claims locais
+`DETRAN_LOCAL_ASSURANCE_LEVEL`/`DETRAN_LOCAL_CPF`, guarda fail-closed
+`PORTAL.ASSURANCE_NOT_VERIFIED` provados por e2e com IdP simulado. Fora: credenciais
+institucionais do IdP gov.br real (OD-P15, homologação R-0014 WP-P6).
+
 ### WP-P1 — Modelo de dados (Architect-blueprint)

 | Blueprint                       | Entidades                                                                                                                                                                                                                                                                                                                                                            |
@@ -51,8 +74,15 @@ Timers no motor de prazos (`owner='portal'`): `T-PROTOCOLO` (imediato), `T-OUV-R
 `T-OUV-INFO` (20+20, interno), `T-AVAL-CONVITE`, `T-SNE-CIENCIA` (30, lido do módulo de
 notificação), `T-LGPD-ACESSO` (regime público, parâmetro). Fixtures: um cidadão por nível, uma
 representação, um pedido por estado, uma manifestação por estado, catálogo completo com 9
-disponíveis/2 parciais/4 indisponíveis com motivo. Gate: `blueprints:check`, `verify:rls-ddl`
-(exceto `brand_profile`/`public_hostname`, sem RLS por desenho), seeds em banco limpo.
+disponíveis/2 parciais/4 indisponíveis com motivo. Gate: `pnpm blueprints:check`, `pnpm verify:rls-ddl`
+(exceto `brand_profile`/`public_hostname`, sem RLS por desenho), `bash backend/database/seed.sh` em banco limpo.
+
+**Executado em R-0009** (PR #54): cinco blueprints (`BP-PORTAL-{IDENTITY,REQUESTS,INBOX,
+CITIZEN-SERVICE,PROJECTIONS}-001`); DDL `19-portal-platform.sql` (plataforma, manuscrito),
+`61…65-portal-*.sql` (gerado), timers `owner='portal'` em `14-inf-lifecycle-vocabulary.sql`,
+schema `portal` em `install_tenant_triggers()` (`11-auth-functions.sql`); `70-fixtures-portal.sql`.
+Fora: `portal/complaints` (DDL 60, PEC) mantido intacto, sem unificação com `portal.manifestation`
+(M2, OD-P14).

 ### WP-P2 — Rotas, delegações e projeções (Engineer-backend)

@@ -62,16 +92,29 @@ transação: protocolo → comando do domínio dono → estado `EM_ANDAMENTO_NO_
 protocolo vira pendência interna, nunca perde o protocolo); projetores das cinco projeções a partir
 dos eventos; evidência de ciência para itens SNE (`NOTIFICACAO_CIENCIA`); adesão/cancelamento SNE
 via módulo de notificação; leituras nacionais cacheadas com `cachedAt`; SSE `/v1/portal/stream`;
-regras de política `portal:*` para `CIDADAO`. Gate: testes de vínculo (sem vínculo = 404), nível
-(matriz por ato), idempotência com corpo diferente, protocolo imediato antes de qualquer validação
-de conteúdo, projeção reconstruída por replay.
+regras de política `portal:*` para `CIDADAO`. Gate: `pnpm backend:test:ci` cobrindo vínculo (sem
+vínculo = 404), nível (matriz por ato), idempotência com corpo diferente, protocolo imediato antes
+de qualquer validação de conteúdo, projeção reconstruída por replay.
+
+**Executado em R-0009** (PR #56): controladores `/v1/portal/*` (`portal-route-contract.md` §2–§9),
+`RequestDelegationService`, projetores das cinco projeções (ADR-0020) com replay, evidência de
+ciência SNE, adesão/cancelamento SNE sem envio real (OD-P16), leituras nacionais cacheadas, SSE
+`/v1/portal/stream`, política `portal:*`. Fora: delegações reais de `defesa_previa`, `recurso_jari`,
+`recurso_cetran`, `indicacao_condutor` e `pagamento` — R-0007 (`rait-backend`) não está em `main`
+nesta rodada (M8/M23, §3): as rotas respondem `PORTAL.SERVICE_UNAVAILABLE`
+`{unavailableReason:'delegacao_indisponivel_r0007'}` e o teste de delegação real fica `it.todo`
+citando R-0007 (`docs/meta/knowledge-base/backlog.md` §Handoffs de engenharia).

 ### WP-P3 — Payloads e contrato (Transcriber-docs)

 `docs/framework/contracts/BP-PORTAL-*.openapi.json` com os corpos por `serviceKey` (§5.1 do
 contrato), respostas 4xx com códigos do catálogo, `Idempotency-Key` determinística documentada,
 exemplos com as fixtures; `docs/framework/schemas/portal-request-draft.schema.json` por ato.
-Gate: `contracts:check`; cliente gerado compila.
+Gate: `pnpm contracts:check`; `pnpm contracts:clients` (cliente gerado compila).
+
+**Executado em R-0009** (PR #56, TASK-0009): `docs/framework/contracts/BP-PORTAL-*.commands.openapi.json`
+(138 operações) e `docs/framework/schemas/portal-request-draft.schema.json`; `pnpm contracts:clients`
+rodado pelo maestro (Engineer) no checkpoint de CTG-0002.

 ### WP-P4 — Telas, formulários, mapa de tradução e i18n (Transcriber-docs → Engineer-frontend)

@@ -109,23 +152,73 @@ WP-P2 depende dos comandos do RAIT (WP-B) e dos módulos de ADR-0016/0015 para a
 defesa, indicação e pagamento; até lá, as rotas existem e devolvem `SERVICE_UNAVAILABLE` com
 motivo (o catálogo é dado). Sonnet: WP-P3, WP-P4; Opus/Terra: WP-P0, WP-P1, WP-P2.

+**Nota (R-0009):** WP-P2 foi executado sem WP-B — `rait-backend` (R-0007) não está em `main` nesta
+rodada. As delegações reais de `defesa_previa`, `recurso_jari`, `recurso_cetran`,
+`indicacao_condutor` e `pagamento` ficam `PORTAL.SERVICE_UNAVAILABLE`
+`{unavailableReason:'delegacao_indisponivel_r0007'}` até R-0007 mesclar (M8/M23 de
+`work/rounds/R-0009/plan.md`); o teste de delegação real com alvo real fica `it.todo` citando
+R-0007. A adesão real ao SNE nacional (OD-P16) e o endpoint `@stynx-nyx/privacy` (OD-P17) seguem o
+mesmo padrão, mas por R-0014, não por R-0007.
+
 ## 4. Questões abertas do Portal (OD-P)

-| ID     | Questão                                                                             | Premissa adotada                                                                                                                                                                                                                                                                                                                        | Decisor           |
-| ------ | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
-| OD-P01 | Portaria estadual de níveis de assinatura por ato (DT-050)                          | matriz do Decreto 10.543 como dados em `act_level_policy`; teto avançada — **PN DETRAN-AM 001/2025 localizada** ([REF-DETRANAM-PORTARIA-NORMATIVA-001-2025]): gov.br ouro/e-Notariado/qualificada para defesas, recursos, indicação e procurações → `act_level_policy` com fonte; resta o CETRAN-AM — **H.49**: CETRAN pela mesma regra | Owner / LEGAL     |
-| OD-P02 | Mapeamento dos selos gov.br (bronze/prata/ouro) → simples/avançada                  | prata ou ouro = avançada; bronze = simples; sem exigir qualificada — **revisar**: a PN 001/2025 só admite **nível ouro**; prata/bronze insuficientes para os atos do art. 3º — **H.50**: prata aceito desde já (decisão do Owner contra a PN 001/2025; portaria pedida)                                                                 | Architect / LEGAL |
-| OD-P03 | Instrumento da renúncia na faixa de 40% (DT-026) e sua ativação (OD-003)            | declaração eletrônica versionada; faixa desligada por flag — **DT-026 respondido**: termo digital assinado no PORTAL, sem depender do SNE; ativação segue OD-003 (flag)                                                                                                                                                                 | Owner / LEGAL     |
-| OD-P04 | CRLV-e com multa sob recurso suspensivo (DT-027)                                    | não bloqueia; exibido como "exigibilidade suspensa"                                                                                                                                                                                                                                                                                     | LEGAL             |
-| OD-P05 | Cartão e parcelamento (DT-031)                                                      | indisponíveis até autorização; guia PIX/boleto sempre — **DT-031 respondido**: prosseguir assumindo autorização; confirmação institucional em paralelo (DT-072) → flag `portal.card_payment` off até confirmação                                                                                                                        | Owner             |
-| OD-P06 | Nível de assinatura da ouvidoria (DT-051)                                           | nenhum (anônimo admitido); simples para acompanhar — **H.51**                                                                                                                                                                                                                                                                           | Owner             |
-| OD-P07 | Adesão do AM à Lei 14.129/2021 (DT-066)                                             | fundamentação mantida; registrar inexistência se for o caso — **DT-066 refinado**: Lei AM 6.837/2024 supre a maior parte; fundamentação dupla                                                                                                                                                                                           | LEGAL             |
-| OD-P08 | Prazo LGPD no regime público (`RN-PORTAL-120`)                                      | parâmetro `privacy.public_regime_days` sem valor exibido até decisão                                                                                                                                                                                                                                                                    | LEGAL / DPO       |
-| OD-P09 | Regime jurídico da notificação de andamento (sem ciência ficta) vs. SNE             | leitura provisória de [WF-PORTAL-003]; só SNE produz ciência ficta                                                                                                                                                                                                                                                                      | LEGAL             |
-| OD-P10 | Taxonomia "solicitação" na ouvidoria (proposta operacional)                         | mantida — **H.52**                                                                                                                                                                                                                                                                                                                      | Owner             |
-| OD-P11 | Volumes (consultas, pagamentos, BAT com terceiro, meta SNE) — pedidos de capacidade | cache de leitura com TTL 15 min; gateway só guia — **H.54** vigente                                                                                                                                                                                                                                                                     | Owner             |
-| OD-P12 | `apps/portal/mobile` (shell móvel)                                                  | adiado até o runtime móvel provar-se no BOAT                                                                                                                                                                                                                                                                                            | Owner (Fase 4)    |
-| OD-P13 | Uso do `@stynx-nyx/flow` para o ciclo comum de solicitação                          | máquina fixa de 13 estados em código; `flow` avaliado em WP-P1                                                                                                                                                                                                                                                                          | Architect         |
+| ID     | Questão                                                                             | Premissa adotada                                                                                                                                                                                                                                                                                                                        | Decisor               |
+| ------ | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
+| OD-P01 | Portaria estadual de níveis de assinatura por ato (DT-050)                          | matriz do Decreto 10.543 como dados em `act_level_policy`; teto avançada — **PN DETRAN-AM 001/2025 localizada** ([REF-DETRANAM-PORTARIA-NORMATIVA-001-2025]): gov.br ouro/e-Notariado/qualificada para defesas, recursos, indicação e procurações → `act_level_policy` com fonte; resta o CETRAN-AM — **H.49**: CETRAN pela mesma regra | Owner / LEGAL         |
+| OD-P02 | Mapeamento dos selos gov.br (bronze/prata/ouro) → simples/avançada                  | **fechada por H.50** (Owner, R-0009): prata ou ouro = avançada; bronze = simples; sem exigir qualificada; risco registrado — PN DETRAN-AM 001/2025 art. 1º só nomeia o nível ouro, ato assinado com prata é impugnável até portaria própria (ADR-0024 §Decisão 2, §Consequências); carta a DETRAN-AM pedindo a portaria                 | Owner (fechada, H.50) |
+| OD-P03 | Instrumento da renúncia na faixa de 40% (DT-026) e sua ativação (OD-003)            | declaração eletrônica versionada; faixa desligada por flag — **DT-026 respondido**: termo digital assinado no PORTAL, sem depender do SNE; ativação segue OD-003 (flag)                                                                                                                                                                 | Owner / LEGAL         |
+| OD-P04 | CRLV-e com multa sob recurso suspensivo (DT-027)                                    | não bloqueia; exibido como "exigibilidade suspensa"                                                                                                                                                                                                                                                                                     | LEGAL                 |
+| OD-P05 | Cartão e parcelamento (DT-031)                                                      | indisponíveis até autorização; guia PIX/boleto sempre — **DT-031 respondido**: prosseguir assumindo autorização; confirmação institucional em paralelo (DT-072) → flag `portal.card_payment` off até confirmação                                                                                                                        | Owner                 |
+| OD-P06 | Nível de assinatura da ouvidoria (DT-051)                                           | nenhum (anônimo admitido); simples para acompanhar — **H.51**                                                                                                                                                                                                                                                                           | Owner                 |
+| OD-P07 | Adesão do AM à Lei 14.129/2021 (DT-066)                                             | fundamentação mantida; registrar inexistência se for o caso — **DT-066 refinado**: Lei AM 6.837/2024 supre a maior parte; fundamentação dupla                                                                                                                                                                                           | LEGAL                 |
+| OD-P08 | Prazo LGPD no regime público (`RN-PORTAL-120`)                                      | parâmetro `privacy.public_regime_days` sem valor exibido até decisão                                                                                                                                                                                                                                                                    | LEGAL / DPO           |
+| OD-P09 | Regime jurídico da notificação de andamento (sem ciência ficta) vs. SNE             | leitura provisória de [WF-PORTAL-003]; só SNE produz ciência ficta                                                                                                                                                                                                                                                                      | LEGAL                 |
+| OD-P10 | Taxonomia "solicitação" na ouvidoria (proposta operacional)                         | mantida — **H.52**                                                                                                                                                                                                                                                                                                                      | Owner                 |
+| OD-P11 | Volumes (consultas, pagamentos, BAT com terceiro, meta SNE) — pedidos de capacidade | cache de leitura com TTL 15 min; gateway só guia — **H.54** vigente                                                                                                                                                                                                                                                                     | Owner                 |
+| OD-P12 | `apps/portal/mobile` (shell móvel)                                                  | adiado até o runtime móvel provar-se no BOAT                                                                                                                                                                                                                                                                                            | Owner (Fase 4)        |
+| OD-P13 | Uso do `@stynx-nyx/flow` para o ciclo comum de solicitação                          | **fechada** (R-0009, M7): `@stynx-nyx/flow` avaliado e descartado; máquina fixa de 13 estados em código (`REQUEST_TRANSITIONS`, `portal/requests/src/handwritten/guards/request.transitions.ts`) mantém a auditabilidade no domínio                                                                                                     | Architect (fechada)   |
+
+### Questões levantadas na implementação (R-0009, OD-P14…P46)
+
+Registradas por TASK-0010 (Architect, transcrição), transcritas dos relatórios de TASK-0001…0009 e
+dos contratos `work/rounds/R-0009/contracts/CTG-000{1,2}.md`; nenhuma é fechada por esta tarefa
+(transcrição, Art. 6/10). Formato de `docs/meta/knowledge-base/open-decisions-rait.md` §F.
+
+| ID     | Questão                                                                                                                                                                                                                                                                                                                                   | Premissa adotada                                                                                                                                                                                                                                            | Decisor                              | Fonte                                 |
+| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------- |
+| OD-P14 | Unificar `portal/complaints` (PEC, DDL 60, papéis `CANDIDATO\|DPO\|AUDITOR\|GESTOR_DETRAN\|SUPORTE`) com `portal.manifestation` ([WF-PORTAL-004], Lei 13.460) — mesmo canal de reclamação em duas tabelas?                                                                                                                                | Mantidos separados nesta rodada (M2): `complaint` não é manifestação de ouvidoria; nenhuma tabela duplicada para o mesmo fato até decisão                                                                                                                   | Owner (após parity/freeze PEC)       | `plan.md` M2                          |
+| OD-P15 | Credenciais institucionais do cliente OIDC gov.br (client id/secret, attribute mapping do pool)                                                                                                                                                                                                                                           | `source_pending`; só IdP simulado nos perfis `test`/`local` (`DetranLocalTokenVerifier`) nesta rodada                                                                                                                                                       | Architect (R-0014 WP-P6)             | `plan.md` M3; ADR-0024 §Consequências |
+| OD-P16 | Envio real da adesão/cancelamento de SNE ao sistema nacional via `SnePort` (`packages/senatran-adapter`)                                                                                                                                                                                                                                  | Nesta rodada grava `portal.sne_enrollment`, publica `SNE_ADESAO_SOLICITADA`/`SNE_CANCELAMENTO_SOLICITADO` e responde `ADERIDO_SNE`/`NAO_ADERIDO_SNE` sem chamar o SNE nacional                                                                              | Architect (R-0014 WP-P6)             | `plan.md` M8                          |
+| OD-P17 | `lgpd_declaracao` delega a `@stynx-nyx/privacy` (`/privacy/exports`); módulo `privacy` do STYNX não montado no app                                                                                                                                                                                                                        | `PORTAL.SERVICE_UNAVAILABLE {unavailableReason:'privacy_endpoint_pendente'}`; catálogo marca `lgpd_declaracao` `partially_available` (só escopo `confirmacao`)                                                                                              | Architect (R-0014)                   | `plan.md` M8, M12                     |
+| OD-P18 | Balcão da ouvidoria: transições do órgão da manifestação (`EM_ANALISE`, `INFORMACAO_SOLICITADA_AO_AGENTE`, `DECISAO_FINAL_ELABORADA`, `CIENCIA_AO_USUARIO`) sem rota cidadã                                                                                                                                                               | Existem só como `MANIFESTATION_TRANSITIONS` e serviço interno testável; a interface do agente é do DASHBOARD                                                                                                                                                | Architect (DASHBOARD R-0011)         | `plan.md` M13                         |
+| OD-P19 | `junta_medica` (delegação PEC sem comando) e projetores `crash_view`/`exam_view` sem produtor real (BOAT/PEC)                                                                                                                                                                                                                             | `junta_medica` fora do catálogo de 15 serviços desta rodada (§5.1 do contrato de rotas continua listando-a com a pendência); `crash_view`/`exam_view` só tabela + projetor esqueleto (`applyEvent` registrando `last_event_id`)                             | Architect (R-0010/PEC)               | `plan.md` M12, M16                    |
+| OD-P20 | 3 dos 15 estados de `inf.infraction_state_ref` sem rótulo cidadão em `INFRACTION_SITUATION_MAP` (`AIT_LAVRADO`, `PENALIDADE_A_APLICAR`, `AGUARDANDO_RECURSO_2A`)                                                                                                                                                                          | Evento com esses `toState` falha o projetor (`last_error='PORTAL.INTERNAL:situation:<toState>'`), nunca rótulo inventado (C-0002-46)                                                                                                                        | Architect / Owner (linguagem cidadã) | `plan.md` M16; CTG-0002 §7.3, §13     |
+| OD-P21 | Operação de leitura nacional ausente na porta (`CdtPort`/`RenachPort`/`RenavamReadPort`, `packages/senatran-adapter/src/ports.ts`)                                                                                                                                                                                                        | Rota responde 503 `PORTAL.NATIONAL_READ_UNAVAILABLE {cachedAt:null, retryAfter}`; nunca `fetch` próprio; `retryAfter` = TTL (minutos) × 60 sem segundos documentados no catálogo de parâmetros                                                              | Architect (R-0014 WP-P6)             | `plan.md` M17; CTG-0002 §15           |
+| OD-P22 | Reconciliar `parameter-catalogue.md` §PORTAL (`portal.act_level_policy`/`portal.govbr_seal_mapping` como parâmetros json) com ADR-0024/M5 (tabela + attribute mapping do IdP) — duas fontes de verdade para a mesma matriz; vocabulário `advanced/simple` × tokens canônicos; intervalo de recarga do `PortalHostnameDirectory` sem fonte | Propor rebaixar as duas entradas do catálogo a documentação (sem consumidor em código) ou removê-las; vocabulário a alinhar; recarga `source_pending`                                                                                                       | Architect / Owner (catálogo é H.54)  | CTG-0001 §13; TASK-0001/0002          |
+| OD-P23 | `portal.subject.cpf_hash` = sha256 sem chave (M6) — espaço de 10^11 CPFs torna o hash reversível por força bruta                                                                                                                                                                                                                          | Fixtures e testes desta rodada usam sha256 puro (M6); propor HMAC-SHA256 com segredo do tenant/app antes de dado real                                                                                                                                       | Architect / DPO (R-0014)             | CTG-0001 §13                          |
+| OD-P24 | Janela do convite de avaliação (`AVALIACAO_OFERECIDA → CONCLUIDO \| ENCERRADA` "janela expira") sem valor na fonte                                                                                                                                                                                                                        | `T-AVAL-CONVITE` é imediato (disparo), não a janela; expiração não é executada nesta rodada (só a resposta do cidadão fecha)                                                                                                                                | Owner                                | CTG-0001 §13                          |
+| OD-P25 | Claim `govbr_level` (selo bruto) e dígito verificador do CPF — nomes/valores reais dependem do attribute mapping do pool (OD-P15)                                                                                                                                                                                                         | Nome fixo `govbr_level`, opcional, sem validação de DV nesta rodada                                                                                                                                                                                         | Architect (homologação R-0014)       | CTG-0001 §13                          |
+| OD-P26 | Conteúdo real da Carta de Serviços (`service_catalog`) e da marca (`brand_profile`) para produção                                                                                                                                                                                                                                         | Textos de `70-fixtures-portal.sql` são fixtures (`"(fixture)"`/`'source_pending'`); carga institucional pelo agency-admin com [REF-DETRANAM-SERVICOS]                                                                                                       | Owner                                | CTG-0001 §13; TASK-0003               |
+| OD-P27 | Ator nominal das rotas públicas do Portal (`PORTAL_PUBLIC_ACTOR_ID`, UUID nulo) e bypass de membership no interceptor de tenancy só para `/v1/portal/*` `@Public()` — o STYNX exige `actorId`/membership no `RequestContext`                                                                                                              | Bypass documentado nesta rodada (A3(b)); pedir ao STYNX suporte nativo a rotas públicas por tenant                                                                                                                                                          | Architect / STYNX                    | TASK-0004; `plan.md` A3(b)            |
+| OD-P28 | Schemas dos eventos consumidos pelas projeções sem produtor em `main` (`NOTIFICACAO_EXPEDIDA`/`NOTIFICACAO_CIENCIA` de `inf/notification`, `PAGAMENTO_CONFIRMADO` de `inf/collection`)                                                                                                                                                    | Types e `data` mínimos propostos ao produtor (CTG-0002 §7.5); `docs/framework/schemas/events/` ganha os três                                                                                                                                                | Architect (R-0007/R-0014)            | CTG-0002 §15                          |
+| OD-P29 | Backfill de `portal.entitlement` quando o sujeito é criado depois dos eventos de infração (primeiro `GET me`)                                                                                                                                                                                                                             | Consultar a projeção `infraction_view` por `cpf_hash` → `entitlement origin='infraction'`                                                                                                                                                                   | Architect                            | CTG-0002 §15                          |
+| OD-P30 | Autenticação oportunista em rota `@Public()` (`POST manifestations`, H.51 "simples para acompanhar") — extensão do guard de auth do app                                                                                                                                                                                                   | Implementada nesta rodada como extensão do STYNX (§2.8); ratificar formalmente com o STYNX junto de OD-P27                                                                                                                                                  | Architect / STYNX                    | CTG-0002 §15; `plan.md` A4(b)         |
+| OD-P31 | Conteúdo versionado de `GET content/points-explainer` (T-15) sem fonte                                                                                                                                                                                                                                                                    | Rota não montada nesta rodada                                                                                                                                                                                                                               | Owner (conteúdo institucional)       | CTG-0002 §15; `plan.md` A4(d)         |
+| OD-P32 | Pré-preenchimento por serviço (`prefilled`, `RN-PORTAL-106`) depende das delegações reais                                                                                                                                                                                                                                                 | Vazio nesta rodada (R-0007 ausente)                                                                                                                                                                                                                         | Architect (R-0014)                   | CTG-0002 §15                          |
+| OD-P33 | Versões esperadas dos textos institucionais (`consequence_ack.text_version`, `sne_enrollment.consent_text_version`, termo de desistência) sem fonte                                                                                                                                                                                       | Qualquer versão não vazia é aceita e gravada nesta rodada                                                                                                                                                                                                   | Owner / DPO                          | CTG-0002 §15                          |
+| OD-P34 | Pontuação por AIT na projeção (`infraction_view.points`) e `disputed_points` reais                                                                                                                                                                                                                                                        | Propor coluna `points` em `BP-PORTAL-PROJECTIONS-001` v1.1 alimentada por `PENALIDADE_DEFINITIVA` e pelo enquadramento                                                                                                                                      | Architect                            | CTG-0002 §15                          |
+| OD-P35 | Mapeamento de `CitizenLicense.license` (opaco no adapter) → campos cidadãos da CNH (status, validade, categorias, restrições)                                                                                                                                                                                                             | Depende do contrato real CDT (senatran-mock)                                                                                                                                                                                                                | Architect (R-0014 WP-P6)             | CTG-0002 §15                          |
+| OD-P36 | Identificador do veículo nas rotas `vehicles/{id}` (uuid de `entitlement` × placa) e forma tipada de `GET vehicles` (`CitizenCollection` opaco)                                                                                                                                                                                           | Sem forma fixada nesta rodada                                                                                                                                                                                                                               | Architect                            | CTG-0002 §15                          |
+| OD-P37 | Validação/recusa da procuração (`PROCURACAO_VALIDADA`/`RECUSADA`) sem rota cidadã; expiração em cascata dos `entitlement` `origin='representation'`                                                                                                                                                                                       | Balcão/DASHBOARD (R-0011) ou automática por documento assinado (`RN-PORTAL-104`); `validateRepresentation` interno, sem rota, responde `VALIDATION_FAILED {fields:['state']}` fora de estado                                                                | Owner / Architect                    | CTG-0002 §15; TASK-0007               |
+| OD-P38 | Substrato de preferências (`@stynx-nyx/preferences`) não montado no app                                                                                                                                                                                                                                                                   | `PUT preferences` responde `SERVICE_UNAVAILABLE` nesta rodada                                                                                                                                                                                               | Architect (R-0014)                   | CTG-0002 §15                          |
+| OD-P39 | Dono (cidadão × órgão) por timer de `inf.infraction_timer_ref` para `deadlines[].ownedBy` sem coluna                                                                                                                                                                                                                                      | Propor coluna `owned_by` no vocabulário (DDL 14, R-0007); `deadlines_json` vem `[]` do projetor nesta rodada                                                                                                                                                | Architect                            | CTG-0002 §15                          |
+| OD-P40 | Produtor de `portal.inbox_item` a partir de `NOTIFICACAO_EXPEDIDA` (sne/portal) e de eventos de processo, e entrega push/`@stynx-nyx/notifications`                                                                                                                                                                                       | Sexto projetor, fora de M16 nesta rodada; SSE `inbox.item` sem produtor até lá                                                                                                                                                                              | Architect (R-0014)                   | CTG-0002 §15; `plan.md` A4(d)         |
+| OD-P41 | `payment_json.tiers`/`refund` a partir da cotação nacional (`cdt.getPaymentQuote`) e do módulo de arrecadação; `evidenceAvailable` (`ops/evidence`)                                                                                                                                                                                       | `amount=null` (framing sem valor numérico) nesta rodada                                                                                                                                                                                                     | Architect (R-0007/R-0014)            | CTG-0002 §15; TASK-0008               |
+| OD-P42 | Anexos: armazenamento assinado (ADR-0018) e limites de `ATTACHMENT_INVALID` (tipos, `maxBytes`) sem fonte                                                                                                                                                                                                                                 | Sem implementação de upload real nesta rodada                                                                                                                                                                                                               | Architect / Owner                    | CTG-0002 §15                          |
+| OD-P43 | Vocabulário de `decisionKind`/`addressee` do RAIT → `outcome` cidadão (`deferido\|indeferido\|…`) e diligências                                                                                                                                                                                                                           | Fixado por R-0007                                                                                                                                                                                                                                           | Architect (R-0007)                   | CTG-0002 §15                          |
+| OD-P44 | Acompanhamento de manifestação anônima por protocolo sem sessão (H.51 "simples para acompanhar" × anônimo)                                                                                                                                                                                                                                | Rota `GET manifestations/by-protocol/{protocol}`? não implementada nesta rodada                                                                                                                                                                             | Owner                                | CTG-0002 §15                          |
+| OD-P45 | Limites de conexão do SSE (1/aba, 5/usuário → 429 `PORTAL.RATE_LIMITED`)                                                                                                                                                                                                                                                                  | Contagem não implementada nesta rodada                                                                                                                                                                                                                      | Architect                            | CTG-0002 §15                          |
+| OD-P46 | `verify:parameter-catalogue --check-usage` acusava chaves i18n do Portal (`portal.requests.nextAction.<STATE>`, `portal.evaluations.publicIndicator`) nos clientes gerados como candidatas a parâmetro — colisão heurística (prefixo `portal.` + ≥2 pontos) × chave i18n                                                                  | Excluída **só** `packages/api-clients/src/generated` da varredura de uso (A7, `parameter-catalogue.md` §Verificador fail-closed); prefixo ou allowlist declarada para chaves i18n quando `i18n/portal.pt-BR.json` entrar em código fica para decisão futura | Architect (R-0014)                   | `plan.md` A7                          |

 ## 5. Mapa entregável → definições

diff --git a/docs/meta/adr/ADR-0019-citizen-identity-and-request-lifecycle.md b/docs/meta/adr/ADR-0019-citizen-identity-and-request-lifecycle.md
index 464632d..5d2e400 100644
--- a/docs/meta/adr/ADR-0019-citizen-identity-and-request-lifecycle.md
+++ b/docs/meta/adr/ADR-0019-citizen-identity-and-request-lifecycle.md
@@ -6,6 +6,17 @@ Accepted on 2026-09-13 by Owner decision (steering G.37), on the Architect's pro
 line of `BUILD-PLAN.md` (`domains/portal`, gov.br federation) and the model of `APP-PORTAL`
 ("orchestrator of a shop window, never a system of record").

+Implementação: PR #54 (R-0009, CTG-0001, 2026-09-16) — identity, model and fixtures
+(`BP-PORTAL-IDENTITY-001`, `BP-PORTAL-REQUESTS-001`, `BP-PORTAL-INBOX-001`,
+`BP-PORTAL-CITIZEN-SERVICE-001`, `BP-PORTAL-PROJECTIONS-001`; ADR-0024 realises point 1); PR #56
+(CTG-0002, routes, delegation, projections, `portal:*` policy, contracts). The eight-state graph
+sketched in §2 above is superseded by the fixed 13-state `[WF-PORTAL-001]` machine (OD-P13,
+closed; `work/rounds/R-0009/contracts/CTG-0001.md` §6). Real delegation of `defesa_previa`,
+`recurso_jari`, `recurso_cetran`, `indicacao_condutor` and `pagamento` stays out until R-0007
+merges to `main` (`PORTAL.SERVICE_UNAVAILABLE`, `portal-build-pack.md` §3); real SNE enrolment,
+the privacy endpoint, signed CNH-e/CRLV-e and `junta_medica` are R-0014/R-0010 (`portal-build-pack.md`
+§4, OD-P16/P17/P19).
+
 ## Context

 The PORTAL corpus is complete at product level (four workflows, 20 use cases, 28 rules, 27
diff --git a/docs/meta/knowledge-base/backlog.md b/docs/meta/knowledge-base/backlog.md
index b64fdfe..af7d2d7 100644
--- a/docs/meta/knowledge-base/backlog.md
+++ b/docs/meta/knowledge-base/backlog.md
@@ -87,6 +87,27 @@ Formato: `- [ ] <pergunta ou id> — <por quê> (added YYYY-MM-DD)`
       parâmetros para a constante que a origem usa sem fonte normativa — OD-T14
 - [ ] teat: **`batches/{id}/retransmit` e `GET certificates`** (route contract §4.6) ficam fora por falta de
       entidade de lote de integração em `ops` e de fonte para validade mTLS — OD-T43
+- [ ] portal/rait: **R-0007 `rait-backend` precisa mesclar em `main` para as delegações reais do Portal**
+      (`defesa_previa`, `recurso_jari`, `recurso_cetran`, `indicacao_condutor`, `pagamento`): até lá
+      `POST requests` responde `PORTAL.SERVICE_UNAVAILABLE {unavailableReason:'delegacao_indisponivel_r0007'}`
+      na verificação de elegibilidade e o teste de delegação real com alvo real fica `it.todo` citando
+      R-0007 (`work/rounds/R-0009/plan.md` M8/M23; `portal-build-pack.md` §3)
+- [ ] portal: **adesão/cancelamento reais de SNE via `SnePort`** (`packages/senatran-adapter`) não
+      implementados em R-0009: `portal.sne_enrollment` grava o pedido e publica
+      `SNE_ADESAO_SOLICITADA`/`SNE_CANCELAMENTO_SOLICITADO` sem chamar o SNE nacional — OD-P16 (R-0014 WP-P6)
+- [ ] portal: **`lgpd_declaracao` (escopo `declaracao_completa`/`correcao`/`eliminacao`) depende do módulo
+      `@stynx-nyx/privacy` não montado no app**: rota responde `SERVICE_UNAVAILABLE` com
+      `unavailableReason:'privacy_endpoint_pendente'`; catálogo marca o serviço `partially_available`
+      (só `confirmacao`) — OD-P17 (R-0014)
+- [ ] portal: **`junta_medica` fora do catálogo de 15 serviços** (delegação PEC sem comando) e projetores
+      `crash_view`/`exam_view` só com tabela + esqueleto (`applyEvent` registrando `last_event_id`, sem
+      produtor real) — OD-P19 (R-0010/PEC)
+- [ ] portal: **3 dos 15 estados de `inf.infraction_state_ref` sem rótulo cidadão** em
+      `INFRACTION_SITUATION_MAP` (`AIT_LAVRADO`, `PENALIDADE_A_APLICAR`, `AGUARDANDO_RECURSO_2A`): evento
+      com esses estados falha o projetor (`last_error`), nunca rótulo inventado — OD-P20 (linguagem cidadã,
+      LEGAL/Owner)
+- [ ] portal: **CNH-e/CRLV-e assinados e credenciais institucionais do IdP gov.br real** ficam para R-0014
+      WP-P6 (OD-P15, ADR-0018); nesta rodada só IdP simulado nos perfis `test`/`local`

 ## Rodada RAIT — time multidisciplinar (2026-08-24)

@@ -415,6 +436,12 @@ citação de regras fechada em cinco dos seis apps (RAIT em 32/43 — ver abaixo
       `portal-build-pack.md` (WP-P0…P6; 13 questões OD-P01…P13)
 - [ ] **Reconciliar `use-cases/INDEX.md` do PORTAL** (marca todos como `draft`; arquivos são `approved`/`reviewed`)
       e registrar uma RN dedicada ao ato de adesão ao SNE (UC-PORTAL-007 cita "backlog BPO/LEGAL") (added 2026-09-13)
+- [x] **`portal-backend` R-0009 (2026-09-16, PR #54/#56)**: WP-P0…P3 — ADR-0024 (gov.br via Cognito);
+      cinco pacotes `@detran/portal-{identity,requests,inbox,citizen-service,projections}` (DDL
+      19/61…65/14/11); rotas `/v1/portal/*`, projeções (ADR-0020), SSE, política `portal:*`; contratos
+      `BP-PORTAL-*.commands.openapi.json` (138 operações). OD-P02 e OD-P13 fechadas (ver
+      `decision-closure-plan.md` §PORTAL); OD-P14…P46 abertas na implementação
+      (`portal-build-pack.md` §4)
 - [x] **Pacote BOAT (2026-09-13)**: `boat-frontends.md`, `boat-route-contract.md`, `boat-error-catalog.md`,
       `boat-build-pack.md` (WP-B0…B5; 13 questões OD-B01…B13)
 - [ ] **BOAT — reconciliar `policy.ts` (`est:crash-record:*`) com o corpus e criar UC-BOAT-013** (dever de
diff --git a/docs/meta/knowledge-base/decision-closure-plan.md b/docs/meta/knowledge-base/decision-closure-plan.md
index 12005dc..b3cda1f 100644
--- a/docs/meta/knowledge-base/decision-closure-plan.md
+++ b/docs/meta/knowledge-base/decision-closure-plan.md
@@ -95,13 +95,15 @@ admitindo selo prata, parecer jurídico único).

 ### PORTAL

-| Item(s)                | Via | Ponte C                                                | Saída                               |
-| ---------------------- | --- | ------------------------------------------------------ | ----------------------------------- |
-| OD-P01, OD-P02         | A   | `portal.act_level_policy` vigente                      | capturado; revisar OD-P02 (só ouro) |
-| OD-P06, OD-P10         | B   | `portal.ombudsman_level`, taxonomia                    | cédula 06                           |
-| OD-P03, OD-P05, OD-P07 | C   | flags                                                  | fechados por DT-026/031/066         |
-| OD-P04, OD-P08, OD-P09 | B   | `privacy.public_regime_days` pendente                  | parecer LEGAL (DT-042)              |
-| OD-P11, OD-P12, OD-P13 | C   | `portal.read_cache_ttl_minutes`, `portal.mobile_shell` | Architect em WP-P1                  |
+| Item(s)                | Via | Ponte C                                                | Saída                                                                                                                                               |
+| ---------------------- | --- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
+| OD-P01                 | A   | `portal.act_level_policy` vigente                      | capturado; resta CETRAN-AM/ouvidoria                                                                                                                |
+| OD-P02                 | A   | `portal.act_level_policy` vigente                      | **fechada** por H.50 (Owner, R-0009): prata ou ouro = avançada; risco (PN 001/2025 só nomeia ouro) registrado em ADR-0024 §Decisão 2/§Consequências |
+| OD-P06, OD-P10         | B   | `portal.ombudsman_level`, taxonomia                    | cédula 06                                                                                                                                           |
+| OD-P03, OD-P05, OD-P07 | C   | flags                                                  | fechados por DT-026/031/066                                                                                                                         |
+| OD-P04, OD-P08, OD-P09 | B   | `privacy.public_regime_days` pendente                  | parecer LEGAL (DT-042)                                                                                                                              |
+| OD-P11, OD-P12         | C   | `portal.read_cache_ttl_minutes`, `portal.mobile_shell` | Architect em WP-P1                                                                                                                                  |
+| OD-P13                 | C   | —                                                      | **fechada** (R-0009, M7): `@stynx-nyx/flow` avaliado e descartado; máquina fixa de 13 estados em código                                             |

 ### BOAT
```
