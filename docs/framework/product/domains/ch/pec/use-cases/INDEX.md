# Índice do corpus de casos de uso — PEC

O PEC herda um corpus de casos de uso espalhado por **três namespaces de id não-fundidos**
(o mesmo número em namespaces diferentes é um caso de uso _diferente_ — não confundir):
mapeamento consolidado em [pec:docs/framework/pec/catalogo-uc.md]. Este índice cataloga a
fonte; os drafts completos escritos para este KB usam o prefixo `UC-PEC-nnn` e citam o(s)
id(s) de origem.

## 1. SUC-UC-01 … SUC-UC-35 — "Casos Transacionais" (namespace SUC v1.1)

Camada transacional/API — cada UC mapeado a endpoint(s) REST e a elementos de Ponto de
Função IFPUG (EE/SE/CE). Fonte completa (Atores, Objetivo, Gatilho, Pré/Pós, Fluxo Principal,
Alternativos, Regras, NFRs, Dados & Interfaces): [pec:docs/meta/project/user-cases/suc-pec-v1.1.md].
Índice curto: [pec:docs/framework/pec/catalogo-uc.md].

| Faixa          | Tema                                                                                                                          |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| SUC-UC-01 a 03 | Autenticação, multi-tenant, autorização por papel                                                                             |
| SUC-UC-04 a 07 | Cadastro de condutor/profissional, enrolamento e verificação biométrica                                                       |
| SUC-UC-08 a 09 | Agendamento, no-show/reagendamento — ver [WF-PEC-003]                                                                         |
| SUC-UC-10 a 17 | Atendimento clínico: abertura, exame médico/psicológico, laudo, assinatura, adendo, documentos, telessaúde — ver [WF-PEC-001] |
| SUC-UC-18 a 20 | Transmissão RENACH, ACK, reprocessamento — ver [RN-PEC-008]                                                                   |
| SUC-UC-21 a 25 | Faturamento: item faturável, teleatendimento, fechamento de fatura, atesto, divergências                                      |
| SUC-UC-26 a 27 | Inconsistências: detecção/notificação, correção/reprocessamento                                                               |
| SUC-UC-28 a 31 | Administração: usuários/papéis, parâmetros operacionais, onboarding de clínica, certificados/TSA                              |
| SUC-UC-32 a 33 | Relatórios operacionais e financeiros                                                                                         |
| SUC-UC-34 a 35 | Auditoria e ouvidoria/denúncia                                                                                                |

## 2. UCAP-UC-01 … UCAP-UC-103 — "Namespace Amplo" (Atores/Papéis)

Camada narrativa mais ampla, organizada em grupos temáticos A–K. Fonte:
[pec:docs/archive/user-cases/uc/casos-de-uso.txt] (bruto), mirror narrativo em
[pec:docs/meta/project/user-cases/source-cases.md] §5 (lá com ids nus `UC-NN`), consolidado em
[pec:docs/framework/pec/catalogo-uc.md] (renomeado `UCAP-UC-nn` para evitar colisão com o
namespace SUC).

| Grupo | Tema                                                                                                                   | Faixa de id       |
| ----- | ---------------------------------------------------------------------------------------------------------------------- | ----------------- |
| A     | Identidade, cadastro e biometria (processo RENACH, enrolamento, exceções)                                              | UCAP-UC-01 a 05   |
| B     | PEP Médico (episódio, anamnese, exame, laudo, condicionantes, junta, adendo, encerramento)                             | UCAP-UC-10 a 17   |
| C     | PEP Psicológico (avaliação, instrumentos, laudo assinado, junta/recurso, validade de teste)                            | UCAP-UC-20 a 24   |
| D     | Orquestração do processo (pré-condição toxicológica, bloqueio/desbloqueio de etapa, resultado RENACH, estatísticas)    | UCAP-UC-30 a 33   |
| E     | Junta e recursos (constituir junta, parecer, decisão CETRAN/CONTRANDIFE)                                               | UCAP-UC-40 a 42   |
| F     | Credenciamento e cadastro (clínica/profissional, vigência/vistoria, suspensão/revogação, certificados)                 | UCAP-UC-50 a 53   |
| G     | Segurança e LGPD (RBAC, logs de auditoria, direitos do titular, incidentes, ROPA)                                      | UCAP-UC-60 a 64   |
| H     | Auditoria, relatórios e exportações (relatórios regulatórios, dashboards, exportação PDF/A+FHIR)                       | UCAP-UC-70 a 72   |
| I     | Operação e suporte (backup/recuperação, monitoramento, suporte N2, versionamento)                                      | UCAP-UC-80 a 83   |
| J     | Integrações externas (RENACH, provedor biométrico, ICP-Brasil/TSA, CRM/CRP, laboratório toxicológico)                  | UCAP-UC-90 a 94   |
| K     | Administração do sistema — DETRAN (parâmetros regulatórios, tabelas mestras, habilitação de clínica piloto, SLA/filas) | UCAP-UC-100 a 103 |

## 3. MAN-CASO-01 … MAN-CASO-13 — "Casos Operacionais do Manual"

Estilo passo-a-passo de manual do usuário (Passos/Resultado esperado), não uma especificação
formal de UC. Fonte: [pec:docs/archive/user-manual/manual.txt]. Cobre: cadastro/busca de
paciente, agenda, exame médico, emissão/assinatura de laudo, anexos, aprovação de exceção
biométrica, bloqueios de processo, gestão de usuários/profissionais, transmissões,
habilitação de clínica/profissional, parametrização de regras, auditoria/relatórios.

## Regras globais derivadas dos casos de uso

`catalogo-uc.md` §4 aponta para [pec:docs/framework/pec/requisitos-autoritativos.md] e
[pec:docs/meta/project/archive-authoritative-sources.md] como fonte de regras transversais,
matriz RACI, critérios de aceite e anexos (A: templates de laudo; B: dicionário de dados do
episódio; C: catálogo de API; D: fluxogramas BPMN) — não replicados aqui; usar como fonte
primária ao aprofundar qualquer UC-PEC.

## UC-PEC-nnn — drafts completos neste KB

Os 9 casos de uso originais abaixo foram selecionados por serem os mais estruturantes do domínio
(criação de processo, ciclo do encounter, exceção biométrica, junta médica, laudo/assinatura,
adendo, encerramento, transmissão RENACH):

| id                            | Título                                                  | Origem                          |
| ----------------------------- | ------------------------------------------------------- | ------------------------------- |
| [UC-PEC-001](./UC-PEC-001.md) | Abrir processo RENACH e agendar exame                   | UCAP-UC-01, SUC-UC-08           |
| [UC-PEC-002](./UC-PEC-002.md) | Abrir atendimento clínico (encounter)                   | SUC-UC-10                       |
| [UC-PEC-003](./UC-PEC-003.md) | Tratar exceção de biometria                             | UCAP-UC-04, MAN-CASO-07         |
| [UC-PEC-004](./UC-PEC-004.md) | Submeter caso à junta médica                            | UCAP-UC-15, UC-J1               |
| [UC-PEC-005](./UC-PEC-005.md) | Registrar decisão da junta (com escalonamento a CETRAN) | UCAP-UC-41, UCAP-UC-42          |
| [UC-PEC-006](./UC-PEC-006.md) | Emitir laudo e assinar digitalmente                     | SUC-UC-13, UCAP-UC-13           |
| [UC-PEC-007](./UC-PEC-007.md) | Retificar laudo via adendo assinado                     | SUC-UC-15, UCAP-UC-16           |
| [UC-PEC-008](./UC-PEC-008.md) | Encerrar episódio clínico                               | UCAP-UC-17                      |
| [UC-PEC-009](./UC-PEC-009.md) | Transmitir resultado ao RENACH e tratar ACK/erro        | SUC-UC-18, SUC-UC-19, SUC-UC-20 |

### UC-PEC-010..014 — extensão BPO (rodada 2026-08-25, `_intake/research-dossier.md`)

Cinco casos de uso novos, motivados por achados da rodada CRAWLER que não tinham cobertura em
nenhum dos 9 UC originais. Dois são `stub` deliberado, condicionados a decisões do Owner ainda
em aberto — ver os respectivos workflows para o desenho completo das alternativas.

| id                            | Título                                                                 | Status   | Motivação                                                                                                    | Depende de                                |
| ----------------------------- | ---------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| [UC-PEC-010](./UC-PEC-010.md) | Conduzir recurso à Junta Especial de Saúde (terceira instância)        | draft    | Res. CONTRAN 927/2022 art. 15 — instância recursal técnica não modelada em nada do PEC                       | [WF-PEC-002]                              |
| [UC-PEC-011](./UC-PEC-011.md) | Registrar resultado "apto com restrições" e emitir código de restrição | draft    | mapeamento de vocabulário de resultado (`CONDICIONADO` vs. rótulos legais) sinalizado como risco pelo dossiê | [RN-PEC-006]                              |
| [UC-PEC-012](./UC-PEC-012.md) | Monitorar exame toxicológico periódico pós-CNH (2,5 anos)              | **stub** | escopo do PEC não decidido — ver [WF-PEC-005] §"Pergunta de escopo de produto"                               | [WF-PEC-005]                              |
| [UC-PEC-013](./UC-PEC-013.md) | Operar distribuição aleatória e impessoal de exames                    | **stub** | regime de distribuição não decidido — ver [WF-PEC-004] §"Decisão do Owner necessária"                        | [WF-PEC-004]                              |
| [UC-PEC-014](./UC-PEC-014.md) | Gerenciar retenção e eliminação/devolução do prontuário                | draft    | Lei 13.787/2018 art. 6º (20 anos) — gap total de retenção no corpus PEC                                      | (nova `RN-PEC-1xx`, a produzir por LEGAL) |
