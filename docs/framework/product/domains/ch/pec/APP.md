---
id: APP-PEC
title: PEC — Prontuário Eletrônico (aptidão do condutor)
status: approved
apps: [pec]
sources:
  - pec:docs/framework/pec/requisitos-autoritativos.md
  - pec:docs/framework/pec/archive-authoritative-sources.md
  - pec:docs/framework/pec/index.md
  - pec:docs/framework/pec/rbac-matrix.md
  - pec:docs/roles/index.md
  - pec:database/ddl/02-pec.sql
  - REF-DETRANAM-PORTARIA-008-2021
updated: 2026-08-26
---

## Missão

Sistema integrado de prontuário eletrônico que unifica, em plataforma única, o atendimento
médico e psicológico do processo de habilitação (aptidão física e mental + avaliação
psicológica), com registro e validação biométrica e integração nativa ao RENACH — elevando
segurança, rastreabilidade e padronização do exame, reduzindo fraude e acelerando a emissão
de resultados [pec:docs/framework/pec/archive-authoritative-sources.md].

O PEC não é o sistema de habilitação em si: é o módulo clínico satélite que o DETRAN/AM e as
clínicas credenciadas usam para produzir o laudo de aptidão que alimenta o processo RENACH —
ele não decide se o condutor está habilitado, apenas produz e transmite a peça clínica que
uma das condições da habilitação depende dela.

## Atores

13 papéis binding definidos em [pec:docs/framework/pec/rbac-matrix.md] (fonte de verdade —
prevalece sobre qualquer outro documento em caso de divergência), organizados em 5 clusters
por [pec:docs/roles/index.md]:

| Ator               | Cluster         | Papel de negócio                                                                                                                                   |
| ------------------ | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Candidato          | Autoatendimento | Único ator que se autentica como usuário final do próprio processo; acesso somente-leitura ao próprio dossiê; agenda/cancela o próprio atendimento |
| Recepção           | Clínico         | Abre o atendimento e inicia o intake biométrico; sem acesso a conteúdo clínico                                                                     |
| Técnico Biométrico | Clínico         | Executa o check-in biométrico/LFD; registra falha e justificativa (sujeito a exceção aprovada por Supervisor)                                      |
| Médico             | Clínico         | Autoridade de assinatura clínica do exame médico: anamnese, exame, laudo, assinatura digital, solicitação de adendo, encerramento de episódio      |
| Psicólogo          | Clínico         | Espelha o Médico na trilha psicológica: exame, laudo, assinatura, adendo, encerramento                                                             |
| Admin Clínica      | Administrativo  | Administra a clínica (troca de tenant no escopo da clínica, cadastro de paciente, agenda da unidade); aprova retificação em par com Supervisor     |
| Supervisor         | Administrativo  | Ponto de escalonamento de qualidade clínica: aprova exceção biométrica; solicita/aprova retificação (dupla)                                        |
| Gestor DETRAN      | Administrativo  | Único ator com alcance cross-tenant; parametriza regras, habilita clínicas/profissionais, extrai relatórios regulatórios                           |
| DPO                | Administrativo  | Conformidade LGPD; consulta trilhas/evidências                                                                                                     |
| Junta (médica)     | Regulatório     | Órgão de adjudicação externo; registra parecer formal sobre casos a ela submetidos                                                                 |
| CETRAN             | Regulatório     | Conselho estadual; instância recursal sobre decisões da Junta (escalonamento)                                                                      |
| Auditor            | Auditoria       | Somente-leitura sobre a trilha de auditoria; extrai relatórios regulatórios                                                                        |
| Suporte            | Auditoria       | Operações técnicas com janela de tempo limitada, autorização explícita e mascaramento de dados; nunca acessa conteúdo clínico                      |

Atores adicionais citados na documentação-fonte mais ampla (não constam da matriz RBAC binding,
possivelmente parte da contagem "~15" do domínio): **Procuradoria Jurídica** (DETRAN/AM,
consulta dossiês para processos legais) e a cisão de **Suporte** em N2/N3
[pec:docs/meta/project/user-cases/players.md]. Atores de sistema (não humanos, endpoints de
integração): RENACH/SENATRAN, provedor biométrico autorizado, ICP-Brasil/AC/TSA, CRM/CFM e
CRP/CFP, laboratório toxicológico (C/D/E), SIEM/observabilidade.

## Fundamento

O exame de aptidão física e mental e a avaliação psicológica **são exigência de lei**, com ato
pericial próprio e indelegável ([RN-PEC-101], [RN-PEC-107]) — o PEC não cria a exigência nem pode
flexibilizá-la por conveniência operacional. Toda a arquitetura de biometria, assinatura e
imutabilidade existe porque o produto do sistema é uma **peça pericial**, não um formulário.

## Escopo (dentro / fora)

**Dentro:** agendamento de atendimento; check-in biométrico; abertura/condução do atendimento
clínico (encounter); exame médico e exame psicológico; emissão e assinatura digital de laudo
(PAdES+TSA); retificação controlada via adendo; exceção de biometria; submissão e decisão de
junta médica (com escalonamento a CETRAN); encerramento do episódio; transmissão de
resultados/eventos ao RENACH e tratamento de ACK/erro; faturamento do atendimento; gestão de
inconsistências; auditoria e relatórios regulatórios; credenciamento de clínicas e
profissionais; telessaúde.

**Fora:** prova teórica e prática de direção; emissão física da CNH; abertura do processo de
habilitação em si (o PEC consome uma `renach_process_key` já aberta ou a abre via integração,
mas não é o sistema de habilitação); julgamento de infrações de trânsito (ver domínio `inf`).

## O modelo do encontro clínico (encounter)

O PEC modela cada visita clínica como um **encounter** (`pec.encounters`), a unidade central
do domínio. Conceitualmente, **paciente ≡ candidato/condutor requerente**: a mesma pessoa
física que hoje busca a CNH ou sua renovação é tratada, dentro do PEC, como paciente de um
episódio clínico — não há um ator "paciente" distinto do "candidato" no modelo de dados
[pec:database/ddl/02-pec.sql]. Um encounter cobre **até dois exames** (um médico e um
psicológico, `UNIQUE (encounter_id)` em `pec.exams_medical` e `pec.exams_psych`) e **até dois
laudos** (`UNIQUE (encounter_id, kind)` em `pec.reports`) — não é um encounter por exame.

O **`renach_process_key`** é a chave que amarra esse encounter local (e, transitivamente, o
paciente) ao processo nacional RENACH: coluna nullable em `pec.encounters`, com unicidade
`(tenant_id, patient_id, renach_process_key)` quando presente — um processo RENACH só pode
estar ligado a um encounter por paciente/tenant
[pec:domain/integration-renach/api/src/renach/renach-processes.service.ts]. Ver
[WF-PEC-001] para o ciclo de vida completo do encounter.

## Postura de integração (RENACH)

O PEC é satélite, não autoritativo: o RENACH é o sistema nacional que possui o processo de
habilitação. A integração é bidirecional e assíncrona:

- **Abertura de processo**: `POST /integrations/renach/processes` liga (idempotentemente) o
  encounter à `renach_process_key`; consultas de identidade retornam um modelo em camadas
  (`basic|indicators|detailed|image`), com indicadores de negócio (`requiresMedical`,
  `requiresPsychological`, `requiresBiometrics`, `requiresPaymentClearance`) que podem
  disparar/dispensar etapas do PEC.
- **Transmissão de eventos**: cada entidade relevante (encounter, laudo, restrição) é
  enfileirada como evento e despachada em janelas de até 15 minutos, com idempotência e mTLS
  [pec:docs/framework/pec/flows/transmissoes-ack.md].
- **ACK/erro**: o RENACH confirma via webhook (`ACKED|ERROR`); erro dispara reprocessamento.
  **O encerramento do encounter (`CLOSED`) exige que a transmissão já tenha sido ACKed** — o
  fechamento verifica, não dispara, a publicação.
- SLA documentado: publicação RENACH ≤ 10s (p95); janela de transmissão ≤ 15 min
  [pec:CONTEXT.md].

## Âncoras legais e gaps de captura

As referências abaixo combinam normas ainda pendentes de captura com âncoras estaduais já
resolvidas. Somente as entradas explicitamente marcadas como fonte pendente funcionam como
_backlog markers_ segundo `CONVENTIONS.md`.

- **[REF-CONTRAN-927]** (fonte pendente) — Resolução CONTRAN 927/2022: procedimentos do exame
  médico e da avaliação psicológica, uso do RENACH e estatísticas regulatórias. Citada como
  módulo mestre ("MÓDULO 03: PERÍCIA MÉDICA — Res. CONTRAN 927/2022"; "MÓDULO 04: AVALIAÇÃO
  PSICOLÓGICA — Res. 927/22 + CFP 01/2019") em
  [pec:docs/framework/pec/archive-authoritative-sources.md].
- **[REF-CONTRAN-789-2020]** — Resolução CONTRAN 789/2020: etapas do processo de formação;
  ⚠ art. 4º (validade 5/3 anos) SUPERADO pelo CTB art. 147 §2º (10/5/3 por faixa etária,
  Lei 14.071/2020) — ver [RN-PEC-102] e [REF-CTB-147-148-habilitacao].
- **[REF-CONTRAN-923-1009-toxicologico]** — base do exame toxicológico é o CTB art. 148-A +
  Res. CONTRAN 923/2022; a Res. 1.009/2024 é emenda. Validade de 90 dias contada da coleta;
  periódico pós-CNH a cada 2a6m — ver [RN-PEC-007] (corrigida) e [RN-PEC-120..122].
  (Correção de citação registrada em revisão LEGAL 2026-08-24 — era o CONTRADICT #3.)
- **[REF-DETRANAM-PORTARIA-005-2021]** — Portaria DETRAN-AM 005/2021: sessão única e janela
  08h-13h — ver [RN-PEC-116]. A Portaria 008/2021 foi recuperada e rege o programa CNH Social sem
  os dispositivos conflitantes antes temidos; ver [RN-PEC-155]-[RN-PEC-157].
- (fonte pendente) Portarias SENATRAN/DENATRAN 968/2022, 495/2025, 1.515/2018, 2.145/2020 —
  coleta/validação biométrica (foto, digitais, assinatura) e validação de presença.
- Ver `_intake/proposals.md` para a lista completa proposta ao backlog de pesquisa legal.

## Interfaces com outros apps/domínios

- **RENACH/SENATRAN** (externo): abertura de processo, transmissão de resultado, estatísticas.
- **CRM/CFM, CRP/CFP** (externo): validação de habilitação profissional do médico/psicólogo
  antes de vinculá-lo a um laudo (`pec.reports.signer_council`).
- **ICP-Brasil / AC / TSA** (externo): certificado qualificado e carimbo de tempo para
  assinatura PAdES dos laudos — ver [RN-PEC-002].
- **Provedor biométrico autorizado** (externo): captura facial/digital, LFD/anti-spoofing.
- **Laboratório toxicológico** (externo): pré-condição para categorias C/D/E — ver [RN-PEC-007].
- **portal / dashboard** (internos ao ecossistema DETRAN, ver `transversal/`): não há evidência
  nos documentos do PEC de integração direta hoje — interface presumida, não confirmada.

## Vocabulário de resultado — mapeamento legal ↔ local ↔ sistema

Achado de maior risco pontual da rodada CRAWLER (`_intake/research-dossier.md` §8, item 2):
**nenhuma fonte legal ou local usa o rótulo `CONDICIONADO`** que `pec.encounters.medical_result`
usa hoje. Três vocabulários distintos coexistem, nenhum deles idêntico a outro — a tabela abaixo
é referência de mapeamento, não uma correção do schema (matéria de [RN-PEC-105]/[RN-PEC-006], a
cargo de LEGAL, já com regra formal produzida na rodada paralela). Leitura de trabalho fixada por
[RN-PEC-105]: `CONDICIONADO` ≡ "apto com restrições", **somente na trilha médica** — o enum não
pode ser compartilhado entre as duas trilhas, cada uma precisa do seu próprio vocabulário fechado;
e "PENDENTE" (Portaria DETRAN-AM 005/2021) é lido como **estado do processo** (exame não
concluído/aguardando complemento ou junta), não como um quinto resultado pericial — não deve ser
gravado em `medical_result` nem transmitido ao RENACH como resultado.

### Exame médico

| Sistema (`pec.encounters.medical_result`) | Res. CONTRAN 927/2022 art. 8º | Portaria DETRAN-AM 005/2021 art. 34 §9º                               | Prazo associado (DETRAN-AM)                                                               |
| ----------------------------------------- | ----------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| (não confirmado — `APTO`?)                | apto                          | APTO                                                                  | —                                                                                         |
| `CONDICIONADO`                            | **apto com restrições**       | APTO COM RESTRIÇÕES                                                   | 30 dias (associação exata rótulo↔prazo não explícita na fonte capturada — fonte pendente) |
| (não confirmado)                          | inapto temporário             | INAPTO TEMPORARIAMENTE                                                | 60 ou 365 dias (não determinado qual)                                                     |
| (não confirmado)                          | inapto                        | INAPTO                                                                | 90 dias (não determinado se aplicável a "inapto" ou a outro rótulo)                       |
| (sem equivalente no schema hoje)          | (sem equivalente federal)     | **PENDENTE** — [RN-PEC-105] lê como estado de processo, não resultado | não determinado; inclui "ENCAMINHAMENTO À JUNTA MÉDICA ESPECIAL"                          |

### Avaliação psicológica

| Sistema          | Res. CONTRAN 927/2022 art. 9º                      | Nota                                                                                        |
| ---------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| (não confirmado) | apto (podendo ter prazo de validade reduzido, §2º) | —                                                                                           |
| (não confirmado) | inapto temporário                                  | consigna prazo de inaptidão específico do caso (§1º), não um valor fixo da tabela DETRAN-AM |
| (não confirmado) | inapto                                             | —                                                                                           |

**Item de validação jurídica prioritária, ainda não fechado por completo** — [RN-PEC-105] fixa a
leitura de trabalho acima, mas mantém em aberto: (a) confirmação de que o RENACH de fato aceita a
taxonomia federal (inferência a partir do CTB art. 147 §1º, não de especificação técnica de
integração); (b) os prazos "30, 60, 90 e 365 dias" da Portaria DETRAN-AM 005/2021 são **quatro
números para cinco rótulos**, sem correspondência explícita no texto — não deve ser inferida pelo
produto; (c) os códigos do Anexo XV da Res. 927/2022 (que dão conteúdo ao rótulo "apto com
restrições") não foram capturados — publicados separadamente, fora do PDF do DOU. Recomenda-se
consulta formal ao DETRAN-AM antes de congelar o enum. Enquanto não resolvido, qualquer
integração ou relatório que exponha `medical_result` para fora do PEC carrega risco de
mapeamento incorreto.

## KPIs operacionais propostos

Lista de indicadores para o feed de `transversal/dashboard`, calibrada com o mesmo padrão da
rodada RAIT (`inf/rait/_intake/bpo-notes.md` §4). Proposta do BPO, não confirmada em steering.

| KPI                                                                     | Granularidade                                                            | Fonte de dado                                                                                                                            |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Tempo por etapa do encounter                                            | por episódio, por transição de [WF-PEC-001]                              | timestamps de mudança de `pec.encounters.status`                                                                                         |
| % de resultados apto / apto com restrições / inapto temporário / inapto | por período, por clínica, por tipo de exame                              | `pec.encounters.medical_result` + psicológico equivalente (após correção de enum de [RN-PEC-006])                                        |
| Backlog de junta médica/psicológica vs. prazos da Res. 927/2022         | por caso, por marco da escada de [WF-PEC-002] §"Escada de escalonamento" | timestamps de cada transição da trilha legal (requerimento → designação → decisão → recurso → Junta Especial de Saúde)                   |
| Taxa de expiração do resultado toxicológico antes do uso                | por candidato C/D/E                                                      | comparação entre data de coleta e data de uso do resultado como pré-condição — ver [WF-PEC-005]                                          |
| Ocupação da janela de atendimento (08h-13h)                             | por clínica, por dia                                                     | agendamentos vs. capacidade teórica da janela — ver [WF-PEC-003]                                                                         |
| Aging de credenciamento de clínicas/profissionais                       | por entidade credenciada                                                 | vigência de 1 ano + comprovação bienal (Res. 927/2022 arts. 16-24) — sem UC/WF dedicado hoje, candidato a módulo de administração futuro |
| Adendos por 1.000 laudos emitidos                                       | por clínica, por profissional                                            | proxy de qualidade/retrabalho — `pec.documents (kind='ADENDO')` vs. `pec.reports`                                                        |
| SLA de transmissão RENACH (ACKed dentro de 15min)                       | por evento                                                               | `integration.renach_outbox`/`integration.renach_acks`                                                                                    |

## Pedidos de capacidade (dados operacionais em aberto)

Nenhum dado quantitativo de capacidade real foi levantado nesta rodada — mesma classe de lacuna
que a rodada RAIT tratou como prioridade em `_meta/steering.md` item B antes de travar qualquer
escada de SLA em produção. Perguntas propostas ao Owner (ver `_intake/bpo-notes.md`):

1. Número de clínicas credenciadas ativas hoje no DETRAN-AM, e sua distribuição geográfica.
2. Volume mensal de encounters (exame médico + psicológico) processados pelo PEC.
3. Se a janela de 08h-13h (Portaria DETRAN-AM 005/2021 art. 40) é, na prática, o gargalo de
   agenda, ou se as clínicas já usam a extensão a dias não úteis (parágrafo único do art. 40) de
   forma rotineira.
4. Volume mensal de casos submetidos à junta médica/psicológica (trilha implementada,
   `SUBMITTED`) e, separadamente, volume de requerimentos de junta pelo candidato (trilha legal,
   art. 12) — **hoje não está confirmado se essas duas contagens são a mesma coisa** (ver
   [WF-PEC-002] §"Pergunta estrutural não resolvida").
5. Existe hoje algum mecanismo, ainda que manual, de distribuição de clínica pelo DETRAN-AM, ou
   o agendamento é inteiramente por escolha do candidato/clínica? (insumo direto para a decisão
   de regime de [WF-PEC-004]).

## Residual aberto após a rodada de endurecimento (2026-08-26)

**As 36 regras seguem em `draft`** — o top-10 do advogado (`_intake/legal-assessment.md`) não foi
respondido (DT-041). Como no TEAT e no BOAT: critério de aceitação é contrato de implementação,
regra em `draft` é fundamentação ainda sujeita a parecer.

O PEC tem uma particularidade que os outros apps não têm: **três dos itens abaixo já são defeitos
de produto conhecidos, não apenas decisões pendentes** — o sistema de origem faz hoje algo que a
norma capturada contradiz.

| Item                                                                    | Onde                                                    | Natureza                                                                                                                                                            |
| ----------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Regime de distribuição de exames** (P1–P4; LEGAL recomenda P2)        | [RN-PEC-113], [UC-PEC-013]                              | decisão — CFM 1.636 art. 3º expõe **pessoalmente** o diretor médico do DETRAN (DT-021)                                                                              |
| **Módulo de faturamento estruturalmente errado**                        | preço público federal indexado ao IPCA, Lei 15.428/2026 | **defeito** — o modelo de preço atual não corresponde à norma (DT-100)                                                                                              |
| **Validade do exame: 10/5/3 por faixa etária** (CTB 147 §2º)            | [RN-PEC-102]                                            | **defeito** — o sistema aplica os 5/3 da Res. 789/2020, superados (DT-101)                                                                                          |
| **`CONDICIONADO` não existe em norma**                                  | [RN-PEC-105], [UC-PEC-011]                              | **defeito** — enum exposto ao candidato (DT-102, DT-022)                                                                                                            |
| **Escalonamento ao CETRAN não é a terceira instância**                  | [UC-PEC-005], [UC-PEC-010]                              | **decisão reconciliada** — o alvo modela Junta Especial de Saúde distinta, designada pelo CETRAN; a reatribuição de signatário fica apenas como evidência da origem |
| **Responsável pela guarda do prontuário** (20 anos, Lei 13.787 art. 6º) | [RN-PEC-141], [UC-PEC-014]                              | decisão — clínica × DETRAN × plataforma; nenhuma eliminação antes disso (DT-023)                                                                                    |
| **Escopo do toxicológico periódico**                                    | [UC-PEC-012], [WF-PEC-005]                              | **decisão reconciliada** — PEC consome evento RENACH e registra resultado/suspensão; SENATRAN conserva o alerta                                                     |
| **Portaria DETRAN-AM 008/2021** (possível substituta da 005/2021, 404)  | regime local                                            | pedido institucional (DT-062)                                                                                                                                       |
| **Anexo XV da Res. 927/2022** (códigos de restrição) não capturado      | [UC-PEC-011], tela C-12                                 | captura de corpus                                                                                                                                                   |

O núcleo clínico — agendamento, check-in biométrico, atendimento, laudo assinado, adendo,
encerramento e transmissão ao RENACH — está `approved` e **não depende de nenhum deles**.
