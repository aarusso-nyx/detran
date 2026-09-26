# Inspeção 2026-09-25 — item (f): planos, prompts, rounds e ciclos

**Papel:** Auditor (Constitution Article 6), somente leitura. **Data:** 2026-09-25. **HEAD:** `a92ef731` (merge do PR #117).
**Fontes:** `BUILD-PLAN.md`, `work/rounds/README.md`, `work/rounds/R-0001…R-0016`, `record/proofs/work/generic/R-*.jsonl`,
`record/proofs/compliance/closures/PC-0001…0014.json`, `docs/meta/agents/orchestra/waves.md`,
`docs/meta/knowledge-base/{backlog,open-issues,decision-closure-plan,open-decisions-rait}.md`,
`docs/meta/knowledge-base/owner-ballots/letters/README.md`, GitHub Issues (#11–#126) e PRs (#1–#117), `git log`.

> **Limitação:** R-0015 e R-0016 foram lidas em profundidade: plano, reviews, budget, closure e evidências.
> Para R-0003…R-0014, a tabela usa outras fontes: closures PC, histórico de `waves.md`, `backlog.md` §Handoffs, títulos e corpos de PR e issues de handoff.
> A leitura em profundidade dessas rodadas (prompts/reviews/budget por task) não foi concluída a tempo desta entrega.
> Os números de iteração dessas rodadas vêm de `waves.md` e não foram recontados.

---

## 1. Resumo executivo

1. **As 16 rodadas terminaram:**
   - R-0001 e R-0002 fecharam sem closure formal.
   - R-0003…R-0016 fecharam como PC-0001…PC-0014 (`record/proofs/compliance/closures/`).
   - A cadeia de evidência DEVAI é válida: `devai evidence verify --scope chain` → _valid_, head `035497d5…`.
2. **Os registros humanos de estado não acompanharam as entregas:**
   - `work/rounds/README.md` ainda mostra R-0007…R-0016 como _planned_.
   - O mesmo README traz maestros trocados em R-0011, R-0015 e R-0016.
   - `waves.md` l.66 e `dashboard-build-pack.md` l.112 ainda dizem que o PR #103 está "em CI".
   - Os `AUTHORIZATION.md` de R-0015 e R-0016 seguem `status: active`.
   - `CLAUDE.md` cita DEVAI 1.4.5; `AGENTS.md`, `README.md` e `package.json` usam 1.5.6.
3. **"Fechado" não significa "pronto para produção".** Todas as frentes com integração externa fecharam só contra mocks ou em nível estrutural:
   - RAIT-WEB sem comandos reais (#122).
   - DASHBOARD em L0 (#124).
   - PORTAL no mock SENATRAN, com gov.br e SNE por homologar (#125).
   - BOAT sem camada nativa real nem RENAEST real (#109 comentário, #120).
   - TEAT mobile apenas em homologação de UI (#108–#112).
4. **O BUILD-PLAN (Fases 0–6) não é mais o documento de controle.** A adenda de 2026-09-13 o substituiu pelos build packs, mas vários itens das fases originais ficaram sem round nem issue: WP-P (projeções RAIT), `apps/portal/mobile`, arquivamento de origens e retirada de infra (Fase 6), runbook gov.br-como-IdP (Fase 1), W0.3.
5. **As dependências externas não andaram.**
   - Os seis ofícios institucionais redigidos em 2026-09-13 não têm data de envio (`owner-ballots/letters/README.md`, colunas vazias).
   - O parecer jurídico único (ofício 05) não foi pedido formalmente.
   - #126 agrega o tema, mas sem item por pendência.
6. **O processo produz evidência, mas com custo alto e sinais de fragilidade:**
   - Reviews FAIL recorrentes.
   - Iterações de correção: R-0008 ~20; R-0012 20; R-0015 até 6 por task.
   - Orçamento de janela estourado (R-0015: 795k/800k contra um limiar de 640k; R-0016 com números inconsistentes entre `budget.json` e `closure.json`).
   - `closed_at` placeholder em PC-0012 (`2026-09-22T00:00:00.000Z`).

---

## 2. Tabela por round

| Round  | Front / WPs                        | Objetivo                                                                          | Entregue (PRs)                                                                              | Closure                                             | Evidência                                                                             | Desvios / pendências principais                                                                                                                                                                                                                                                                                                        |
| ------ | ---------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-0001 | rodada de definição + WP-0 + WP-T0 | build packs, gate de implementação; STYNX 1.3.1/Angular 22; defeitos de base TEAT | #27, #28, #29 (+ #22/#24 de proveniência KB)                                                | **sem PC**; README: "closed by merges"              | `R-0001.jsonl` seq. 1–4                                                               | `prompts/00-orchestrator.md` ficou com o placeholder "Deterministic local scaffold. Replace this working prompt before execution." e nunca foi substituído; sem `closure.json`/`AUTHORIZATION.md`/tasks; o plano tem só 3 ondas, sem critérios de aceite formais                                                                       |
| R-0002 | PEC port (Fase 6, `domains/ch`)    | port de paridade integral do `pec`                                                | PR #26 (`codex/pec-port-mapping`, 2026-09-01)                                               | **sem PC; pasta `work/rounds/R-0002/` inexistente** | só `R-0002.jsonl` (1 linha: verdict READY, 76/76 AC, 115 specs portados, 0 deferidos) | lacuna documental: executada antes do método de orquestra, sem papéis de trabalho; o README só aponta o jsonl; fronteiras externas explicitamente fail-closed: PAdES-LTA deletion desabilitada, SEFAZ e Cognito reais dependem de credenciais                                                                                          |
| R-0003 | `dash-roles` — WP-D0               | papéis/política/camadas DASHBOARD (OD-D01)                                        | #32; fechamento #35                                                                         | PC-0001 (2026-09-14)                                | `evidence-CTG-0001*.json`, jsonl 2 linhas                                             | 4 tasks, 3 iterações nas TASK-0001…0003 (prompts `-iteration-2/3`); OD-T01 continua aberto para o WP TEAT                                                                                                                                                                                                                              |
| R-0004 | `param-store` — ADR-0021           | `ops.parameter`, catálogo, gate                                                   | #37; fechamento #38                                                                         | PC-0002                                             | `evidence-CTG-000{1,2}.json`                                                          | ADR-0021 segue **Proposed** em `DESIGN-DECISIONS.md` apesar de implementada; valores `proposta`/`pendente de fonte` dependem de cédulas e ofícios                                                                                                                                                                                      |
| R-0005 | `ops-agency` — WP-T1               | `ops/agency` mínimo, módulos ops, fixtures                                        | #40, #41, #42, #44; fechamento #45                                                          | PC-0003                                             | 9 evidências (CI-correction, post-rebase, main-integration)                           | `shift.status`, vocabulários source-pending e provisioning roteados a WP-T2+/R-0013; convênios fora (H.40); vários ciclos de correção de CI e rebase                                                                                                                                                                                   |
| R-0006 | `rait-model` — WP-A restante       | agregado da infração (ADR-0016), organização, cobrança, integração                | #39, #43; fechamento #46                                                                    | PC-0004                                             | `evidence-CTG-000{1,2}.json`                                                          | 14 tasks (8 + 6 de correção); **M10: WP-P (projeções por consumidor, migração de `rait_communication` → projeção de `inf.notice`) remetido a "R-0007 / WP-P"**, mas `inf.rait_communication` segue tabela (`ddl/34-inf-rait-case.sql:417`) e WP-P não tem round em `waves.md`                                                          |
| R-0007 | `rait-backend` — WP-B + WP-C       | rotas, comandos, timers, SSE, contratos RAIT                                      | #69 (CTG-0001/0002), #94 (CTG-0003/0004), #102 (docs), adoção DEVAI #74/#75/#84/#86/#89/#91 | PC-0011 (2026-09-22)                                | `R-0007.jsonl` 42 linhas; sem `evidence-*.json` na raiz da pasta                      | 477 arquivos e ciclos corretivos longos; **#96 (OD-D17)**: `rait.clock.flag-changed`, `rait.decision.published` e `rait.case.created` sem produtor em `main` (sugere R-0007 CTG-0003, já fechado) → DASHBOARD liga 2/11 indicadores do bloco A; README desatualizado ("planned")                                                       |
| R-0008 | `teat-backend` — WP-T2 + T3        | comandos AIT, turno, numeração, sync, evidência, medidas, contratos               | #47–#51; fechamento #52                                                                     | PC-0005                                             | `evidence-CTG-0001…0005.json`                                                         | ~20 iterações de correção; 13 tasks (1 re-decomposição); OD-T13…T73 (`open-decisions-rait.md` §F); OD-T66/T70/T71/T72/T73 roteados a rodadas futuras **sem issue**                                                                                                                                                                     |
| R-0009 | `portal-backend` — WP-P0…P3        | identidade federada, modelo, rotas, projeções, contratos                          | #54, #56; fechamento #57                                                                    | PC-0006                                             | `evidence-CTG-000{1,2}.json`                                                          | 4 iterações restritas do Inspector; OD-P13 fechada (flow descartado); OD-P02 fechada com risco (ADR-0024); PR #58 de lições fechado sem merge (absorvido por #59)                                                                                                                                                                      |
| R-0010 | `boat-backend` — WP-B0…B3          | política `est:*`, `BP-EST-CRASH-001`, comandos, RENAEST (mock), job mensal        | #55, #71; fechamento #72                                                                    | PC-0008                                             | `evidence-CTG-000{1,2}.json`                                                          | catálogos `est.catalog.*` com valores de protótipo `source_pending` (OD-B11); RENAEST só no mock; OD-D49 (`CELL_THRESHOLD=10` literal) repassado                                                                                                                                                                                       |
| R-0011 | `dashboard-backend` — WP-D1…D3     | projeções, ciclo de alerta, deveres, frescor, export, SSE                         | #83, #87; fechamento #88                                                                    | PC-0009                                             | `evidence-CTG-000{1,2}.json`                                                          | handoffs **#96–#100** (OD-D17/D33/D35/D50/D58); o PR #101 que os documentava foi **fechado sem merge**; job de relatórios ausente (#99); `it.todo` no e2e (#100)                                                                                                                                                                       |
| R-0012 | `rait-web` — WP-D + E + F          | 63 fichas, núcleo, dados, 50 páginas, 16 schemas                                  | #79, #81, #85, #90, #92; fechamento #93; observação #95                                     | PC-0010                                             | 5 evidências (CTG-0001, 0002a/b-1/b-2/c)                                              | 17 tasks, 20 iterações; **ficou fora:** 64 comandos reais, `caseAccessGuard` real, endpoint SSE, e2e Playwright, paginação server-side etc. → **#122**; OD-R12-001…054 (`open-decisions-rait.md` §G)                                                                                                                                   |
| R-0013 | `teat-frontends` — WP-T4…T6        | fichas, i18n, provisionamento offline, frontends TEAT                             | #70, #73, #82, #113; fechamento #114; observação #115                                       | PC-0013 (2026-09-24)                                | 10 evidências (observação, homologação, preflight) + `corrections/`, `issues/`        | escopo reduzido por ADR-0033 a **homologação de UI/workflows**; produção mobile (E2/trust, Android/GMS820, V01–V11, ciclo AIT, gate de campo) adiada → **#108–#112**, "R-0017 candidato, não reservado"                                                                                                                                |
| R-0014 | `portal-pwa` — WP-P4…P6            | primeiro app, 27 fichas, PWA, 11 jornadas e2e no mock                             | #60–#66; fechamento #67                                                                     | PC-0007 (2026-09-19)                                | 8 evidências; `closure.md`                                                            | WP-P6 "integração e homologação" provada **só no mock SENATRAN**; OD-P15/16/17/19/61/88/102–108, B1 (Lighthouse), A12(j) → **#125**; OD-P66 fixo no app                                                                                                                                                                                |
| R-0015 | `boat-mobile` — WP-B4 + B5         | 17 fichas, i18n, `@detran/boat-mobile`, 5 páginas web                             | #107, #116; fechamento #117                                                                 | PC-0014 (2026-09-24)                                | `evidence-CTG-000{1,2}.json`, jsonl 2 linhas                                          | sem Capacitor nem camada nativa real (6 `InjectionToken` com doubles); **binding completo campos/formulários = handoff sem item no backlog**; OD-R15-003/005 → #118; OD-R15-004 → #119; OD-R15-006 → comentário em #109; RENAEST real → #120; prompt-reviews pr-5/pr-6 FAIL; delivery CTG-0002 FAIL(16) → PASS; janela 1 com 795k/800k |
| R-0016 | `dashboard-console` — WP-D4 + D5   | 18 fichas, 9 schemas, console                                                     | #80, #103; fechamento #105; observação #106                                                 | PC-0012 (`closed_at` placeholder 00:00)             | `evidence-CTG-0001…0003.json`                                                         | **console em L0** (18 telas "indisponível nesta versão") embora R-0011 estivesse em `main`; a meta "P-09 com supressão secundária ativa" **não foi provada**; CTG-0002 e 0003 no mesmo PR (viola M7); i18n com 307 chaves em vez de 312; OD-D16-001…019 abertos → **#123/#124**                                                        |

---

## 3. Listas consolidadas

### 3.1 Lacunas: planejado e não entregue

| #   | Lacuna                                                                                                                                                                  | Fonte                                                                                                                                                                   |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L1  | Comandos reais RAIT-WEB (64), `caseAccessGuard`, SSE real, e2e Playwright, paginação server-side, `days_remaining`, URL assinada, resumo de turno, schema de ata, PAdES | `backlog.md` l.583–599; `R-0012/plan.md` M8; #122                                                                                                                       |
| L2  | Console DASHBOARD L2: facades, clients, dados reais, supressão secundária P-09 ponta a ponta                                                                            | `R-0016/plan.md` A5; `backlog.md` l.636; #124                                                                                                                           |
| L3  | Produtores dos eventos `rait.clock.flag-changed`, `rait.decision.published` e `rait.case.created` (bloco A do DASHBOARD em 2/11, meta DT-030 = 100 %)                   | #96; `dashboard-build-pack.md` §4 OD-D17                                                                                                                                |
| L4  | Job assíncrono de relatórios do DASHBOARD (`@stynx-nyx/jobs`)                                                                                                           | #99; `R-0011/contracts/CTG-0002.md` §16                                                                                                                                 |
| L5  | Camada nativa real do BOAT (Capacitor: GPS, câmera, assinatura, atestação) e mapeamento tela → porta                                                                    | `R-0015/plan.md` A5; comentário em #109 (OD-R15-006)                                                                                                                    |
| L6  | Binding completo de campos/formulários BOAT                                                                                                                             | `R-0015/reports/TASK-0012.md` l.56; `boat-build-pack.md` l.96/112 — **sem issue e sem item no backlog**                                                                 |
| L7  | TEAT mobile de produção (E2/trust, Android/GMS820, validador V01–V11, ciclo AIT/numeração, gate de campo)                                                               | #108–#112; ADR-0033                                                                                                                                                     |
| L8  | WP-P RAIT: projeções por consumidor, migração de `rait_communication` para projeção de `inf.notice` (ADR-0016 §4, ADR-0020)                                             | `rait-build-pack.md` l.247; `R-0006/plan.md` M10, l.347 — **sem round em `waves.md` e sem issue**; as projeções PORTAL e DASHBOARD saíram parcialmente em R-0009/R-0011 |
| L9  | Integrações reais PORTAL: gov.br, SNE, `@stynx-nyx/privacy`, CRLV-e, cancelamento SNE, mapa de erros                                                                    | #125; `backlog.md` l.602–616                                                                                                                                            |
| L10 | Paridade de rotas e códigos DASHBOARD: rotas GET de exports e relatórios, códigos de estado inválido, tokens de evento, guard 403                                       | #97, #98, #100, #123                                                                                                                                                    |
| L11 | `apps/portal/mobile` (placeholder "Deferred to after Phase 5")                                                                                                          | `apps/portal/mobile/README.md` — sem round nem issue                                                                                                                    |
| L12 | Fase 6: retirada de infra, checklists de paridade por módulo, arquivamento das origens (`pec`, `teat`, `senatran`)                                                      | `BUILD-PLAN.md`; `open-issues.md` DT-003; #121 (só `senatran`)                                                                                                          |
| L13 | Fase 1 (repo STYNX): registry publish (DT-001), RC local (DT-002), runbook gov.br-como-Cognito-IdP                                                                      | `BUILD-PLAN.md`; #121 — o runbook não tem rastreio                                                                                                                      |
| L14 | Engenharia herdada: DT-104 (`CANCELLED` morto no PEC; o issue #15 foi fechado, mas o KB mantém o item aberto) e DT-111 (`crash_record_id` sem FK)                       | `open-issues.md` §F — sem issue aberta                                                                                                                                  |

### 3.2 Postergações (explícitas e implícitas)

**Explícitas:**

- Produção TEAT mobile para um "R-0017 candidato" (ADR-0033; #108–#112).
- Hardware, release de campo e homologação RENAEST/SNE/gov.br fora de R-0015 (`R-0015/AUTHORIZATION.md` Emenda 1; `contracts/CTG-0002.md` §4).
- DASHBOARD L0 → L2 (R-0016 A5).
- RAIT-WEB CTG-0004 (#122).
- Projeções para WP-P (R-0006 M10).
- `apps/portal/mobile` para depois da Fase 5.
- `apps/pec/web` "reserved, not planned".
- Bodycam e guarda monitorada para onda futura (DT-014, DT-015).
- Medidores de velocidade: UC-TEAT-013 fora do MVP (DT-063).
- Faixa de 40 % fora do SNE mantida desligada (DT-012/H.53).
- Cartão/parcelamento com flag off (DT-031).
- Parâmetro de anexos PORTAL "lido em rodada futura" (OD-P66).
- Lighthouse CI até existir ferramenta offline (PORTAL B1).

**Implícitas** (fechadas como PASS com `todo`, provisórios ou "estrutural"):

- `it.todo` OD-D58 (`backend/app/tests/e2e/dashboard-domain-boundary.e2e.spec.ts`).
- Provisórios "executados" OD-D16-001…017, com `policy.ts` prevalecendo sobre o contrato.
- WP-B4/B5 rebaixados a "entrega estrutural".
- Critério i18n reduzido de 312 para 307 chaves.
- P-09 só na apresentação.
- OD-T66/T70–T73 "roteados a rodadas futuras" sem issue.
- ADR-0021 e ADR-0022 ainda "Proposed" embora operantes.

### 3.3 Decisões de OWNER pendentes

| Item                               | Tema                                                                                                    | Fonte                                                             |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| OD-R15-003 / 005                   | `screenId` de W-05; `uxCode` de S-12                                                                    | #118; `R-0015/plan.md`                                            |
| OD-R15-004                         | 13 textos pt-BR `source_pending` do BOAT                                                                | #119                                                              |
| OD-D16-005                         | passe global de administrador × camadas DASHBOARD (viola RN-DASH-170)                                   | `backlog.md` l.621; #123                                          |
| OD-D16-009, 012, 014, 019          | formas do SeverityChip, textos i18n, grupos de navegação, textos das fichas                             | `backlog.md` l.625–635; #123                                      |
| OD-P61, OD-P103                    | enum legal SNE; rótulo cidadão de CNH bloqueada                                                         | #125                                                              |
| OD-001, OD-013                     | autoridade, prazo e escala das 55 autoridades (recurso vinculado)                                       | `open-decisions-rait.md` §A; `decision-closure-plan.md` §1 item 6 |
| OD-003, OD-012/207, OD-010, OD-011 | 40 % fora do SNE; jeton; desistência × 360 d; reformatio in pejus                                       | `open-decisions-rait.md` §A/§C                                    |
| OD-T01, OD-T03 (DT-016)            | papéis TEAT; janela de sessão concorrente (aguarda histórico)                                           | `decision-closure-plan.md` §1/§4                                  |
| DT-019                             | proprietário hospitalizado: 60 d (Owner "não sei"; premissa adotada)                                    | `open-issues.md` §B                                               |
| OD-B11, OD-B06                     | catálogos BOAT e derivação de severidade                                                                | `decision-closure-plan.md` §4 BOAT                                |
| OD-D04…D13 (cédula 07)             | calibrações DASHBOARD `proposta`                                                                        | idem                                                              |
| Reservadas (DESIGN-DECISIONS)      | separação dos pools Cognito staff × cidadão; espelho público do senatran-mock; prazos estatutários RAIT | `DESIGN-DECISIONS.md` (fim)                                       |
| Envio dos 6 ofícios                | ato do Owner; nenhum foi datado                                                                         | `owner-ballots/letters/README.md`                                 |

Decisões de Architect correlatas, que não são do Owner: #97, #98, #100, OD-R12-* (§G) e OD-D16-001…017.

### 3.4 Homologações pendentes

| Integração                                                | Situação                                                                         | Fonte                                      |
| --------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------ |
| SENATRAN real (`SENATRAN_PROVIDER=real`), RENAINF         | só mock; OD-306 (`SituacaoRenainf`) depende do contrato real                     | ADR-0003/0008; `open-decisions-rait.md` §D |
| RENAEST (BAT)                                             | mock e outbox; manuais e campos não obtidos (DT-061, ofício 04 não enviado)      | #120; `R-0015/closure.json`                |
| SNE (PORTAL `SnePort`, cancelamento)                      | mock                                                                             | #125 OD-P16/P106                           |
| gov.br (credenciais e callback)                           | não homologado                                                                   | #125 OD-P15                                |
| Cognito real (pools)                                      | "requires deployment credentials"                                                | `R-0002.jsonl` externalBoundary            |
| SEFAZ (PEC)                                               | adapter e mocks; execução real exige credenciais                                 | `R-0002.jsonl`                             |
| PAdES / preservação LTA                                   | desabilitado ("pending real preservation provider"); RAIT sem PAdES (OD-R12-043) | `R-0002.jsonl`; #122                       |
| Banco / arrecadação (ADR-0017), cartão                    | port bancário mock; autorização federal do cartão pendente (DT-072)              | ADR-0017; `open-issues.md`                 |
| Dispositivo GMS820 / Android, impressora, provisionamento | equipamento homologado; app não provado                                          | #109, #112                                 |
| VAPID / push                                              | fonte auditável indefinida                                                       | #125 OD-P88                                |
| Registry STYNX e RC                                       | DT-001/DT-002                                                                    | #121                                       |

### 3.5 Referências normativas e legais pendentes (cruzado com #126)

| ID                                   | Tema                                                                                                                                                | Tipo                     | Fonte                                          |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ---------------------------------------------- |
| DT-040                               | 15 itens TEAT; conflito MBFT §8.3 × CTB 165/165-A × Res. CONTRAN 432 art. 10 (recolhimento do documento)                                            | legal                    | `open-issues.md` §C                            |
| DT-041                               | top-10 PEC em `legal-assessment.md`                                                                                                                 | legal                    | idem                                           |
| DT-042 / DT-043                      | PORTAL/DASHBOARD (18 itens) e RAIT (15 itens) sem parecer formal → ofício 05 PGE-AM **não enviado**                                                 | legal                    | idem; `letters/README.md`                      |
| DT-044 / OD-302                      | CTB art. 289-A: efeito do julgamento tardio, suspensão/interrupção                                                                                  | legal                    | idem; `open-decisions-rait.md` §D              |
| DT-045 / OD-011                      | reformatio in pejus na 2ª instância                                                                                                                 | legal                    | idem                                           |
| OD-301 / OD-305                      | Lei 9.873/1999 × órgão estadual (Res. 918 art. 36); NP interrompe prescrição?                                                                       | legal                    | `open-decisions-rait.md` §D; REF-STJ-1293-1294 |
| OD-303 / OD-304                      | CTB art. 282 §6º-A (T-NA/T-DEC fora do flagrante); T-NA-IND vencido                                                                                 | legal                    | idem                                           |
| OD-308                               | 22 RNs série 1xx em `draft` sem revisão individual                                                                                                  | legal                    | idem                                           |
| DT-046                               | saneamento e cancelamento pós-finalização: portaria estadual necessária                                                                             | legal                    | `open-issues.md`                               |
| DT-047 / 048 / 049 / 053             | LGPD: saúde da vítima (art. 11), papel de controlador (Portaria 139/2025), retenção BAT/bodycam, **menores (art. 14) nunca endereçado**             | legal                    | idem; R-0015                                   |
| DT-052                               | LGPD RAIT (RN-RAIT-133…138) não validada                                                                                                            | legal                    | idem                                           |
| DT-050 / 051                         | níveis de assinatura: PN DETRAN-AM 001/2025 só nomeia ouro; Owner aceitou prata (H.50) → portaria pedida (ofício 01); CETRAN (ofício 02); ouvidoria | legal / institucional    | idem; ADR-0024                                 |
| DT-060 / 071                         | regimentos JARI-AM/CETRAN-AM; composição da JARI × Res. CONTRAN 357/2010                                                                            | institucional            | idem                                           |
| DT-070 / OD-009                      | "prazo de 120 dias" do DETRAN-AM                                                                                                                    | institucional            | idem                                           |
| DT-069                               | Unidade de Controle Interno (Decreto AM 53.273/2025 art. 7º)                                                                                        | institucional            | idem                                           |
| DT-072                               | autorização federal para cartão/parcelamento (Res. 918 art. 27)                                                                                     | institucional            | idem                                           |
| DT-061 / DT-082                      | manuais RENAEST; base normativa do RENAEST; art. 326-A §9º não regulamentado                                                                        | institucional / pesquisa | idem; `backlog.md` l.62/185                    |
| DT-080 / 081 / 083 / 084 / 085 / 086 | LAI estadual; força maior (CTB 290-A); Res. 918 × Lei 14.599 (60 %); `no_approach_reason`; PNATRANS; RENAINF interestadual                          | pesquisa                 | `open-issues.md` §E                            |
| DT-066                               | adesão do AM à Lei 14.129/2021                                                                                                                      | institucional            | idem                                           |
| DT-068                               | grafia do signatário da Portaria 5046/2018                                                                                                          | institucional            | idem                                           |

A #126 cobre essas frentes só em nível de tópico (7 checkboxes). Ela não traz o "registro obrigatório por item" que ela mesma exige.

---

## 4. Itens órfãos (BUILD-PLAN × rounds × issues)

**No plano, sem round:**

- Fase 0: W0.3 (refresh do adoption-prompt do mock).
- Fase 1: runbook gov.br-como-Cognito-IdP.
- Fase 3: "teat app re-host" só em parte, via R-0013.
- Fase 6: retirada de infra, checklists de paridade e arquivamentos.
- WP-P RAIT (projeções por consumidor, ADR-0020): o `waves.md` afirma "todos os WPs aparecem exatamente uma vez", o que é falso para WP-P.
- `apps/portal/mobile`.

**Em round, sem issue:**

- Binding de campos BOAT (L6).
- WP-P / `rait_communication` (L8).
- OD-T66/T70/T71/T72/T73 (R-0008).
- OD-R12-* individuais (agregados em #122).
- OD-D49.
- OD-B11 (catálogos BOAT `source_pending`).
- DT-104 e DT-111.
- Flake `rait-priority-upgrade.integration.spec.ts` (R-0016).

**Issue sem round:**

- #121 (plataforma, fora do repositório).
- #126 (externo).
- #108–#112, #118–#120, #122–#125: todas sem round aberto. Existe só o "R-0017 candidato" citado em #108–#112.

**Rounds sem pasta ou sem closure formal:** R-0002 (sem pasta) e R-0001 (sem closure; prompt placeholder).

**Documentação de handoff perdida:** PR #101 (handoffs R-0011 no backlog) foi fechado sem merge. As issues #96–#100 existem, mas a linha correspondente em `backlog.md` só aparece de forma resumida.

**KB defasado:**

- `open-issues.md` tem frontmatter `updated: 2026-08-28`, mas o conteúdo vai até 2026-09-14.
- `porting-checklist.md` ainda diz que os apps "são stubs".
- DT-104 aberto no KB × issue #15 fechada.

---

## 5. Avaliação da qualidade do processo

**Pontos fortes:**

- Método uniforme desde R-0003: plan, AUTHORIZATION, contratos CTG, prompts, reviews com verdict JSON e bridge, evidências, budget e closure.
- Cadeia hash válida e PCs registrados.
- Reviewer de outra família efetivamente reprova (FAIL recorrente, depois PASS).
- Handoffs honestos e fail-closed: `source_pending` não renderizado, sem textos inventados, mocks declarados como mocks.

**Fragilidades:**

1. **Estado derivado não é atualizado no fechamento.** O README de rounds, `waves.md` "em CI", `AUTHORIZATION.md` ativos, ADRs "Proposed" e a versão DEVAI divergente mostram que a closure não varre os índices.
2. **"PASS" com critérios renegociados durante a execução** (L0, 307/312, P-09, "estrutural"). O critério original não é marcado como _not met_ em `closure.json`; ele é reescrito.
3. **Retrabalho alto:** R-0008 ~20 iterações, R-0012 20, R-0015 até 6 por task, prompts reprovados em série. Houve erros do próprio maestro: escrita fora da fronteira (R-0016 A9), arquivo fora da worktree, `audit observe` com HEAD errado, `.gitignore` ocultando `features/reports`.
4. **Orçamento pouco confiável:** janela excedida (R-0015); números divergentes entre `budget.json` e `closure.json` (R-0016); telemetria "estimativa agregada".
5. **M7 violada** (dois CTGs no PR #103); `closed_at` artificial (PC-0012).
6. **Rodadas pré-método (R-0001/R-0002) sem papéis de trabalho equivalentes.** R-0002, a maior entrega de domínio (PEC), não tem plano nem closure humana.
7. **Dependências externas sem dono operacional:** nenhum ofício enviado 12 dias após a redação; #126 genérica.

**Nota qualitativa:** a execução técnica e a evidência estão bem controladas. A governança de escopo (o que "fechado" significa) e a atualização dos índices estão fracas.

---

## 6. Recomendações

1. **(Architect)** Corrigir os índices de estado:
   - `work/rounds/README.md`: estados, PCs e maestros.
   - `waves.md` l.66 e `dashboard-build-pack.md` l.112/136.
   - `AUTHORIZATION.md` de R-0015/R-0016 para `closed`.
   - Status de ADR-0021/0022.
   - `CLAUDE.md` para DEVAI 1.5.6.
   - Frontmatter de `open-issues.md` e `porting-checklist.md`.
   - Acrescentar à checklist de `devai round close` uma varredura desses índices.
2. **(Architect)** Criar `work/rounds/R-0002/README.md` (ou uma nota no README) apontando PR #26, o jsonl e as fronteiras fail-closed. Registrar que R-0001/R-0002 são pré-método, sem PC.
3. **(Architect)** Em `closure.json`, separar `criteria_met` de `criteria_renegotiated`, com link para o handoff (L0, P-09, i18n 307, BOAT "estrutural").
4. **(Owner/Architect)** Abrir issues para os órfãos:
   - L6 (binding BOAT).
   - L8 (WP-P / `rait_communication`); também corrigir a afirmação de cobertura em `waves.md`.
   - OD-T66/T70–T73.
   - OD-B11, DT-104/DT-111 e o flake de R-0016.
   - `apps/portal/mobile`.
   - Fase 6 (arquivamento de `pec`/`teat`, retirada de infra).
   - Runbook gov.br-IdP.
5. **(Owner)** Planejar formalmente a próxima onda (R-0017+) com rounds nomeados para #122, #124/#123, #125, #108–#112 e #120. Ordenar pelo impacto: #96 (produtores de eventos RAIT) destrava o DASHBOARD; #122 destrava o RAIT operacional.
6. **(Owner)** Enviar os ofícios 01–06 e registrar as datas. Desdobrar a #126 em sub-issues com o "registro obrigatório por item" (órgão, pergunta, fonte, bloqueio, último pedido). Prioridade: P1 LGPD (DT-047/049/053), DT-044/OD-301…305 (prazos RAIT) e DT-061 (RENAEST).
7. **(Owner)** Decidir as questões diretas baratas que hoje bloqueiam UI: OD-R15-003/004/005 (#118/#119), OD-D16-005 (passe global, risco de acesso indevido) e OD-D16-009/019.
8. **(Engineer/Inspector)** Tornar o orçamento de janela um gate efetivo (parar em 80 %) e padronizar a telemetria por task. Proibir `closed_at` sintético.
