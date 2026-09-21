# Manifesto de rotas do DASHBOARD (M6) — fonte única para TASK-0002 (fichas), TASK-0003 (i18n), TASK-0004 (testes) e TASK-0005/0006 (código)

**Rodada:** R-0016, frente `dashboard-console`. **Autor:** Architect (TASK-0001), 2026-09-21.
**Papel:** Architect (Art. 6). Derivado de `docs/framework/arch/dashboard-frontends.md` §1 (fronteira,
camadas, segregação), §3 (papéis e guardas), §4 (rotas, telas, camada, conteúdo, UC/origem), §6
(jornadas), §7 (formulários), §9 (pastas); `dashboard-route-contract.md` §1–§5;
`backend/domains/shared/src/roles.ts` (`DETRAN_ROLES`, `DASHBOARD_ROLES`) e `policy.ts`
(`DASHBOARD_RULES` linhas 1513–1638, `GLOBAL_ADMIN_ROLES` linha 1720, `isDetranActionAllowed`
linhas 1805–1845, `DASHBOARD_LAYER_BY_ROLE`/`dashboardLayerFor`/`dashboardLayerAllows` linhas
1882–1921); [IU-DASH-001] §A (painéis P-01…P-09, coluna Jornada, coluna UC); [APP-DASHBOARD]
§Catálogo (blocos A–D) e §KPIs; [RN-DASH-170] (camadas N0…N3); `plan.md` M4 (textos fixos), M5
(i18n), M6 (manifesto e rotas auxiliares). O app transcreve a tabela em
`src/app/app.route-manifest.ts` (`DASHBOARD_ROUTE_MANIFEST`) e o Inspector a transcreve, de forma
independente, em `src/testing/route-manifest.fixture.ts` (contrato `CTG-0001.md` §4 e
`CTG-0002.md`). Nada aqui redecide M1…M9; o que não tem fonte está listado em §F como `OD-D16-nnn`
(propostas, nunca decididas aqui).

## Regras de leitura das colunas

- `#`: posição na ordem da §4 (1…18) mais as duas auxiliares de M6 (19, 20).
  `DASHBOARD_ROUTE_MANIFEST` mantém exatamente esta ordem.
- `id`: `D-01`…`D-18` da §4; `—` nas auxiliares.
- `sheet`: `IU-DASH-D-nn` (M4: arquivo
  `docs/framework/product/transversal/dashboard/screens/IU-DASH-D-nn.md`, id igual ao nome);
  `null` nas auxiliares (fora da contagem 18/18).
- `path`: literal da coluna "Painel / tela (rota)" da §4, com barra inicial; parâmetros `:id`,
  `:system`, `:period` como na §4. D-14 e D-16 têm na §4 um `:id` de detalhe na mesma linha
  (`/monitoramento/indicadores`, `:id`; `/monitoramento/relatorios`, `:id`): a linha do manifesto
  é a rota de lista e a rota filha de detalhe está em §B (mesma ficha, mesmas guardas, fora da
  contagem 20).
- `screen`: `P-nn` de [IU-DASH-001] §A quando a §4 o nomeia em negrito; `—` nas telas de apoio.
- `layer`: coluna "Camada" da §4, literal (inclusive os valores compostos `Ação/Técnico` e
  `Ação/Vigilância`).
- `access`: camada de acesso **mínima exigida para abrir a rota** (`N0`/`N1`/`N2`), derivada do
  recorte que a rota serve por default segundo a tabela de [RN-DASH-170] (N0 agregados
  institucionais; N1 contagens por pool, idade de fila, backlog, alertas por família; N2
  identificação de objeto de processo), o contrato de rotas §1 regra 4 e §2–§4 e a §1
  "Segregação". `N3` nunca é camada de rota (`dashboardLayerAllows(_, 'N3') === false`, `policy.ts`
  linha 1916). Onde a tela expõe conteúdo N2 só sob demanda (drill-down, objeto do alerta), a rota
  fica em N1 e o conteúdo N2 passa por `LayerGate` (finalidade, `X-Purpose`; §3, contrato §1
  regra 4) — a derivação por rota está em §C.
- `policy`: chave `dashboard:<recurso>:<ação>` de `DASHBOARD_RULES` que abre a rota. Para rotas
  sem chave própria, a chave `read` do recurso lido; onde nem o contrato nem `policy.ts` têm chave
  de leitura, a chave provisória está marcada `(prov.)` e a lacuna é `OD-D16-nnn` (§F).
- `roles`: lista literal dos códigos de `DASHBOARD_RULES` para essa chave (§D expande os
  conjuntos nomeados `N0-ROLES`, `AREA-MANAGERS`, `TECH`) **∩** papéis cuja camada em
  `DASHBOARD_LAYER_BY_ROLE` é ≥ `access` (§D). Papéis ausentes = todos os demais de `DETRAN_ROLES`
  (36 códigos, §D) — o Inspector prova presença **e** ausência. O passe global de
  `GLOBAL_ADMIN_ROLES` (§E) não entra nesta coluna: é efeito executado por `isDetranActionAllowed`
  e está registrado à parte, com o resultado esperado por rota.
- `module`: pasta de `features/` da §9, literal.
- `slug`: segmentos do `path` sem `/monitoramento`, sem `:`, unidos por `-`; raiz = `triagem`
  (M6). Segmento i18n = slug com `-` → `_` (M5: `'dashboard.screens.' + slug.replace(/-/g, '_')`).
- `uc`: `[UC-DASH-nnn]` citado na própria linha da §4 ou, na falta, o da linha `P-nn` de
  [IU-DASH-001] §A; `—` quando nenhuma das duas cita.
- `journeys`: `[JRN-DASH-nnn]` da coluna Jornada de [IU-DASH-001] §A para o painel da rota, mais a
  jornada da §6 que percorre a rota; `—` quando nenhuma.
- `blocks`: classes A/B/C/D de [APP-DASHBOARD] §Catálogo dos indicadores que a tela exibe (da
  coluna "Conteúdo"/"UC / origem" da §4 e do contrato §6); `—` quando a tela não exibe indicador
  do catálogo.
- `forms`: formulários da §7 presentes na tela (slug de arquivo de `CTG-0002.md` §Decisões 3).
- `fixed`: textos fixos de M4 aplicáveis (`ver apuração de incidente`; `sem prazo definido`; `prazo
do candidato, preclusivo`; `registro manual de ciência`).
- `fonte`: origem de cada célula que não é cópia literal da §4 (número = nota em §G).

## A. Tabela principal (20 linhas = 18 rotas da §4 + 2 auxiliares de M6)

| #   | id   | sheet          | path                                        | screen | layer           | access | policy                               | roles                                                                   | module         | slug                       | uc                           | journeys                       | blocks                       | forms                                            | fixed                                                 | fonte |
| --- | ---- | -------------- | ------------------------------------------- | ------ | --------------- | ------ | ------------------------------------ | ----------------------------------------------------------------------- | -------------- | -------------------------- | ---------------------------- | ------------------------------ | ---------------------------- | ------------------------------------------------ | ----------------------------------------------------- | ----- |
| 1   | D-01 | `IU-DASH-D-01` | `/monitoramento`                            | P-01   | Ação            | N1     | `dashboard:alert:read`               | dash-operator, AREA-MANAGERS, agency-admin, technical-admin, AUDITOR    | `triage`       | `triagem`                  | [UC-DASH-002]                | [JRN-DASH-001]                 | A, B, C, D                   | —                                                | ver apuração de incidente                             | 1, 2  |
| 2   | D-02 | `IU-DASH-D-02` | `/monitoramento/alertas/:id`                | —      | Ação            | N1     | `dashboard:alert:read`               | dash-operator, AREA-MANAGERS, agency-admin, technical-admin, AUDITOR    | `triage`       | `alertas-id`               | [UC-DASH-002]                | [JRN-DASH-001]                 | A, B, C, D                   | `ack-alerta`, `encerrar-alerta`, `finalidade-n2` | ver apuração de incidente; registro manual de ciência | 1, 3  |
| 3   | D-03 | `IU-DASH-D-03` | `/monitoramento/radar/rait`                 | P-02   | Ação            | N1     | `dashboard:alert:read` (prov.)       | dash-operator, AREA-MANAGERS, agency-admin, technical-admin, AUDITOR    | `radar`        | `radar-rait`               | [UC-DASH-001]                | [JRN-DASH-002]                 | A                            | `finalidade-n2`                                  | —                                                     | 1, 4  |
| 4   | D-04 | `IU-DASH-D-04` | `/monitoramento/radar/pec`                  | P-03   | Ação            | N1     | `dashboard:alert:read` (prov.)       | dash-operator, AREA-MANAGERS, agency-admin, technical-admin, AUDITOR    | `radar`        | `radar-pec`                | [UC-DASH-001]                | [JRN-DASH-007]                 | A, C                         | `finalidade-n2`                                  | prazo do candidato, preclusivo                        | 1, 4  |
| 5   | D-05 | `IU-DASH-D-05` | `/monitoramento/radar/teat`                 | —      | Ação            | N1     | `dashboard:alert:read` (prov.)       | dash-operator, AREA-MANAGERS, agency-admin, technical-admin, AUDITOR    | `radar`        | `radar-teat`               | —                            | —                              | A, C                         | `finalidade-n2`                                  | —                                                     | 1, 4  |
| 6   | D-06 | `IU-DASH-D-06` | `/monitoramento/integracoes`                | P-04   | Ação/Técnico    | N1     | `dashboard:source:read`              | technical-admin, integration-operator, dash-operator, AUDITOR           | `integrations` | `integracoes`              | [UC-DASH-006]                | [JRN-DASH-001], [JRN-DASH-004] | D                            | —                                                | —                                                     | 5     |
| 7   | D-07 | `IU-DASH-D-07` | `/monitoramento/integracoes/:system`        | —      | Técnico         | N1     | `dashboard:source:read`              | technical-admin, integration-operator, dash-operator, AUDITOR           | `integrations` | `integracoes-system`       | —                            | [JRN-DASH-004]                 | D                            | `causa-raiz`                                     | —                                                     | 5, 6  |
| 8   | D-08 | `IU-DASH-D-08` | `/monitoramento/deveres`                    | P-05   | Ação/Vigilância | N0     | `dashboard:duty:read`                | N0-ROLES                                                                | `duties`       | `deveres`                  | [UC-DASH-003], [UC-DASH-008] | [JRN-DASH-003]                 | B                            | —                                                | sem prazo definido                                    | 7     |
| 9   | D-09 | `IU-DASH-D-09` | `/monitoramento/deveres/:id/ciclos/:period` | —      | Ação            | N0     | `dashboard:duty-cycle:read`          | N0-ROLES                                                                | `duties`       | `deveres-id-ciclos-period` | [UC-DASH-003]                | [JRN-DASH-003]                 | B                            | `avancar-ciclo`                                  | sem prazo definido                                    | 7, 8  |
| 10  | D-10 | `IU-DASH-D-10` | `/monitoramento/comparativo`                | P-06   | Vigilância      | N1     | `dashboard:comparison:read`          | agency-admin, AREA-MANAGERS, bi-analyst, AUDITOR                        | `comparison`   | `comparativo`              | [UC-DASH-005]                | [JRN-DASH-006]                 | A, B, C                      | `finalidade-n2`, `exportar`                      | —                                                     | 9     |
| 11  | D-11 | `IU-DASH-D-11` | `/monitoramento/auditoria`                  | P-07   | Contexto        | N2     | `dashboard:audit-trail:read`         | AUDITOR, DPO, agency-admin, AREA-MANAGERS                               | `audit`        | `auditoria`                | [UC-DASH-004]                | [JRN-DASH-005]                 | todos (filtro por indicador) | `finalidade-n2`, `exportar`                      | —                                                     | 10    |
| 12  | D-12 | `IU-DASH-D-12` | `/monitoramento/transparencia`              | P-08   | Vigilância      | N0     | `dashboard:transparency-audit:read`  | technical-admin, agency-admin, AUDITOR                                  | `transparency` | `transparencia`            | [UC-DASH-007]                | —                              | B                            | `auditoria-transparencia`                        | —                                                     | 11    |
| 13  | D-13 | `IU-DASH-D-13` | `/monitoramento/sinistros`                  | P-09   | Contexto        | N0     | `dashboard:comparison:read` (prov.)  | agency-admin, AREA-MANAGERS, bi-analyst, AUDITOR                        | `crashes`      | `sinistros`                | [UC-DASH-005]                | —                              | B, C                         | —                                                | —                                                     | 12    |
| 14  | D-14 | `IU-DASH-D-14` | `/monitoramento/indicadores`                | —      | Contexto        | N0     | `dashboard:indicator:read`           | N0-ROLES                                                                | `catalogue`    | `indicadores`              | —                            | —                              | A, B, C, D                   | `configurar-indicador`                           | —                                                     | 13    |
| 15  | D-15 | `IU-DASH-D-15` | `/monitoramento/frescor`                    | —      | Técnico         | N0     | `dashboard:source:read`              | technical-admin, integration-operator, dash-operator, AUDITOR           | `catalogue`    | `frescor`                  | —                            | —                              | D                            | —                                                | —                                                     | 14    |
| 16  | D-16 | `IU-DASH-D-16` | `/monitoramento/relatorios`                 | —      | Contexto        | N1     | `dashboard:generated-report:read`    | bi-analyst, agency-admin, technical-admin, AUDITOR                      | `reports`      | `relatorios`               | —                            | —                              | —                            | `solicitar-relatorio`, `exportar`                | —                                                     | 15    |
| 17  | D-17 | `IU-DASH-D-17` | `/monitoramento/exportacoes`                | —      | Contexto        | N1     | `dashboard:audit-trail:read` (prov.) | AUDITOR, DPO, agency-admin, AREA-MANAGERS                               | `reports`      | `exportacoes`              | —                            | —                              | —                            | —                                                | —                                                     | 16    |
| 18  | D-18 | `IU-DASH-D-18` | `/monitoramento/kpis`                       | —      | Contexto        | N0     | `dashboard:kpi:read`                 | agency-admin, dash-operator, AUDITOR                                    | `catalogue`    | `kpis`                     | —                            | —                              | —                            | —                                                | —                                                     | 17    |
| 19  | —    | `null`         | `/monitoramento/sem-permissao`              | —      | —               | —      | —                                    | qualquer sessão (destino do guarda de papel/camada; sem guarda própria) | `core`         | `sem-permissao`            | —                            | —                              | —                            | —                                                | —                                                     | 18    |
| 20  | —    | `null`         | `/monitoramento/auth/callback`              | —      | —               | —      | —                                    | anônimo (retorno OIDC; sem guarda)                                      | `core`         | `auth-callback`            | —                            | —                              | —                            | —                                                | —                                                     | 18    |

Invariantes verificáveis (transcritas pelo Inspector em `route-manifest.fixture.ts`):

1. 20 entradas nesta ordem; `path` únicos; nenhum `path` fora desta tabela e de §B em
   `DASHBOARD_ROUTES` (exceto a coringa técnica `**` → `/monitoramento/sem-permissao`).
2. 18 entradas com `sheet` `IU-DASH-D-01`…`IU-DASH-D-18`, contíguas, na ordem de `#`; 2 com
   `sheet: null` (`module: core`).
3. `screen` ⊆ {P-01…P-09}; cada `P-nn` aparece em exatamente uma rota (P-01 #1, P-02 #3, P-03 #4,
   P-04 #6, P-05 #8, P-06 #10, P-07 #11, P-08 #12, P-09 #13).
4. `access` ∈ {N0, N1, N2} nas 18 rotas com ficha; nunca `N3`.
5. `policy` ∈ chaves de `DASHBOARD_RULES` (`policy.ts` linhas 1548–1638); `roles` = matriz da
   chave ∩ camada ≥ `access` (§D), sem abreviação.
6. `module` ∈ {`core`} ∪ 10 pastas da §9; `core` só nas auxiliares.
7. 18 `slug` únicos; `dashboard.screens.<slug_>.title` presente na semente para os 18 (M5).

## B. Rotas filhas de detalhe (`:id` da mesma linha da §4; fora da contagem 20)

| pai (id) | path                             | sheet          | access | policy                            | módulo      | slug (i18n)                   |
| -------- | -------------------------------- | -------------- | ------ | --------------------------------- | ----------- | ----------------------------- |
| D-14     | `/monitoramento/indicadores/:id` | `IU-DASH-D-14` | N0     | `dashboard:indicator:read`        | `catalogue` | `indicadores` (mesmas chaves) |
| D-16     | `/monitoramento/relatorios/:id`  | `IU-DASH-D-16` | N1     | `dashboard:generated-report:read` | `reports`   | `relatorios` (mesmas chaves)  |

Fonte: §4 linhas D-14 e D-16 (`/monitoramento/indicadores`, `:id`; `/monitoramento/relatorios`,
`:id`); contrato §4 `GET indicators/{code}`; D-16 "acompanhar, baixar" por relatório. A ficha do
pai descreve a rota filha na seção 3 (Entrada) e 4 (Dados); nenhuma chave i18n extra (M5).

## C. Derivação da camada de acesso (`access`) por rota

Regra: `access` é o **mínimo** que a rota serve sem `LayerGate`; o conteúdo N2 de uma rota N1 é
servido só após finalidade declarada (`LayerGate`, §3; contrato §1 regra 4; [RN-DASH-171]) e a
recusa do backend (`DASH.LAYER_FORBIDDEN`, `DASH.DOMAIN_SCOPE_MISMATCH`, `DASH.PURPOSE_REQUIRED`)
prevalece sempre sobre o guarda do app.

| id        | access | Derivação                                                                                                                                                                                                                                                                                                              |
| --------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-01      | N1     | fila de alertas cross-app = "alertas por família" e "contagens por pool" ([RN-DASH-170] linha N1); contrato §2 `GET alerts` "camada por papel"; §3: operador de monitoramento N1 vê P-01                                                                                                                               |
| D-02      | N1     | anatomia mínima e ciclo do alerta são N1; o **objeto** do alerta é "opaco por camada" (build pack WP-D1) e só se identifica em N2 (contrato §2 auditoria `DASH_ALERT_READ (N2)`), via `LayerGate`; o operador (N1) faz ACK sem ver o objeto ([JRN-DASH-001] passo 2: "não abre o processo")                            |
| D-03…D-05 | N1     | "casos por faixa", contagens e filtros pool/circuito/unidade = N1; card com nº do processo e drill-down ao app de origem = N2 ([RN-DASH-142] verificação 3: "quantidade … por pool" P2, "processo nº X" P3), via `LayerGate`; gestor de área só no próprio domínio (`DASH.DOMAIN_SCOPE_MISMATCH`, dinâmico no backend) |
| D-06      | N1     | "idade do lote mais antigo", filas e lag = "idade de fila, backlog" ([RN-DASH-170] linha N1); §3: administração técnica N1, sem conteúdo de domínio                                                                                                                                                                    |
| D-07      | N1     | detalhe da mesma fonte (contrato §4 `GET sources/{id}`); itens isolados são registros de integração, não objetos de processo                                                                                                                                                                                           |
| D-08      | N0     | contrato §3 `GET duties` "todos autenticados (N0)"; 14 linhas institucionais ([RN-DASH-120])                                                                                                                                                                                                                           |
| D-09      | N0     | contrato §3 `GET duties/{id}/cycles/{period}` "idem" (N0); avançar o ciclo é permissão de comando (`duty-cycle:start…archive`), não camada                                                                                                                                                                             |
| D-10      | N1     | distribuição por pool/circuito/unidade/clínica = N1 (agregado por fila); indicador individual nomeado só em N2 com finalidade ([JRN-DASH-006] passo 4; §2 invariante 8), via `LayerGate`; `DASH.RANKING_OF_PERSONS_FORBIDDEN` fora de N2                                                                               |
| D-11      | N2     | contrato §4 `GET audit-trail` "linha do tempo por caso/indicador/período/app": partir de um caso identificado ([JRN-DASH-005] passo 1) é N2 ([RN-DASH-170] linha N2); auditor/DPO N2 transversal, sempre logado ([RN-DASH-170] verificação 1); `LayerGate` na entrada                                                  |
| D-12      | N0     | checklist LAI, ciclo mensal, datasets abertos e indicadores de serviço art. 22 são conteúdo público/institucional ([RN-DASH-142] P1); nenhum objeto de processo                                                                                                                                                        |
| D-13      | N0     | estatística **agregada** de sinistros com supressão primária e secundária (OD-D02, `dashboard.cell_threshold=10`; [RN-DASH-161]) = "séries anonimizadas" ([RN-DASH-170] linha N0); dado de saúde de vítima é N3 e nunca é servido ([RN-DASH-170] linha N3)                                                             |
| D-14      | N0     | contrato §4 `GET indicators` "N0"; catálogo sem dado de caso                                                                                                                                                                                                                                                           |
| D-15      | N0     | última leitura, latência aceitável, estado e heartbeat por fonte/painel ([WF-DASH-003]) — sem conteúdo de domínio; abaixo de qualquer linha N1 de [RN-DASH-170]; a política (`source:read`) restringe os papéis independentemente da camada                                                                            |
| D-16      | N1     | §3: analista de BI N1 "relatórios"; relatório gerado herda a camada do recorte que o gerou ([RN-DASH-172] regra 1), marca d'água com camada (regra 3); o app não abre relatório acima da camada do usuário                                                                                                             |
| D-17      | N1     | registro de exportações = quem, quando, filtros, linhas, formato, finalidade ([RN-DASH-172] regra 2) — nenhum desses campos é objeto de processo; "painel de exportações" é revisão do Encarregado ([RN-DASH-172] verificação 2)                                                                                       |
| D-18      | N0     | cobertura, MTTA, MTTR, % deveres no prazo, frescor médio ([APP-DASHBOARD] §KPIs) = agregados institucionais                                                                                                                                                                                                            |

## D. Papéis e camadas (transcrição de `roles.ts`/`policy.ts`; o Inspector transcreve de novo, independentemente)

`DETRAN_ROLES` (36 códigos, `roles.ts` linhas 79–93): `ADMIN`, `ADMIN_CLINICA`, `MEDICO`,
`PSICOLOGO`, `RECEPCAO`, `TECNICO_BIOMETRIA`, `AUDITOR`, `GESTOR`, `SUPERVISOR`, `GESTOR_DETRAN`,
`JUNTA`, `CETRAN`, `DPO`, `SUPORTE`, `CANDIDATO`, `field-agent`, `field-supervisor`,
`processing-operator`, `traffic-authority`, `agency-admin`, `technical-admin`, `bi-analyst`,
`integration-operator`, `rait-analyst`, `rait-coordinator`, `rait-secretary`,
`rait-signing-authority`, `rait-central-authority`, `rait-rapporteur`, `rait-chair`,
`rait-manager`, `rait-hr`, `rait-finance`, `dash-operator`, `dash-duty-owner`, `CIDADAO`.
`auditor` (TEAT) canonicaliza para `AUDITOR` (`roles.ts` `canonicalRole`).

Conjuntos nomeados (`policy.ts` linhas 1513–1538):

- `AREA-MANAGERS` = `rait-manager`, `rait-coordinator`, `rait-chair`, `traffic-authority`,
  `GESTOR` (5).
- `TECH` = `technical-admin`, `integration-operator` (2).
- `N0-ROLES` = `DETRAN_ROLES` menos `CANDIDATO` e `CIDADAO` (34).
- `EXPORT-ROLES` (só para o botão exportar, `dashboard:export:create`) = `agency-admin`,
  `GESTOR_DETRAN`, AREA-MANAGERS, `dash-operator`, `dash-duty-owner`, TECH, `bi-analyst` (12).

`DASHBOARD_LAYER_BY_ROLE` (`policy.ts` linhas 1882–1899; teto, nunca grant):

| Camada         | Papéis                                                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| N2             | `agency-admin`, `GESTOR_DETRAN`, `AUDITOR`, `DPO`, `rait-manager`, `rait-coordinator`, `rait-chair`, `traffic-authority`, `GESTOR` |
| N1             | `dash-operator`, `dash-duty-owner`, `technical-admin`, `integration-operator`, `bi-analyst`                                        |
| N0 (sem linha) | os 22 demais códigos de `DETRAN_ROLES` (`dashboardLayerFor` devolve `N0`)                                                          |

Chaves de política usadas pelo manifesto e sua matriz literal (`policy.ts` linhas 1548–1638):

| Chave                               | Papéis (literal)                                                                 |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| `dashboard:alert:read`              | `dash-operator`, AREA-MANAGERS, `agency-admin`, `technical-admin`, `AUDITOR` (9) |
| `dashboard:source:read`             | `technical-admin`, `integration-operator`, `dash-operator`, `AUDITOR` (4)        |
| `dashboard:duty:read`               | N0-ROLES (34)                                                                    |
| `dashboard:duty-cycle:read`         | N0-ROLES (34)                                                                    |
| `dashboard:comparison:read`         | `agency-admin`, AREA-MANAGERS, `bi-analyst`, `AUDITOR` (8)                       |
| `dashboard:audit-trail:read`        | `AUDITOR`, `DPO`, `agency-admin`, AREA-MANAGERS (8)                              |
| `dashboard:transparency-audit:read` | `technical-admin`, `agency-admin`, `AUDITOR` (3)                                 |
| `dashboard:indicator:read`          | N0-ROLES (34)                                                                    |
| `dashboard:generated-report:read`   | `bi-analyst`, `agency-admin`, `technical-admin`, `AUDITOR` (4)                   |
| `dashboard:kpi:read`                | `agency-admin`, `dash-operator`, `AUDITOR` (3)                                   |

Chaves de **comando** que só abrem botões (nunca rotas; `*stynxHasPermission` com a mesma chave do
backend, sem tabela paralela): `dashboard:alert:ack` (`dash-operator`, AREA-MANAGERS,
`agency-admin`, TECH), `dashboard:alert:close` (`dash-operator`), `dashboard:alert:annotate`
(TECH), `dashboard:incident:read` (AREA-MANAGERS, `agency-admin`, `AUDITOR` — botão "ver apuração
de incidente"), `dashboard:duty-cycle:start|prepare|submit|prove` (`dash-duty-owner`,
`agency-admin`), `dashboard:duty-cycle:archive` (`dash-operator`, `agency-admin`),
`dashboard:indicator-config:update` (`bi-analyst`, `agency-admin`, `technical-admin`),
`dashboard:indicator-config:publish` (idem, linha 861), `dashboard:generated-report:request`
(idem, linha 846), `dashboard:export:create` (EXPORT-ROLES), `dashboard:export:approve`
(`agency-admin`), `dashboard:transparency-audit:audit` (`technical-admin`, `agency-admin`). A
checagem de "dono" do alerta/dever (`DASH.ALERT_ACK_NOT_OWNER`, `DASH.DUTY_NOT_OWNER`) é
dinâmica no backend, nunca no app.

Resultado esperado por rota (papéis **ativos** = `roles` da tabela A; todos os demais de
`DETRAN_ROLES` → `/monitoramento/sem-permissao`), antes do passe global de §E:

| id               | ativos                                                                                                                                         | nº  |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| D-01…D-05        | `dash-operator`, `rait-manager`, `rait-coordinator`, `rait-chair`, `traffic-authority`, `GESTOR`, `agency-admin`, `technical-admin`, `AUDITOR` | 9   |
| D-06, D-07       | `technical-admin`, `integration-operator`, `dash-operator`, `AUDITOR`                                                                          | 4   |
| D-08, D-09, D-14 | N0-ROLES                                                                                                                                       | 34  |
| D-10, D-13       | `agency-admin`, `rait-manager`, `rait-coordinator`, `rait-chair`, `traffic-authority`, `GESTOR`, `bi-analyst`, `AUDITOR`                       | 8   |
| D-11, D-17       | `AUDITOR`, `DPO`, `agency-admin`, `rait-manager`, `rait-coordinator`, `rait-chair`, `traffic-authority`, `GESTOR`                              | 8   |
| D-12             | `technical-admin`, `agency-admin`, `AUDITOR`                                                                                                   | 3   |
| D-15             | `technical-admin`, `integration-operator`, `dash-operator`, `AUDITOR`                                                                          | 4   |
| D-16             | `bi-analyst`, `agency-admin`, `technical-admin`, `AUDITOR`                                                                                     | 4   |
| D-18             | `agency-admin`, `dash-operator`, `AUDITOR`                                                                                                     | 3   |

Em todas as 18 rotas a interseção "matriz ∩ camada ≥ access" é igual à matriz: nenhum papel
da matriz de uma chave fica abaixo da camada exigida (conferido linha a linha com a tabela de
camadas acima). Sessão sem papel canônico, `CANDIDATO` e `CIDADAO` → `/monitoramento/sem-permissao`
em todas as 18.

## E. Passe global (`GLOBAL_ADMIN_ROLES`, `policy.ts` linhas 1720–1725, 1796, 1842)

`isDetranActionAllowed` devolve `true` para qualquer chave (inclusive `dashboard:*`) quando o
principal tem `ADMIN`, `GESTOR_DETRAN`, `SUPORTE` ou `technical-admin`; `permissionsForRoles`
devolve `['*']` para eles (linha 1796) e a própria política aceita `'*'` e `<recurso>:*` em
`principal.permissions` (linhas 1831–1836). A **camada** não tem passe: `dashboardLayerFor` dá
`N0` a `ADMIN` e `SUPORTE`, `N1` a `technical-admin`, `N2` a `GESTOR_DETRAN`. O app espelha o
executado (o guarda de permissão aceita `'*'` e `dashboard:*` como o backend; o guarda de camada
não) — é isto que o Inspector prova, e a contradição com [RN-DASH-170] verificação 3 é
`OD-D16-005` (§F), não decisão deste manifesto.

| Papel             | Camada | Ativo por passe global em (além do que a matriz já concede)                    | Bloqueado pela camada em          |
| ----------------- | ------ | ------------------------------------------------------------------------------ | --------------------------------- |
| `ADMIN`           | N0     | D-12, D-13, D-15, D-18 (N0) — D-08/D-09/D-14 já são N0-ROLES                   | D-01…D-07, D-10, D-11, D-16, D-17 |
| `SUPORTE`         | N0     | idem `ADMIN`                                                                   | idem `ADMIN`                      |
| `GESTOR_DETRAN`   | N2     | D-01…D-07, D-10, D-11, D-12, D-13, D-15, D-16, D-17, D-18 (todas)              | nenhuma                           |
| `technical-admin` | N1     | D-10, D-13, D-17, D-18 (além de D-01…D-09, D-12, D-14, D-15, D-16 pela matriz) | D-11 (N2)                         |

## F. `OD-D16-nnn` propostas por este manifesto (registradas também em `CTG-0001.md` §5)

| OD         | Lacuna / divergência                                                                                                                                                                                                                                                                                                                                                                                       | Adotado provisoriamente (executado por `policy.ts`)                                                                                                    |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| OD-D16-001 | D-17 (registro de exportações) não tem rota de leitura no contrato §4 (só `POST exports` e `POST exports/{id}/approve`) nem chave `dashboard:export:read` em `DASHBOARD_RULES`                                                                                                                                                                                                                             | `dashboard:audit-trail:read`, N1 (exportação é evento de trilha, [RN-DASH-171]/[RN-DASH-172] regra 2); pedir `GET exports` + `export:read` a R-0011    |
| OD-D16-002 | D-03/D-04/D-05 (radares) e D-13 (P-09) leem projeções (`prescription_risk`, `pec_deadlines`, `teat_measures`, `crashes`, contrato §6) sem rota `GET` própria no contrato §4 e sem chave de leitura própria                                                                                                                                                                                                 | radares: `dashboard:alert:read` (lista `GET alerts` filtrada por `app`/`block`); D-13: `dashboard:comparison:read` ([UC-DASH-005] partilhado com P-06) |
| OD-D16-003 | `dashboard-frontends.md` §3 × `policy.ts`: `agency-admin` "P-01…P-08" mas sem `source:read` (P-04); `bi-analyst` "P-08" mas sem `transparency-audit:read`; `technical-admin` "P-04, frescor" mas com `alert:read` (P-01/P-02/P-03)                                                                                                                                                                         | `policy.ts` (matriz literal de §D)                                                                                                                     |
| OD-D16-004 | contrato §2–§4 × `policy.ts`: `GET sources` (+`AUDITOR` na política), `GET kpis` (+`AUDITOR`), `GET transparency/checklist` (ação `audit` no contrato; `transparency-audit:read` com `AUDITOR` na política), `GET alerts/{id}/incident` ("gestores, AUDITOR"; política inclui `agency-admin`), `POST exports` ("N1/N2 conforme recorte"; política = EXPORT-ROLES, com `GESTOR_DETRAN` e `dash-duty-owner`) | `policy.ts`                                                                                                                                            |
| OD-D16-005 | passe global de `GLOBAL_ADMIN_ROLES` alcança `dashboard:*` (§E): `technical-admin` abre D-10/D-13/D-17/D-18 e `ADMIN`/`SUPORTE` abrem D-12/D-13/D-15/D-18, contra [RN-DASH-170] verificação 3 ("technical-admin é o ponto cego") e §3 "sem conteúdo de domínio"                                                                                                                                            | o app espelha o executado; a exclusão de `dashboard:*` do passe é pergunta ao Owner/Engineer-backend                                                   |

Camada do usuário no app, rótulos dos relógios A/D e tokens das finalidades N2 estão em
`CTG-0001.md` §5 / `CTG-0002.md` §Decisões (OD-D16-006…008).

## G. Notas de fonte (coluna `fonte`)

1. `access` N1 e `LayerGate` para N2: §C; `roles` = `dashboard:alert:read` (`policy.ts` 1550–1560).
2. `blocks` A, B, C, D: [IU-DASH-001] §A P-01 "agregado de todas as escadas"; [JRN-DASH-001]
   passos 2–5 (RAIT bloco A, PEC bloco A/C, BOAT bloco C, integração bloco D). `fixed`: M4
   (alerta em `CRITICO_EXTINCAO`/`INCIDENTE_REGISTRADO`; [WF-DASH-001] §Distinção).
3. `forms`: §7 linhas "ACK do alerta (D-02)", "Encerrar alerta (D-02)", "Finalidade N2
   (`LayerGate`)" (objeto N2); `fixed`: M4 (ACK `manual` — AC-DASH-002-5; §2 invariante 5);
   `uc`/`journeys`: §4 e §6 ([JRN-DASH-001] "D-02 ACK").
4. `policy` provisória: OD-D16-002; `blocks`: §4 coluna "UC / origem" (D-03 IND-101…105 = A;
   D-04 IND-106/107 = A e 306…309 = C; D-05 IND-108…111 = A e 311…314 = C); `forms`
   `finalidade-n2`: drill-down N2 (§C); D-04 `fixed`: M4 e §2 invariante 7; D-05 `uc` `—`: a §4
   cita só indicadores e [IU-DASH-001] não tem painel TEAT.
5. `policy` `dashboard:source:read` (`policy.ts` 1604–1609; contrato §4 `GET sources`);
   `journeys` D-06: [IU-DASH-001] §A P-04 → [JRN-DASH-004] e §6 [JRN-DASH-001] ("item outbox
   `ERROR` → D-06"); `blocks` D: §4 IND-401…408.
6. `forms` `causa-raiz`: §7 "Registrar causa raiz (D-07)"; comando `dashboard:alert:annotate`
   (TECH) só no botão.
7. `policy` `dashboard:duty:read`/`duty-cycle:read` (`policy.ts` 1572–1573; contrato §3 N0);
   `uc` D-08: §4 [UC-DASH-008] + [IU-DASH-001] §A P-05 [UC-DASH-003]; `blocks` B: §4
   IND-201…209; `fixed` "sem prazo definido": M4 (deveres 204/205/208, [RN-DASH-113]).
8. `forms` `avancar-ciclo`: §7 "Avançar ciclo do dever (D-09)"; comandos
   `duty-cycle:start…archive` só nos botões.
9. `policy` `dashboard:comparison:read` (`policy.ts` 1618–1623; contrato §4 `GET comparisons`);
   `blocks` A, B, C: §4 "faixa de risco, % na meta, MTTA/MTTR, % deveres no prazo" e contrato §6
   (`production` → 304, 305, comparativo); `forms`: §7 "Exportar (D-10/D-11/D-16)" e "Finalidade
   N2" (indicador individual nomeado, [JRN-DASH-006] passo 4).
10. `policy` `dashboard:audit-trail:read` (`policy.ts` 1612–1617); `access` N2: §C; `forms`:
    §7 "Exportar (D-10/D-11/D-16)" + `LayerGate` na entrada; `blocks`: §4 "por
    caso/indicador/período/app" (filtro, não exibição de indicador).
11. `policy` `dashboard:transparency-audit:read` (`policy.ts` 1624–1629); `blocks` B: §4
    IND-DASH-209; `forms`: §7 "Auditoria de transparência (D-12)"; DT-066: itens 14.129 marcados
    "base estadual" (build pack OD-D03) — sem bloqueio de rota.
12. `policy` provisória: OD-D16-002; `access` N0: §C; `blocks` B, C: contrato §6 (`crashes` →
    203, 204, 310); M4: rota real com supressão secundária (OD-D02, DT-029), estado "bloqueado por
    decisão" só residual (`DASH.PANEL_BLOCKED_BY_DECISION`).
13. `policy` `dashboard:indicator:read` (`policy.ts` 1579; contrato §4 `GET indicators` N0);
    `blocks` A, B, C, D: os 42; `forms`: §7 "Configurar indicador (D-14)" (`indicator-config:update`
    e `:publish` só nos botões; OD-D13 vigente).
14. `policy` `dashboard:source:read`: §4 "página de status por painel/fonte" = contrato §4 `GET
sources` ("frescor por fonte/painel, heartbeat, latência aceitável"); `blocks` D: §4 IND-408.
15. `policy` `dashboard:generated-report:read` (`policy.ts` 1598–1603); `forms`: §7 "Solicitar
    relatório (D-16)" e "Exportar (D-10/D-11/D-16)"; OD-D13 vigente (telas de apoio D-14/D-16).
16. `policy` provisória: OD-D16-001; `access` N1: §C.
17. `policy` `dashboard:kpi:read` (`policy.ts` 1637); `uc` `—`: §4 cita [APP-DASHBOARD] §KPIs.
18. M6 (rotas auxiliares, padrão R-0012 A2): `sem-permissao` é o destino do guarda de papel/camada
    com `?de=<url>`; `auth/callback` é o `loginRedirectRoute` do OIDC (padrão do Portal/R-0012
    `AuthCallbackPageComponent`).

## H. `slug` → título visível (18 linhas; `dashboard.shell.title.<slug_>` e `dashboard.screens.<slug_>.title`, M5)

Título = nome da tela na coluna "Painel / tela" da §4, sem o código `P-nn` e sem a rota.

| slug                       | segmento i18n (`slug_`)    | título visível           |
| -------------------------- | -------------------------- | ------------------------ |
| `triagem`                  | `triagem`                  | Triagem do turno         |
| `alertas-id`               | `alertas_id`               | Detalhe do alerta        |
| `radar-rait`               | `radar_rait`               | Radar de prescrição RAIT |
| `radar-pec`                | `radar_pec`                | Escada de prazos PEC     |
| `radar-teat`               | `radar_teat`               | Radar TEAT               |
| `integracoes`              | `integracoes`              | Saúde técnica            |
| `integracoes-system`       | `integracoes_system`       | Detalhe da integração    |
| `deveres`                  | `deveres`                  | Deveres periódicos       |
| `deveres-id-ciclos-period` | `deveres_id_ciclos_period` | Ciclo do dever           |
| `comparativo`              | `comparativo`              | Comparativo              |
| `auditoria`                | `auditoria`                | Trilha de auditoria      |
| `transparencia`            | `transparencia`            | Transparência ativa      |
| `sinistros`                | `sinistros`                | Estatística de sinistros |
| `indicadores`              | `indicadores`              | Catálogo de indicadores  |
| `frescor`                  | `frescor`                  | Frescor das fontes       |
| `relatorios`               | `relatorios`               | Relatórios               |
| `exportacoes`              | `exportacoes`              | Exportações              |
| `kpis`                     | `kpis`                     | KPIs do painel           |

Auxiliares (só `dashboard.shell.title.<slug_>`, sem `dashboard.screens.*`): `sem-permissao` →
`sem_permissao` "Sem permissão"; `auth-callback` → `auth_callback` "Retorno de autenticação"
(M6: destino do guarda / retorno OIDC).

## I. Menu do shell (ordem = camadas, §1 e §4)

Grupos de navegação, nesta ordem: **Ação** (D-01, D-03, D-04, D-05, D-06, D-08 — rotas cuja
coluna `layer` começa por `Ação`), **Vigilância** (D-10, D-12), **Contexto** (D-11, D-13, D-14,
D-16, D-17, D-18), **Técnico** (D-15). Ordem fixa Ação › Vigilância › Contexto é de §1 e
[IU-DASH-001] §B; `Técnico` é valor literal da coluna Camada da §4 sem posição fixada pelas fontes
— fica depois de Contexto porque não compete por atenção com as três camadas do produto ([IU-DASH-001]
§B) e é "sem conteúdo de domínio" (§3). Rotas de detalhe (D-02, D-07, D-09 e as filhas de §B) não
aparecem no menu. Cada item só aparece quando o guarda de permissão **e** o de camada da rota
passam para a sessão (mesma regra do roteamento; nenhuma tabela paralela).
