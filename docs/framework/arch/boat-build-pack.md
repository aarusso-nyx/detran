---
id: ARCH-BOAT-BUILD-PACK
title: Pacote de construção do BOAT — definições e pacotes de trabalho para a orquestra (domínio est/crash, módulo de campo, retaguarda, RENAEST)
status: draft
apps: [boat]
updated: 2026-09-13
---

# Pacote de construção do BOAT

Índice das definições para construir `backend/domains/est/crash`, o módulo de sinistro do app de
campo (`apps/boat/mobile`), a retaguarda web e a integração RENAEST. Segue `rait-build-pack.md` §0
e os manuais de `docs/meta/agents/`. Fontes: [APP-BOAT], [WF-BOAT-001…003], [UC-BOAT-001…012],
[RN-BOAT-001…132], [JRN-BOAT-001…005], [IU-BOAT-001]; `boat-frontends.md`,
`boat-route-contract.md`, `boat-error-catalog.md`; `teat-build-pack.md` (fila, evidência, shell
de campo); ADR-0003/0008 (adapter), ADR-0018 (BAT em PDF/A), ADR-0020 (projeções); origem:
`BP-CRASH-RECORDS-001`, `crash-records.md`, matriz `crash-*`, `RenaestPort` e mock RENAEST.

## 1. Estado de partida (verificado em 2026-09-13)

| Item                  | Situação                                                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `backend/domains/est` | BP-EST-CRASH-001, DDL `70-est-crash.sql`, módulo `@detran/est-crash` e testes entregues em R-0010; B4/B5 fora desta rodada                      |
| Política              | regras `est:crash-record:*` reconciliadas ao corpus; UC-BOAT-013 e índice de use cases transcritos em R-0010                                    |
| Adapter               | `RenaestPort` completo (7 operações) sobre o mock; mapeamento campo a campo provisório, com campos a confirmar por DT-061/OD-B08                |
| Origem                | blueprint com 5 entidades (com `evaded`, PII `forever`), 7 comandos, 32 rotas, 11 telas mobile (todas shell), 4 web                             |
| Corpus                | WF-001 `approved`; UC-001/002/004/007/012 `approved`, demais `reviewed`; 36 regras `draft`; nove residuais DT-017…061                           |
| Bloqueios de produção | S-06/W-05 têm hipótese e retenção registradas conforme H.44/H.45; produção real, homologação RENAEST e campos nacionais continuam sem evidência |

## 2. Pacotes de trabalho

### WP-B0 — Reconciliação e política (Engineer; Owner para o índice) — executado na parte comprovada

Alinhar `policy.ts` ao corpus (`attach-sketch` + `processing-operator`; `validate` =
`processing-operator`, `traffic-authority`; novas ações `record-duty`, `add-damage`,
`add-witness`, `link`, `record`, `complement`, `cancel`, `transmit`, `rectify`, `archive`,
`subject-request`; leitura de `crash-victim` com finalidade); atualizar `use-cases/INDEX.md`
(status reais, UC-012 não é stub); criar `UC-BOAT-013` (dever de resposta ao titular, W-05).
Entrega comprovada: `est:*` reconciliado, UC-BOAT-013 e índice transcritos; os gates de política e KB passaram nos respectivos relatórios de R-0010. A validação do procedimento de resposta ao titular continua `source_pending`.

### WP-B1 — Modelo de dados (Architect-blueprint) — executado

| Blueprint `BP-EST-CRASH-001` (namespace `est`)                                                                                                                      | Entidades                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `crash_record`                                                                                                                                                      | campos da origem **menos** nada; **mais** `severity` obrigatório (enum federal), `location_reference`, `ait_links` via tabela, `source_*`, `version`; check de estado (`WF-BOAT-001`), check `occurred_at <= recorded_at`, check gravidade × vítimas no fechamento (função) |
| `crash_vehicle`                                                                                                                                                     | sem `evaded`; `plate` PII com retenção por parâmetro                                                                                                                                                                                                                        |
| `crash_person`                                                                                                                                                      | + `refused_data`; `name`/`document_number` PII                                                                                                                                                                                                                              |
| `crash_victim`                                                                                                                                                      | todos os campos marcados dado de saúde (`pii: sensitive-health`), retenção por parâmetro (nunca `forever`), acesso com finalidade                                                                                                                                           |
| `crash_scene_duty` (novo)                                                                                                                                           | `regime`, `duty_code` (176_I…V, 177, 178), `crash_person_id?`, `crash_vehicle_id?`, `complied`, `note`                                                                                                                                                                      |
| `crash_damage`, `crash_witness` (novos)                                                                                                                             | [UC-BOAT-012]                                                                                                                                                                                                                                                               |
| `crash_sketch`                                                                                                                                                      | como a origem                                                                                                                                                                                                                                                               |
| `crash_link` (novo)                                                                                                                                                 | `kind: ait                                                                                                                                                                                                                                                                  | measure`, `target_id`, sem FK rígida (DT-111) |
| `crash_renaest_submission` (novo)                                                                                                                                   | protocolo, `layout_version`, situação nacional espelhada, retificações (`kind`, motivo, situação), chave natural                                                                                                                                                            |
| `crash_subject_request` (novo)                                                                                                                                      | pedido do titular (kind, finalidade, decisão, prazo)                                                                                                                                                                                                                        |
| `est.crash_state_ref`, `est.crash_severity_ref`, `est.scene_duty_ref`, `est.crash_condition_ref` (via, clima, iluminação, sinalização), `est.damage_asset_kind_ref` | referência seedada, verificada por `verify:lifecycle-vocabulary` estendido                                                                                                                                                                                                  |

Timer `T-BOAT-TRANSM` (mensal, proposta) no motor de prazos com `owner='sinistro'`. Fixtures: um
registro por estado local, um por situação nacional, um com vítima e um sem, um com retificação.
Gate comprovado: `blueprints:check`, `verify:rls-ddl`, vocabulário, contratos derivados e seeds em banco limpo passaram. O DDL canônico desta rodada é `70-est-crash.sql`, aplicado por `apply.sh`.

### WP-B2 — Comandos, sincronização e RENAEST (Engineer-backend; Architect no mapeamento) — executado na parte comprovada

Ler `boat-route-contract.md`, `boat-error-catalog.md`, `teat-route-contract.md` §4.3–4.4.
Produzir: comandos §3 em `src/handwritten/`; aplicador do item `crash-record` na sincronização
do TEAT (transação única, independência recíproca); gate gravidade × vítimas; leitura de vítima
com `purpose` e auditoria; `transmit`/`rectify` via outbox + `RenaestPort` com mapeamento campo a
campo documentado em `docs/framework/contracts/renaest-mapping.md` (marcando os campos que
dependem dos Manuais RENAEST, DT-061); espelho da situação nacional; job `T-BOAT-TRANSM`; relatório
preliminar/BAT em PDF/A (ADR-0018); projeções `portal.crash_view`, `dashboard.crashes` (com limiar
de célula), `integration.renaest_mirror`; SSE. R-0010 (PR #55, merge `4f034553`; PR #71, merge `1c24657b`; fechamento PC-0008) comprovou comandos, sincronização, mock,
projeções e envelope canônico; o job ainda depende de autoridade administrativa para descoberta de
tenants, e PDF/A e homologação real permanecem sem entrega comprovada. Gate: matriz de transições de `WF-BOAT-001` e
`WF-BOAT-003`, testes de gravidade × vítimas, duplicidade por chave natural, terminal sem
correção, `verify:senatran-boundary`, adapter e2e no mock.

### WP-B3 — Payloads e contrato (Transcriber-docs) — executado

`docs/framework/contracts/BP-EST-CRASH-001.commands.openapi.json` (comandos §3 com DTOs da origem
preservados e os novos), schema JSON do payload canônico `crash-record` da fila, exemplos com
fixtures; `renaest-mapping.md` como tabela campo a campo. Entrega comprovada: 13 operações montadas,
schema canônico, códigos BOAT do applier, clientes regenerados; `contracts:check` passou com 152
operações e 61 clientes. O layout nacional permanece `source_pending` por DT-061/OD-B08.

### WP-B4 — Telas, formulários e i18n (Transcriber-docs → Engineer-frontend) — executado

Fichas `IU-BOAT-S-nn.md`/`IU-BOAT-W-nn.md` (17) no padrão da origem, com os estados obrigatórios,
a regra de acesso a vítimas (perfil + finalidade + auditoria) e os textos fixos ("sinistro" nunca
"acidente"; "fotografar a cena, não o sofrimento"; "registro nacional definitivo, sem correção");
schemas dos 14 formulários (`boat-frontends.md` §8); `transitions.ts` com as 149 transições + S-12;
`i18n/boat.pt-BR.json` (estados, regimes 176/177/178 em linguagem simples, catálogos de condição,
erros). TASK-0010 comprovou typecheck, lint, build e 12 testes do pacote mobile, além de
typecheck/lint/build do `teat-web` e 561/561 testes web focais; TASK-0008 revisou a matriz de
rotas e os negativos de segurança. O baseline do KB ficou em 773 artefatos e 446 tokens
canônicos, com `source_pending:OD-R15-004` preservado. A entrega comprovada até este ponto é
estrutural: fichas, schemas, transições, catálogo, rotas e componentes existem e integram. O
binding completo dos campos/formulários permanece handoff futuro. Antes do segundo
delivery-review desta entrega, Engineers corrigem a renderização/mescla runtime do catálogo
byte a byte e o Inspector prova a orientação literal e axe nas 12 telas mobile e nas cinco web;
a estrutura isolada não é evidência desses comportamentos. Gate documental: `docs:kb:check` e
`docs:kb:publish-check`.

### WP-B5 — Frontends e camada nativa (Engineer-frontend) — executado no escopo comprovado

`apps/boat/mobile` como biblioteca de features carregada pelo shell de campo do TEAT (WP-T6): 12
telas, componentes §6, `victimAccessGuard`, editor de croqui, portas GPS/câmera/assinatura
(Capacitor), armazenamento cifrado e atestação de dispositivo (Fase 5 W5.2); módulo `sinistros`
em `apps/teat/web` (5 telas); Portal T-18/T-19 já especificados. TASK-0009 comprovou lint,
build mobile/TEAT e 118 testes do shell; TASK-0010 comprovou os gates do pacote e do módulo web;
TASK-0008 deixou a revisão focal com REDs de superfícies ainda ausentes no checkpoint, sem
relaxar testes. Hardware real, release de campo e homologação RENAEST/SNE/gov.br não foram
executados nesta rodada. O gate já comprova estrutura, roteamento/transições e builds. Apenas o
binding completo de campos/forms fica em handoff futuro. A renderização/mescla i18n, a orientação
literal e axe sobre as 12 telas mobile e cinco web são gates desta entrega e serão corrigidos por
Engineers/Inspector antes do segundo delivery-review; `assertBoatA11y` não é prova de DOM ou axe.

## 3. Ordem e paralelismo

```text
WP-B0 ──► WP-B1 ──► WP-B2 ──► WP-B3 ──┐
                └──► WP-B4 ───────────┼──► WP-B5 ──► homologação RENAEST (mock → real)
```

WP-B2 depende de WP-T2 (fila e evidência do TEAT) e WP-B5 de WP-T6 (shell de campo). Sonnet:
WP-B3, WP-B4; Opus/Terra: WP-B1, WP-B2.

## 4. Questões abertas do BOAT (OD-B)

| ID     | Questão                                                                          | Premissa adotada                                                                                                                                                                                                                                                    | Decisor              |
| ------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| OD-B01 | Hipótese legal do dado de saúde da vítima e sua publicação (DT-047)              | art. 11 II a/b LGPD (posição prudencial); S-06 e W-05 fora de produção até decisão — PN DETRAN-AM 002/2026 art. 28 (inventário com hipóteses) é o veículo de publicação; hipóteses propostas em [REF-ANPD-GUIA-PODER-PUBLICO-2024] — **H.44**: registrar e publicar | LEGAL / Owner        |
| OD-B02 | Prazos de retenção do BAT identificado, de campos de saúde e de bodycam (DT-049) | parâmetro `est.retention.*` sem valor; eliminação bloqueada; nunca `forever` — dono institucional: CSAD (PN 015/2026) + CPPD; benchmark DETRAN-DF ([REF-DETRANDF-INSTRUCAO-146-2023-TTD]) — **H.45**: 5/5/10 anos vigentes; bodycam pendente                        | Owner / DPO          |
| OD-B03 | Papel LGPD do DETRAN-AM no registro estadual (DT-048)                            | controlador — PN 002/2026, 016/2026 e 018/2026: o DETRAN-AM já atua como controlador ([REF-DETRANAM-PORTARIAS-LGPD-2026])                                                                                                                                           | LEGAL                |
| OD-B04 | Periodicidade de transmissão ao RENAEST (DT-017)                                 | mensal, proposta, parâmetro — **DT-017 respondido (2026-08-28)**: mensal, SLA operacional → `est.renaest.transmit_period=monthly` vigente                                                                                                                           | Owner                |
| OD-B05 | Correção de registro nacional terminal (DT-020)                                  | decidido: definitivo, sem correção; risco aceito                                                                                                                                                                                                                    | — (Owner 2026-08-28) |
| OD-B06 | Derivação `severity` (vítima) ↔ `gravidade` (sinistro) (DT-018)                  | gravidade do sinistro = pior gravidade de vítima; sem vítima = `SEM_VITIMA` — **DT-018 respondido**: equipe técnica propõe, Owner aprova depois → premissa vira proposta formal na cédula 03 — **H.43**: regra aprovada                                             | Owner / SENATRAN     |
| OD-B07 | Veículo removido com proprietário hospitalizado, prazo de 60 dias (DT-019)       | sem suspensão; aviso na tela — DT-019: Owner respondeu "não sei" (2026-08-28) → posição institucional; premissa mantida — **H.54** vigente                                                                                                                          | LEGAL                |
| OD-B08 | Manuais RENAEST e campos mínimos do BAT (DT-061)                                 | mapeamento provisório pelo contrato do mock; campos marcados "a confirmar"                                                                                                                                                                                          | institutional-ask    |
| OD-B09 | Limiar de célula para publicação agregada (DT-029)                               | 10 registros por célula (parâmetro) — **DT-029 respondido (2026-08-28)**: publicar já com limiar conservador (supressão < 10) → `dashboard.cell_threshold=10` vigente; parecer valida depois                                                                        | LEGAL / DPO          |
| OD-B10 | Parceiro facultativo (F.31)                                                      | visão futura; contrato reservado                                                                                                                                                                                                                                    | Owner                |
| OD-B11 | Catálogos de `crash_type` e das quatro condições (não há enum no corpus)         | catálogo do órgão em `est.crash_condition_ref`, valores iniciais do protótipo — **H.42**: valores do protótipo, pendentes                                                                                                                                           | Owner / SENATRAN     |
| OD-B12 | Fronteira BOAT × PORTAL para o BAT do cidadão (W-05 × T-18/T-19)                 | Portal consulta e baixa por projeção; pedidos de correção/eliminação via W-05                                                                                                                                                                                       | Owner                |
| OD-B13 | Cancelamento de rascunho: condições e ator                                       | só `RASCUNHO`; agente cancela, autoridade pode cancelar — **H.54** vigente                                                                                                                                                                                          | Owner                |

## 5. Mapa entregável → definições

| Entregável | Definições                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| A          | WP-B1; `BP-CRASH-RECORDS-001` (origem); [WF-BOAT-001…003]; `RenaestPort`/mock (`SinistroRequest`)               |
| B          | `boat-route-contract.md`; `policy.ts` (`est:*`); `teat-route-contract.md` §4.3 (fila)                           |
| C          | `boat-route-contract.md` §3–§5; `boat-error-catalog.md`; DTOs da origem                                         |
| D          | [IU-BOAT-001]; `boat-frontends.md` §4–§7; matriz `crash-*`; [JRN-BOAT-001…005]; `portal-frontends.md` T-18/T-19 |
| E          | `boat-frontends.md` §8; [RN-BOAT-*]; `boat-error-catalog.md`                                                    |
| F          | `boat-frontends.md` §1, §4–§6; `teat-frontends.md` §10 (shell de campo)                                         |
