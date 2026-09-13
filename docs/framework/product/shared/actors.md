---
id: SHARED-ACTORS
title: Catálogo de atores do ecossistema
status: reviewed
apps: [pec, teat, boat, rait, portal, dashboard]
sources:
  [
    REF-CONTRAN-918,
    REF-CONTRAN-900,
    REF-CONTRAN-985-1003-MBFT,
    REF-DETRANAM-TALAO-BODYCAM,
  ]
updated: 2026-09-12
---

Visão AGREGADA e multi-app, complementada pela seção de papéis granulares do TEAT abaixo.
**Decisão do Owner (2026-08-24, steering.md F.30):** espelhar aqui os 9 papéis granulares de
RBAC do TEAT ([APP-TEAT] §Atores), mantendo também a visão agregada — as duas camadas coexistem,
uma não substitui a outra. Os papéis granulares do PEC ([APP-PEC] lista 13) continuam vivendo
apenas no APP.md do app; espelhá-los aqui não fez parte desta decisão e segue em aberto.

## Cidadãos e partes

| Ator                             | Descrição                                                                                                                       | Apps         |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Cidadão / Condutor               | pessoa física; condutor autuado, indicado, ou requerente de habilitação                                                         | portal, pec  |
| Proprietário do veículo (PF/PJ)  | responsável pelo veículo; recebe NA/NP, indica condutor, parte legítima em defesa/recurso ([REF-CONTRAN-900] art.2º)            | portal       |
| Embarcador / Transportador       | partes legítimas quando responsáveis pela infração ([REF-CONTRAN-900] art.2º III-IV)                                            | portal, rait |
| Procurador / Representante legal | representa parte legítima, sob pena de não conhecimento ([REF-CONTRAN-900] art.2º §2º; DETRAN-AM Portaria 5046/2018 — pendente) | portal, rait |

## Campo e operação (inf/est)

| Ator                             | Descrição                                                                                                                                                                                                                         | Apps                                     |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Agente de trânsito               | lavra AIT e registra sinistro em campo; no DETRAN-AM inclui servidores próprios e policiais militares do BPTRAN sob convênio ([REF-DETRANAM-TALAO-BODYCAM])                                                                       | teat, boat                               |
| Supervisor de campo              | monta operações, equipes, turnos; supervisão da lavratura                                                                                                                                                                         | teat, boat                               |
| Operador de processamento        | retaguarda de saneamento/remessa dos atos                                                                                                                                                                                         | teat, rait                               |
| Autoridade de trânsito           | dirigente do órgão; julga defesa da autuação e aplica penalidade ([REF-CONTRAN-918] arts.2º IV, 9º)                                                                                                                               | rait                                     |
| Diretoria de Fiscalização        | unidade organizacional que decide cancelamento pós-finalização no DETRAN-AM; no runtime TEAT permanece agregada a `traffic-authority` em nível hierárquico superior, sem criar novo papel RBAC ([REF-DETRANAM-TALAO-BODYCAM] § 1) | teat                                     |
| Analista / Revisor (1º circuito) | instrui e analisa defesas/recursos individualmente                                                                                                                                                                                | rait                                     |
| JARI (colegiado)                 | julga recursos de 1ª instância ([REF-CONTRAN-918] art.15)                                                                                                                                                                         | rait                                     |
| CETRAN (recursal inf)            | 2ª instância de recursos de infração ([REF-CONTRAN-918] art.16) — ⚠ papel distinto do CETRAN do domínio ch                                                                                                                        | rait                                     |
| Parceiro conveniado (sinistros)  | integrador FACULTATIVO do RENAEST via DETRAN-AM (Res.808/2020 art.6º: saúde, SAMU, bombeiros, seguradora DPVAT) — vínculo institucional, não papel RBAC obrigatório                                                               | boat ([RN-BOAT-112..113], [WF-BOAT-002]) |

### Papéis granulares TEAT (decisão do Owner, steering.md F.30)

Os 9 papéis de RBAC declarados em [APP-TEAT] §Atores, espelhados aqui com a granularidade
original (fonte: `auth.rbac.roles` agregados dos blueprints de produto TEAT). Refinam/sobrepõem
as linhas agregadas acima (ex.: `field-agent`/`field-supervisor` refinam "Agente de
trânsito"/"Supervisor de campo"; `processing-operator` refina "Operador de processamento") — os
dois níveis coexistem por decisão do Owner, nenhum substitui o outro.

| Papel                                             | Atuação central                                                                                                                                             | Apps |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `field-agent` (agente de trânsito)                | lavra o AIT, registra abordagem, coleta evidências (incl. bodycam contínua), aplica medida administrativa, conduz procedimento de etilômetro, opera offline | teat |
| `field-supervisor` (supervisor de campo)          | gerencia turno/equipe/viatura, reserva faixas de numeração, resolve conflitos de sincronização, libera retenção de veículo                                  | teat |
| `processing-operator` (operador de processamento) | tramita o AIT após recebimento (validação, solicitação de correção), acompanha medidas administrativas e evidências na retaguarda                           | teat |
| `traffic-authority` (autoridade de trânsito)      | aceita/rejeita o AIT, aprova correções, conclui medidas administrativas, encerra procedimento de etilômetro — inicia o ciclo [WF-INF-003]                   | teat |
| `agency-admin` (administrador do órgão)           | parametriza órgão/unidade/convênio/competência territorial, gerencia homologação de dispositivos e publica catálogo normativo                               | teat |
| `technical-admin` (administrador técnico)         | administra sincronização offline, resolve incidentes técnicos, publica pacote normativo mobile                                                              | teat |
| `auditor` (auditor/corregedor)                    | consulta trilha de auditoria, cadeia de custódia, exportações de dados; não edita                                                                           | teat |
| `bi-analyst` (analista de BI/inteligência)        | consome projeções e relatórios operacionais (fora do escopo direto de lavratura)                                                                            | teat |
| `integration-operator` (operador de integração)   | acompanha e retransmite falhas de integração com sistemas nacionais/estaduais (RENAVAM, RENACH, RENAINF, RENAEST, SNE/CDT)                                  | teat |

### Papéis granulares RAIT (decisão do Owner, 2026-09-12)

Dez papéis de RBAC do RAIT, extraídos de [WF-RAIT-004] (organização e distribuição do trabalho) e
da especificação do frontend (`docs/framework/arch/rait-web-frontend.md` §3), adotados pelo Owner
em 2026-09-12 e registrados no catálogo canônico (`backend/domains/shared/src/roles.ts`,
`backend/database/ddl/05-role-catalog.sql`; ADR-0013). Refinam as linhas agregadas acima
("Analista / Revisor", "Autoridade de trânsito", "JARI", "CETRAN") sem substituí-las. Um mesmo
servidor pode acumular papéis (união, ADR-0005). Os papéis transversais já existentes
(`auditor`, `agency-admin`, `integration-operator`, `DPO`) continuam valendo no RAIT.

| Papel                                                        | Atuação central                                                                                                                                 | Fontes                                                          |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `rait-analyst` (analista / revisor da defesa prévia)         | puxa casos da fila coletiva, faz a triagem de admissibilidade, instrui, abre diligências e redige a minuta — nunca assina                       | [JRN-RAIT-001], [UC-RAIT-002], [UC-RAIT-003]                    |
| `rait-coordinator` (coordenador / subcoordenador)            | dono do pool `defesa_previa`: escala, limite de casos simultâneos, reatribuição, plantão de risco, amostragem de qualidade, plano de capacidade | [WF-RAIT-004] §3-4, [UC-RAIT-013], [UC-RAIT-025], [UC-RAIT-038] |
| `rait-secretary` (secretaria do órgão e dos colegiados)      | intake multicanal e digitalização, pendências, remessas, desistências, sorteio em lote, banca, ata, publicação, jeton, arquivo                  | [JRN-RAIT-003], [UC-RAIT-001], [UC-RAIT-014], [UC-RAIT-020]     |
| `rait-signing-authority` (autoridade de trânsito signatária) | autoridade investida que decide a defesa prévia na sua circunscrição e assina digitalmente; pode devolver a minuta uma vez                      | [RN-RAIT-143], [UC-RAIT-016]                                    |
| `rait-central-authority` (autoridade centralizada)           | decide, dentro de `T-R2`, recorrer ao CETRAN-AM contra provimento da JARI, ou declara que não recorre (recurso vinculado)                       | [RN-RAIT-130], [UC-RAIT-008]                                    |
| `rait-rapporteur` (membro / conselheiro relator)             | titular ou suplente da JARI-AM ou do CETRAN-AM: aceita lote, declara impedimento, redige parecer e voto, vota em sessão, pede vista             | [JRN-RAIT-002], [UC-RAIT-004], [UC-RAIT-019]                    |
| `rait-chair` (presidente JARI-AM / CETRAN-AM)                | homologa sorteios, monta e fecha a pauta, confirma a banca, abre e conduz a sessão, desempata, proclama, convoca extraordinária, aprova o jeton | [WF-RAIT-003], [UC-RAIT-005], [UC-RAIT-006], [UC-RAIT-021]      |
| `rait-manager` (gestor RAIT)                                 | radar de prescrição, produção e metas, capacidade, constituição de turmas, incidentes e extinções; leitura de integrações                       | [JRN-RAIT-004], [UC-RAIT-010], [UC-RAIT-039], [UC-RAIT-040]     |
| `rait-hr` (RH / gabinete)                                    | mandatos dos membros (nomeação, posse, recondução, perda) e apoio à folha de jeton                                                              | [UC-RAIT-036], [UC-RAIT-037]                                    |
| `rait-finance` (financeiro / tesouraria)                     | documentos de arrecadação por fase, restituições, cobrança e dívida ativa, conciliação bancária                                                 | [UC-RAIT-032]…[UC-RAIT-035]                                     |

Regra de espelhamento: os três registros do catálogo (código, DDL e este documento) são
verificados por `pnpm verify:role-catalog`; um papel novo exige os três no mesmo PR.

## Clínico (ch)

| Ator                          | Descrição                                                                                 | Apps |
| ----------------------------- | ----------------------------------------------------------------------------------------- | ---- |
| Médico perito examinador      | exame de aptidão física e mental                                                          | pec  |
| Psicólogo                     | avaliação psicológica (CFP 01/2019 — excerto pendente)                                    | pec  |
| Técnico biométrico / Recepção | captura biométrica, acolhimento; exceções biométricas com aprovação de Supervisor         | pec  |
| Junta médica (colegiado ch)   | segunda opinião clínica; composição não modelada hoje (backlog)                           | pec  |
| CETRAN (recursal ch)          | recurso da decisão da junta médica — mesmo órgão, papel distinto do recursal de infrações | pec  |
| Admin Clínica / Supervisor    | gestão da clínica credenciada; aprovações duplas                                          | pec  |

## Transversais

| Ator                      | Descrição                                  | Apps            |
| ------------------------- | ------------------------------------------ | --------------- |
| Gestor DETRAN             | visão cross-tenant do órgão                | todos           |
| Auditor / DPO             | trilhas de auditoria; proteção de dados    | todos           |
| Operador de monitoramento | acompanha operações e indicadores internos | dashboard       |
| Administração técnica     | saúde técnica, homologações, integrações   | dashboard, teat |

**Decisão do Owner (2026-08-24, steering.md F.32):** os papéis de protótipo sem RBAC próprio no
MVP — Suporte (técnico), Fiscal de contrato e Encarregado de dados/DPO (distinto do papel
agregado "Auditor / DPO" acima, que hoje cobre trilha de auditoria/LGPD em nível de sistema) —
estão **confirmados no escopo**, para **ondas futuras** de RBAC, não descartados (fonte:
`inf/teat/_intake/proposals.md`, `est/boat/_intake/proposals.md`).

## Decisões

**2026-08-24 (steering.md F.30, F.32).** Owner decidiu: (F.30) espelhar nesta tabela os 9 papéis
granulares de RBAC do TEAT, mantendo a visão agregada; (F.32) confirmar Suporte, Fiscal de
contrato e DPO como papéis de ondas futuras de RBAC, não fora de escopo. Ver `_meta/steering.md`
itens F.30 e F.32. Promove este arquivo de `draft` para `reviewed` — era seu único item de
decisão de escopo em aberto.
