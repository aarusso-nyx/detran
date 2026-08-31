---
id: UC-PEC-006
title: Emitir laudo e assinar digitalmente
status: approved
apps: [pec]
sources:
  - pec:domain/reports-bi-reports/api/src/reports/reports.service.ts
  - pec:docs/framework/pec/signatures.md
  - pec:database/ddl/02-pec.sql
  - pec:docs/framework/pec/rbac-matrix.md
updated: 2026-08-26
---

## Ator e objetivo

Médico (exame médico) ou Psicólogo (exame psicológico) emite o laudo do encounter e o assina
digitalmente, tornando-o a peça clínica imutável que sustenta o resultado do processo.
Origem: SUC-UC-13 ("Emitir laudo e assinar digitalmente"), UCAP-UC-13 ("Emitir Laudo Médico
com Assinatura Digital").

## Pré-condições

- Exame correspondente (médico ou psicológico) já registrado no encounter.
- Profissional autenticado com o papel correto (`MEDICO` para `kind=MEDICAL`, `PSICOLOGO`
  para `kind=PSYCH`).
- Biometria de encerramento do perito validada (presença física confirmada) — ver
  [RN-PEC-005].

## Fluxo principal

1. Profissional compõe o laudo (o sistema monta um artefato PDF/A com tipo de laudo, id do
   encounter, id do exame de origem, versão do template).
2. Validação de consistência do conteúdo.
3. Assinatura PAdES com certificado ICP-Brasil qualificado do profissional; carimbo de tempo
   (TSA) embutido.
4. Validação OCSP do certificado (fallback CRL se OCSP indisponível).
5. Persistência em `pec.reports`: `sha256`, `signer_name`, `signer_identifier`,
   `signer_council` (CRM ou CRP), `signed_at`, `tsa_time`, `ocsp_status`.
6. Publicação no PEC/RENACH.
7. Se chamado via `POST /encounters/:id/sign`, o encounter avança de status — ver
   [WF-PEC-001] (inclui a nuance de "primeiro laudo assinado força `SIGNED`").

## Fluxos alternativos / exceções

- **Biometria de encerramento falha**: bloqueia o envio e registra tentativa de fraude no log
  (RF-014) — o profissional não consegue finalizar o laudo sem validar a própria digital
  contra o perfil cadastrado.
- **Reassinatura do mesmo conteúdo**: o sistema evita re-assinar; se o `sha256` não mudou,
  reutiliza as evidências existentes (idempotência).
- **Correção necessária após assinatura**: não se edita o laudo original — segue para
  [UC-PEC-007] (adendo).

## Pós-condições

- Laudo assinado, imutável, persistido com hash e evidências de assinatura/validação.
- Um evento de auditoria (`audit.events`) registrado para a operação.

## Critérios de aceitação

**AC-PEC-006-1 — o ato pericial é pessoal e indelegável**

- **Dado** um laudo produzido por um profissional
- **Quando** a assinatura é aplicada
- **Então** só o próprio perito examinador assina ([RN-PEC-107], CFM 1.636 art. 1º) — o sistema
  não oferece nenhum caminho para assinar laudo produzido por outro profissional

**AC-PEC-006-2 — a biometria do perito é precondição da assinatura**

- **Dado** o momento de finalizar o laudo
- **Quando** o profissional aciona a assinatura
- **Então** o sistema exige validação biométrica dele contra o próprio perfil ([RN-PEC-005]);
  falha bloqueia o envio e registra tentativa de fraude

**AC-PEC-006-3 — o nível de assinatura é o exigido, não o disponível**

- **Dado** a assinatura do laudo
- **Quando** é aplicada
- **Então** observa o piso do art. 14 — avançada — elevando-se a qualificada onde a norma o exige
  ([RN-PEC-142]); o sistema declara qual nível aplicou, e por quê

**AC-PEC-006-4 — o laudo nascido eletrônico não precisa de papel**

- **Dado** um laudo eletrônico assinado
- **Quando** seu valor probatório é questionado
- **Então** ele é pleno pelo regime da Lei 13.787/2018 ([RN-PEC-140]) — o sistema não imprime nem
  arquiva via física para "garantir validade"

**AC-PEC-006-5 — laudo assinado é imutável; correção é adendo**

- **Dado** um laudo já assinado
- **Quando** se detecta erro
- **Então** o original não é editado nem substituído — segue [UC-PEC-007] ([RN-PEC-001])

**AC-PEC-006-6 — reassinatura do mesmo conteúdo é idempotente**

- **Dado** um conteúdo cujo `sha256` não mudou
- **Quando** a assinatura é acionada de novo
- **Então** as evidências existentes são reaproveitadas, sem nova assinatura

**AC-PEC-006-7 — validação de certificado é registrada, com fallback**

- **Dado** a assinatura
- **Quando** o certificado é validado
- **Então** OCSP é consultado, com fallback CRL, e o resultado fica persistido com o laudo
  ([RN-PEC-002])

**AC-PEC-006-8 — o primeiro laudo assinado não pode travar a segunda trilha**

- **Dado** um encounter com trilha médica e psicológica
- **Quando** o primeiro laudo é assinado
- **Então** o segundo profissional continua podendo registrar e assinar o seu — o comportamento
  atual, em que o primeiro laudo força `SIGNED`, é débito registrado (DT-105)

**AC-PEC-006-9 — a perícia psicológica segue instrumento com parecer SATEPSI**

- **Dado** uma avaliação psicológica
- **Quando** é conduzida
- **Então** usa instrumentos com parecer favorável do SATEPSI e observa a condução exigida
  ([RN-PEC-104]) — o sistema registra qual instrumento foi aplicado

## Regras aplicáveis

- [RN-PEC-001]
- [RN-PEC-002]
- [RN-PEC-005]
