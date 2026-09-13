# Plano de fechamento das decisões abertas — três vias (2026-09-13)

Índice vivo que sucede o retrato de `implementation-gate-2026-09-13.md`. Cada item do portão
recebe **uma via primária** e, quando possível, uma **ponte C** (parâmetro ou flag de
`docs/framework/arch/parameter-catalogue.md`, ADR-0019) que destrava a construção enquanto a
via principal não fecha.

| Via   | Critério                                                           | Como fecha                                                                                   |
| ----- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| **A** | um texto público responde ou fornece o default                     | captura em `docs/reference/legal/` (REF-\*), linha no `index.md`, baseline do KB             |
| **B** | fato institucional, calibração de produto, capacidade ou orçamento | cédula em `owner-ballots/`; resposta vira nova versão de parâmetro ou edição de DDL/política |
| **C** | existe default razoável e a mudança tardia é barata se versionada  | linha no catálogo com `status=proposta`; a interface marca "pendente de decisão"             |

Estado da via A após a rodada de 2026-09-13: **capturado** = REF escrita; **esgotado** = fontes
públicas não têm o texto, vai para a carta institucional (`owner-ballots/ask-letter-template.md`).

**Cédulas 01…08 respondidas em 2026-09-13** (steering §H, itens 38–57). Via B fechada para todos os
itens listados; restam a execução (WP-0, PR de base, WP-A) e as cartas institucionais (relação
das 55 autoridades, regimentos, Manuais RENAEST, jeton, CSAD, CETRAN sobre assinatura, portaria
admitindo selo prata, parecer jurídico único).

## 1. Itens que bloqueiam o início (gate §1)

| #   | Item                                             | Via | Ponte C                                                                                     | Estado / saída                                                                                                                                        | Cédula |
| --- | ------------------------------------------------ | --- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | Janela e responsável do WP-0 (OD-020)            | B   | —                                                                                           | Owner marca data; Engineer executa `wp0-stynx-1-3-1-migration.md` (Angular 22: `OnPush` default, router `always`, TS 6, Node 22 já registrados em §7) | 02     |
| 2   | Papéis novos (OD-D01, OD-T01)                    | B   | mapeamento provisório em `traffic-authority`/`agency-admin` só para leitura                 | Owner escolhe; Engineer edita `roles.ts`, `05-role-catalog.sql`, `policy.ts`, `shared/actors.md`                                                      | 01     |
| 3   | Contexto institucional (OD-T02, OD-013)          | B   | `ops/agency` mínimo (unidade, circunscrição, competência)                                   | Owner escolhe portar × tenancy; Architect fecha blueprint                                                                                             | 01     |
| 4   | Lei 9.873 (OD-301)                               | A→B | `deadline.T-PAR-3A/T-PRESC-5A.expiry_kind_override=alert_only`                              | **A capturado**: [REF-STJ-TEMAS-1293-1294] (lei federal-only; sem lei estadual). Owner/LEGAL ratificam "alerta sem declaração de ofício"              | 04     |
| 5   | Catálogos do BOAT (OD-B11)                       | B   | `est.catalog.*` com valores do protótipo (`source_pending`)                                 | Owner valida ou substitui os valores; seed do WP-B1                                                                                                   | 03     |
| 6   | Recurso vinculado e escala (OD-001, OD-013)      | B   | `rait.signing.schedule` pendente; DT-010 já fixou autoridade centralizada sem contrarrazões | Owner responde prazo do recurso e escala; institutional-ask para as 55 autoridades                                                                    | 05     |
| 7   | Nível de assinatura por ato (OD-P01/P02, DT-050) | A   | `portal.act_level_policy` **vigente** com fonte                                             | **A capturado**: [REF-DETRANAM-PORTARIA-NORMATIVA-001-2025] (gov.br ouro, e-Notariado, qualificada). Resta CETRAN-AM e ouvidoria                      | 06     |

## 2. Pré-condições de engenharia (gate §2)

| Item  | Via | Ação                                                                                                                                                       | Dono      |
| ----- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| E1    | —   | `pnpm install --frozen-lockfile` com token, `pnpm exec devai evidence record`, commit separado                                                             | usuário   |
| E2    | —   | tarefa `task_4332c5ce`; confirmar no PR de base                                                                                                            | Engineer  |
| E3–E7 | —   | PR único "WP-T0 base defects" (`teat-route-contract.md` §9)                                                                                                | Engineer  |
| E8    | —   | reconciliar `policy.ts` (`est:*`, `dashboard:*`) no mesmo PR de E2–E7                                                                                      | Engineer  |
| E9    | C   | contratos de dado propostos em WP-D3; ACK manual até existir (`dashboard.ack` rotulado)                                                                    | Architect |
| E10   | A→B | RENAINF real e Manuais RENAEST: **esgotado online** (Portaria 587/2024 é de preços; página oficial sem anexos) → carta                                     | Owner     |
| E11   | A   | **capturado**: Angular 22 em `wp0-stynx-1-3-1-migration.md` §7; feriados em [REF-CALENDARIO-2026-AM-MANAUS] (fixture corrigida: 04/06 é feriado municipal) | —         |
| E12   | —   | pins de texto no WP-0                                                                                                                                      | Engineer  |

## 3. Decisões transversais (DT)

| DT     | Via | Estado após a rodada                                                                                                          | Ponte C / cédula                                 |
| ------ | --- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| DT-029 | C   | respondido (supressão < 10); parecer valida depois                                                                            | `dashboard.cell_threshold=10` vigente            |
| DT-066 | A   | refinado: Lei AM 6.837/2024 supre; adesão expressa não localizada (busca 2026-09-13 sem novidade)                             | fundamentação dupla; sem cédula                  |
| DT-047 | A→B | **capturado** guia ANPD e portarias LGPD do DETRAN-AM; hipótese a publicar no inventário do art. 28 da PN 002/2026            | `est.lgpd.health_hypothesis`; cédula 03          |
| DT-048 | A   | **capturado**: DETRAN-AM atua como controlador (PN 002/016/018 de 2026)                                                       | fechado para o registro estadual                 |
| DT-049 | A→B | **capturado** CSAD (PN 015/2026) + benchmark DETRAN-DF; tabela do AM não existe → pedido de Plano de Destinação à CSAD        | `*.retention.*` pendentes; carta + cédula 03     |
| DT-017 | C   | respondido: mensal                                                                                                            | `est.renaest.transmit_period` vigente            |
| DT-061 | B   | **esgotado online** → carta à SENATRAN (Manuais RENAEST, campos mínimos do BAT)                                               | `est.renaest.layout_version` pendente            |
| DT-050 | A   | **capturado** PN 001/2025; resta adoção pelo CETRAN-AM                                                                        | `portal.cetran_appeal_level` proposta; cédula 06 |
| DT-026 | C   | respondido: termo digital no PORTAL                                                                                           | `portal.waiver_40_term` off até OD-003           |
| DT-031 | C   | respondido: assumir autorização; DT-072 confirma                                                                              | `portal.card_payment` off                        |
| DT-014 | C   | respondido: onda futura; retenção segue DT-049                                                                                | `teat.bodycam.retention_days` pendente           |
| DT-063 | C   | resolvido: sem medidores                                                                                                      | `teat.speed_meters` off                          |
| DT-042 | B   | lista jurídica de PORTAL/DASHBOARD sem resposta                                                                               | cédula 07 (item "parecer LEGAL")                 |
| DT-060 | A→B | CETRAN-AM: PDF oficial 404, Wayback 429 (repetir); JARI-AM: nada novo → carta ao DETRAN-AM e à secretaria executiva do CETRAN | cédula 08 só se a carta falhar                   |
| DT-016 | B   | Owner pediu histórico de incidentes                                                                                           | `sync.concurrency_window_minutes` pendente       |
| DT-019 | B   | Owner "não sei" → posição institucional                                                                                       | `est.hospitalized_owner_days=60` proposta        |
| DT-064 | B   | throughput de sessão JARI/CETRAN e taxa de provimento                                                                         | cédula 07                                        |

## 4. Inventário por superfície

### RAIT

| Item(s)                        | Via | Ponte C                                                        | Saída                                                                               |
| ------------------------------ | --- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| OD-002, OD-015, OD-016, DT-010 | —   | fechados (DT-011, DT-013, [REF-LEI-10741-2003], DT-010)        | propagados aos registros                                                            |
| OD-003, OD-012, OD-015 fonte   | B   | `collection.discount_40_outside_sne`, `rait.jeton.*` pendentes | cédula 07; jeton vai à carta (nenhuma lei estadual localizada)                      |
| OD-004…009, OD-014, OD-017…019 | C   | linhas `rait.*` proposta                                       | Owner calibra quando quiser (cédula 07 agrupa)                                      |
| OD-101…112 (regimento JARI)    | A→B | `session.*` proposta                                           | carta (DT-060); benchmark municipal Decreto Manaus 4.922/2020 a capturar (403 hoje) |
| OD-201…207 (regimento CETRAN)  | A→B | idem, parametrizado por órgão                                  | Wayback do Decreto 34.398/2014 + carta                                              |
| OD-301…305                     | A→B | `deadline.*.expiry_kind_override`                              | [REF-STJ-TEMAS-1293-1294]; cédula 04                                                |
| OD-306                         | B   | mapeamento do mock                                             | homologação com RENAINF real (carta)                                                |
| OD-308                         | B   | —                                                              | parecer LEGAL (DT-043)                                                              |
| OD-307                         | C   | fora do ciclo da infração                                      | processo próprio do domínio `ch` (suspensão/cassação); nada a decidir agora         |

### TEAT

| Item(s)                        | Via | Ponte C                                                                   | Saída                                                                          |
| ------------------------------ | --- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| OD-T01, OD-T02                 | B   | —                                                                         | cédula 01                                                                      |
| OD-T03                         | B   | `sync.concurrency_window_minutes` pendente                                | histórico de incidentes (DT-016)                                               |
| OD-T04, OD-T06, OD-T07         | B   | `teat.homologation.*`, `teat.no_approach_reason.mode`, `teat.numbering.*` | cédula 07                                                                      |
| OD-T05, OD-T12                 | A   | dois campos impressos; posição RN-TEAT-129                                | memo do LEGAL sobre normas já capturadas (Res. 1.025, MBFT, Res. 432) — DT-040 |
| OD-T08, OD-T09, OD-T10, OD-T11 | C   | flags `teat.*`                                                            | fechados por DT-014/015/063; Sivec e legitimidade seguem flags                 |
| Corpus (12 inconsistências)    | —   | —                                                                         | Transcriber-docs, PR próprio antes de WP-T4                                    |

### PORTAL

| Item(s)                | Via | Ponte C                                                | Saída                               |
| ---------------------- | --- | ------------------------------------------------------ | ----------------------------------- |
| OD-P01, OD-P02         | A   | `portal.act_level_policy` vigente                      | capturado; revisar OD-P02 (só ouro) |
| OD-P06, OD-P10         | B   | `portal.ombudsman_level`, taxonomia                    | cédula 06                           |
| OD-P03, OD-P05, OD-P07 | C   | flags                                                  | fechados por DT-026/031/066         |
| OD-P04, OD-P08, OD-P09 | B   | `privacy.public_regime_days` pendente                  | parecer LEGAL (DT-042)              |
| OD-P11, OD-P12, OD-P13 | C   | `portal.read_cache_ttl_minutes`, `portal.mobile_shell` | Architect em WP-P1                  |

### BOAT

| Item(s)                | Via | Ponte C                                                | Saída                                  |
| ---------------------- | --- | ------------------------------------------------------ | -------------------------------------- |
| OD-B11, OD-B06         | B   | `est.catalog.*`, `est.severity.derivation`             | cédula 03                              |
| OD-B01, OD-B02, OD-B03 | A→B | `est.lgpd.health_hypothesis`, `est.retention.*`        | capturas LGPD; carta à CSAD; cédula 03 |
| OD-B04, OD-B05, OD-B09 | C   | vigentes                                               | fechados                               |
| OD-B07, OD-B13, OD-B12 | B   | `est.hospitalized_owner_days`, `est.cancel.draft_only` | cédula 07                              |
| OD-B08                 | B   | `est.renaest.layout_version` pendente                  | carta SENATRAN (DT-061)                |
| OD-B10                 | C   | `est.partner_intake` off                               | F.31                                   |

### DASHBOARD

| Item(s)                    | Via | Ponte C                           | Saída                                                                                     |
| -------------------------- | --- | --------------------------------- | ----------------------------------------------------------------------------------------- |
| OD-D01                     | B   | —                                 | cédula 01                                                                                 |
| OD-D02, OD-D03, OD-D12     | C   | vigentes                          | fechados por DT-029/066/063                                                               |
| OD-D04…D09, OD-D11, OD-D13 | C   | `dashboard.*` proposta            | cédula 07 agrupa; SRE calibra D04                                                         |
| OD-D05                     | C   | ACK manual rotulado               | contratos de dado (WP-D3)                                                                 |
| OD-D10                     | A   | `dashboard.duty.IND-202.deadline` | Res. 918 arts. 26–27 já capturados: art. 27 §6º não fixa dia → manter "último dia do mês" |

## 5. Pesquisa da via A — resultado da rodada

| Alvo                                      | Resultado                                                                                                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lei 10.741 art. 71                        | capturado — [REF-LEI-10741-2003]                                                                                                                              |
| Feriados 2026 AM/Manaus                   | capturado — [REF-CALENDARIO-2026-AM-MANAUS]; fixture corrigida                                                                                                |
| Manuais RENAEST                           | esgotado — página oficial sem anexos; dataset sem dicionário; Portaria 587/2024 é de preços                                                                   |
| Guia ANPD Poder Público                   | capturado — [REF-ANPD-GUIA-PODER-PUBLICO-2024]                                                                                                                |
| Tabela de temporalidade                   | capturado benchmark DETRAN-DF — [REF-DETRANDF-INSTRUCAO-146-2023-TTD]; CSAD do AM — [REF-DETRANAM-PORTARIA-NORMATIVA-015-2026]                                |
| Decreto 34.398/2014 e regimento JARI-AM   | esgotado nesta rodada (404 no site; Wayback 429); Mensagem 057/2020 confirma o decreto                                                                        |
| Assinatura eletrônica no AM               | capturado — [REF-DETRANAM-PORTARIA-NORMATIVA-001-2025] (ato do órgão; decretos estaduais 42.727/2020, 46.558/2022 são de processo eletrônico interno e e-CPF) |
| Jeton JARI/CETRAN-AM                      | esgotado — nenhuma lei estadual localizada                                                                                                                    |
| Lei 9.873 × órgão estadual                | capturado — [REF-STJ-TEMAS-1293-1294]                                                                                                                         |
| Angular 22                                | capturado — `wp0-stynx-1-3-1-migration.md` §7                                                                                                                 |
| Portarias LGPD do DETRAN-AM (achado novo) | capturado — [REF-DETRANAM-PORTARIAS-LGPD-2026]                                                                                                                |

## 6. Sequência

1. Owner responde as cédulas 01–04 (conjunto mínimo). 2. Engineer abre o PR de base (E2–E8) e
   executa o WP-0. 3. Owner envia as cartas (DT-060, DT-061, jeton, CSAD, CETRAN sobre assinatura).
2. Cédulas 05–07 no ritmo dos pacotes; cédula 08 só se as cartas falharem. 5. Cada resposta vira
   versão nova em `ops.parameter` (WP-A) e linha `vigente` no catálogo.
