---
id: ARCH-PEC-ERRORS
title: Catálogo de erros PEC — códigos propostos para a superfície clínica e regulatória
status: draft
apps: [pec, portal]
updated: 2026-09-29
---

# Catálogo de erros PEC

Contrato de destino para TASK-0003, sujeito à caracterização de TASK-0002.
Hoje os serviços `ch` e os controladores de composição lançam exceções Nest
com mensagens livres. Nenhum `PEC.*` abaixo é declarado como resposta já
observada. A caracterização registra status e corpo atuais antes de mapear
exceções. A implementação preserva o status HTTP existente de cada caso;
qualquer mudança exigiria decisão e contrato explícitos. O frontend usa
`code` estável quando existir e não interpreta texto livre.

| Código                      | Classe atual / situação                                             | Status atual a preservar       | Tratamento e fonte                                                               |
| --------------------------- | ------------------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------- |
| `PEC.VALIDATION_FAILED`     | `BadRequestException` para payload, formato ou parâmetro inválido   | 400                            | Campo e regra, sem dado pessoal em `context`; contratos e RN-PEC-150/151         |
| `PEC.NOT_FOUND`             | `NotFoundException`, inclusive recurso invisível a outro tenant     | 404                            | Mostrar indisponível sem revelar existência; RLS/ADR-0002                        |
| `PEC.FORBIDDEN_ACTION`      | `ForbiddenException` ou guarda de política                          | 403                            | Mostrar acesso negado; papel vindo de `policy.ts`                                |
| `PEC.CONFLICT`              | `ConflictException` de estado, vínculo, duplicidade ou idempotência | 409                            | Recarregar recurso e manter contexto mínimo; WF-PEC-001/002                      |
| `PEC.UNPROCESSABLE`         | `UnprocessableEntityException` em administração de usuário          | 422                            | Exibir validação de negócio; serviço `pec-user-admin`                            |
| `PEC.SIGNING_UNAVAILABLE`   | Provedor PAdES/TSA indisponível ou inválido                         | `source_pending` até TASK-0002 | Falha fechada: nenhum laudo emitido, estado explícito; RN-PEC-142, PEC-TRUST-001 |
| `PEC.BIOMETRIC_UNAVAILABLE` | Porta biométrica indisponível ou leitura recusada                   | `source_pending` até TASK-0002 | Encaminhar ao fluxo de exceção, sem validação fictícia; RN-PEC-130               |
| `PEC.RENACH_ACK_ERROR`      | ACK/erro de transmissão                                             | `source_pending` até TASK-0002 | Manter evento para reprocessamento; RN-PEC-008, ADR-0003                         |
| `PEC.RETENTION_BLOCKED`     | Proposta de eliminação sob PEC-RETENTION-001                        | `source_pending` até TASK-0002 | Estado `BLOCKED`, sem SQL de exclusão; RN-PEC-141, DT-023                        |

`source_pending` não autoriza criar uma resposta HTTP. TASK-0002 captura o
comportamento observado; TASK-0003 só codifica os casos cujo status esteja
confirmado, sem modificar os adaptadores de assinatura de
`clinical-reports` ou `juntas` em migração por R-0022. Códigos novos
exigem fonte e extensão deste catálogo antes de uso. `context` contém apenas
identificadores e tokens canônicos, nunca conteúdo clínico, imagem biométrica
ou CPF.

O checker de comandos ainda reconhece apenas TEAT, PORTAL, BOAT, DASH e RAIT.
TASK-0003 adiciona o prefixo PEC e a raiz dos controladores PEC; até lá,
o diagnóstico `node tools/contracts/check-commands.mjs` não é aceite do CTG.
