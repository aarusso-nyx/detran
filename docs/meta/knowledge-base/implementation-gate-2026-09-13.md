# Portão de implementação — pontos de atenção e decisões abertas (2026-09-13)

Consolidação de tudo o que a rodada de definições de 2026-09-12/13 levantou nas cinco superfícies
(RAIT, TEAT, PORTAL, BOAT, DASHBOARD), no substrato (WP-0) e nas fronteiras (ADR-0015…0020).
Cada item aponta o documento onde está detalhado. A seção 1 é a lista curta: o que precisa de
resposta **antes** de a orquestra começar. As demais seções são o inventário completo, por
superfície, separando o que bloqueia de início, o que bloqueia um pacote específico e o que já
tem premissa adotada e só produz retrabalho se a decisão vier diferente.

**Reconciliado em 2026-09-13 (tarde)** com `open-issues.md` e com a pesquisa de fechamento: as
respostas do Owner de 2026-08-28 (DT-010, 011, 013, 014, 015, 017, 018, 020, 026, 029, 031,
063, 066) foram propagadas aos registros OD; os achados novos (Portaria DETRAN-AM 001/2025 sobre
assinaturas; STJ Temas 1.293/1.294; portarias LGPD 2026; CSAD) estão em
`decision-closure-plan.md`, que passa a ser o índice vivo. Este documento é o retrato do portão.

Convenção: **[INÍCIO]** bloqueia qualquer código da superfície; **[PACOTE]** bloqueia um WP
nomeado; **[PREMISSA]** desenho segue uma premissa declarada, a interface marca "pendente de
decisão", nada para; **[PRODUÇÃO]** não bloqueia construção, bloqueia ir a produção.

**Fechado em 2026-09-13 (tarde)**: as sete decisões abaixo foram respondidas por prompt interativo
(steering §H). O portão está aberto; ver `decision-closure-plan.md`.

## 1. Decisões do Owner que bloqueiam o início

| #   | Decisão                                                                                                                                                                                                                                                  | Superfícies afetadas                                    | Referência                             |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------- |
| 1   | **Janela e responsável do WP-0** (pins STYNX 1.1.1 → 1.3.1, Angular 21 → 22, DEVAI 1.4.5). Adoção já decidida (G.34); execução não agendada                                                                                                              | todos os frontends, `@detran/ui`                        | OD-020; `wp0-stynx-1-3-1-migration.md` |
| 2   | **Papéis RBAC novos no catálogo canônico**: `dash-operator`, `dash-duty-owner` (DASHBOARD), Diretoria de Fiscalização (TEAT, `teat-fiscalization-board` × `traffic-authority` com atributo)                                                              | DASHBOARD, TEAT, DDL `05-role-catalog.sql`, `policy.ts` | OD-D01, OD-T01                         |
| 3   | **Módulo de contexto institucional** (órgãos, unidades, convênios, competências, circunscrições): portar `agency-context` como `ops/agency` ou usar `tenancy` do STYNX. Alimenta o roteamento por circunscrição do RAIT                                  | TEAT WP-T1, RAIT autoridade/assinatura                  | OD-T02, OD-013                         |
| 4   | **Aplicabilidade da Lei 9.873/1999** ao órgão estadual (`T-PAR-3A`, `T-PRESC-5A`) — único item que o steering marcou `[BLOQUEIA]` (C.13); enquanto aberto, a transição `EXTINTO_PRESCRICAO` fica `a_confirmar` e o RAIT não declara prescrição de ofício | RAIT motor de prazos, DASHBOARD bloco A (IND-104/105)   | OD-301                                 |
| 5   | **Catálogos fechados do BOAT** (`crash_type` e as quatro condições: via, clima, iluminação, sinalização) — o DDL do WP-B1 precisa dos valores para seedar `est.crash_condition_ref`                                                                      | BOAT WP-B1                                              | OD-B11                                 |
| 6   | **Autoridade do recurso vinculado** contra provimento da JARI (cargo/unidade, prazo, contrarrazões) e **escala de assinatura das 55 autoridades**                                                                                                        | RAIT módulos `autoridade` e `assinatura`                | OD-001, OD-013                         |
| 7   | **Nível de assinatura por ato** (portaria estadual, DT-050) e mapeamento dos selos gov.br — condiciona o gate de cada serviço do Portal                                                                                                                  | PORTAL WP-P1/P2                                         | OD-P01, OD-P02                         |

Sem esses sete, ainda é possível começar: WP-0 pode ser executado por decisão do Engineer se o
Owner apenas confirmar a janela; os itens 2 e 3 têm premissas adotadas (papéis mapeados a
`traffic-authority`, módulo `ops/agency` mínimo), mas mudam DDL e política, o que é o retrabalho
mais caro; os itens 4 a 7 travam módulos específicos, não a superfície inteira.

## 2. Pré-condições de engenharia e governança (não são decisões do Owner, mas param a orquestra)

| #   | Item                                                                                                                                                                                                   | Estado                                                                     | Onde                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------- |
| E1  | **Cadeia de evidência DEVAI**: `pnpm exec devai evidence record` exige `pnpm install --frozen-lockfile` com `NODE_AUTH_TOKEN` (reinstala `node_modules`; devai global é 0.3.0, o workspace pede 1.4.5) | não executado; commit separado pendente                                    | `AGENTS.md`, `wp0-stynx-1-3-1-migration.md` §1                |
| E2  | **Gerador concatena `basePath` + `path` sem barra** (`@Controller('v1/inf/aitaits')`)                                                                                                                  | tarefa em sessão separada (`task_4332c5ce`); não verificado como corrigido | `teat-route-contract.md` §9.1                                 |
| E3  | `AitModule` não monta `AitCommandsController` nem `AitLifecycleService`                                                                                                                                | aberto                                                                     | `teat-route-contract.md` §9.2, WP-T0                          |
| E4  | Auditoria do `ops` cita tabelas inexistentes (`ops.agent_profile`)                                                                                                                                     | aberto                                                                     | §9.3                                                          |
| E5  | Política sem rota (`ops:evidence:complete-upload`, `validate`) e rota sem política (`ops:homologation:read`, `ops:application-version:read`)                                                           | aberto                                                                     | §9.4                                                          |
| E6  | `BP-INF-SPEED-001` sem módulo nem política                                                                                                                                                             | aberto                                                                     | §9.5                                                          |
| E7  | Sete entidades da origem ausentes nos blueprints (`MetrologicalTable`, `EvidenceAccessRequest`, `AitCancelRequest`, `DeviceEvent`, `TeamAgent`, `PatrolVehicle`, `MeasurementInstrument`)              | WP-T1                                                                      | §9.6                                                          |
| E8  | `policy.ts` diverge do corpus: `est:crash-record:*` (validate sem `traffic-authority`, attach-sketch sem `processing-operator`); `dashboard:*` só conhece os três recursos da origem                   | WP-B0, WP-D0                                                               | `boat-route-contract.md` §8, `dashboard-route-contract.md` §8 |
| E9  | Contratos de eventos existem só para o RAIT; PEC, TEAT, PORTAL e adapter não publicam nada para o DASHBOARD; nenhum app expõe evento de ciência (ACK)                                                  | WP-D3 propõe; cada pacote precisa publicar                                 | `dashboard-route-contract.md` §7                              |
| E10 | Mapeamento `SituacaoRenainf` (mock) não validado contra o RENAINF real; mapeamento RENAEST campo a campo depende dos Manuais (DT-061)                                                                  | `approved` só após validação                                               | OD-306, OD-B08                                                |
| E11 | Mudanças específicas do Angular 22 não conferidas contra o guia oficial; calendário de feriados 2026 das fixtures não validado com ato oficial                                                         | registrar durante o WP-0 / antes de virar parâmetro                        | backlog 2026-09-13                                            |
| E12 | Pins de texto: `CLAUDE.md`, `AGENTS.md`, `README.md`, `docs/start/index.md` dizem "alvo 1.3.1, pins 1.1.1" — devem virar 1.3.1 no WP-0                                                                 | pendente do WP-0                                                           | `wp0-stynx-1-3-1-migration.md` §4                             |

## 3. Decisões transversais compartilhadas por mais de uma superfície

| Decisão (DT)                                                                | Superfícies                                                       | Classe                                      | Referências               |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------- | ------------------------- |
| DT-029 limiar de célula e supressão para agregados                          | DASHBOARD P-09 e exportações, BOAT publicação, PORTAL estatística | [PRODUÇÃO] para o resto, [PACOTE] para P-09 | OD-D02, OD-B09            |
| DT-066 adesão do AM à Lei 14.129/2021                                       | PORTAL, DASHBOARD P-08                                            | [PREMISSA]                                  | OD-P07, OD-D03            |
| DT-047 hipótese legal do dado de saúde de vítima; DT-049 prazos de retenção | BOAT S-06 e W-05, DASHBOARD                                       | [PRODUÇÃO]                                  | OD-B01, OD-B02            |
| DT-017 periodicidade de transmissão ao RENAEST                              | BOAT `T-BOAT-TRANSM`, DASHBOARD IND-310                           | [PREMISSA] mensal                           | OD-B04                    |
| DT-061 Manuais RENAEST                                                      | BOAT WP-B2 homologação                                            | [PACOTE] homologação real                   | OD-B08                    |
| DT-050 portaria de níveis de assinatura                                     | PORTAL, RAIT assinatura                                           | [INÍCIO] Portal gates                       | OD-P01                    |
| DT-026 renúncia na faixa de 40% × OD-003 desconto fora do SNE               | PORTAL, RAIT financeiro                                           | [PREMISSA] flag desligada                   | OD-P03, OD-003            |
| DT-031 cartão e parcelamento                                                | PORTAL pagamento                                                  | [PREMISSA] indisponível                     | OD-P05                    |
| DT-014 bodycam (retenção e acesso)                                          | TEAT, BOAT                                                        | [PREMISSA] onda futura                      | OD-T08                    |
| DT-063 parque de medidores                                                  | TEAT, DASHBOARD IND-173                                           | [PREMISSA] fonte desconectada               | OD-D12, OD-T09            |
| DT-042 lista de validação jurídica de PORTAL e DASHBOARD não respondida     | PORTAL, DASHBOARD (31 regras `draft`)                             | [PREMISSA] leitura de trabalho              | `APP-DASHBOARD` §Residual |
| Regimentos internos JARI-AM (DT-060) e CETRAN-AM                            | RAIT colegiado                                                    | [PACOTE] módulo `colegiado` sem flags       | OD-101…112, OD-201…207    |

## 4. Inventário por superfície

### 4.1 RAIT (`open-decisions-rait.md`, `rait-build-pack.md`)

| Classe     | Itens                                                                                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [INÍCIO]   | OD-020 (WP-0); OD-301 (Lei 9.873, `[BLOQUEIA]`)                                                                                                            |
| [PACOTE]   | OD-001, OD-013 (autoridade, assinatura); OD-101…112 (regimento JARI); OD-201…207 (regimento CETRAN); OD-003/012/015 (financeiro e jeton com valores reais) |
| [PREMISSA] | OD-002, 004…011, 014, 016…019; OD-302…305 (transições `a_confirmar`); OD-307; OD-308 (22 RNs legais `draft`, risco de reversão)                            |
| Atenção    | escada do relógio B divergente entre [RN-RAIT-112] e [WF-RAIT-002] §4.1 (OD-006); "120 dias" institucional não adotado (OD-009); OD-306 mapeamento RENAINF |

### 4.2 TEAT (`teat-build-pack.md`, `teat-route-contract.md` §9)

| Classe     | Itens                                                                                                                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [INÍCIO]   | E2…E7 (defeitos de base, WP-T0); OD-T01 (papel da Diretoria); OD-T02 (contexto institucional)                                                                                                                                        |
| [PACOTE]   | OD-T04 (homologação caducada bloqueia lavratura?) — WP-T2; OD-T06 (`no_approach_reason`, reconciliar UC-TEAT-002) — WP-T4; OD-T05 (dois prazos de retirada) — WP-T4                                                                  |
| [PREMISSA] | OD-T03 (janela de concorrência), OD-T07 (reserva expirada), OD-T08 (bodycam), OD-T09 (guarda monitorada, medidores), OD-T10 (Sivec), OD-T11 (legitimidade do agente), OD-T12 (recolhimento da CNH)                                   |
| Corpus     | 12 inconsistências (`teat-build-pack.md` §5): INDEX dos UCs em `draft` e sem UC-013; 49 × 50 regras; `allows_no_approach` booleano × enum; numeração de passos; "68 × 67 telas"; etilômetro sem certificado; testemunha sem entidade |

### 4.3 PORTAL (`portal-build-pack.md`)

| Classe     | Itens                                                                                                                                                                                                                                    |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [INÍCIO]   | OD-P01, OD-P02 (nível de assinatura por ato e selos gov.br)                                                                                                                                                                              |
| [PACOTE]   | OD-P08 (prazo LGPD no regime público, sem valor exibido); OD-P13 (`@stynx-nyx/flow` × máquina fixa, avaliado em WP-P1)                                                                                                                   |
| [PREMISSA] | OD-P03 (renúncia 40%), OD-P04 (CRLV-e com recurso suspensivo), OD-P05 (cartão), OD-P06 (assinatura na ouvidoria), OD-P07 (14.129), OD-P09 (notificação de andamento × SNE), OD-P10 (taxonomia), OD-P11 (volumes), OD-P12 (mobile adiado) |
| Corpus     | INDEX dos UCs marca todos `draft`; falta RN dedicada ao ato de adesão ao SNE (UC-PORTAL-007 cita backlog)                                                                                                                                |

### 4.4 BOAT (`boat-build-pack.md`, `boat-route-contract.md` §8)

| Classe     | Itens                                                                                                                                                                                                |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [INÍCIO]   | OD-B11 (catálogos de tipo e condições); E8 (política `est:*`)                                                                                                                                        |
| [PACOTE]   | OD-B08 (Manuais RENAEST) — homologação do WP-B2; OD-B06 (derivação gravidade ↔ vítima) — gate de fechamento; OD-B13 (cancelamento de rascunho)                                                       |
| [PRODUÇÃO] | OD-B01 (DT-047), OD-B02 (DT-049): telas de vítimas e do titular não vão a produção                                                                                                                   |
| [PREMISSA] | OD-B03 (papel LGPD), OD-B04 (DT-017), OD-B05 (decidido: terminal sem correção), OD-B07 (60 dias com proprietário hospitalizado), OD-B09 (limiar), OD-B10 (parceiro, F.31), OD-B12 (fronteira Portal) |
| Corpus     | UC-BOAT-013 (dever de resposta ao titular) inexistente; INDEX dos UCs desatualizado; `evaded` removido; PII da origem marcada `forever`                                                              |

### 4.5 DASHBOARD (`dashboard-build-pack.md`)

| Classe     | Itens                                                                                                                                                                                                                                        |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [INÍCIO]   | OD-D01 (papéis); E9 (contratos de dado dos outros apps — MVP só cobre o RAIT do bloco A)                                                                                                                                                     |
| [PACOTE]   | OD-D02 (DT-029) — P-09 e exportação agregada; OD-D04 (limiares técnicos, SRE) — bloco D; OD-D05 (ACK) — rótulo manual até existir                                                                                                            |
| [PREMISSA] | OD-D03 (14.129), OD-D06 (auto-ocultação), OD-D07 (heartbeat), OD-D08 (finalidades N2), OD-D09 (5.000 linhas), OD-D10 (data do IND-202), OD-D11 (comunicação em `CRITICO_EXTINCAO`), OD-D12 (medidores), OD-D13 (recursos da origem mantidos) |
| Corpus     | [IU-DASH-001] sem códigos de tela nem rotas (ids D-01…D-18 são proposta); README do app com vocabulário antigo; "9 deveres" × "14 linhas"                                                                                                    |

### 4.6 Substrato e fronteiras (ADR-0015…0020, WP-0)

- ADR-0015 aceita: STYNX 1.3.1 confirmado no registro (todos os símbolos importados existem); a única aresta de quebra é Angular 21 → 22.
- ADR-0016…0020 aceitas (G.37): agregado da infração e notificação, cobrança e restituição, documentos e assinatura, identidade e ciclo de solicitação do cidadão, projeções. Consequências de engenharia ainda não iniciadas: `BP-INF-INFRACTION-001`, gate `verify:domain-boundaries` (WP-P do RAIT), projeções `portal.*`, `dashboard.*`, `integration.*`.
- Fixtures canônicas (`seed.sh`) validadas em banco limpo; `apply.sh` corrigido para incluir os DDL 05, 14 e 34…37.
- Diagramas (`docs/framework/arch/diagrams/`) fora do prettier por `.prettierignore`.

## 5. Ordem sugerida de resposta

1. Owner confirma a janela do WP-0 (item 1) e os papéis novos (item 2). Engineer corrige E2…E8 no mesmo PR de base.
2. Owner decide contexto institucional (item 3) e catálogos do BOAT (item 5); Architect fecha `BP-EST-CRASH-001` e `ops/agency`.
3. LEGAL responde OD-301 (item 4) e DT-050 (item 7); Owner responde OD-001/OD-013 (item 6).
4. Em paralelo, institutional-ask: regimentos JARI/CETRAN, Manuais RENAEST, parque de medidores, adesão à 14.129.
5. Antes da primeira publicação agregada: DT-029 (parecer do limiar de célula) e DT-047/049 (dado de saúde e retenção).
