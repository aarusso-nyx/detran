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

**Primeiro ciclo (exaustivo) da entrega do grupo CTG-0005 (fechamento documental da rodada)** —
TASK-0012 (Architect/transcrição, Codex: it. 1 Luna insuficiente → it. 2 **Terra/alto**, A25):
`docs/framework/arch/portal-build-pack.md` (§2 WP-P4/P5/P6 "Executado em R-0014"; §4 subseção
R-0014 com **64 linhas** OD-P47…P108, uma por OD, com fonte), `portal-frontends.md` §9/§10,
`parameter-catalogue.md` (OD-P66: `portal.attachment.max_size_mb` int 10 e
`portal.attachment.accepted_types` json `["application/pdf","image/jpeg","image/png"]`, status
`proposta`, fonte spec §7/A6(e)) + gerados regenerados pelo maestro (`pnpm parameters:generate`:
`05-parameters.sql`, `parameter-catalogue.ts`, `parameter-flags.ts`) + linha OD-P66 no
`decision-closure-plan.md` (o verificador exige a referência de decisão na base de conhecimento),
`docs/meta/agents/orchestra/README.md` (§4.17/§4.18 atualizados; §10 entrada R-0014),
`waves.md` §Histórico, `model-ladder.md` (ids Codex), `engineer-frontend.md` (padrão de app
fixado por R-0014; R-0012 copia), `docs/meta/knowledge-base/backlog.md` (15 itens), fichas
`IU-PORTAL-T10…T18` (chaves i18n inexistentes → chaves reais; `{{source}}` → `{source}`),
`work/rounds/R-0014/contracts/CTG-0003c.md` (A12(j): §3.8 sem degrau `access`; C-3c-116;
nota C-3c-78), `work/rounds/R-0014/closure.md` (rascunho do relatório final, 110 linhas).
Relatórios: `reports/TASK-0012.md`, `TASK-0012-iteration-2.md`. Decisões: `plan.md` A25 e
§Retomada checkpoint 8. Nenhum código, teste ou blueprint muda neste CTG (só docs, fichas,
contrato do par 3, catálogo + gerados por script).

Gates executados pelo maestro: `node tools/docs/kb/check.mjs` → OK (549 artifacts, 446 canonical tokens); `pnpm docs:kb:publish-check`
→ OK (201 files); `pnpm verify:parameter-catalogue` → OK (89 entradas, 18 flags, 14 namespaces, 0 erros);
`pnpm format:check` → OK; `pnpm check` → todos os passos verdes exceto `format:check` sobre este próprio prompt (criado durante a execução; formatado em seguida) — `pnpm check` será repetido antes do commit.

Itens a julgar com atenção: (5) transcrição, não decisão — cada linha OD com fonte (adenda/contrato/
relatório) e premissa idêntica à registrada; nenhum valor novo (as duas linhas de OD-P66 são as
de A25(b), `proposta`, com valores da spec §7/`upload_hint`); (10) OD já fechadas marcadas como
tal (OD-P35/P36/P91 pelo CTG-0004; OD-P46; OD-P89 estendida); (11) os dez entregáveis de
`prompts/TASK-0012-iteration-2.md` presentes; fichas: nenhuma chave citada ausente do catálogo;
(8) vocabulário do método (§4.17/§4.18/§10) coerente com `plan.md`; (13) N/A.

### git diff --stat

```
 backend/app/src/generated/parameter-flags.ts                       |  4 +-
 backend/database/seed/05-parameters.sql                            |  4 +-
 backend/domains/ops/parameter/src/generated/parameter-catalogue.ts | 90 ++++++++++++++++++++++++------------
 docs/framework/arch/parameter-catalogue.md                         | 28 +++++------
 docs/framework/arch/portal-build-pack.md                           | 89 ++++++++++++++++++++++++++++++++++-
 docs/framework/arch/portal-frontends.md                            | 23 ++++++---
 docs/framework/product/transversal/portal/screens/IU-PORTAL-T10.md | 16 +++----
 docs/framework/product/transversal/portal/screens/IU-PORTAL-T11.md |  2 +-
 docs/framework/product/transversal/portal/screens/IU-PORTAL-T12.md | 18 ++++----
 docs/framework/product/transversal/portal/screens/IU-PORTAL-T13.md | 16 +++----
 docs/framework/product/transversal/portal/screens/IU-PORTAL-T14.md | 16 +++----
 docs/framework/product/transversal/portal/screens/IU-PORTAL-T15.md | 16 +++----
 docs/framework/product/transversal/portal/screens/IU-PORTAL-T16.md |  2 +-
 docs/framework/product/transversal/portal/screens/IU-PORTAL-T17.md |  2 +-
 docs/framework/product/transversal/portal/screens/IU-PORTAL-T18.md |  2 +-
 docs/meta/agents/engineer-frontend.md                              | 19 ++++++++
 docs/meta/agents/orchestra/README.md                               | 52 +++++++++++++++++++--
 docs/meta/agents/orchestra/model-ladder.md                         |  2 +-
 docs/meta/agents/orchestra/waves.md                                |  2 +-
 docs/meta/knowledge-base/backlog.md                                | 15 ++++++
 docs/meta/knowledge-base/decision-closure-plan.md                  | 21 +++++----
 work/rounds/R-0014/compositions.json                               |  4 +-
 work/rounds/R-0014/contracts/CTG-0003c.md                          |  5 +-
 work/rounds/R-0014/plan.md                                         | 13 ++++++
 work/rounds/R-0014/prompts/TASK-0012.md                            | 20 ++++----
 work/rounds/R-0014/tasks/TASK-0012.json                            |  6 +--
 26 files changed, 357 insertions(+), 130 deletions(-)
```

### git diff — docs, catálogo, KB, contrato, fichas (sem `work/rounds/R-0014/reports`; sem os gerados — regenerados por script)

````diff
diff --git a/docs/framework/arch/parameter-catalogue.md b/docs/framework/arch/parameter-catalogue.md
index 1d1c6e78..92c89b2a 100644
--- a/docs/framework/arch/parameter-catalogue.md
+++ b/docs/framework/arch/parameter-catalogue.md
@@ -76,19 +76,21 @@ registro em `open-decisions-rait.md`, nos §4 dos build packs ou em `open-issues

 ## PORTAL (`portal.*`, `privacy.*`)

-| Chave                           | Tipo | Default                                                                                                                           | Status   | pend.   | legal | Decisão                                                          | Consumidor           |
-| ------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------------------------------------------------------------- | -------------------- |
-| `portal.act_level_policy`       | json | defesa/recurso/indicação/procuração = `advanced` (gov.br ouro, e-Notariado, qualificada); consulta = `simple`; ouvidoria = `none` | vigente  | não     | não   | OD-P01, OD-P02, [REF-DETRANAM-PORTARIA-NORMATIVA-001-2025], H.50 | gates de serviço     |
-| `portal.govbr_seal_mapping`     | json | ouro **e prata** = advanced; bronze = insuficiente (decisão H.50, contra a PN 001/2025 — portaria pedida)                         | vigente  | não     | não   | OD-P02, H.50                                                     | idem                 |
-| `portal.cetran_appeal_level`    | enum | `advanced`                                                                                                                        | vigente  | não     | não   | OD-P01 residual, H.54                                            | recurso 2ª instância |
-| `portal.ombudsman_level`        | enum | `none` (anônimo) / `simple` para acompanhar                                                                                       | vigente  | não     | não   | OD-P06, DT-051, H.54                                             | ouvidoria            |
-| `portal.card_payment`           | F    | false                                                                                                                             | proposta | não     | não   | OD-P05/DT-031, DT-072                                            | pagamento            |
-| `portal.installments`           | F    | false                                                                                                                             | proposta | não     | não   | OD-P05/DT-031, DT-072                                            | idem                 |
-| `portal.waiver_40_term`         | F    | false                                                                                                                             | proposta | não     | não   | OD-P03/DT-026, OD-003                                            | termo de renúncia    |
-| `privacy.public_regime_days`    | dias | —                                                                                                                                 | proposta | **sim** | não   | OD-P08                                                           | resposta ao titular  |
-| `portal.read_cache_ttl_minutes` | int  | 15                                                                                                                                | vigente  | não     | não   | OD-P11, H.54                                                     | leituras nacionais   |
-| `portal.mobile_shell`           | F    | false                                                                                                                             | vigente  | não     | não   | OD-P12                                                           | `apps/portal/mobile` |
-| `portal.ombudsman_taxonomy`     | json | inclui "solicitação"                                                                                                              | vigente  | não     | não   | OD-P10, H.54                                                     | ouvidoria            |
+| Chave                              | Tipo | Default                                                                                                                           | Status   | pend.   | legal | Decisão                                                          | Consumidor                                                                                  |
+| ---------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
+| `portal.act_level_policy`          | json | defesa/recurso/indicação/procuração = `advanced` (gov.br ouro, e-Notariado, qualificada); consulta = `simple`; ouvidoria = `none` | vigente  | não     | não   | OD-P01, OD-P02, [REF-DETRANAM-PORTARIA-NORMATIVA-001-2025], H.50 | gates de serviço                                                                            |
+| `portal.govbr_seal_mapping`        | json | ouro **e prata** = advanced; bronze = insuficiente (decisão H.50, contra a PN 001/2025 — portaria pedida)                         | vigente  | não     | não   | OD-P02, H.50                                                     | idem                                                                                        |
+| `portal.cetran_appeal_level`       | enum | `advanced`                                                                                                                        | vigente  | não     | não   | OD-P01 residual, H.54                                            | recurso 2ª instância                                                                        |
+| `portal.ombudsman_level`           | enum | `none` (anônimo) / `simple` para acompanhar                                                                                       | vigente  | não     | não   | OD-P06, DT-051, H.54                                             | ouvidoria                                                                                   |
+| `portal.card_payment`              | F    | false                                                                                                                             | proposta | não     | não   | OD-P05/DT-031, DT-072                                            | pagamento                                                                                   |
+| `portal.installments`              | F    | false                                                                                                                             | proposta | não     | não   | OD-P05/DT-031, DT-072                                            | idem                                                                                        |
+| `portal.waiver_40_term`            | F    | false                                                                                                                             | proposta | não     | não   | OD-P03/DT-026, OD-003                                            | termo de renúncia                                                                           |
+| `privacy.public_regime_days`       | dias | —                                                                                                                                 | proposta | **sim** | não   | OD-P08                                                           | resposta ao titular                                                                         |
+| `portal.read_cache_ttl_minutes`    | int  | 15                                                                                                                                | vigente  | não     | não   | OD-P11, H.54                                                     | leituras nacionais                                                                          |
+| `portal.mobile_shell`              | F    | false                                                                                                                             | vigente  | não     | não   | OD-P12                                                           | `apps/portal/mobile`                                                                        |
+| `portal.ombudsman_taxonomy`        | json | inclui "solicitação"                                                                                                              | vigente  | não     | não   | OD-P10, H.54                                                     | ouvidoria                                                                                   |
+| `portal.attachment.max_size_mb`    | int  | 10                                                                                                                                | proposta | não     | não   | OD-P66, spec §7, A6(e)                                           | upload de anexos (o app usa `ATTACHMENT_MAX_BYTES`/`accept` fixos até o parâmetro ser lido) |
+| `portal.attachment.accepted_types` | json | `["application/pdf","image/jpeg","image/png"]`                                                                                    | proposta | não     | não   | OD-P66, spec §7, A6(e)                                           | upload de anexos (o app usa `ATTACHMENT_MAX_BYTES`/`accept` fixos até o parâmetro ser lido) |

 ## BOAT (`est.*`)

diff --git a/docs/framework/arch/portal-build-pack.md b/docs/framework/arch/portal-build-pack.md
index 01c4f52d..06e2044b 100644
--- a/docs/framework/arch/portal-build-pack.md
+++ b/docs/framework/arch/portal-build-pack.md
@@ -127,6 +127,12 @@ estados internos (RAIT/PEC/BOAT/infração → situação cidadã) como tabela
 versionados (consequências, quatro efeitos do SNE, renúncia 40%). Gate: `docs:kb:check`, teste que
 cada tela tem ficha e rota, revisão do Owner (linguagem cidadã).

+**Executado em R-0014.** Rodada R-0014; PRs #60…#65 (`1396f1a`, `2888c9b`, `ddca527`,
+`d2412558`, `4c3be453`, `11d939f6`); evidências generic sequence 1…6. Entregues fichas, mapa
+de tradução, i18n e schemas. B1/M3 substitui Lighthouse por `axe-core` por rota em TestBed;
+delegações ficam `delegacao_indisponivel_r0007` até R-0007; OD-P15/P16/P17/P19/P88 seguem
+`source_pending`; SNE foi provado pelo mock, não por homologação real.
+
 ### WP-P5 — PWA (Engineer-frontend)

 `apps/portal/web` (Angular 22, `@detran/ui` para primitivos, shell próprio, PWA com cache cifrado
@@ -135,12 +141,24 @@ disponibilidade; `ResumeService`; a11y AA + eMAG com auditoria automática por r
 roteamento por nível e vínculo, TestBed dos compartilhados, Lighthouse PWA e a11y ≥ 90 em CI,
 `ng build`, `pnpm check`.

+**Executado em R-0014.** Rodada R-0014; PRs #60…#65 (`1396f1a`, `2888c9b`, `ddca527`,
+`d2412558`, `4c3be453`, `11d939f6`); evidências generic sequence 1…6. Entregues Angular,
+38 rotas, guardas, PWA/offline, SSE e push. B1/M3 mantém `axe-core` por rota em TestBed no lugar
+de Lighthouse; delegações ficam `delegacao_indisponivel_r0007` até R-0007 e OD-P15/P16/P17/P19/P88
+permanecem `source_pending`; SNE é mock, não homologação real.
+
 ### WP-P6 — Integração e homologação (Engineer; Inspector)

 Adesão SNE real (mock → homologação), cotação/reconhecimento via `CdtPort`, CNH-e/CRLV-e reais,
 push web, e2e das 11 jornadas com as fixtures; teste de que nenhum token interno aparece em
 nenhuma resposta `/v1/portal/*` (lint de payload contra o vocabulário dos workflows).

+**Executado em R-0014.** Rodada R-0014; PRs #60…#65 (`1396f1a`, `2888c9b`, `ddca527`,
+`d2412558`, `4c3be453`, `11d939f6`); evidências generic sequence 1…6. Entregues 11 jornadas,
+lint de payload e CNH-e/veículos/quitação no `senatran-mock`. Fora: homologação real de SNE e
+provedores de OD-P15/P16/P17/P19/P88; delegações ficam `delegacao_indisponivel_r0007` até R-0007.
+B1/M3 mantém `axe-core` por rota em TestBed, não Lighthouse.
+
 ## 3. Ordem e paralelismo

 ```text
@@ -207,8 +225,8 @@ dos contratos `work/rounds/R-0009/contracts/CTG-000{1,2}.md`; nenhuma é fechada
 | OD-P32 | Pré-preenchimento por serviço (`prefilled`, `RN-PORTAL-106`) depende das delegações reais                                                                                                                                                                                                                                                 | Vazio nesta rodada (R-0007 ausente)                                                                                                                                                                                             | Architect (R-0014)                   | CTG-0002 §15                          |
 | OD-P33 | Versões esperadas dos textos institucionais (`consequence_ack.text_version`, `sne_enrollment.consent_text_version`, termo de desistência) sem fonte                                                                                                                                                                                       | Qualquer versão não vazia é aceita e gravada nesta rodada                                                                                                                                                                       | Owner / DPO                          | CTG-0002 §15                          |
 | OD-P34 | Pontuação por AIT na projeção (`infraction_view.points`) e `disputed_points` reais                                                                                                                                                                                                                                                        | Propor coluna `points` em `BP-PORTAL-PROJECTIONS-001` v1.1 alimentada por `PENALIDADE_DEFINITIVA` e pelo enquadramento                                                                                                          | Architect                            | CTG-0002 §15                          |
-| OD-P35 | Mapeamento de `CitizenLicense.license` (opaco no adapter) → campos cidadãos da CNH (status, validade, categorias, restrições)                                                                                                                                                                                                             | Depende do contrato real CDT (senatran-mock)                                                                                                                                                                                    | Architect (R-0014 WP-P6)             | CTG-0002 §15                          |
-| OD-P36 | Identificador do veículo nas rotas `vehicles/{id}` (uuid de `entitlement` × placa) e forma tipada de `GET vehicles` (`CitizenCollection` opaco)                                                                                                                                                                                           | Sem forma fixada nesta rodada                                                                                                                                                                                                   | Architect                            | CTG-0002 §15                          |
+| OD-P35 | Mapeamento de `CitizenLicense.license` (opaco no adapter) → campos cidadãos da CNH (status, validade, categorias, restrições)                                                                                                                                                                                                             | **Fechada em R-0014**: CTG-0004 §3 mapeia a fonte CDT/mock, inclusive A/V/S/C e restrição por texto.                                                                                                                            | Architect (fechada, R-0014)          | CTG-0004 §3; `plan.md` A14(d)         |
+| OD-P36 | Identificador do veículo nas rotas `vehicles/{id}` (uuid de `entitlement` × placa) e forma tipada de `GET vehicles` (`CitizenCollection` opaco)                                                                                                                                                                                           | **Fechada em R-0014**: CTG-0004 §3 fixa UUIDv5 do chassi, placa/modelo e proíbe RENAVAM como fallback.                                                                                                                          | Architect (fechada, R-0014)          | CTG-0004 §3; `plan.md` A14(d)         |
 | OD-P37 | Validação/recusa da procuração (`PROCURACAO_VALIDADA`/`RECUSADA`) sem rota cidadã; expiração em cascata dos `entitlement` `origin='representation'`                                                                                                                                                                                       | Balcão/DASHBOARD (R-0011) ou automática por documento assinado (`RN-PORTAL-104`); `validateRepresentation` interno, sem rota, responde `VALIDATION_FAILED {fields:['state']}` fora de estado                                    | Owner / Architect                    | CTG-0002 §15; TASK-0007               |
 | OD-P38 | Substrato de preferências (`@stynx-nyx/preferences`) não montado no app                                                                                                                                                                                                                                                                   | `PUT preferences` responde `SERVICE_UNAVAILABLE` nesta rodada                                                                                                                                                                   | Architect (R-0014)                   | CTG-0002 §15                          |
 | OD-P39 | Dono (cidadão × órgão) por timer de `inf.infraction_timer_ref` para `deadlines[].ownedBy` sem coluna                                                                                                                                                                                                                                      | Propor coluna `owned_by` no vocabulário (DDL 14, R-0007); `deadlines_json` vem `[]` do projetor nesta rodada                                                                                                                    | Architect                            | CTG-0002 §15                          |
@@ -220,6 +238,73 @@ dos contratos `work/rounds/R-0009/contracts/CTG-000{1,2}.md`; nenhuma é fechada
 | OD-P45 | Limites de conexão do SSE (1/aba, 5/usuário → 429 `PORTAL.RATE_LIMITED`)                                                                                                                                                                                                                                                                  | Contagem não implementada nesta rodada                                                                                                                                                                                          | Architect                            | CTG-0002 §15                          |
 | OD-P46 | `verify:parameter-catalogue --check-usage` acusava chaves i18n do Portal (`portal.requests.nextAction.<STATE>`, `portal.evaluations.publicIndicator`) nos clientes gerados como candidatas a parâmetro — colisão heurística (prefixo `portal.` + ≥2 pontos) × chave i18n                                                                  | **Resolvida em R-0014** (Owner, 2026-09-17; `plan.md` M10): allowlist de namespaces i18n declarada em `parameter-catalogue.md` §Namespaces i18n e lida por `verify.mjs`; exclusão por diretório (A7) removida                   | Owner (fechada, R-0014)              | `plan.md` A7                          |

+### Questões levantadas na implementação (R-0014, OD-P47…P108)
+
+| ID      | Questão                            | Premissa adotada                                                                             | Dono                            | Fonte                                   |
+| ------- | ---------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------- |
+| OD-P47  | Logotipo ausente de `GET brand`.   | Sem `logoUrl`; usa contrato.                                                                 | Owner + Architect-backend       | `plan.md` A1                            |
+| OD-P48  | Representação ativa.               | `null`; apenas lista.                                                                        | Architect                       | `plan.md` A1                            |
+| OD-P49  | Link de atendimento presencial.    | `source_pending`.                                                                            | Owner + Architect               | `plan.md` A1                            |
+| OD-P50  | Falha do catálogo de serviços.     | Erro recuperável, entrada gov.br preservada.                                                 | Architect                       | `plan.md` A1; CTG-0003c C-3c-69         |
+| OD-P51  | Cache offline estático.            | Sem `dataGroup`; store cifrado por `sid`.                                                    | Architect                       | `plan.md` A3(a)                         |
+| OD-P52  | Nível de T-08.                     | Ficha segue `simples`; decisão pendente.                                                     | Owner/LEGAL                     | `plan.md` §OD TASK-0004                 |
+| OD-P53  | Nível de T-09.                     | Contrato seguido; conflito permanece.                                                        | Owner/LEGAL                     | `plan.md` §OD TASK-0004                 |
+| OD-P54  | Offline operacional.               | Bateria/autenticação `source_pending`.                                                       | Architect                       | `plan.md` §OD TASK-0004                 |
+| OD-P55  | Catálogo e nome de cancelamento.   | 15 serviços; nome cidadão pendente.                                                          | Owner + Architect               | `plan.md` A4                            |
+| OD-P56  | `badge_of` de pedido.              | Sem correspondência, `null`.                                                                 | Owner                           | `plan.md` §OD TASK-0006                 |
+| OD-P57  | Endereço/horário presencial.       | `source_pending`.                                                                            | Owner + Architect-backend       | CTG-0003a §10                           |
+| OD-P58  | Chaves do par 1.                   | Lista fechada aplicada.                                                                      | Owner + transcriber             | `plan.md` A6(d); CTG-0003a §10          |
+| OD-P59  | Formas 2xx ausentes.               | `source_pending`; indisponível, nunca simula.                                                | Architect-backend               | `plan.md` A6(f); CTG-0003a §10          |
+| OD-P60  | `signatureRef` gov.br.             | Não usar sem fonte.                                                                          | Architect-backend + LEGAL       | CTG-0003a §10                           |
+| OD-P61  | Enum `effectsAck` × textos legais. | Fio atual mantido; alinhamento legal pendente.                                               | Owner/LEGAL + Architect-backend | CTG-0003a §10; `plan.md` A24            |
+| OD-P62  | Validação por campo.               | Só mensagem genérica.                                                                        | Owner                           | CTG-0003a §10                           |
+| OD-P63  | `actions[].reason`.                | Token em `data-*`; catálogo pendente.                                                        | Architect-backend + transcriber | CTG-0003a §10                           |
+| OD-P64  | `daysLeft`/`deadlines.kind`.       | Sem cálculo no cliente.                                                                      | Architect                       | CTG-0003a §10                           |
+| OD-P65  | Escala de avaliação.               | Nenhuma escala inventada.                                                                    | Owner                           | CTG-0003a §10                           |
+| OD-P66  | Limite e tipos de anexo.           | 10 MiB/tipos da spec; parâmetros `proposta`.                                                 | Maestro + transcriber           | `plan.md` A6(e), A25(b)                 |
+| OD-P67  | Nível de diligência.               | `simples` no manifesto; conflito aberto.                                                     | Owner/LEGAL                     | CTG-0003a §10                           |
+| OD-P68  | Rótulos de aviso/ack/upload.       | Chaves aplicadas.                                                                            | Owner + transcriber             | `plan.md` A7(e), A8(a)                  |
+| OD-P69  | Schemas de AIT/pedido.             | Objetos livres `source_pending`.                                                             | Architect-backend               | CTG-0003b §10                           |
+| OD-P70  | Chaves do par 2/fichas.            | Chaves aplicadas; fichas corrigidas no CTG-0005.                                             | Owner + transcriber             | `plan.md` A8; CTG-0003b §10             |
+| OD-P71  | Dono da timeline.                  | Campo/mapa canônico pendente.                                                                | Architect-backend + transcriber | CTG-0003b §10                           |
+| OD-P72  | Formas de pedido/diligência.       | Tipos `source_pending`.                                                                      | Architect-backend               | CTG-0003b §10                           |
+| OD-P73  | `targetId` de caso.                | `externalId`; nulo dá canal presencial.                                                      | Architect-backend               | CTG-0003b §10                           |
+| OD-P74  | Meios/tiers de pagamento.          | Servidor prevalece; flags são fallback.                                                      | Architect-backend + maestro     | `plan.md` A10(a); CTG-0003b §10         |
+| OD-P75  | Guia acessível persistente.        | Campo ausente de preferências.                                                               | Owner + Architect-backend       | CTG-0003b §10                           |
+| OD-P76  | Prorrogação de diligência.         | Sem comando/regra, não implementada.                                                         | Owner/LEGAL + Architect-backend | CTG-0003b §10                           |
+| OD-P77  | Desistência pautada.               | Aguardar sinal e orientação.                                                                 | Owner + Architect-backend       | CTG-0003b §10                           |
+| OD-P78  | Filtro e pontos de autos.          | Filtro servidor; formas livres não renderizadas.                                             | Transcriber + Architect-backend | CTG-0003b §10                           |
+| OD-P79  | Abandono de composição.            | Sem `canDeactivate`.                                                                         | Owner                           | CTG-0003b §10                           |
+| OD-P80  | Percentuais de pagamento.          | Textos aguardam linguagem cidadã.                                                            | Owner                           | CTG-0003b §10                           |
+| OD-P81  | `consequenceAck`.                  | Diálogo antes de salvar; origem pendente.                                                    | Architect-backend               | `plan.md` A10(c); CTG-0003b §10         |
+| OD-P82  | Chaves pré-preenchidas.            | Mapa vazio até fonte.                                                                        | Architect-backend + transcriber | CTG-0003b §10                           |
+| OD-P83  | Limite de tabela STYNX.            | Listas semânticas; extensão pendente.                                                        | Architect + R-0012              | `plan.md` A9(b)                         |
+| OD-P84  | Rótulo de filtro vazio.            | Sem `[value]` sem filtro.                                                                    | Owner                           | `plan.md` A9(h)                         |
+| OD-P85  | Enum CNH.                          | Listas públicas aguardam enum.                                                               | Architect-backend               | `plan.md` A9(h)                         |
+| OD-P86  | `aria-describedby`.                | Diretiva preserva referência alheia.                                                         | Architect                       | `plan.md` A9(h)                         |
+| OD-P87  | `If-Match` de preferências.        | Sem ETag/version; apresentar 428.                                                            | Architect-backend               | CTG-0003c §10                           |
+| OD-P88  | Chave VAPID.                       | `null`; push indisponível.                                                                   | Architect + maestro             | CTG-0003c §10                           |
+| OD-P89  | Chaves/correções par 3.            | **Estendida** A11/A12; fichas corrigidas aqui.                                               | Owner + transcriber             | `plan.md` A11(e), A12(i); CTG-0003c §10 |
+| OD-P90  | Conteúdo de pontuação.             | Página estática; rota pendente.                                                              | Architect-backend + Owner       | CTG-0003c §10                           |
+| OD-P91  | Formas de documentos.              | **Fechada em R-0014 para os handoffs CTG-0004 §3**; demais formas livres não são fabricadas. | Architect-backend               | CTG-0004 §3; CTG-0003c §10              |
+| OD-P92  | Vocabulário exame/sinistro.        | Exibir servidor; comando pendente.                                                           | Architect-backend + PEC/BOAT    | CTG-0003c §10                           |
+| OD-P93  | Rota de avaliação.                 | `POST evaluations`; manifestação inline.                                                     | Architect + Owner               | CTG-0003c §10                           |
+| OD-P94  | Anexos de manifestação.            | `attachmentIds: []`; sem upload inventado.                                                   | Architect-backend               | CTG-0003c §10                           |
+| OD-P95  | Privacidade/exportação.            | Ciclo comum; rota/forma pendentes.                                                           | Architect-backend + Owner       | CTG-0003c §10                           |
+| OD-P96  | SSE/reconexão.                     | Transporte HttpClient; detalhes pendentes.                                                   | Architect + Architect-backend   | CTG-0003c §10                           |
+| OD-P97  | Busca/resumo/download BAT.         | Filtro local; download indisponível.                                                         | Architect-backend + BOAT        | CTG-0003c §10                           |
+| OD-P98  | Campos Carta de Serviços.          | Renderizar existentes; modelo pendente.                                                      | Owner + Architect-backend       | CTG-0003c §10                           |
+| OD-P99  | Pendências da home.                | Só critérios expostos; limites pendentes.                                                    | Owner + Architect               | CTG-0003c §10                           |
+| OD-P100 | Nível SNE.                         | Divergência permanece.                                                                       | Owner/LEGAL                     | CTG-0003c §10                           |
+| OD-P101 | Locale de `Intl`.                  | Runtime i18n até `AvailableBrand`.                                                           | Architect                       | `plan.md` A9(h), A10(i)                 |
+| OD-P102 | Status 0 central.                  | **Fechada**: só `ErrorBoundary`; unificação futura.                                          | Architect                       | `plan.md` A12(a)                        |
+| OD-P103 | Rótulo CNH `B`.                    | `status:null`; rótulo pendente.                                                              | Owner + Architect-backend       | CTG-0004 §10; `plan.md` A14(d)          |
+| OD-P104 | Quitação/restrições/`canIssue`.    | Só multa; resto `source_pending`.                                                            | Architect-backend               | CTG-0004 §10; `plan.md` A14(d)          |
+| OD-P105 | Emissão CRLV-e.                    | 422; sem bytes/QR inventados.                                                                | Architect-backend               | CTG-0004 §10; `plan.md` A14(d)          |
+| OD-P106 | Cancelamento SNE.                  | Local; `cancelNotification` não serve.                                                       | Architect-backend               | CTG-0004 §10; `plan.md` A14(b)          |
+| OD-P107 | Mapa adapter → `PORTAL.*`.         | Sem mapa não vira INTERNAL.                                                                  | Architect-backend               | CTG-0004 §10; `plan.md` A14(f)          |
+| OD-P108 | DELETE de push.                    | Sem rota, não implementar/testar.                                                            | Architect-backend               | CTG-0004 §10; `plan.md` A14(f)          |
+
 ## 5. Mapa entregável → definições

 | Entregável            | Definições                                                                                                             |
diff --git a/docs/framework/arch/portal-frontends.md b/docs/framework/arch/portal-frontends.md
index 634cc74b..81ca135e 100644
--- a/docs/framework/arch/portal-frontends.md
+++ b/docs/framework/arch/portal-frontends.md
@@ -220,12 +220,17 @@ sempre com próximo passo e canal alternativo.
 ## 9. Estrutura de pastas

 ```text
-apps/portal/web/src/app/
-  core/       citizen-shell, brand.service, session.facade, resume.service, error-boundary, offline-document.store, guards/ (auth, assurance, entitlement, service-availability)
-  features/   catalogo/ autos/ defesa/ indicacao/ pagamento/ processos/ notificacoes/ documentos/ sinistros/ exames/ atendimento/ privacidade/ assinatura/
-  shared/     (§5.2)
-  data/       api/portal.client.ts (gerado), models/
-  i18n/       portal.pt-BR.json (inclui o mapa de tradução de estados)
+apps/portal/web/src/
+  app/core/        shell, sessão, marca, guardas, `ErrorBoundary`, offline e runtime
+  app/shared/      componentes reutilizáveis, wizard, diálogos, recibo e canal alternativo
+  app/forms/       14 schemas zod, `form-gate.ts` e anexos
+  app/data/        `portal.client.ts`, modelos de leitura/comando e idempotência
+  app/features/*/  módulos lazy: catálogo, autos, defesa, indicação, pagamento, processos,
+                    notificações, documentos, sinistros, exames, atendimento, privacidade e assinatura
+  app/i18n/        catálogo plano `portal.pt-BR.json` e fallback
+  app/a11y/        helper `axe` e invariantes de acessibilidade
+  app/screens/     páginas por tela e seus componentes de rota
+  testing/**       stubs, fixtures e harness HTTP/router dos specs
````

Caminho completo: `apps/portal/web/src/app/i18n/portal.pt-BR.json`; só os namespaces
@@ -247,3 +252,9 @@ verificador) são reconhecidos por `verify:parameter-catalogue --check-usage`.

Enquanto uma dependência não existe, o serviço aparece no catálogo como `unavailable` com motivo
e canal alternativo (constraint do catálogo), nunca como 404. +
+Estado ao fim de R-0014: as delegações reais continuam em R-0007 com +`delegacao_indisponivel_r0007`; OD-P15 (gov.br real), OD-P16 (SNE real), OD-P17 (privacy),
+OD-P19 (junta médica) e OD-P88 (VAPID) continuam pendentes. CTG-0004 fechou CNH-e, veículos e
+quitação contra o mock; SNE é acessado pelo `SnePort`, e push segue M9. OD-P102 foi fechada no
+CTG-0003c: status 0 é classificado exclusivamente pelo `ErrorBoundary`.
diff --git a/docs/framework/product/transversal/portal/screens/IU-PORTAL-T10.md b/docs/framework/product/transversal/portal/screens/IU-PORTAL-T10.md
index 224a0e23..d30c54c5 100644
--- a/docs/framework/product/transversal/portal/screens/IU-PORTAL-T10.md
+++ b/docs/framework/product/transversal/portal/screens/IU-PORTAL-T10.md
@@ -89,14 +89,14 @@ pode recorrer (AC-4).

## Estados obrigatórios

| -   | Estado            | Texto cidadão (chave i18n)                           | Ação seguinte                                          |
| --- | ----------------- | ---------------------------------------------------- | ------------------------------------------------------ |
| -   | carregando        | `portal.states.loading`                              | —                                                      |
| -   | vazio             | `portal.screens.t10.empty`                           | volta a `/processos/:requestId`                        |
| -   | sem elegibilidade | tratado pelo guarda (redireciona)                    | `/vinculo/por-que-nao-vejo`                            |
| -   | erro recuperável  | `portal.states.retry`                                | tentar novamente                                       |
| -   | sem permissão     | tratado pelo guarda (redireciona)                    | `/vinculo/por-que-nao-vejo`                            |
| -   | indisponível      | `portal.states.unavailable`                          | tentar mais tarde; canal alternativo ([RN-PORTAL-105]) |
| +   | Estado            | Texto cidadão (chave i18n)                           | Ação seguinte                                          |
| +   | ----------------- | ---------------------------------------------------- | ------------------------------------------------------ |
| +   | carregando        | `portal.states.loading`                              | —                                                      |
| +   | vazio             | `portal.screens.t10.empty`                           | volta a `/processos/:requestId`                        |
| +   | sem elegibilidade | tratado pelo guarda (redireciona)                    | `/vinculo/por-que-nao-vejo`                            |
| +   | erro recuperável  | `portal.states.error` + `portal.common.action.retry` | tentar novamente                                       |
| +   | sem permissão     | tratado pelo guarda (redireciona)                    | `/vinculo/por-que-nao-vejo`                            |
| +   | indisponível      | `portal.states.service_unavailable`                  | tentar mais tarde; canal alternativo ([RN-PORTAL-105]) |

## Chaves i18n

diff --git a/docs/framework/product/transversal/portal/screens/IU-PORTAL-T11.md b/docs/framework/product/transversal/portal/screens/IU-PORTAL-T11.md
index 4a9affd2..8ac5626b 100644
--- a/docs/framework/product/transversal/portal/screens/IU-PORTAL-T11.md
+++ b/docs/framework/product/transversal/portal/screens/IU-PORTAL-T11.md
@@ -91,7 +91,7 @@ tela mostra que o processo seguiu para julgamento no estado em que se encontra (
| sem elegibilidade | tratado pelo guarda (redireciona) | `/vinculo/por-que-nao-vejo` |
| erro recuperável | `portal.screens.t11.state.encerrada` | ver status atual do processo |
| sem permissão | tratado pelo guarda (redireciona) | `/vinculo/por-que-nao-vejo` |
-| indisponível | `portal.states.unavailable` | tentar mais tarde |
+| indisponível | `portal.states.service_unavailable` | tentar mais tarde |

## Chaves i18n

diff --git a/docs/framework/product/transversal/portal/screens/IU-PORTAL-T12.md b/docs/framework/product/transversal/portal/screens/IU-PORTAL-T12.md
index 7013d74b..386fb1cf 100644
--- a/docs/framework/product/transversal/portal/screens/IU-PORTAL-T12.md
+++ b/docs/framework/product/transversal/portal/screens/IU-PORTAL-T12.md
@@ -83,14 +83,14 @@ lista já carregada permanece, sem erro bloqueante.

## Estados obrigatórios

| -   | Estado            | Texto cidadão (chave i18n)                           | Ação seguinte                     |
| --- | ----------------- | ---------------------------------------------------- | --------------------------------- |
| -   | carregando        | `portal.states.loading`                              | —                                 |
| -   | vazio             | `portal.screens.t12.empty`                           | —                                 |
| -   | sem elegibilidade | n/a — caixa do próprio sujeito                       | —                                 |
| -   | erro recuperável  | `portal.states.retry`                                | tentar novamente                  |
| -   | sem permissão     | n/a — caixa do próprio sujeito                       | —                                 |
| -   | indisponível      | `portal.screens.t12.state.sem_tempo_real`            | lista carregada permanece visível |
| +   | Estado            | Texto cidadão (chave i18n)                           | Ação seguinte                     |
| +   | ----------------- | ---------------------------------------------------- | --------------------------------- |
| +   | carregando        | `portal.states.loading`                              | —                                 |
| +   | vazio             | `portal.screens.t12.empty`                           | —                                 |
| +   | sem elegibilidade | n/a — caixa do próprio sujeito                       | —                                 |
| +   | erro recuperável  | `portal.states.error` + `portal.common.action.retry` | tentar novamente                  |
| +   | sem permissão     | n/a — caixa do próprio sujeito                       | —                                 |
| +   | indisponível      | `portal.screens.t12.state.sem_tempo_real`            | lista carregada permanece visível |

## Chaves i18n

@@ -99,5 +99,5 @@ lista já carregada permanece, sem erro bloqueante.

- `portal.screens.t12.state.sem_tempo_real` — "Não conseguimos atualizar em tempo real agora —
  mostrando o que já foi carregado." ([RN-PORTAL-124] item 4; `portal-frontends.md` §8)
- `portal.screens.t12.cmd.marcar_lida` — "Marcar como lida"
  -- `portal.screens.t12.field.canal` — "Recebido por {{source}}" (`sne` ou "canal do PORTAL")
  +- `portal.screens.t12.field.canal` — "Recebido por {source}" (`sne` ou "canal do PORTAL")
  ([RN-PORTAL-124] dever 1)
  diff --git a/docs/framework/product/transversal/portal/screens/IU-PORTAL-T13.md b/docs/framework/product/transversal/portal/screens/IU-PORTAL-T13.md
  index 23eee21e..dc938bae 100644
  --- a/docs/framework/product/transversal/portal/screens/IU-PORTAL-T13.md
  +++ b/docs/framework/product/transversal/portal/screens/IU-PORTAL-T13.md
  @@ -92,14 +92,14 @@ nunca simula um resultado.

## Estados obrigatórios

| -   | Estado            | Texto cidadão (chave i18n)                       | Ação seguinte                                       |
| --- | ----------------- | ------------------------------------------------ | --------------------------------------------------- |
| -   | carregando        | `portal.states.loading`                          | —                                                   |
| -   | vazio             | n/a — rota exige AIT existente                   | —                                                   |
| -   | sem elegibilidade | `portal.states.ineligible`                       | ir a "por que não vejo isto"                        |
| -   | erro recuperável  | `portal.screens.t13.state.faixa_indisponivel`    | escolher outra faixa disponível                     |
| -   | sem permissão     | tratado pelo guarda (redireciona)                | `/vinculo/por-que-nao-vejo`                         |
| -   | indisponível      | `portal.states.unavailable`                      | tentar mais tarde; prazo não muda ([RN-PORTAL-125]) |
| +   | Estado            | Texto cidadão (chave i18n)                       | Ação seguinte                                       |
| +   | ----------------- | ------------------------------------------------ | --------------------------------------------------- |
| +   | carregando        | `portal.states.loading`                          | —                                                   |
| +   | vazio             | n/a — rota exige AIT existente                   | —                                                   |
| +   | sem elegibilidade | `portal.states.ineligible`                       | ir a "por que não vejo isto"                        |
| +   | erro recuperável  | `portal.screens.t13.state.faixa_40_indisponivel` | escolher outra faixa disponível                     |
| +   | sem permissão     | tratado pelo guarda (redireciona)                | `/vinculo/por-que-nao-vejo`                         |
| +   | indisponível      | `portal.states.service_unavailable`              | tentar mais tarde; prazo não muda ([RN-PORTAL-125]) |

## Chaves i18n

diff --git a/docs/framework/product/transversal/portal/screens/IU-PORTAL-T14.md b/docs/framework/product/transversal/portal/screens/IU-PORTAL-T14.md
index 49d2e57b..7553ae2e 100644
--- a/docs/framework/product/transversal/portal/screens/IU-PORTAL-T14.md
+++ b/docs/framework/product/transversal/portal/screens/IU-PORTAL-T14.md
@@ -80,14 +80,14 @@ técnico (alt. 2a).

## Estados obrigatórios

| -   | Estado            | Texto cidadão (chave i18n)                           | Ação seguinte                                        |
| --- | ----------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| -   | carregando        | `portal.states.loading`                              | —                                                    |
| -   | vazio             | `portal.screens.t14.empty`                           | ir à ouvidoria se achar que há divergência (alt. 2b) |
| -   | sem elegibilidade | n/a — consulta do próprio CPF                        | —                                                    |
| -   | erro recuperável  | `portal.states.retry`                                | tentar novamente                                     |
| -   | sem permissão     | n/a — consulta do próprio CPF                        | —                                                    |
| -   | indisponível      | `portal.states.unavailable`                          | canal alternativo ([RN-PORTAL-105])                  |
| +   | Estado            | Texto cidadão (chave i18n)                           | Ação seguinte                                        |
| +   | ----------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| +   | carregando        | `portal.states.loading`                              | —                                                    |
| +   | vazio             | `portal.screens.t14.empty`                           | ir à ouvidoria se achar que há divergência (alt. 2b) |
| +   | sem elegibilidade | n/a — consulta do próprio CPF                        | —                                                    |
| +   | erro recuperável  | `portal.states.error` + `portal.common.action.retry` | tentar novamente                                     |
| +   | sem permissão     | n/a — consulta do próprio CPF                        | —                                                    |
| +   | indisponível      | `portal.states.service_unavailable`                  | canal alternativo ([RN-PORTAL-105])                  |

## Chaves i18n

diff --git a/docs/framework/product/transversal/portal/screens/IU-PORTAL-T15.md b/docs/framework/product/transversal/portal/screens/IU-PORTAL-T15.md
index a5f48b9c..d4174ddb 100644
--- a/docs/framework/product/transversal/portal/screens/IU-PORTAL-T15.md
+++ b/docs/framework/product/transversal/portal/screens/IU-PORTAL-T15.md
@@ -70,14 +70,14 @@ acessível sem sessão (`access: anonimo`), presente mesmo para usuário anônim

## Estados obrigatórios

| -   | Estado            | Texto cidadão (chave i18n)                           | Ação seguinte     |
| --- | ----------------- | ---------------------------------------------------- | ----------------- |
| -   | carregando        | `portal.states.loading`                              | —                 |
| -   | vazio             | n/a — conteúdo estático                              | —                 |
| -   | sem elegibilidade | n/a — acesso anônimo                                 | —                 |
| -   | erro recuperável  | `portal.states.retry`                                | tentar novamente  |
| -   | sem permissão     | n/a — acesso anônimo                                 | —                 |
| -   | indisponível      | `portal.states.unavailable`                          | voltar mais tarde |
| +   | Estado            | Texto cidadão (chave i18n)                           | Ação seguinte     |
| +   | ----------------- | ---------------------------------------------------- | ----------------- |
| +   | carregando        | `portal.states.loading`                              | —                 |
| +   | vazio             | n/a — conteúdo estático                              | —                 |
| +   | sem elegibilidade | n/a — acesso anônimo                                 | —                 |
| +   | erro recuperável  | `portal.states.error` + `portal.common.action.retry` | tentar novamente  |
| +   | sem permissão     | n/a — acesso anônimo                                 | —                 |
| +   | indisponível      | `portal.states.service_unavailable`                  | voltar mais tarde |

## Chaves i18n

diff --git a/docs/framework/product/transversal/portal/screens/IU-PORTAL-T16.md b/docs/framework/product/transversal/portal/screens/IU-PORTAL-T16.md
index 5f44e485..d535cd31 100644
--- a/docs/framework/product/transversal/portal/screens/IU-PORTAL-T16.md
+++ b/docs/framework/product/transversal/portal/screens/IU-PORTAL-T16.md
@@ -89,7 +89,7 @@ motivo com link de pagamento antes de negar a emissão (alt. 2b).
| sem elegibilidade | `portal.screens.t16.state.nao_valida` | caminho de regularização ([UC-PORTAL-011] alt. 2a) |
| erro recuperável | `portal.screens.t16.state.pendencia` | ir ao módulo de pagamento |
| sem permissão | n/a — é sempre a própria CNH | — |
-| indisponível | `portal.states.unavailable` | dado em cache com data da consulta ([RN-PORTAL-117]) |
+| indisponível | `portal.states.service_unavailable` | dado em cache com data da consulta ([RN-PORTAL-117]) |

## Chaves i18n

diff --git a/docs/framework/product/transversal/portal/screens/IU-PORTAL-T17.md b/docs/framework/product/transversal/portal/screens/IU-PORTAL-T17.md
index cd145e84..ac39145f 100644
--- a/docs/framework/product/transversal/portal/screens/IU-PORTAL-T17.md
+++ b/docs/framework/product/transversal/portal/screens/IU-PORTAL-T17.md
@@ -88,7 +88,7 @@ emissão (AC-2).
| sem elegibilidade | `portal.states.ineligible` | ir a "por que não vejo isto" |
| erro recuperável | `portal.screens.t17.state.pendencia` | ir ao pagamento (T-13) |
| sem permissão | tratado pelo guarda (redireciona) | `/vinculo/por-que-nao-vejo` |
-| indisponível | `portal.states.unavailable` | dado em cache com data da consulta ([RN-PORTAL-117]) |
+| indisponível | `portal.states.service_unavailable` | dado em cache com data da consulta ([RN-PORTAL-117]) |

## Chaves i18n

diff --git a/docs/framework/product/transversal/portal/screens/IU-PORTAL-T18.md b/docs/framework/product/transversal/portal/screens/IU-PORTAL-T18.md
index 5cc05f83..e336dd1a 100644
--- a/docs/framework/product/transversal/portal/screens/IU-PORTAL-T18.md
+++ b/docs/framework/product/transversal/portal/screens/IU-PORTAL-T18.md
@@ -86,7 +86,7 @@ saúde de terceiro não aparece na lista (AC-2).
| sem elegibilidade | `portal.screens.t18.state.sem_vinculo` | canal formal (ouvidoria/LGPD) ([UC-PORTAL-013] alt. 2b) |
| erro recuperável | `portal.screens.t18.state.em_elaboracao` | aguardar; o registro ainda está em atendimento |
| sem permissão | `portal.screens.t18.state.sem_vinculo` | canal formal (ouvidoria/LGPD) |
-| indisponível | `portal.states.unavailable` | tentar mais tarde |
+| indisponível | `portal.states.service_unavailable` | tentar mais tarde |

## Chaves i18n

diff --git a/docs/meta/agents/engineer-frontend.md b/docs/meta/agents/engineer-frontend.md
index 93596dca..5a044673 100644
--- a/docs/meta/agents/engineer-frontend.md
+++ b/docs/meta/agents/engineer-frontend.md
@@ -44,5 +44,24 @@ pnpm check

## Entrega

+## Padrão de app (fixado por R-0014; R-0012 copia) +
+1. `package.json` declara os scripts `build`, `test`, `lint` e `typecheck`.
+2. `build` é `ng build`; `test` é Vitest; `lint` é ESLint e `typecheck` verifica app e specs.
+3. `vitest.config.ts` usa jsdom, `src/test-setup.ts` e `angularJitApplicationTransform` (A7a).
+4. `src/test-setup.ts` inicializa TestBed uma vez e o restaura após cada spec.
+5. ESLint é flat, com `angular-eslint`, `typescript-eslint` e Prettier.
+6. `pnpm check` constrói `@detran/ui` antes do typecheck e inclui lint, test e build do app.
+7. `@detran/ui` expõe `exports["."]` para consumo por apps (M6).
+8. I18n usa placeholders `{x}`, nunca `{{x}}` (A7c), e namespaces declarados no catálogo.
+9. Specs zoneless aguardam o estado observável com `vi.waitFor`.
+10. Cada estado de tela é provado por `expectA11yStateInvariants` e `axe` no TestBed.
+11. Harnesses usam `HttpClient`/`HttpTestingController`, sem fetch falso para API do Portal.
+12. `ErrorBoundary` é o único classificador de erro/offline; features só apresentam sua saída (A12(a)).
+13. Comandos carregam `Idempotency-Key` determinística segundo M17.
+14. Rotas derivam de manifesto único, com guardas de sessão, nível, disponibilidade e vínculo. +
+R-0014 fixa o padrão para os frontends seguintes: scripts `build|test|lint|typecheck`, Vitest com JIT transform, `test-setup.ts`, ESLint flat, `pnpm check` estendido, export da raiz de `@detran/ui`, i18n com `{x}`, zoneless com `vi.waitFor`, `expectA11yStateInvariants` e harness com `HttpClient`; R-0012 copia este padrão (plan.md M1, A7a, A12). +
PR por módulo de feature (`features/<modulo>`), com capturas das telas principais em ambos os
temas, tabela rota → componente → comando → erro tratado, "Papel: Engineer" e evidência DEVAI.
diff --git a/docs/meta/agents/orchestra/README.md b/docs/meta/agents/orchestra/README.md
index d754d609..e826a7b3 100644
--- a/docs/meta/agents/orchestra/README.md
+++ b/docs/meta/agents/orchestra/README.md
@@ -89,15 +89,20 @@ O detalhe está em `maestro-prompt.template.md`. 16. **e2e idempotente em banco persistente** (R-0009): cada arquivo limpa no `afterAll` o que criou;
`DB_NAME` explícito no env da rodada (`work/rounds/R-nnnn/env-detran-rN.sh`); o CI usa banco
limpo e não acusa.
-17. **Chaves i18n não são parâmetros** (OD-P46): o verificador de parâmetros só reconhece chaves

- declaradas no catálogo ou namespaces i18n listados numa allowlist do próprio catálogo — nunca
- exclusão por diretório. Resolver no primeiro frontend (R-0012) antes de qualquer `i18n/*.json`
- entrar em código.
  +17. **Chaves i18n não são parâmetros** (OD-P46, fechada): a allowlist vive em

* `parameter-catalogue.md` §Namespaces i18n e é lida por `tools/parameters/verify.mjs`; o
* verificador reconhece somente parâmetros declarados ou esses namespaces. Exclusão por diretório
* é proibida; R-0014 resolveu OD-P46 no primeiro frontend.

18. **Checkpoint de dependências entre tarefas**: pacote de workspace novo → o maestro roda
    `pnpm install`, guarda o `pnpm-lock.yaml` para o commit do grupo e só então libera o Inspector;
    contrato novo → `pnpm contracts:clients` antes dos testes que o consomem; o CTG seguinte só
    começa a escrever depois do merge do anterior, ou nasce em branch empilhado (nunca commits novos

- no branch de um PR aberto).

* no branch de um PR aberto). Em R-0014: nunca commits em branch de PR aberto; vereditos são
* lidos integralmente; toda tríade declara Architect explícito; `typecheck` é critério do
* Inspector; iterações paralelas exigem fronteiras disjuntas (A12) e regra transversal só muda no
* módulo dono (A12(a)); asserções por conjunto de status e escapes condicionais são vedados
* (A15); um app isolado por arquivo de spec (A18); nomes `SENATRAN_*_BASE_URL` nunca aparecem em
* `backend/**` (A19(c)).

## 5. Parcimônia de tokens

@@ -229,6 +234,43 @@ follow-up qualitativo de cada maestro: o que custou tempo, o que funcionou e o q
estrutura de fronteira corrigível (ciclo extra permitido, registrado em §Bloqueios); R-0008 e R-0009
já operaram assim por decisão do Owner.

+### R-0014 `portal-pwa` (Fable 5.1 → maestro Opus 5 na janela 4; workers/reviewer Codex a partir de 2026-09-19 — B3; PRs #60…#65) + +**O que custou tempo** +
+1. Prompt-reviews FAIL por estrutura exigiram reescrita antes de disparar workers; B0 é um desvio

- registrado, não autorização para ignorar o veredito.
  +2. A9/A10 deixaram cobertura inicialmente declarada parcial; o Inspector precisou torná-la integral.
  +3. A12 tornou explícita a regra transversal: o `ErrorBoundary`, módulo dono, absorve status 0.
  +4. O Codex trunca comandos acima de 30 s; as suítes precisaram de processo em segundo plano, log e
- polling pelo maestro.
  +5. O sandbox não disponibiliza `pkill`; o isolamento de processos precisa vir do arquivo de spec.
  +6. Asserções por conjunto de status e escapes condicionais esconderam casos e foram vedados em A15.
  +7. O Inspector fez 11 iterações no CTG-0004; isso expôs lacunas de fixtures, não justificou reduzir
- cobertura.
  +8. A fonte homônima do seed não bastou para o contrato: o Architect precisou ler a fonte do serviço.
-

+**O que funcionou** +
+1. Tríade com Architect explícito em cada CTG; contrato antes de Inspector e Engineer.
+2. O contrato como spec manteve decisões e negativas verificáveis durante as iterações.
+3. `tools/orchestra/worker.sh` registrou executor, hashes e a proibição de `git` do worker.
+4. A ponte de revisão com fontes, ratificada em A24, evitou alterar enum/OpenAPI por paráfrase.
+5. Fronteiras disjuntas permitiram as iterações paralelas de A12 sem corrida de escrita. + +**Números e recomendações** +
+1. `budget.json`: 6.959.875 tokens estimados de entrada e 1.262.818 de saída; janela 4 encerrou

- com aproximadamente 4,93 M únicos acumulados.
  +2. Reviews: CTG-0001 4, CTG-0002 2, CTG-0003a 2, CTG-0003b 6, CTG-0003c 2 e CTG-0004 3;
- prompt-reviews 12 ciclos (incluindo ciclos restritos).
  +3. CTG-0004: contrato em 2 iterações, Inspector em 11 e Engineer em 5; delivery-review
- FAIL → FAIL contestado → PASS.
  +4. Manter Architect explícito, leitura integral do veredito e `typecheck` no critério de Inspector.
  +5. Para matriz grande, usar Sonnet/médio ou Terra/médio; não reduzir o conjunto de estados.
  +6. Proibir escapes condicionais e manter um app isolado por arquivo de spec.
  +7. Registrar variáveis de mock só no shell/CI: `SENATRAN_*_BASE_URL` não entra em `backend/**`.
-

## Arquivos deste método

| Arquivo | Uso |
diff --git a/docs/meta/agents/orchestra/model-ladder.md b/docs/meta/agents/orchestra/model-ladder.md
index 203e8709..660e3898 100644
--- a/docs/meta/agents/orchestra/model-ladder.md
+++ b/docs/meta/agents/orchestra/model-ladder.md
@@ -11,7 +11,7 @@
| **Médio** | GPT-5.6 **Terra** | **Opus 5** | architect-blueprint, guardas de estado, engineer-frontend, reviewer padrão |
| **Pequeno** | GPT-5.6 **Luna** | **Sonnet 5** | transcriber-docs, inspector-tests, engineer-backend em tarefas de contrato fechado |

-Identificadores na CLI: Claude aceita os apelidos `fable`, `opus`, `sonnet` em `--model`; Codex
+Identificadores na CLI: Codex usa `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`; Claude aceita os apelidos `fable`, `opus`, `sonnet` em `--model`; Codex
usa o id do modelo em `-m` (confirmar o id exato de Sol/Terra/Luna com `codex --help` ou
`~/.codex/config.toml` antes da primeira ponte; registrar em `waves.md` §Histórico).

diff --git a/docs/meta/agents/orchestra/waves.md b/docs/meta/agents/orchestra/waves.md
index 20e03c0c..0f631f69 100644
--- a/docs/meta/agents/orchestra/waves.md
+++ b/docs/meta/agents/orchestra/waves.md
@@ -61,6 +61,6 @@ ficam ativas ao mesmo tempo (ondas 5 e 6).
| R-0011 | `dashboard-backend` | — | — | — | — | — | — | — |
| R-0012 | `rait-web` | — | — | — | — | — | — | — |
| R-0013 | `teat-frontends` | — | — | — | — | — | — | — |
-| R-0014 | `portal-pwa` | — | — | — | — | — | — | — |
+| R-0014 | `portal-pwa` | 2026-09-17 | PRs #60…#65; PC-<pendente> | 0012 + fechamento; WP-P4…P6 | 8…11 | B1 Lighthouse; B2 reviewer; B3 Codex | ~4.93M únicos acumulados; janela 4 | `gpt-5.6-sol\|gpt-5.6-terra\|gpt-5.6-luna`; comandos longos em segundo plano; app isolado por arquivo; asserções por conjunto vedadas; Sonnet/médio (ou Terra/médio) para Inspectors de matriz grande. |
| R-0015 | `boat-mobile` | — | — | — | — | — | — | — |
| R-0016 | `dashboard-console` | — | — | — | — | — | — | — |
diff --git a/docs/meta/knowledge-base/backlog.md b/docs/meta/knowledge-base/backlog.md
index af7d2d7e..d81e9c3a 100644
--- a/docs/meta/knowledge-base/backlog.md
+++ b/docs/meta/knowledge-base/backlog.md
@@ -502,3 +502,18 @@ citação de regras fechada em cinco dos seis apps (RAIT em 32/43 — ver abaixo
a partir da onda 3, abrir a próxima frente de uma família quando a anterior daquela família mesclar (added 2026-09-14)

- [x] **WP-T2 + WP-T3 teat-backend (R-0008)**: comandos manuscritos de AIT, bootstrap/turno/handoff, numeração e sincronização, evidência, snapshots, normativo, medidas, alcoolemia, velocidade, SSE e integrações (CTG-0001…0004, PRs #47–#50, 2026-09-15/16), contratos de comando + gate + clientes tipados + schemas + docs (CTG-0005, PR #51) e fechamento `PC-0005` em 2026-09-16; OD-T13…OD-T73 em `open-decisions-rait.md` §F; status HTTP divergentes (OD-T70/T71), enum do recibo (OD-T72), `integration.item.changed` (OD-T73) e `BP-INF-SPEED-001.commands` (OD-T66) roteados a rodadas futuras.
- [x] **WP-T1 ops-agency (R-0005)**: agência, modelos ops, deltas inf e fixtures entregues nos CTG-0001/0002 (PRs #40/#41, 2026-09-14), CTG-0003 (PR #42), documentação final (PR #44) e fechamento `PC-0003` em 2026-09-15; `shift.status`, demais vocabulários source-pending e provisioning (R-0013/WP-T5) permanecem roteados a WP-T2+.
      +- [ ] **PORTAL OD-P15 — gov.br real**: credenciais e retorno institucional; dono Architect-backend/Owner; fonte `plan.md` A14 e CTG-0004 §10.
      +- [ ] **PORTAL OD-P16 — SNE real**: homologar `SnePort` além do mock; dono Architect-backend; fonte `plan.md` A14 e CTG-0004 §10.
      +- [ ] **PORTAL OD-P17 — privacy**: montar `@stynx-nyx/privacy`; dono Architect-backend/Owner; fonte CTG-0004 §10.
      +- [ ] **PORTAL OD-P19 — junta médica**: produtor PEC/BOAT e comando; dono PEC/BOAT; fonte CTG-0004 §10.
      +- [ ] **PORTAL OD-P61 — enum legal SNE**: reconciliar enum do fio e textos legais; dono Owner/LEGAL + Architect-backend; fonte `plan.md` A24.
      +- [ ] **PORTAL OD-P88 — VAPID**: fonte auditável de `applicationServerKey`; dono Architect + maestro; fonte CTG-0003c §10.
      +- [ ] **PORTAL OD-P102 — ErrorBoundary**: acompanhar unificação futura, sem regra duplicada; dono Architect; fonte `plan.md` A12(a).
      +- [ ] **PORTAL OD-P103 — CNH B**: rótulo cidadão de BLOQUEADA; dono Owner + Architect-backend; fonte CTG-0004 §10.
      +- [ ] **PORTAL OD-P104 — quitação**: fonte de restrições, suspensão e `canIssue`; dono Architect-backend; fonte CTG-0004 §10.
      +- [ ] **PORTAL OD-P105 — CRLV-e**: porta, bytes, QR e emissão; dono Architect-backend; fonte CTG-0004 §10.
      +- [ ] **PORTAL OD-P106 — cancelamento SNE**: operação cidadã no adapter; dono Architect-backend; fonte CTG-0004 §10.
      +- [ ] **PORTAL OD-P107 — adapter → PORTAL**: mapa completo de erros; dono Architect-backend; fonte CTG-0004 §10.
      +- [ ] **PORTAL OD-P108 — DELETE push**: rota canônica; dono Architect-backend; fonte CTG-0004 §10.
      +- [ ] **PORTAL B1 — Lighthouse CI**: somente ferramenta offline/instalável; até lá `axe` por rota; dono maestro; fonte `plan.md` B1/M3.
      +- [ ] **PORTAL A12(j) — elevação**: manter contrato sem degrau `access`, banner de qualificada e heurística C-3c-78; dono Architect/transcriber; fonte `contracts/CTG-0003c.md` §3.8, §8.
      diff --git a/docs/meta/knowledge-base/decision-closure-plan.md b/docs/meta/knowledge-base/decision-closure-plan.md
      index 64342d79..bd0377dc 100644
      --- a/docs/meta/knowledge-base/decision-closure-plan.md
      +++ b/docs/meta/knowledge-base/decision-closure-plan.md
      @@ -95,16 +95,17 @@ admitindo selo prata, parecer jurídico único).

### PORTAL

| -   | Item(s)                | Via | Ponte C                                                                        | Saída                                                                                                                                               |
| --- | ---------------------- | --- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| -   | OD-P01                 | A   | `portal.act_level_policy` vigente                                              | capturado; resta CETRAN-AM/ouvidoria                                                                                                                |
| -   | OD-P02                 | A   | `portal.act_level_policy` vigente                                              | **fechada** por H.50 (Owner, R-0009): prata ou ouro = avançada; risco (PN 001/2025 só nomeia ouro) registrado em ADR-0024 §Decisão 2/§Consequências |
| -   | OD-P06, OD-P10         | B   | `portal.ombudsman_level`, taxonomia                                            | cédula 06                                                                                                                                           |
| -   | OD-P03, OD-P05, OD-P07 | C   | flags                                                                          | fechados por DT-026/031/066                                                                                                                         |
| -   | OD-P04, OD-P08, OD-P09 | B   | `privacy.public_regime_days` pendente                                          | parecer LEGAL (DT-042)                                                                                                                              |
| -   | OD-P11, OD-P12         | C   | `portal.read_cache_ttl_minutes`, `portal.mobile_shell`                         | Architect em WP-P1                                                                                                                                  |
| -   | OD-P13                 | C   | —                                                                              | **fechada** (R-0009, M7): `@stynx-nyx/flow` avaliado e descartado; máquina fixa de 13 estados em código                                             |
| -   | OD-P46                 | C   | allowlist de namespaces i18n no catálogo de parâmetros                         | **fechada** em R-0014 (Owner, 2026-09-17; M10)                                                                                                      |
| +   | Item(s)                | Via | Ponte C                                                                        | Saída                                                                                                                                               |
| +   | ---------------------- | --- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| +   | OD-P01                 | A   | `portal.act_level_policy` vigente                                              | capturado; resta CETRAN-AM/ouvidoria                                                                                                                |
| +   | OD-P02                 | A   | `portal.act_level_policy` vigente                                              | **fechada** por H.50 (Owner, R-0009): prata ou ouro = avançada; risco (PN 001/2025 só nomeia ouro) registrado em ADR-0024 §Decisão 2/§Consequências |
| +   | OD-P06, OD-P10         | B   | `portal.ombudsman_level`, taxonomia                                            | cédula 06                                                                                                                                           |
| +   | OD-P03, OD-P05, OD-P07 | C   | flags                                                                          | fechados por DT-026/031/066                                                                                                                         |
| +   | OD-P04, OD-P08, OD-P09 | B   | `privacy.public_regime_days` pendente                                          | parecer LEGAL (DT-042)                                                                                                                              |
| +   | OD-P11, OD-P12         | C   | `portal.read_cache_ttl_minutes`, `portal.mobile_shell`                         | Architect em WP-P1                                                                                                                                  |
| +   | OD-P13                 | C   | —                                                                              | **fechada** (R-0009, M7): `@stynx-nyx/flow` avaliado e descartado; máquina fixa de 13 estados em código                                             |
| +   | OD-P46                 | C   | allowlist de namespaces i18n no catálogo de parâmetros                         | **fechada** em R-0014 (Owner, 2026-09-17; M10)                                                                                                      |
| +   | OD-P66                 | C   | `portal.attachment.max_size_mb`, `portal.attachment.accepted_types` (proposta) | R-0014 A6(e)/A25: 10 MB e PDF/JPEG/PNG da spec §7 fixos no app (`ATTACHMENT_MAX_BYTES`); parâmetro lido em rodada futura                            |

### BOAT

diff --git a/work/rounds/R-0014/contracts/CTG-0003c.md b/work/rounds/R-0014/contracts/CTG-0003c.md
index 1790e249..adbeacae 100644
--- a/work/rounds/R-0014/contracts/CTG-0003c.md
+++ b/work/rounds/R-0014/contracts/CTG-0003c.md
@@ -887,7 +887,7 @@ export type ElevationPhase =
export interface ElevationContext {
readonly resumeRoute: string; // ?retomar (RESUME_QUERY_PARAM) ou ResumeService.peek()?.route; sem ambos → '/inicio'
readonly actKey: string | null; // serviceKey da entrada do manifesto cujo `path` casa com resumeRoute (PORTAL_ROUTE_MANIFEST), senão null

- readonly required: AssuranceLevel; // SessionFacade.requirementFor(actKey)?.level quando é nível; senão `access` da entrada do manifesto ('avancada'|'simples'); senão 'avancada' (teto RN-101)

* readonly required: AssuranceLevel; // SessionFacade.requirementFor(actKey)?.level quando é nível; senão 'avancada' (teto RN-101)
  readonly current: AssuranceLevel | null; // SessionFacade.assuranceLevel()
  readonly sufficient: boolean; // ASSURANCE_ORDER[current] >= ASSURANCE_ORDER[required]
  }
  @@ -1801,6 +1801,7 @@ C-3c-58 dado start com 422 SERVICE_UNAVAILABLE{elevacao_govbr_pendente_r0014}
  C-3c-59 dado complete('e1','tok') com 400 VALIDATION_FAILED então phase 'error', portal.screens.t27.state.erro_recuperavel e os três caminhos continuam oferecidos (negativo: nunca beco sem saída) §3.8; UC-019 3b
  C-3c-60 dado complete('e1','tok') com 2xx e ResumePoint { route:'/autos/x/defesa/nova', draft } então SessionFacade.load() foi chamado, phase 'done', navegação para /autos/x/defesa/nova e ResumeService.peek() ainda devolve o ponto (não consumido) §3.8; UC-019 AC-4; A6(a)
  C-3c-61 dado assuranceLevel 'avancada' e retomar de rota 'avancada' então a T-27 navega imediatamente para retomar sem chamar requestElevation (negativo) §3.8
  +C-3c-116 dado ato que nunca exige assurance qualificada então o banner usa `portal.errors.assurance_qualified_never_required` §8; A12(j)
  C-3c-62 dado o DOM da T-27 então 'bronze', 'prata' e 'ouro' não aparecem em atributos de condição nem em código de produção de features/assinatura/** (análise estática: só permitido dentro de textos i18n) RN-102 a; T27 §10
  C-3c-63 dado CatalogoFacade.loadService('defesa_previa') com o item de fixture (unavailable) então a T-25 mostra data-token="delegacao_indisponivel_r0007", o alternativeChannelNote e NÃO mostra o botão "ir para o serviço" (negativo) §3.9; §6 T-25
  C-3c-64 dado functionalRoute('consulta_multas') então '/autos'; functionalRoute('defesa_previa') então '/autos'; functionalRoute('inexistente') então null (negativo: nunca item.route '/servicos/…') §3.9
  @@ -1818,7 +1819,7 @@ C-3c-74 dado a reabertura responder 204 então a próxima open() vai SEM Last-
  C-3c-75 dado open() errar 429 RATE_LIMITED{retryAfter:120} então lastError.messageKey portal.errors.rate_limited, status 'polling' e a próxima open() só após 120 000 ms (≥ 60 000) §4.1 (e); OD-P45
  C-3c-76 dado open() errar 401 então status 'stopped' e nenhuma nova tentativa (negativo) §4.1 (f)
  C-3c-77 dado SessionFacade.active() passar a false então stop() e status 'stopped'; voltar a true com assinante ativo então start() §4.1 (g)
  -C-3c-78 dado o código de core/realtime.service.ts então não contém 'new EventSource' nem outro número além de 60_000 para intervalo (análise estática) [DIVERGE-1]; §4.1
  +C-3c-78 dado o código de core/realtime.service.ts então não contém 'new EventSource' e prova o intervalo único sem aceitar escapes condicionais (análise estática); a heurística exclui somente a linha de `MS_PER_SECOND` e usa `>= 1000`, para não rejeitar constantes não temporais [DIVERGE-1]; §4.1; A12(j)
  C-3c-79 dado PushService com SwPush.isEnabled=false então status 'unsupported'; com isEnabled=true e PUSH_SERVER_PUBLIC_KEY null então 'unavailable' e subscribe() não chama requestSubscription (negativo) §4.2; OD-P88
  C-3c-80 dado PUSH_SERVER_PUBLIC_KEY 'k' e a página de preferências montada então requestSubscription NÃO foi chamado até o clique no opt-in (negativo); após o clique, requestSubscription({ serverPublicKey:'k' }) e POST push-subscriptions com { endpoint, keys:{ p256dh, auth } } de toJSON(); status 'subscribed' §4.2; spec §8
  C-3c-81 dado requestSubscription rejeitar então status 'denied' e nenhum POST (negativo); dado POST 500 então status 'error' e SwPush.unsubscribe chamado §4.2

```

```
