---
id: UC-PEC-003
title: Tratar exceção de biometria
status: approved
apps: [pec]
sources:
  - pec:docs/framework/pec/flows/biometria-excecao.md
  - pec:docs/framework/pec/rbac-matrix.md
  - pec:docs/framework/pec/catalogo-uc.md
updated: 2026-08-26
---

## Ator e objetivo

Técnico Biométrico registra a falha de captura biométrica e solicita ao Supervisor uma
liberação temporária controlada, sem comprometer a rastreabilidade do processo. Origem:
UCAP-UC-04 ("Tratar Exceções de Biometria"), MAN-CASO-07 ("Aprovar exceção biométrica"). Ver
[JRN-PEC-003] para a narrativa completa.

## Pré-condições

- Tentativa de captura biométrica não atingiu a qualidade mínima
  (`B{Qualidade mínima atingida?}` = Não).

## Fluxo principal

1. Técnico Biométrico registra a falha e a justificativa.
2. Anexa evidências (documentais) sujeitas a dupla checagem.
3. Solicita a exceção ao Supervisor.
4. Supervisor aprova → sistema concede liberação temporária controlada com prazo/escopo
   limitados (`pec.biometric_exceptions.expires_at`).
5. Trilha de auditoria reforçada é gravada (falha, justificativa, aprovação, liberação),
   vinculando ID biométrico, IP/estação e hash.

## Fluxos alternativos / exceções

- **Supervisor reprova**: candidato é reagendado ou a captura é refeita — não há liberação.
- **Exceção expira** (`expires_at` alcançado): a liberação deixa de ser válida; a captura
  biométrica volta a ser exigida normalmente (comportamento inferido do campo `expires_at` e
  status `EXPIRED`; fluxo de reprocessamento não detalhado nos documentos — fonte pendente).

## Pós-condições

- Liberação temporária registrada e vinculada ao paciente/encounter, com prazo definido.
- Evento de auditoria reforçada persistido.

## Critérios de aceitação

**AC-PEC-003-1 — a exceção é aprovada por Supervisor, nunca autoconcedida**

- **Dado** uma falha de captura biométrica
- **Quando** o técnico registra
- **Então** a liberação depende de aprovação de Supervisor ([RN-PEC-003]) — o técnico não tem a
  ação de liberar

**AC-PEC-003-2 — a exceção tem prazo e escopo, e expira sozinha**

- **Dado** uma exceção aprovada
- **Quando** `expires_at` é atingido
- **Então** a liberação deixa de valer e a captura volta a ser exigida, sem intervenção

**AC-PEC-003-3 — ausência de digital tem fallback previsto, e não é exceção**

- **Dado** um candidato sem impressão digital utilizável
- **Quando** o check-in é feito
- **Então** o sistema usa o fallback por reconhecimento facial ([RN-PEC-131]) — tratar condição
  física permanente como "exceção aprovada por supervisor" é desenho errado e expõe a pessoa a
  fricção recorrente

**AC-PEC-003-4 — a trilha da exceção é reforçada**

- **Dado** uma exceção concedida
- **Quando** é auditada
- **Então** a trilha liga falha, justificativa, evidências, aprovador, ID biométrico, estação/IP e
  hash — auditoria reforçada, distinta da trilha comum de uso

**AC-PEC-003-5 — reprovar não gera liberação parcial**

- **Dado** um Supervisor que reprova
- **Quando** a decisão é registrada
- **Então** não há liberação alguma; o candidato é reagendado ou a captura é refeita

## Regras aplicáveis

- [RN-PEC-003]
