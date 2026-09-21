# Manifesto de rotas do RAIT (M3/M6) — fonte única para TASK-0002/0003/0004 (fichas), TASK-0005 (testes) e TASK-0006 (código)

**Rodada:** R-0012, frente `rait-web`. **Autor:** Architect (TASK-0001), 2026-09-21. **Papel:**
Architect (Art. 6). Derivado de `docs/framework/arch/rait-web-frontend.md` §4 (rotas, telas,
papéis, resolver, casos de uso), `plan.md` M3/M4/M6/M13 e adenda A2 (rotas auxiliares),
`IU-RAIT-001` (inventário T-01…T-17 e coluna Jornada), `rait-web-journeys/README.md` (JW-01…12 →
papéis), `backend/domains/shared/src/roles.ts` (`RAIT_ROLES`) e `rait-web-structure-diagrams.md`
D2/D3/D4/D7. O app transcreve esta tabela em `src/app/app.route-manifest.ts` (`RAIT_ROUTE_MANIFEST`,
M3) e o Inspector a transcreve, de forma independente, em `src/testing/route-manifest.fixture.ts`
(contrato `CTG-0002a.md` §10). Nada aqui redecide M1…M14; o que não tem fonte está em
`CTG-0002a.md` §12 como `OD-R12-*`.

## Regras de leitura das colunas

- `#`: posição na ordem da §4 (1…72) mais as duas auxiliares de A2 (73, 74). `RAIT_ROUTE_MANIFEST`
  mantém exatamente esta ordem.
- `path`: como na §4, sem barra inicial; `''` para `/`. Parâmetros como na §4 (`:id`, `:orgao`,
  `:caseId`, `:loteId`); `:orgao` ∈ {`jari`, `cetran`} (§4).
- `kind`: `redirect` para `/` e para as 8 raízes de grupo (`/colegiado/:orgao`, `/gestao`,
  `/organizacao`, `/integracoes`, `/financeiro`, `/arquivo`, `/auditoria`, `/admin`) — redirecionam ao
  primeiro filho da §4 permitido ao papel (M6; `/` usa a tabela B); `layout` para `/casos/:id`
  (T-04 com `CaseHeader` fixo + `router-outlet` filho, `detran-ui-guide.md` §3.2); `page` para as
  demais.
- `screen`: `T-nn` da §4 (idêntico ao inventário `IU-RAIT-001`) ou `—`.
- `sheet`: id da ficha (M6): 63 fichas, uma por rota `page`/`layout` da §4, ids contíguos por
  lote — lote A (painel, fila, casos, conta) `IU-RAIT-002…018`, lote B (protocolo, assinatura,
  autoridade, colegiado) `IU-RAIT-019…038`, lote C (gestao, organizacao, integracoes, financeiro,
  arquivo, auditoria, admin) `IU-RAIT-039…064`; dentro de cada lote, a ordem da §4. Rotas
  `redirect` e as auxiliares de A2 não têm ficha (`—`).
- `module`: um dos 15 módulos da §2 (`painel`, `fila`, `caso`, `protocolo`, `assinatura`,
  `autoridade`, `colegiado`, `gestao`, `organizacao`, `integracoes`, `financeiro`, `arquivo`,
  `auditoria`, `admin`, `conta`) ou `core` (`/`, `sem-permissao`, `auth/callback`). `/casos/**` é
  o módulo `caso` (a pasta é `features/caso/`; o primeiro segmento da URL é `casos`).
- `roles`: transcrição da coluna "papéis" da §4 com os códigos canônicos exatos de `RAIT_ROLES`
  (`roles.ts` linhas 57–68) mais `integration-operator`, `AUDITOR`, `agency-admin` (§3). A §4
  abrevia: `analyst` = `rait-analyst`, `coordinator` = `rait-coordinator`, `secretary` =
  `rait-secretary`, `signing-authority` = `rait-signing-authority`, `central-authority` =
  `rait-central-authority`, `rapporteur` = `rait-rapporteur`, `chair` = `rait-chair`, `manager` =
  `rait-manager`, `hr` = `rait-hr`, `finance` = `rait-finance`, `admin` (em `/organizacao/pools`) =
  `agency-admin`. Rota filha sem papéis próprios herda os do pai (M4): `/casos/:id/resumo` herda
  `/casos/:id`; `/colegiado/:orgao/sessoes/:id` ("todos do colegiado") = `rait-rapporteur,
rait-chair, rait-secretary`; `/integracoes/*` = `integration-operator, rait-manager`;
  `/financeiro/*` = `rait-finance`; `/arquivo/busca` e `/arquivo/casos/:id` = `rait-secretary,
AUDITOR`; `/auditoria/*` = `AUDITOR`; `/admin/*` = `agency-admin`. `todos` = qualquer um dos 13
  códigos canônicos (M4; `RAIT_ALL_ROLES` em `CTG-0002a.md` §4). `todos com acesso` (`/casos/:id`)
  é registrado como `todos` porque o `caseAccessGuard` fica `todo` citando R-0007 CTG-0004 (M4).
- `resolver`: o que a §4 diz que a rota carrega (texto da §4, abreviado onde a coluna repete a
  tela). Nas rotas `L0`, cita a linha de `rait-web-frontend.md` §11 que bloqueia a entrega.
- `uc`: `[UC-RAIT-nnn]` citado na própria linha da §4 ou, na falta, o da linha `T-nn` do inventário
  `IU-RAIT-001`; `—` quando nenhuma das duas fontes cita (as seis abas de `/casos/:id` sem tela
  própria e `/organizacao/pools`, `/admin/calendario`, `/conta`).
- `journeys`: `[JRN-RAIT-nnn]` da coluna Jornada de `IU-RAIT-001` para a tela da rota, acrescido
  da jornada da seção de `rait-web-frontend.md` §6 que cita a rota (§6.1 = JRN-RAIT-001, §6.2 =
  JRN-RAIT-003, §6.4 = JRN-RAIT-002, §6.5 = JRN-RAIT-004); depois, `JW-nn` por papel da coluna
  `roles` segundo `rait-web-journeys/README.md` (analyst JW-01; coordinator JW-02; secretary JW-03,
  ou JW-04 nos módulos `colegiado` e `organizacao`; signing-authority JW-05; central-authority
  JW-06; rapporteur JW-07; chair JW-08; manager JW-09; hr e finance JW-10; integration-operator
  JW-11; AUDITOR e agency-admin JW-12). `todos` → `JW-01…12`.
- `level` (M13): `L2` (página real com leitura por facade), `L1` (lista/leitura pelos clientes CRUD
  de `BP-INF-RAIT-ORG-001`/`WORKLIST`), `L0` (`DetranErrorStateComponent`
  `rait.states.unavailable_in_version` com a dependência da §11); `—` para `redirect` e `layout`.
  Onde M13 não cita a rota, vale: backend CRUD existente → `L1`; dependência da §11 "pendente" →
  `L0`. As auxiliares de A2 são `L2` (páginas do núcleo entregues no CTG-0002a).

## Tabela (74 linhas = 72 rotas da §4 + 2 auxiliares de A2)

| #   | path                                      | kind     | screen | sheet       | module      | roles                                                 | resolver                                                                                                    | uc                           | journeys                                     | level |
| --- | ----------------------------------------- | -------- | ------ | ----------- | ----------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------- | ----- |
| 1   | `''`                                      | redirect | —      | —           | core        | todos                                                 | RoleHomeRedirect: redireciona ao painel do papel principal (tabela B)                                       | —                            | JW-01…12                                     | —     |
| 2   | `painel`                                  | page     | T-01   | IU-RAIT-002 | painel      | todos                                                 | resumo do turno (fila, vencendo, diligências, parados)                                                      | [UC-RAIT-003]                | [JRN-RAIT-001], JW-01…12                     | L2    |
| 3   | `painel/retomar`                          | page     | T-06   | IU-RAIT-003 | painel      | rait-analyst, rait-rapporteur                         | bandeja "prontos para retomar"                                                                              | [UC-RAIT-003]                | [JRN-RAIT-001], JW-01, JW-07                 | L2    |
| 4   | `fila/defesa`                             | page     | T-02   | IU-RAIT-004 | fila        | rait-analyst                                          | fila coletiva do pool defesa_previa + botão "puxar próximo"                                                 | [UC-RAIT-003]                | [JRN-RAIT-001], [JRN-RAIT-003], JW-01        | L2    |
| 5   | `fila/recurso/:orgao`                     | page     | T-02   | IU-RAIT-005 | fila        | rait-rapporteur                                       | meus casos distribuídos (relatoria)                                                                         | [UC-RAIT-004]                | [JRN-RAIT-001], [JRN-RAIT-003], JW-07        | L2    |
| 6   | `casos/:id`                               | layout   | T-04   | IU-RAIT-006 | caso        | todos                                                 | layout do caso com abas (resolver: caso, partes, prazos, bandeiras); `caseAccessGuard` todo R-0007 CTG-0004 | [UC-RAIT-003]                | [JRN-RAIT-001], JW-01…12                     | —     |
| 7   | `casos/:id/resumo`                        | page     | —      | IU-RAIT-007 | caso        | todos                                                 | cabeçalho, estado, relógios, próximas ações (herda papéis de `/casos/:id`)                                  | —                            | JW-01…12                                     | L2    |
| 8   | `casos/:id/triagem`                       | page     | T-03   | IU-RAIT-008 | caso        | rait-analyst, rait-secretary                          | 4 critérios de admissibilidade                                                                              | [UC-RAIT-002]                | [JRN-RAIT-001], JW-01, JW-03                 | L2    |
| 9   | `casos/:id/dossie`                        | page     | T-04   | IU-RAIT-009 | caso        | todos                                                 | documentos, evidências, peças                                                                               | [UC-RAIT-003]                | [JRN-RAIT-001], JW-01…12                     | L2    |
| 10  | `casos/:id/diligencias`                   | page     | T-05   | IU-RAIT-010 | caso        | rait-analyst, rait-rapporteur                         | abrir/responder/prorrogar                                                                                   | [UC-RAIT-003]                | [JRN-RAIT-001], JW-01, JW-07                 | L2    |
| 11  | `casos/:id/minuta`                        | page     | T-07   | IU-RAIT-011 | caso        | rait-analyst                                          | editor de minuta (não assina)                                                                               | [UC-RAIT-003]                | [JRN-RAIT-001], JW-01                        | L2    |
| 12  | `casos/:id/decisao`                       | page     | T-07   | IU-RAIT-012 | caso        | rait-signing-authority                                | decisão/assinatura (lado autoridade)                                                                        | [UC-RAIT-003]                | [JRN-RAIT-001], JW-05                        | L2    |
| 13  | `casos/:id/prazos`                        | page     | —      | IU-RAIT-013 | caso        | todos                                                 | timers, base legal, marcos por canal                                                                        | —                            | JW-01…12                                     | L2    |
| 14  | `casos/:id/partes`                        | page     | —      | IU-RAIT-014 | caso        | rait-secretary, rait-analyst                          | requerente, procurador, legitimidade                                                                        | —                            | JW-03, JW-01                                 | L2    |
| 15  | `casos/:id/comunicacoes`                  | page     | —      | IU-RAIT-015 | caso        | rait-secretary                                        | envios e marcos de ciência                                                                                  | —                            | JW-03                                        | L2    |
| 16  | `casos/:id/impedimentos`                  | page     | —      | IU-RAIT-016 | caso        | rait-rapporteur, rait-chair                           | declarar impedimento / arguições                                                                            | —                            | JW-07, JW-08                                 | L2    |
| 17  | `casos/:id/historico`                     | page     | —      | IU-RAIT-017 | caso        | todos                                                 | eventos e trilha                                                                                            | —                            | JW-01…12                                     | L2    |
| 18  | `protocolo`                               | page     | T-08   | IU-RAIT-019 | protocolo   | rait-secretary                                        | lista de intake do dia                                                                                      | [UC-RAIT-001]                | [JRN-RAIT-003], JW-03                        | L2    |
| 19  | `protocolo/novo`                          | page     | T-08   | IU-RAIT-020 | protocolo   | rait-secretary                                        | cadastro e digitalização de peça física                                                                     | [UC-RAIT-001]                | [JRN-RAIT-003], JW-03                        | L2    |
| 20  | `protocolo/pendencias`                    | page     | —      | IU-RAIT-021 | protocolo   | rait-secretary                                        | pendências de conteúdo mínimo                                                                               | [UC-RAIT-028]                | [JRN-RAIT-003], JW-03                        | L2    |
| 21  | `protocolo/remessas`                      | page     | —      | IU-RAIT-022 | protocolo   | rait-secretary                                        | F-J-0: remessas à JARI, T-REM10                                                                             | [UC-RAIT-017]                | [JRN-RAIT-003], JW-03                        | L2    |
| 22  | `protocolo/redirecionamentos`             | page     | —      | IU-RAIT-023 | protocolo   | rait-secretary                                        | peças de/para outro órgão                                                                                   | [UC-RAIT-027]                | JW-03                                        | L2    |
| 23  | `protocolo/desistencias`                  | page     | T-17   | IU-RAIT-024 | protocolo   | rait-secretary                                        | registro de desistência                                                                                     | [UC-RAIT-012]                | [JRN-RAIT-003], JW-03                        | L2    |
| 24  | `assinatura`                              | page     | —      | IU-RAIT-025 | assinatura  | rait-signing-authority                                | fila F-DP-5 da circunscrição, ordenada                                                                      | [UC-RAIT-016]                | JW-05                                        | L2    |
| 25  | `assinatura/:caseId`                      | page     | T-07   | IU-RAIT-026 | assinatura  | rait-signing-authority                                | decisão com minuta lado a lado                                                                              | [UC-RAIT-016]                | [JRN-RAIT-001], JW-05                        | L2    |
| 26  | `autoridade/provimentos`                  | page     | T-16   | IU-RAIT-027 | autoridade  | rait-central-authority                                | provimentos da JARI a avaliar, dias restantes de T-R2                                                       | [UC-RAIT-008]                | JW-06                                        | L2    |
| 27  | `colegiado/:orgao`                        | redirect | —      | —           | colegiado   | rait-rapporteur, rait-chair, rait-secretary           | raiz de grupo: redireciona ao primeiro filho permitido ao papel                                             | —                            | JW-07, JW-08, JW-04                          | —     |
| 28  | `colegiado/:orgao/distribuicao`           | page     | T-09   | IU-RAIT-028 | colegiado   | rait-chair, rait-secretary                            | lotes de sorteio                                                                                            | [UC-RAIT-014]                | [JRN-RAIT-002], [JRN-RAIT-003], JW-08, JW-04 | L2    |
| 29  | `colegiado/:orgao/distribuicao/:loteId`   | page     | —      | IU-RAIT-029 | colegiado   | rait-chair, rait-secretary                            | ata do lote, aceites, impedimentos                                                                          | [UC-RAIT-014]                | [JRN-RAIT-002], [JRN-RAIT-003], JW-08, JW-04 | L2    |
| 30  | `colegiado/:orgao/relatoria`              | page     | T-10   | IU-RAIT-030 | colegiado   | rait-rapporteur                                       | meus casos, T-VOTO, aceitar lote                                                                            | [UC-RAIT-004]                | [JRN-RAIT-002], JW-07                        | L2    |
| 31  | `colegiado/:orgao/relatoria/:caseId/voto` | page     | T-10   | IU-RAIT-031 | colegiado   | rait-rapporteur                                       | redação do parecer e voto                                                                                   | [UC-RAIT-004]                | [JRN-RAIT-002], JW-07                        | L2    |
| 32  | `colegiado/:orgao/pauta`                  | page     | T-11   | IU-RAIT-032 | colegiado   | rait-chair                                            | montagem e fechamento da pauta                                                                              | [UC-RAIT-005]                | [JRN-RAIT-002], JW-08                        | L2    |
| 33  | `colegiado/:orgao/sessoes`                | page     | —      | IU-RAIT-033 | colegiado   | rait-chair, rait-secretary, rait-rapporteur           | calendário e lista de sessões                                                                               | —                            | [JRN-RAIT-002], JW-08, JW-04, JW-07          | L2    |
| 34  | `colegiado/:orgao/sessoes/:id`            | page     | T-12   | IU-RAIT-034 | colegiado   | rait-rapporteur, rait-chair, rait-secretary           | sessão ao vivo: quorum, itens, votos ("todos do colegiado" = papéis de `/colegiado/:orgao`)                 | [UC-RAIT-006]                | [JRN-RAIT-002], JW-07, JW-08, JW-04          | L2    |
| 35  | `colegiado/:orgao/sessoes/:id/banca`      | page     | —      | IU-RAIT-035 | colegiado   | rait-secretary, rait-chair                            | confirmação de banca e suplentes                                                                            | [UC-RAIT-015]                | [JRN-RAIT-003], JW-04, JW-08                 | L2    |
| 36  | `colegiado/:orgao/sessoes/:id/ata`        | page     | T-13   | IU-RAIT-036 | colegiado   | rait-secretary, rait-chair                            | ata gerada, assinatura, publicação                                                                          | [UC-RAIT-020]                | [JRN-RAIT-002], [JRN-RAIT-003], JW-04, JW-08 | L2    |
| 37  | `colegiado/:orgao/vistas`                 | page     | —      | IU-RAIT-037 | colegiado   | rait-chair, rait-rapporteur                           | itens com vista e prazos                                                                                    | [UC-RAIT-019]                | JW-08, JW-07                                 | L2    |
| 38  | `colegiado/:orgao/extraordinaria`         | page     | —      | IU-RAIT-038 | colegiado   | rait-chair                                            | convocação extraordinária                                                                                   | [UC-RAIT-021]                | JW-08                                        | L2    |
| 39  | `gestao`                                  | redirect | —      | —           | gestao      | rait-manager, rait-coordinator                        | raiz de grupo: redireciona ao primeiro filho permitido ao papel                                             | —                            | JW-09, JW-02                                 | —     |
| 40  | `gestao/radar`                            | page     | T-14   | IU-RAIT-039 | gestao      | rait-manager                                          | radar de prescrição por relógio                                                                             | [UC-RAIT-010]                | [JRN-RAIT-004], JW-09                        | L2    |
| 41  | `gestao/radar/:caseId`                    | page     | T-15   | IU-RAIT-040 | gestao      | rait-manager                                          | drill-down e ação (reatribuir, priorizar, escalar)                                                          | [UC-RAIT-010], [UC-RAIT-011] | [JRN-RAIT-004], JW-09                        | L2    |
| 42  | `gestao/producao`                         | page     | —      | IU-RAIT-041 | gestao      | rait-manager, rait-coordinator                        | produção, metas, taxa de provimento                                                                         | [UC-RAIT-040]                | [JRN-RAIT-004], JW-09, JW-02                 | L1    |
| 43  | `gestao/capacidade`                       | page     | —      | IU-RAIT-042 | gestao      | rait-coordinator, rait-manager                        | projeção e plano do período                                                                                 | [UC-RAIT-038]                | [JRN-RAIT-004], JW-02, JW-09                 | L1    |
| 44  | `gestao/turmas`                           | page     | —      | IU-RAIT-043 | gestao      | rait-manager                                          | unidades e constituição                                                                                     | [UC-RAIT-039]                | [JRN-RAIT-004], JW-09                        | L1    |
| 45  | `gestao/incidentes`                       | page     | —      | IU-RAIT-044 | gestao      | rait-manager                                          | PRESCRITO_OPERACIONAL, extinções declaradas                                                                 | [UC-RAIT-023]                | JW-09                                        | L2    |
| 46  | `gestao/qualidade`                        | page     | —      | IU-RAIT-045 | gestao      | rait-coordinator                                      | amostragem e achados                                                                                        | [UC-RAIT-025]                | JW-02                                        | L1    |
| 47  | `organizacao`                             | redirect | —      | —           | organizacao | rait-coordinator, rait-chair, rait-secretary, rait-hr | raiz de grupo: redireciona ao primeiro filho permitido ao papel                                             | —                            | JW-02, JW-08, JW-04, JW-10                   | —     |
| 48  | `organizacao/escala`                      | page     | —      | IU-RAIT-046 | organizacao | rait-coordinator, rait-chair                          | escala semanal e plantão — §11 linha 4 (escala/plantão pendente)                                            | [UC-RAIT-013]                | JW-02, JW-08                                 | L0    |
| 49  | `organizacao/membros`                     | page     | —      | IU-RAIT-047 | organizacao | rait-hr, rait-chair                                   | membros, mandatos, posse, perda                                                                             | [UC-RAIT-037]                | JW-10, JW-08                                 | L1    |
| 50  | `organizacao/pools`                       | page     | —      | IU-RAIT-048 | organizacao | rait-coordinator, agency-admin                        | pools e estratégias                                                                                         | —                            | JW-02, JW-12                                 | L1    |
| 51  | `organizacao/jeton`                       | page     | —      | IU-RAIT-049 | organizacao | rait-secretary, rait-hr                               | folha de remuneração por sessão — §11 linha 8 (jeton pendente)                                              | [UC-RAIT-036]                | [JRN-RAIT-003], JW-04, JW-10                 | L0    |
| 52  | `integracoes`                             | redirect | —      | —           | integracoes | integration-operator, rait-manager                    | raiz de grupo: redireciona ao primeiro filho permitido ao papel                                             | —                            | JW-11, JW-09                                 | —     |
| 53  | `integracoes/renainf`                     | page     | —      | IU-RAIT-050 | integracoes | integration-operator, rait-manager                    | espelhamento e recibos — §11 linha 6 (painel de integrações pendente)                                       | [UC-RAIT-029]                | JW-11, JW-09                                 | L0    |
| 54  | `integracoes/renach`                      | page     | —      | IU-RAIT-051 | integracoes | integration-operator, rait-manager                    | penalidades definitivas e estornos — §11 linha 6                                                            | [UC-RAIT-030]                | JW-11, JW-09                                 | L0    |
| 55  | `integracoes/falhas`                      | page     | —      | IU-RAIT-052 | integracoes | integration-operator, rait-manager                    | retransmissão e conciliação — §11 linha 6                                                                   | [UC-RAIT-031]                | JW-11, JW-09                                 | L0    |
| 56  | `financeiro`                              | redirect | —      | —           | financeiro  | rait-finance                                          | raiz de grupo: redireciona ao primeiro filho permitido ao papel                                             | —                            | JW-10                                        | —     |
| 57  | `financeiro/arrecadacao`                  | page     | —      | IU-RAIT-053 | financeiro  | rait-finance                                          | documentos por fase — §11 linha 5 (módulo financeiro pendente)                                              | [UC-RAIT-032]                | JW-10                                        | L0    |
| 58  | `financeiro/restituicoes`                 | page     | —      | IU-RAIT-054 | financeiro  | rait-finance                                          | ordens de restituição — §11 linha 5                                                                         | [UC-RAIT-033]                | JW-10                                        | L0    |
| 59  | `financeiro/cobranca`                     | page     | —      | IU-RAIT-055 | financeiro  | rait-finance                                          | cobrança e dívida ativa — §11 linha 5                                                                       | [UC-RAIT-034]                | JW-10                                        | L0    |
| 60  | `financeiro/conciliacao`                  | page     | —      | IU-RAIT-056 | financeiro  | rait-finance                                          | retornos bancários — §11 linha 5                                                                            | [UC-RAIT-035]                | JW-10                                        | L0    |
| 61  | `arquivo`                                 | redirect | —      | —           | arquivo     | rait-secretary, AUDITOR                               | raiz de grupo: redireciona ao primeiro filho permitido ao papel                                             | —                            | JW-03, JW-12                                 | —     |
| 62  | `arquivo/busca`                           | page     | —      | IU-RAIT-057 | arquivo     | rait-secretary, AUDITOR                               | autos encerrados                                                                                            | [UC-RAIT-024]                | JW-03, JW-12                                 | L2    |
| 63  | `arquivo/casos/:id`                       | page     | —      | IU-RAIT-058 | arquivo     | rait-secretary, AUDITOR                               | dossiê final selado, vista/cópia                                                                            | [UC-RAIT-024]                | JW-03, JW-12                                 | L2    |
| 64  | `arquivo/retencao`                        | page     | —      | IU-RAIT-059 | arquivo     | rait-secretary                                        | fila de retenção e anonimização                                                                             | [UC-RAIT-024]                | [JRN-RAIT-003], JW-03                        | L2    |
| 65  | `auditoria`                               | redirect | —      | —           | auditoria   | AUDITOR                                               | raiz de grupo: redireciona ao primeiro filho permitido ao papel                                             | —                            | JW-12                                        | —     |
| 66  | `auditoria/trilha`                        | page     | —      | IU-RAIT-060 | auditoria   | AUDITOR                                               | trilha por caso/período                                                                                     | [UC-RAIT-042]                | JW-12                                        | L2    |
| 67  | `auditoria/exportacoes`                   | page     | —      | IU-RAIT-061 | auditoria   | AUDITOR                                               | exportações registradas — §11 linha 8 (exportações assinadas pendentes)                                     | [UC-RAIT-042]                | JW-12                                        | L0    |
| 68  | `admin`                                   | redirect | —      | —           | admin       | agency-admin                                          | raiz de grupo: redireciona ao primeiro filho permitido ao papel                                             | —                            | JW-12                                        | —     |
| 69  | `admin/parametros`                        | page     | —      | IU-RAIT-062 | admin       | agency-admin                                          | timers operacionais, WIP, lotes, escada — §11 linha 7 (parâmetros versionados pendentes)                    | [UC-RAIT-043]                | JW-12                                        | L0    |
| 70  | `admin/calendario`                        | page     | —      | IU-RAIT-063 | admin       | agency-admin                                          | feriados nacional + AM — §11 linha 7 (calendário de feriados pendente)                                      | —                            | JW-12                                        | L0    |
| 71  | `admin/atos/suspensao`                    | page     | —      | IU-RAIT-064 | admin       | agency-admin                                          | atos de força maior — §11 linha 7 (admin pendente); comando `rait-suspension-act:create` "pendente" em §7   | [UC-RAIT-022]                | JW-12                                        | L0    |
| 72  | `conta`                                   | page     | —      | IU-RAIT-018 | conta       | todos                                                 | perfil, papéis ativos, tema                                                                                 | —                            | JW-01…12                                     | L2    |
| 73  | `sem-permissao`                           | page     | —      | —           | core        | todos                                                 | destino do `roleGuard` (A2); `?de=<url>`                                                                    | —                            | JW-01…12                                     | L2    |
| 74  | `auth/callback`                           | page     | —      | —           | core        | todos                                                 | retorno OIDC (A2; padrão do Portal): `completeLogin` e redirect a `/`                                       | —                            | JW-01…12                                     | L2    |

**Rodapé (contagens verificáveis):** 74 linhas = 72 rotas da §4 (linhas 1–72) + 2 auxiliares (73,
74). `kind`: 64 `page` (62 da §4 + 2 auxiliares), 1 `layout` (`/casos/:id`), 9 `redirect` (`/` +
8 raízes de grupo). `sheet`: 63 fichas = lote A 17 (`IU-RAIT-002…018`) + lote B 20
(`IU-RAIT-019…038`) + lote C 26 (`IU-RAIT-039…064`) = 63, contíguas, sem lacuna nem repetição;
72 − 9 `redirect` = 63 ✓ (M6). `screen`: 17 telas distintas T-01…T-17, cada uma em ≥ 1 rota
(T-02, T-04, T-07, T-08 e T-10 em duas rotas). `module`: 16 nomes (`core` + 15 da §2). `level`:
13 `L0`, 6 `L1`, 45 `L2` (43 da §4 + 2 auxiliares), 10 `—`. `roles`: 13 códigos distintos, todos
em `RAIT_ROLES` ∪ {`integration-operator`, `AUDITOR`, `agency-admin`}; `todos` em 10 linhas
(`/`, `/painel`, `/casos/:id`, `resumo`, `dossie`, `prazos`, `historico`, `/conta`,
`sem-permissao`, `auth/callback`).

## A. Slug de cada rota para chaves i18n (`rait.screens.<slug>.*`)

Regra (M6; `CTG-0002a.md` §9): slug = `path` sem `/` inicial, `/` → `-`, `:param` → `param` (só o
dois-pontos cai; o nome do parâmetro fica como na §4, inclusive `caseId` e `loteId`), `home` para
`/`. O título de janela/breadcrumb de cada rota é `rait.screens.<slug>.title`; as fichas de
CTG-0001 acrescentam as demais chaves `rait.screens.<slug>.*`. `RAIT_SCREEN_SLUGS` em
`app.route-manifest.ts` é a transcrição desta tabela.

| path                                      | slug                                    |
| ----------------------------------------- | --------------------------------------- |
| `''`                                      | `home`                                  |
| `painel`                                  | `painel`                                |
| `painel/retomar`                          | `painel-retomar`                        |
| `fila/defesa`                             | `fila-defesa`                           |
| `fila/recurso/:orgao`                     | `fila-recurso-orgao`                    |
| `casos/:id`                               | `casos-id`                              |
| `casos/:id/resumo`                        | `casos-id-resumo`                       |
| `casos/:id/triagem`                       | `casos-id-triagem`                      |
| `casos/:id/dossie`                        | `casos-id-dossie`                       |
| `casos/:id/diligencias`                   | `casos-id-diligencias`                  |
| `casos/:id/minuta`                        | `casos-id-minuta`                       |
| `casos/:id/decisao`                       | `casos-id-decisao`                      |
| `casos/:id/prazos`                        | `casos-id-prazos`                       |
| `casos/:id/partes`                        | `casos-id-partes`                       |
| `casos/:id/comunicacoes`                  | `casos-id-comunicacoes`                 |
| `casos/:id/impedimentos`                  | `casos-id-impedimentos`                 |
| `casos/:id/historico`                     | `casos-id-historico`                    |
| `protocolo`                               | `protocolo`                             |
| `protocolo/novo`                          | `protocolo-novo`                        |
| `protocolo/pendencias`                    | `protocolo-pendencias`                  |
| `protocolo/remessas`                      | `protocolo-remessas`                    |
| `protocolo/redirecionamentos`             | `protocolo-redirecionamentos`           |
| `protocolo/desistencias`                  | `protocolo-desistencias`                |
| `assinatura`                              | `assinatura`                            |
| `assinatura/:caseId`                      | `assinatura-caseId`                     |
| `autoridade/provimentos`                  | `autoridade-provimentos`                |
| `colegiado/:orgao`                        | `colegiado-orgao`                       |
| `colegiado/:orgao/distribuicao`           | `colegiado-orgao-distribuicao`          |
| `colegiado/:orgao/distribuicao/:loteId`   | `colegiado-orgao-distribuicao-loteId`   |
| `colegiado/:orgao/relatoria`              | `colegiado-orgao-relatoria`             |
| `colegiado/:orgao/relatoria/:caseId/voto` | `colegiado-orgao-relatoria-caseId-voto` |
| `colegiado/:orgao/pauta`                  | `colegiado-orgao-pauta`                 |
| `colegiado/:orgao/sessoes`                | `colegiado-orgao-sessoes`               |
| `colegiado/:orgao/sessoes/:id`            | `colegiado-orgao-sessoes-id`            |
| `colegiado/:orgao/sessoes/:id/banca`      | `colegiado-orgao-sessoes-id-banca`      |
| `colegiado/:orgao/sessoes/:id/ata`        | `colegiado-orgao-sessoes-id-ata`        |
| `colegiado/:orgao/vistas`                 | `colegiado-orgao-vistas`                |
| `colegiado/:orgao/extraordinaria`         | `colegiado-orgao-extraordinaria`        |
| `gestao`                                  | `gestao`                                |
| `gestao/radar`                            | `gestao-radar`                          |
| `gestao/radar/:caseId`                    | `gestao-radar-caseId`                   |
| `gestao/producao`                         | `gestao-producao`                       |
| `gestao/capacidade`                       | `gestao-capacidade`                     |
| `gestao/turmas`                           | `gestao-turmas`                         |
| `gestao/incidentes`                       | `gestao-incidentes`                     |
| `gestao/qualidade`                        | `gestao-qualidade`                      |
| `organizacao`                             | `organizacao`                           |
| `organizacao/escala`                      | `organizacao-escala`                    |
| `organizacao/membros`                     | `organizacao-membros`                   |
| `organizacao/pools`                       | `organizacao-pools`                     |
| `organizacao/jeton`                       | `organizacao-jeton`                     |
| `integracoes`                             | `integracoes`                           |
| `integracoes/renainf`                     | `integracoes-renainf`                   |
| `integracoes/renach`                      | `integracoes-renach`                    |
| `integracoes/falhas`                      | `integracoes-falhas`                    |
| `financeiro`                              | `financeiro`                            |
| `financeiro/arrecadacao`                  | `financeiro-arrecadacao`                |
| `financeiro/restituicoes`                 | `financeiro-restituicoes`               |
| `financeiro/cobranca`                     | `financeiro-cobranca`                   |
| `financeiro/conciliacao`                  | `financeiro-conciliacao`                |
| `arquivo`                                 | `arquivo`                               |
| `arquivo/busca`                           | `arquivo-busca`                         |
| `arquivo/casos/:id`                       | `arquivo-casos-id`                      |
| `arquivo/retencao`                        | `arquivo-retencao`                      |
| `auditoria`                               | `auditoria`                             |
| `auditoria/trilha`                        | `auditoria-trilha`                      |
| `auditoria/exportacoes`                   | `auditoria-exportacoes`                 |
| `admin`                                   | `admin`                                 |
| `admin/parametros`                        | `admin-parametros`                      |
| `admin/calendario`                        | `admin-calendario`                      |
| `admin/atos/suspensao`                    | `admin-atos-suspensao`                  |
| `conta`                                   | `conta`                                 |
| `sem-permissao`                           | `sem-permissao`                         |
| `auth/callback`                           | `auth-callback`                         |

## B. `RoleHomeRedirect` — papel → rota inicial de `/`

Fonte: `rait-web-frontend.md` §4 (`/` "redireciona para o painel do papel principal"), §5.1
(`RoleHomeRedirect`), §3 (módulos visíveis) e a regra fixada no prompt TASK-0001 §1(b). Precedência
para união de papéis (ADR-0005): o **primeiro** papel presente na ordem desta tabela decide
(`RAIT_ROLE_PRECEDENCE`, `CTG-0002a.md` §4). Sessão sem nenhum dos 13 códigos → `/sem-permissao`.
As raízes de grupo (`kind: redirect`) resolvem ao primeiro filho da §4 permitido ao papel (coluna
"filho efetivo").

| papel                    | ordem | rota inicial              | filho efetivo (raiz de grupo) | fonte / observação                                                                                                                                              |
| ------------------------ | ----- | ------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rait-analyst`           | 1     | `/painel`                 | —                             | §3 (painel); §6.1 passo 1                                                                                                                                       |
| `rait-rapporteur`        | 2     | `/painel`                 | —                             | §3 (painel); T-01 ator "relator"                                                                                                                                |
| `rait-secretary`         | 3     | `/protocolo`              | —                             | §3 (protocolo); §6.2                                                                                                                                            |
| `rait-signing-authority` | 4     | `/assinatura`             | —                             | §3; §6.3 passo 1                                                                                                                                                |
| `rait-central-authority` | 5     | `/autoridade/provimentos` | —                             | §3; T-16                                                                                                                                                        |
| `rait-chair`             | 6     | `/painel`                 | —                             | **default provisório**: o alvo natural é `/colegiado/:orgao/pauta` (§6.4 passo 3), mas `:orgao` do presidente não tem fonte → `OD-R12-002`; `/painel` é `todos` |
| `rait-manager`           | 7     | `/gestao`                 | `/gestao/radar`               | §3; §6.5 passo 1; primeiro filho da §4 permitido a `manager`                                                                                                    |
| `rait-coordinator`       | 8     | `/gestao`                 | `/gestao/producao`            | §3 ("gestão (produção, capacidade)"); `radar` é só `manager`, primeiro filho permitido é `producao`                                                             |
| `rait-hr`                | 9     | `/organizacao/membros`    | —                             | §3 ("organização (membros e mandatos, jeton)")                                                                                                                  |
| `rait-finance`           | 10    | `/financeiro`             | `/financeiro/arrecadacao`     | §3; primeiro filho da §4                                                                                                                                        |
| `integration-operator`   | 11    | `/integracoes`            | `/integracoes/renainf`        | §3; primeiro filho da §4                                                                                                                                        |
| `AUDITOR`                | 12    | `/auditoria`              | `/auditoria/trilha`           | §3; primeiro filho da §4                                                                                                                                        |
| `agency-admin`           | 13    | `/admin`                  | `/admin/parametros`           | §3; primeiro filho da §4                                                                                                                                        |

Filho efetivo das outras raízes de grupo, pela mesma regra (primeiro filho da §4 permitido ao
papel): `/colegiado/:orgao` → `rait-chair`/`rait-secretary` → `distribuicao`; `rait-rapporteur` →
`relatoria`. `/organizacao` → `rait-coordinator`/`rait-chair` → `escala`; `rait-hr` → `membros`;
`rait-secretary` → `jeton`; `agency-admin` não está nos papéis da raiz `/organizacao` na §4
(apenas em `/organizacao/pools`) → `/sem-permissao` na raiz, acesso direto ao filho —
divergência com D7 registrada em `OD-R12-003`. `/arquivo` → `rait-secretary`/`AUDITOR` → `busca`.

## C. Aba inicial de `/casos/:id` por papel (M4)

Fonte: `rait-web-frontend.md` §4 (regras de roteamento: "analista → triagem/dossiê; autoridade →
decisão; relator → voto") transcrita por `plan.md` M4 ("analista → `triagem`/`dossie`; autoridade →
`decisao`; relator → `dossie`; demais → `resumo`"). A escolha é **só por papel** (`canMatch`, sem
carregar o caso); precedência para união de papéis = ordem da tabela B (`RAIT_ROLE_PRECEDENCE`),
avaliando apenas os papéis com aba própria.

| papel                                                                                                                                                                               | aba inicial | rota resultante      | observação                                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rait-analyst`                                                                                                                                                                      | `triagem`   | `/casos/:id/triagem` | M4 lista `triagem` antes de `dossie`; §6.1 passo 2 chega ao caso por `triagem`. Se a escolha deve depender do `state` (`TRIAGEM_ADMISSIBILIDADE` → triagem, senão dossiê) é `OD-R12-004`; até lá, `triagem` |
| `rait-signing-authority`                                                                                                                                                            | `decisao`   | `/casos/:id/decisao` | "autoridade → decisão" (§4); a aba `decisao` é `rait-signing-authority`                                                                                                                                     |
| `rait-rapporteur`                                                                                                                                                                   | `dossie`    | `/casos/:id/dossie`  | M4 ("relator → `dossie`"); a §4 diz "relator → voto", mas `voto` vive em `/colegiado/:orgao/relatoria/:caseId/voto`, fora de `/casos/:id` — a transcrição M4 prevalece                                      |
| demais (`rait-secretary`, `rait-coordinator`, `rait-central-authority`, `rait-chair`, `rait-manager`, `rait-hr`, `rait-finance`, `integration-operator`, `AUDITOR`, `agency-admin`) | `resumo`    | `/casos/:id/resumo`  | M4 ("demais → `resumo`"); `resumo` herda `todos`                                                                                                                                                            |

O redirect da aba inicial só é aplicado quando a URL termina em `/casos/:id` (`pathMatch: 'full'`
no filho `''`); deep-link com aba explícita é o formato canônico e não é reescrito (§4).

## Invariantes verificáveis (transcritas pelo Inspector em `route-manifest.fixture.ts`)

1. 74 entradas na ordem desta tabela; `path` únicos; nenhum `path` fora desta tabela em
   `RAIT_ROUTES` (exceto a coringa técnica `**`, `CTG-0002a.md` §3).
2. 9 entradas `redirect` (`''` e as 8 raízes), 1 `layout` (`casos/:id`), 64 `page`.
3. `sheet` ≠ `—` ⇔ `kind` ≠ `redirect` e `module` ≠ `core`; os 63 ids são `IU-RAIT-002…064`,
   contíguos na ordem lote A → B → C; dentro do lote, ordem crescente de `#`.
4. `screen` ⊆ {T-01…T-17}; toda tela T-01…T-17 aparece em ≥ 1 rota.
5. `roles` ⊆ `RAIT_ALL_ROLES` (13 códigos) ou `todos`; nenhuma abreviação da §4 sobrevive.
6. `module` ∈ {`core`} ∪ 15 módulos da §2; `core` só em `''`, `sem-permissao`, `auth/callback`.
7. `level` ∈ {`L0`, `L1`, `L2`} ⇔ `kind` = `page`; `—` ⇔ `kind` ∈ {`redirect`, `layout`}; as 13
   `L0` são exatamente as de M13 (`organizacao/escala`, `organizacao/jeton`, `integracoes/*`,
   `financeiro/*`, `admin/*`, `auditoria/exportacoes`) e as 6 `L1` as de M13 (`gestao/producao`,
   `gestao/capacidade`, `gestao/turmas`, `gestao/qualidade`, `organizacao/membros`,
   `organizacao/pools`).
8. Toda rota com `:orgao` está em `fila` ou `colegiado`; toda rota `L0` cita "§11 linha n" no
   `resolver`.

## Tipo TS (M3; transcrito em `app.route-manifest.ts` e, independentemente, em `route-manifest.fixture.ts`)

```ts
export type RaitModule =
  | 'core'
  | 'painel'
  | 'fila'
  | 'caso'
  | 'protocolo'
  | 'assinatura'
  | 'autoridade'
  | 'colegiado'
  | 'gestao'
  | 'organizacao'
  | 'integracoes'
  | 'financeiro'
  | 'arquivo'
  | 'auditoria'
  | 'admin'
  | 'conta';
export type RaitRouteKind = 'page' | 'layout' | 'redirect';
export type RaitRouteLevel = 'L0' | 'L1' | 'L2';
export type RaitRoleCode =
  | 'rait-analyst'
  | 'rait-coordinator'
  | 'rait-secretary'
  | 'rait-signing-authority'
  | 'rait-central-authority'
  | 'rait-rapporteur'
  | 'rait-chair'
  | 'rait-manager'
  | 'rait-hr'
  | 'rait-finance'
  | 'integration-operator'
  | 'AUDITOR'
  | 'agency-admin';
export interface RaitRouteEntry {
  readonly path: string; // como na tabela, sem barra inicial; '' para /
  readonly kind: RaitRouteKind;
  readonly screen: `T-${string}` | null;
  readonly sheet: `IU-RAIT-${string}` | null;
  readonly module: RaitModule;
  readonly roles: readonly RaitRoleCode[] | 'all'; // 'all' = `todos` (M4)
  readonly resolver: string | null;
  readonly uc: readonly string[]; // 'UC-RAIT-nnn' sem colchetes
  readonly journeys: readonly string[]; // 'JRN-RAIT-nnn' e 'JW-nn' ('JW-01…12' expandido em 12 ids)
  readonly level: RaitRouteLevel | null; // M13; null em redirect/layout
}
export const RAIT_ROUTE_MANIFEST: readonly RaitRouteEntry[]; // 74 entradas, ordem desta tabela
```

`level` não consta da lista de campos de M3; entra por M13 (nível por rota é dado do manifesto,
não do código) — registrado em `CTG-0002a.md` §2 para ratificação do maestro.
