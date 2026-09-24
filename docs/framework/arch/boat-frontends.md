---
id: ARCH-BOAT-FRONTENDS
title: BOAT — especificação dos frontends de sinistro (módulo mobile de campo, retaguarda web, toque cidadão)
status: draft
apps: [boat, teat, portal]
updated: 2026-09-24
---

# Frontends do BOAT — registro de sinistro

Especificação de construção das superfícies do BOAT (Boletim de Acidentalidade de Trânsito,
domínio `est`): o **módulo de sinistro do aplicativo de campo** (grupo `sinistros` da matriz
oficial de 67 telas, 11 telas existentes + 1 nova, empacotado em `apps/boat/mobile` e carregado
pelo mesmo shell de campo do TEAT), o **módulo de retaguarda web** (grupo `crashes`, 4 telas + 1
nova, no console `apps/teat/web`) e o **toque cidadão** (consulta e download do BAT, já
especificado em `portal-frontends.md` T-18/T-19). Companheiros: `boat-route-contract.md`,
`boat-error-catalog.md`, `boat-build-pack.md`.

Fontes de verdade: [APP-BOAT], [WF-BOAT-001] (ciclo local e submáquina nacional), [WF-BOAT-002]
(parceiro facultativo — visão futura, steering F.31), [WF-BOAT-003] (validação em três níveis e
terminal sem correção, DT-020), [UC-BOAT-001]…[012], [RN-BOAT-001]…[132], [JRN-BOAT-001]…[005],
[IU-BOAT-001]; regras transversais de [IU-TEAT-001] §D; matriz de paridade da origem (`crash-*`,
149 transições) e `BP-CRASH-RECORDS-001`. Quando divergirem, vale o artefato de produto.

## 1. Stack, princípios e fronteiras

| Item            | Decisão                                                                                                                                                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Empacotamento   | `apps/boat/mobile` = biblioteca de features Angular 22 (`@detran/boat-mobile`) com o módulo `sinistro`, carregada lazy pelo shell de campo de `apps/teat/mobile` (`teat-frontends.md` §1); mesma sessão, mesmo bootstrap, mesma fila offline, mesmo indicador de bodycam |
| Retaguarda      | módulo `sinistros` em `apps/teat/web/features/` (rotas `/fiscalizacao/sinistros*`), mesmo kit `@detran/ui`                                                                                                                                                               |
| Runtime mobile  | `@stynx-nyx/mobile-runtime`: GPS real, câmera, editor de croqui, assinatura, armazenamento cifrado (a camada nativa nova é a do BOAT, `apps/boat/mobile/README.md`)                                                                                                      |
| API             | `/v1/est/crash/*` (`boat-route-contract.md`); RENAEST só pelo adapter (`RenaestPort`, ADR-0003); nenhuma máquina RENAEST local (a nacional é do mock/União)                                                                                                              |
| Estado mobile   | agregado local versionado `crash-record` na fila do TEAT (`entity_type=crash-record`, um item por sinistro; vítimas, veículos, pessoas, condutas, danos, testemunhas e croqui no mesmo payload canônico)                                                                 |
| Dados sensíveis | tela de vítimas abre por perfil e finalidade, auditada; nenhum campo mostra retenção "permanente"; `health_notes` orienta ao mínimo ([RN-BOAT-003], [RN-BOAT-122]…[126])                                                                                                 |
| Vocabulário     | "sinistro", nunca "acidente" ([RN-BOAT-110]); gravidade = enum federal `SEM_VITIMA \| COM_VITIMA_FERIDA \| COM_VITIMA_FATAL` ([RN-BOAT-111]); dinâmica sempre "não conclusiva" ([RN-BOAT-121])                                                                           |
| Fronteiras      | o app registra fato, não apura crime nem responsabilidade civil; não decide seguro/DPVAT; não recoleta dado de RENAVAM/RENACH/RENAINF ([RN-BOAT-107])                                                                                                                    |

## 2. Invariantes de interface

1. **Cena viva primeiro**: socorro e preservação antes de dados; o fluxo aceita registro parcial e retoma ([JRN-BOAT-001]).
2. **`occurred_at` ≠ `recorded_at`**, ambos obrigatórios e distintos na tela ([UC-BOAT-001] AC-3).
3. **Quatro condições obrigatórias** (via, clima, iluminação, sinalização) de catálogo fechado (AC-BOAT-001-4).
4. **Sem `evaded`**: condutas de cena capturadas por dever descumprido nos três regimes (art. 176 cinco incisos; art. 177; art. 178), com o **regime derivado da presença de vítima** e nomeado na tela ([UC-BOAT-007], [RN-BOAT-114]…[117]).
5. **Gravidade ↔ vítimas**: gravidade com vítima exige ao menos uma vítima com `severity`; sem vítima, a tela de vítimas não abre ([RN-BOAT-001], [RN-BOAT-002]).
6. **"Fotografar a cena, não o sofrimento"** ([UC-BOAT-004] AC-3): orientação fixa na captura de evidências.
7. **Encerrar exige ≥ 1 veículo ou pessoa** ([RN-BOAT-004]) e revisão explícita (`crash-review`, gate).
8. **Nada bloqueia por falta de rede**; sincronização pela fila do TEAT com recibo por item.
9. **Terminal nacional é definitivo**: `CONSOLIDADO`/`REJEITADO` não aceitam correção; a UI diz isso explicitamente (AC-BOAT-011-5, DT-020).
10. **Bodycam obrigatória** no atendimento a sinistro ([RN-BOAT-129]); chrome do TEAT.
11. **Titular sem máscara, terceiro mascarado** ([RN-BOAT-126]; portal T-19).

## 3. Papéis e guardas

Mesmos cinco papéis do núcleo TEAT (`field-agent`, `field-supervisor`, `processing-operator`,
`traffic-authority` como Coordenador de RENAEST, `AUDITOR`); `integration-operator` para o painel
RENAEST; parceiro facultativo **sem papel** (visão futura). Guardas mobile: `shiftGuard`,
`readinessGuard`, `victimAccessGuard` (perfil + finalidade + auditoria). Web: `roleGuard` por
rota; W-05 (pedidos do titular) exige `processing-operator` ou `AUDITOR` com finalidade declarada.

## 4. Mobile — módulo `sinistro` (12 telas)

Rotas `/crash-*` no shell de campo; `crash-start` na barra inferior. Assistente linear com
"Continuar" condicionado aos dados mínimos da etapa, `Voltar` contextual, ajuda MBFT, e saídas
cruzadas para consulta veicular/condutor, AIT e medida.

| id   | Tela (uxCode — `screenId`)                  | Conteúdo                                                                                                                                                          | Gate / UC                                              |
| ---- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| S-01 | 060 `crash-start`                           | tipo (catálogo `crash_type`), gravidade (enum federal), turno; cria rascunho local                                                                                | `RASCUNHO → EM_ATENDIMENTO` (`start`) — [UC-BOAT-001]  |
| S-02 | 061 `crash-location`                        | `occurred_at`, `recorded_at` (pré-preenchido, editável), GPS + precisão, endereço, UF/município, via/km/sentido, referência                                       | AC-001-3                                               |
| S-03 | 062 `crash-conditions`                      | via, clima, iluminação, sinalização (4 obrigatórias, catálogo)                                                                                                    | AC-001-4                                               |
| S-04 | 063 `crash-vehicles`                        | lista; "+ Veículo" → `vehicle-search` (snapshot) ou manual; papel, sequência, dano aparente; **sem evadido**                                                      | [UC-BOAT-002] AC-2                                     |
| S-05 | 064 `crash-people`                          | "+ Pessoa" → `driver-search` ou manual; papel (condutor/passageiro/pedestre/ciclista), vínculo a veículo, cinto/capacete; recusa registrada não bloqueia          | [UC-BOAT-002]                                          |
| S-06 | 065 `crash-victims`                         | por pessoa: `severity` (enum), óbito no local/`death_at`, atendimento médico, hospital de destino, `health_notes` mínimo; acesso auditado; sem "permanente"       | [UC-BOAT-003]; abre só se gravidade com vítima         |
| S-07 | 066 `crash-dynamics` (condutas de cena)     | regime derivado (176 · 177 · 178) nomeado; cinco incisos do 176 como cinco registros por condutor; 177 sujeito distinto; 178 só remoção; narrativa não conclusiva | [UC-BOAT-007]                                          |
| S-08 | 067 `crash-sketch`                          | editor simples ou anexo (evidência) ou mapa georreferenciado; `sketch_type`, `drawing_json`                                                                       | [UC-BOAT-004]                                          |
| S-09 | 068 `crash-evidence`                        | fotos com hash e custódia (TEAT); orientação "cena, não sofrimento"                                                                                               | [UC-BOAT-004]                                          |
| S-10 | 069 `crash-ait-links`                       | AITs e medidas do mesmo atendimento; "criar AIT decorrente" → `ait-start`; "criar medida" → `measure-start`; remoção 279-A                                        | [UC-BOAT-004], [UC-BOAT-006]                           |
| S-12 | **novo** `crash-damages` (`source_pending`) | danos materiais por natureza do bem (veículo de terceiro, mobiliário urbano, sinalização, edificação, outro); testemunhas (registro próprio, recusa registrada)   | [UC-BOAT-012]; `IU-BOAT-S-12.md`, boundary `B+S, BOAT` |
| S-11 | 070 `crash-review`                          | checklist de dados mínimos, vítimas (acesso restrito), relatório preliminar (PDF), **finalizar** → fila                                                           | `→ REGISTRADO/FECHADO` local; [UC-BOAT-005]            |

Transições: as 149 da matriz viram `transitions.ts` do módulo (cadeia do assistente, saídas
cruzadas, barra inferior, ajuda); a nova S-12 entra entre S-10 e S-11.

## 5. Web — módulo `sinistros` (5 telas)

| id   | Rota                                             | Conteúdo                                                                                                                               | UC / estado                                  |
| ---- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| W-01 | `/fiscalizacao/sinistros` (060)                  | lista com filtros (estado, gravidade, município, período, agente), destaque `PENDENTE_COMPLEMENTO`                                     | [JRN-BOAT-004]                               |
| W-02 | `/fiscalizacao/sinistros/:id` (061)              | abas: dados, veículos, pessoas, vítimas (guardada), condutas, danos/testemunhas, croqui e evidências, AITs/medidas, histórico, RENAEST | qualquer estado                              |
| W-03 | `/fiscalizacao/sinistros/:id/complementar` (062) | complemento de dados mínimos; validar                                                                                                  | `PENDENTE_COMPLEMENTO → REGISTRADO/VALIDADO` |
| W-04 | `/fiscalizacao/sinistros/:id/renaest` (063)      | cascata de validação (municipal → estadual → nacional) e situação nacional; transmitir, complementar, corrigir; terminal explicado     | [WF-BOAT-003], [UC-BOAT-009], [UC-BOAT-011]  |
| W-05 | **novo** `/fiscalizacao/sinistros/titular`       | pedidos do titular (acesso, correção, eliminação) com finalidade e trilha                                                              | [RN-BOAT-126] (UC-BOAT-013 a criar)          |
| —    | `/tecnico/integracoes?system=renaest`            | fila da outbox RENAEST (compartilhada com o TEAT)                                                                                      | [UC-BOAT-011]                                |

## 6. Componentes

Mobile (`apps/boat/mobile/src/lib/shared/`): `SeverityPicker` (enum federal, deriva regime),
`ConditionsQuad` (4 catálogos), `InvolvedList` (veículos/pessoas com origem snapshot × manual),
`VictimCard` (guardado por `victimAccessGuard`, campos de saúde com orientação de mínimo),
`SceneDutyChecklist` (176 I–V por condutor · 177 · 178), `SketchEditor` (desenho, anexo, mapa),
`DamageWitnessForm`, `CrashLinksPanel` (AIT/medida), `PreliminaryReportButton`,
`MinimumDataChecklist`. Reutiliza do TEAT: `LocationField`, `EvidenceCapture`,
`ProposedValueField`, `ClosedEnumPicker`, `QueueItemCard`, `BodycamIndicator`.

Web (`apps/teat/web/features/sinistros/shared/`): `CrashStateBadge`, `CrashDetailTabs`,
`VictimPanel` (acesso com finalidade), `RenaestCascade` (níveis, situação nacional, terminal),
`ComplementForm`, `RectificationDialog` (complemento × correção), `SubjectRequestForm` (W-05),
`RenaestOutboxTable`.

## 7. Jornadas (rota → ação → comando → efeito)

| Jornada                    | Sequência                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [JRN-BOAT-001] com vítima  | `crash-start` (gravidade com vítima) → `crash-location` → `crash-conditions` → `crash-vehicles` → `crash-people` → `crash-victims` (vítima levada antes dos dados completos: registro parcial) → `crash-dynamics` (regime 176) → `crash-sketch` → `crash-evidence` → `crash-ait-links` (remoção 279-A, AIT decorrente) → `crash-damages` → `crash-review` → finalizar → fila (`crash-record`) |
| [JRN-BOAT-002] sem vítima  | `crash-start` (sem vítima) → … → `crash-people` → `crash-dynamics` (regime 178, só remoção) → `crash-sketch` → `crash-evidence` → `crash-damages` (autocomposição não é registro; danos e testemunhas sim) → `crash-review`                                                                                                                                                                   |
| [JRN-BOAT-004] coordenador | W-01 → W-02 → W-03 (`complement` + `validate`) → W-04 (`close` → `transmit` → cascata; `complement`/`correct` enquanto não terminal; terminal explicado) → painel da outbox                                                                                                                                                                                                                   |
| [JRN-BOAT-005] cidadão     | Portal T-18 → T-19 (titular sem máscara; terceiros mascarados; download do BAT selado)                                                                                                                                                                                                                                                                                                        |
| [JRN-BOAT-003] parceiro    | **visão futura** (F.31): sem tela; contrato reservado em `boat-route-contract.md` §6                                                                                                                                                                                                                                                                                                          |

## 8. Formulários, validação e gates

| Formulário / tela      | Campos obrigatórios                                                                              | Validação de forma                                                                | Gate                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `crash-start`          | `crash_type`, `severity`, turno aberto                                                           | catálogos fechados                                                                | `RASCUNHO → EM_ATENDIMENTO` (`start`)                                       |
| `crash-location`       | `occurred_at`, `recorded_at`, localização (GPS ou manual marcado), UF, município                 | `occurred_at ≤ recorded_at`; precisão informada                                   | —                                                                           |
| `crash-conditions`     | 4 condições                                                                                      | catálogos                                                                         | —                                                                           |
| `crash-vehicles`       | ≥ 0; por veículo: papel, sequência                                                               | placa Mercosul/antiga quando informada; snapshot preferido                        | —                                                                           |
| `crash-people`         | por pessoa: papel; vínculo opcional; cinto/capacete                                              | CPF válido quando informado                                                       | —                                                                           |
| `crash-victims`        | por vítima: pessoa, `severity`; óbito/`death_at` coerentes                                       | `death_at` exige `death_at_scene` ou atendimento; `health_notes` ≤ 500 caracteres | só se gravidade com vítima; acesso auditado                                 |
| `crash-dynamics`       | regime derivado; por condutor os 5 incisos do 176 (com vítima) ou 178 (sem vítima); 177 opcional | nenhum booleano "evadiu"                                                          | —                                                                           |
| `crash-sketch`         | um dos três tipos                                                                                | —                                                                                 | —                                                                           |
| `crash-evidence`       | ≥ 1 foto da cena (proposta) com hash                                                             | tipos aceitos                                                                     | —                                                                           |
| `crash-damages`        | por dano: natureza do bem, descrição; testemunha: nome, contato, recusa                          | —                                                                                 | dano a equipamento viário abre pendência de comunicação                     |
| `crash-review`         | dados mínimos completos (≥ 1 veículo ou pessoa; vítimas se gravidade exigir)                     | checklist verde                                                                   | finalizar → item `crash-record` na fila (`content_hash`, `idempotency_key`) |
| W-03 complementar      | campos faltantes                                                                                 | —                                                                                 | `PENDENTE_COMPLEMENTO → REGISTRADO` → `validate` → `VALIDADO`               |
| W-04 fechar/transmitir | dinâmica final; chave natural completa                                                           | gravidade com vítima exige vítimas (gate local, [RN-BOAT-002])                    | `close` → `FECHADO` → `transmit` (adapter, `Idempotency-Key`) → `INTEGRADO` |
| W-04 retificar         | motivo, campos alterados                                                                         | bloqueado se nacional terminal                                                    | `complement`/`correct` → `EM_ANALISE` nacional                              |
| W-05 titular           | pedido (acesso/correção/eliminação), finalidade, identificação do titular                        | eliminação bloqueada até DT-049                                                   | registro auditado; resposta com prazo do regime público                     |

## 9. Dados e sincronização

Item `crash-record` na fila offline do TEAT (`teat-route-contract.md` §4.3), aplicado
transacionalmente pelo módulo `est/crash`; evidências pelo protocolo de intenção do TEAT;
recibos por item; projeções `dashboard.crashes` e `portal.crash_view` (ADR-0020); RENAEST via
outbox + `RenaestPort` (`submitCrash`, `complementCrash`, `correctCrash`, `getCrashByProtocol`).

## 10. Dependências de backend

| Dependência                                                                                                                                      | Situação                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `backend/domains/est/crash` (blueprint `BP-EST-CRASH-001`, DDL, CRUD)                                                                            | inexistente (só README); Fase 5 W5.1                        |
| Comandos `start`, `add-*`, `attach-sketch`, `validate`, `close`, `transmit`, `complement`, `correct`, `record-duty`, `add-damage`, `add-witness` | pendentes (política parcial em `policy.ts`)                 |
| Aplicação do item `crash-record` pela sincronização do TEAT                                                                                      | depende de WP-T2                                            |
| RENAEST outbox + mapeamento campo a campo (Manuais RENAEST, DT-061)                                                                              | adapter existe (mock); mapeamento pendente                  |
| PII estendida a todos os campos de vítima; prazos de retenção (DT-049)                                                                           | decisão pendente; tela S-06 e W-05 não vão a produção antes |
| Editor de croqui, GPS, câmera nativos                                                                                                            | camada nativa nova do BOAT (Fase 5 W5.2)                    |
