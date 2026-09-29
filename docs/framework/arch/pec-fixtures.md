---
id: ARCH-PEC-FIXTURES
title: Fixtures canônicas PEC — personas, isolamento e ciclos clínicos
status: draft
apps: [pec, portal]
updated: 2026-09-29
---

# Fixtures canônicas PEC

Este é o contrato de fixture compartilhado entre R-0031 e R-0032. A seed SQL
que o materializará será adicionada na tarefa que detiver a fronteira
`backend/database/seed/`; este documento não autoriza criar dados fora dela.
Todos os identificadores abaixo são estáveis, sintéticos e legíveis. Nenhum
valor é dado pessoal real, imagem biométrica, template biométrico ou chamada a
integração externa.

O CPF de cada candidato é um token sintético, deliberadamente não numérico. O
mesmo token e o mesmo `cpf_hash_fixture` devem ser consumidos por R-0032; os
testes nunca calculam nem substituem um CPF válido.

| Chave canônica              | Valor de fixture                       | Regra                                             |
| --------------------------- | -------------------------------------- | ------------------------------------------------- |
| tenant clínico A            | `00000000-0000-7000-8000-0000ceca0001` | tenant proprietário dos casos P-01…P-07           |
| tenant clínico B            | `00000000-0000-7000-8000-0000ceca0002` | tenant de negação RLS                             |
| CPF sintético compartilhado | `CPF-SINTETICO-R0032`                  | nunca serializar como número nem validar como CPF |
| hash compartilhado          | `cpf_hash_fixture_r0032`               | valor de fixture, não hash de pessoa real         |
| relógio de fixture          | `source_pending`                       | não há data normativa comum definida nesta rodada |

## 1. Tenants, clínicas e profissionais

| Fixture                                 | Tenant    | Finalidade                                                                       |
| --------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `pec-clinic-a`                          | clínico A | clínica credenciada que contém todos os casos positivos                          |
| `pec-clinic-b`                          | clínico B | clínica isolada; toda leitura ou mutação cruzada deve falhar                     |
| `pec-admin-clinic-a`                    | clínico A | `ADMIN_CLINICA`, agenda e aprovação clínica de adendo                            |
| `pec-reception-a`                       | clínico A | `RECEPCAO`, agenda, paciente, encounter e check-in permitido                     |
| `pec-biometric-tech-a`                  | clínico A | `TECNICO_BIOMETRIA`, captura e solicitação de exceção                            |
| `pec-supervisor-a`                      | clínico A | `SUPERVISOR`, aprovação de exceção e primeira aprovação de adendo                |
| `pec-medical-a`                         | clínico A | `MEDICO`, trilha médica, laudo e assinatura                                      |
| `pec-psychology-a`                      | clínico A | `PSICOLOGO`, trilha psicológica, laudo e assinatura                              |
| `pec-manager-a`                         | clínico A | `GESTOR`, transmissão e visão operacional permitida                              |
| `pec-junta-a`                           | clínico A | `JUNTA`, parecer de junta                                                        |
| `pec-cetran-a`                          | clínico A | `CETRAN`, decisão da instância distinta                                          |
| `pec-dpo-a`                             | clínico A | `DPO`, retenção e revisão que lhe é exclusiva                                    |
| `pec-auditor-a`                         | clínico A | `AUDITOR`, leitura/auditoria conforme política                                   |
| `pec-support-a`                         | clínico A | `SUPORTE`, autorização global atual sempre acompanhada de serialização mascarada |
| `pec-candidate-p01`…`pec-candidate-p07` | clínico A | sete titulares sintéticos, um por percurso P-01…P-07                             |
| `pec-candidate-b`                       | clínico B | titular que não possui vínculo com casos do tenant A                             |

Profissionais de saúde, clínica e pessoas de teste usam os ids acima. A
fixture não acrescenta papel: cada teste usa exclusivamente os papéis
canônicos de `backend/domains/shared/src/roles.ts`.

## 2. Percursos do candidato e encounters

Cada candidato P tem o CPF sintético compartilhado e uma identidade distinta
de fixture. Um encounter pertence ao tenant A, à clínica A e ao respectivo
titular. Os estados de ciclo de vida são selecionados da referência do módulo
no momento de materializar a seed; este contrato não cria um enum paralelo.

| Caso | Titular             | Encounter / situação requerida                                         | Evidência para R-0032                                                       |
| ---- | ------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| P-01 | `pec-candidate-p01` | agendamento por região/data; clínica e perito resultam da distribuição | não há escolha de clínica ou profissional                                   |
| P-02 | `pec-candidate-p02` | resultado e dossiê próprios disponíveis                                | titular vê o dossiê sem máscara                                             |
| P-03 | `pec-candidate-p03` | resultado com restrição associada                                      | conteúdo restrito à fonte disponível; código do Anexo XV é `source_pending` |
| P-04 | `pec-candidate-p04` | resultado conhecido e requerimento de junta                            | prazo é lido de parâmetro, não de constante de fixture                      |
| P-05 | `pec-candidate-p05` | recurso de junta encaminhado à instância CETRAN distinta               | cadeia de caso, junta e colegiado distintos                                 |
| P-06 | `pec-candidate-p06` | resultado toxicológico periódico recebido                              | origem é evento de integração simulado, nunca laboratório real              |
| P-07 | `pec-candidate-p07` | prontuário sujeito a pedido de retenção/eliminação                     | disposição é `BLOCKED`; não há deleção                                      |

Para cobrir cada estado do lifecycle efetivamente publicado pelos módulos,
o gerador de fixture deve criar um encounter por token da tabela de referência
do módulo, ligado a um dos sete titulares acima. Se a tabela ainda não
publicar o token, a seed falha fechada com `source_pending`; ela não inventa
estado. O conjunto mínimo dos percursos também inclui um encounter cujo
fechamento só é tentado depois de transmissão `ACKED`, como exige APP-PEC.

## 3. Artefatos clínicos e controles negativos

| Fixture                          | Titular / tenant | Cenário contratual                                                                       |
| -------------------------------- | ---------------- | ---------------------------------------------------------------------------------------- |
| `pec-report-signed`              | P-02 / A         | laudo de uma das trilhas, com assinatura por porta simulada e recibo sintético           |
| `pec-report-signing-unavailable` | P-02 / A         | provedor indisponível: falha fechada, sem laudo emitido e com estado explícito do módulo |
| `pec-addendum-pending`           | P-02 / A         | pedido de adendo, aguardando Supervisor e Admin Clínica como aprovações distintas        |
| `pec-addendum-approved`          | P-02 / A         | ambas aprovações registradas antes da assinatura do profissional                         |
| `pec-biometric-exception`        | P-01 / A         | falha de biometria com solicitação do técnico e decisão do Supervisor                    |
| `pec-retention-blocked`          | P-07 / A         | proposta de disposição `BLOCKED`, sem SQL de deleção e sem apagamento lógico             |

Captura biométrica é somente um recibo/resultado sintético da porta. Nunca
armazenar imagem, digital, template, dado biométrico ou material de uma pessoa.
Homologação, se necessária ao teste, deve aparecer rotulada como tal e limitada
ao perfil autorizado.

## 4. Junta, prazos e toxicologia

`pec-board-p04` começa no requerimento do titular P-04. `pec-board-p05` é o
recurso relacionado ao titular P-05 e possui uma Junta Especial/CETRAN de
composição distinta. Cada marco de prazo usa uma chave do catálogo de
parâmetros e o relógio injetado pelo teste; a fixture não fixa dias, datas ou
valores normativos. Uma chave ainda ausente é registrada como `source_pending`
e mantém o comando dependente bloqueado.

| Fixture                  | Resultado esperado                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| `pec-tox-positive`       | resultado positivo sintético recebido por callback autenticado simulado                               |
| `pec-tox-negative`       | resultado negativo sintético recebido por callback autenticado simulado                               |
| `pec-tox-invalid`        | evento malformado, obsoleto ou de categoria não suportada em exceção auditável; não altera o condutor |
| `pec-transmission-acked` | transmissão RENACH simulada com `ACKED`                                                               |
| `pec-transmission-error` | transmissão RENACH simulada com `ERROR`, apta a reprocessamento pelo backend                          |

O simulador só alcança a porta `packages/senatran-adapter`. Frontend, módulos
de domínio e fixture não fazem chamada direta a RENACH, SENATRAN, PAdES, TSA ou
laboratório.

## 5. Isolamento, titular e Suporte

Todo recurso clínico criado no tenant A recebe uma contraparte ou tentativa de
acesso no tenant B. Para cada operação com identificador de recurso, a suíte
deve exercitar: recurso A com principal A autorizado; recurso A com principal
do tenant B; e recurso B com principal A. As duas últimas tentativas devem ser
negadas pela fronteira de tenant, sem revelar existência ou conteúdo.

Para dados de P-01…P-07, a prova de titular é feita pelo vínculo do ator ao
próprio caso, e não pelo CPF enviado pelo cliente. O titular autorizado vê os
campos do próprio dossiê sem máscara, conforme RN-PEC-153. Uma resposta
permitida ao `SUPORTE` deve mascarar identificadores e conteúdo sensível antes
da serialização. A autorização global atual não o torna bypass de RLS ou de
conteúdo clínico; toda tentativa que falhar pela política retorna 403 sem
revelar o recurso.

## 6. Consumo e materialização

R-0032 referencia estes ids, `CPF-SINTETICO-R0032` e
`cpf_hash_fixture_r0032` sem criar variantes. A implementação futura deve
adicionar a seed PEC à lista fechada de `backend/database/seed.sh`, manter
idempotência e executar a seed duas vezes antes de declarar paridade.

Nenhuma fixture deste documento autoriza valor legal novo. Prazos, códigos,
estados ou taxonomias sem referência publicada permanecem `source_pending`.
