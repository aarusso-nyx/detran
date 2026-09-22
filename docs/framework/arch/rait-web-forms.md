---
id: ARCH-RAIT-WEB-FORMS
title: apps/rait/web — formulários, validação de forma e gates de transição (WP-E, consolidado do CTG-0002c)
status: draft
apps: [rait]
updated: 2026-09-22
---

# apps/rait/web — Formulários e gates de transição

Consolidado legível do contrato `work/rounds/R-0012/contracts/CTG-0002c.md` (entregável E do
`rait-build-pack.md` §WP-E; `rait-web-frontend.md` §9). Para cada um dos 16 formulários: a tabela
de campos (campo, tipo zod, obrigatoriedade, máscara, validação de forma no cliente, erro de
negócio esperado do servidor — `rait-error-catalog.md` §3 — e chave i18n) e a tabela do gate
(pré-estado, papéis, pré-condições, comando, pós-estado, `errorCodes`). Os schemas vivem em
`apps/rait/web/src/app/forms/<nome>.schema.ts`, um por formulário, com a tabela do gate no
cabeçalho do arquivo.

## 1. Princípios

1. **Validação de forma só orienta.** Erro de forma é inline, em pt-BR, sob o campo, com
   `aria-describedby` (`detran-ui-guide.md` §3.7). Erro de negócio vem do backend no envelope
   `StynxError` com código estável do catálogo (`rait-error-catalog.md` §4).
2. **Nenhum prazo, tempestividade ou ordem no cliente** ([RN-RAIT-005], [RN-RAIT-141]). Datas
   civis são `YYYY-MM-DD`; a data de referência (`today`) é injetada pela página a partir de
   `RaitClock` — `forms/` nunca chama `Date`. A regra ESLint `rait/no-client-deadline-math` (§18)
   prova a proibição.
3. **Fatos do servidor são espelhados, nunca decididos.** Impedimento, quorum, bandeira
   `ALERTA_N3`/`CRITICO`, calendário, escala, circunscrição e contagens chegam ao schema em
   `context` (tri-estado: `true` passa, `false` gera erro de forma na chave da regra, `null` = fato
   indisponível → o servidor decide). `context` não é controle e não é enviado ao servidor.
4. **O gate é documentação verificável.** Transcreve `rait-web-frontend.md` §6.6/§7/§9, os
   workflows e o catálogo; os papéis são a linha real de `RAIT_COMMAND_RULES`
   (`backend/domains/shared/src/policy.ts`). O gate nunca decide permissão — isso é
   `*stynxHasPermission` e o servidor. Comandos continuam `todo` até R-0007 CTG-0004 (M8).
5. **Chaves i18n** `rait.forms.<nome>.<campo>` (rótulos) e `rait.forms.<nome>.<campo>.<regra>` /
   `rait.forms.common.<regra>` (mensagens); textos provisórios (P) para revisão do Owner
   (OD-R12-028). Tokens de estado, timer, papel e erro vêm dos contratos gerados e dos catálogos.

Tipos comuns (`forms/form-gate.ts`): `FormGate`, `FieldMask` (`cpf`, `cnpj`, `placa`, `ait`,
`date`, `protocol`), helpers `cpfOrCnpj`, `plateBr`, `aitNumber`, `dateNotAfterToday(today)`,
`dateNotBeforeToday(today)`, `businessDaysPositiveInt`, `periodValid`, `issueMessageKey`,
`DOCUMENT_ACCEPT` (PDF, JPEG, PNG — [UC-RAIT-001]).

## 2. Intake físico (`intake-fisico`)

Rota `/protocolo/novo` ([IU-RAIT-020]); [UC-RAIT-001]; [RN-RAIT-106] (marco por canal); §9 linha
"Intake físico"; catálogo §3.2 e §3.3.

| Campo                       | Tipo zod                                        | Obrig.         | Máscara      | Validação (cliente)                            | Erro do servidor                                                                   | Chave i18n                                           |
| --------------------------- | ----------------------------------------------- | -------------- | ------------ | ---------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `channel`                   | `z.enum(RAIT_COMMUNICATION_CHANNELS)`           | sim            | —            | token do contrato (OD-R12-037)                 | `RAIT.ENUM_INVALID`, `RAIT.INTAKE_CHANNEL_MARK_MISSING`                            | `rait.forms.intake-fisico.channel`                   |
| `markOn`                    | `isoDate`                                       | sim            | `date`       | R3: ≤ `context.today`                          | `RAIT.DATE_IN_FUTURE`                                                              | `rait.forms.intake-fisico.markOn`                    |
| `plate`                     | `plateBr`                                       | sim            | `placa`      | padrão AAA0A00 / AAA0000                       | `RAIT.VALIDATION_FAILED`                                                           | `rait.forms.intake-fisico.plate`                     |
| `aitNumber`                 | `aitNumber`                                     | sim            | `ait`        | R1: um só AIT (sem separador)                  | `RAIT.INTAKE_MULTIPLE_AIT`                                                         | `rait.forms.intake-fisico.aitNumber`                 |
| `applicant.name`            | `z.string().trim().min(1)`                      | sim            | —            | não vazio                                      | `RAIT.VALIDATION_FAILED`                                                           | `rait.forms.intake-fisico.applicant.name`            |
| `applicant.document`        | `cpfOrCnpj`                                     | sim            | `cpf`/`cnpj` | R2: dígitos verificadores                      | `RAIT.DOCUMENT_INVALID`                                                            | `rait.forms.intake-fisico.applicant.document`        |
| `applicant.address`         | `z.string().trim().min(1)`                      | sim            | —            | não vazio (sem campo no contrato — OD-R12-041) | `RAIT.VALIDATION_FAILED`                                                           | `rait.forms.intake-fisico.applicant.address`         |
| `applicant.legitimacyBasis` | enum de `CreateRaitPartyDto` (6 tokens), `null` | não            | —            | token do contrato                              | `RAIT.PARTY_LEGITIMACY_INVALID`                                                    | `rait.forms.intake-fisico.applicant.legitimacyBasis` |
| `signaturePresent`          | `z.boolean()`                                   | sim (resposta) | —            | `false` não bloqueia o protocolo               | `RAIT.INTAKE_SIGNATURE_MISSING` (só na admissão)                                   | `rait.forms.intake-fisico.signaturePresent`          |
| `documents[]`               | `z.array(IntakeDocumentSchema).min(1)`          | sim (≥ 1)      | —            | R4: `contentType ∈ DOCUMENT_ACCEPT`            | `RAIT.FILE_TYPE_UNSUPPORTED`, `RAIT.FILE_TOO_LARGE`, `RAIT.INTAKE_MINIMUM_CONTENT` | `rait.forms.intake-fisico.documents`                 |
| `context.today`             | `isoDate`                                       | sim            | —            | injetado pela página                           | —                                                                                  | —                                                    |

Regras: R1 um AIT por requerimento (`rait.forms.common.ait_single`); R2 CPF/CNPJ válidos
(`rait.forms.common.document_invalid`); R3 data do marco ≤ hoje (`rait.forms.common.date_future`);
R4 ao menos uma peça, tipos PDF/JPEG/PNG (`rait.forms.common.file_type`).

| Gate INTAKE_FISICO_GATE | Valor                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| pré-estado              | — (criação)                                                                                                                                                                                                                                                                                                                                                        |
| papéis                  | `rait-secretary`                                                                                                                                                                                                                                                                                                                                                   |
| pré-condições           | conteúdo mínimo ou pendência aberta (§7); um AIT por requerimento, CPF/CNPJ válidos, data do marco ≤ hoje (§9); marco pelo canal utilizado ([RN-RAIT-106])                                                                                                                                                                                                         |
| comando                 | `rait-case:protocol` → `inf:rait-case:protocol`                                                                                                                                                                                                                                                                                                                    |
| pós-estado              | `PROTOCOLADO` ([WF-RAIT-001])                                                                                                                                                                                                                                                                                                                                      |
| `errorCodes`            | `RAIT.INTAKE_MULTIPLE_AIT`, `RAIT.INTAKE_DUPLICATE_INSTANCE`, `RAIT.INTAKE_INFRACTION_STATE_INVALID`, `RAIT.INTAKE_CHANNEL_MARK_MISSING`, `RAIT.INTAKE_MINIMUM_CONTENT`, `RAIT.DOCUMENT_INVALID`, `RAIT.DATE_IN_FUTURE`, `RAIT.PARTY_LEGITIMACY_INVALID`, `RAIT.FILE_TYPE_UNSUPPORTED`, `RAIT.FILE_TOO_LARGE`, `RAIT.VALIDATION_FAILED`, `RAIT.IDEMPOTENCY_REPLAY` |

## 3. Triagem (`triagem`)

Rota `/casos/:id/triagem` ([IU-RAIT-008]); [UC-RAIT-002]; [RN-RAIT-001], [RN-RAIT-122],
[RN-RAIT-105]; §6.6 "admitir / não conhecer"; §9 linha "Triagem"; catálogo §3.5.

| Campo                                                          | Tipo zod                                                                              | Obrig.                  | Máscara | Validação (cliente)                                   | Erro do servidor                     | Chave i18n                                                     |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------- | ------- | ----------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------- |
| `verdicts.{legitimidade,assinatura,pedido_compativel}.verdict` | `z.boolean().nullable()`                                                              | sim quando admit/reject | —       | R3: os três não-nulos                                 | `RAIT.TRIAGE_INCOMPLETE`             | `rait.forms.triagem.verdicts.<critério>` / `.verdicts.verdict` |
| `verdicts.<critério>.reason`                                   | `z.string().trim()`                                                                   | sim quando admit/reject | —       | R3: não vazio                                         | `RAIT.TRIAGE_INCOMPLETE`             | `rait.forms.triagem.verdicts.reason`                           |
| tempestividade                                                 | sem controle; `context.timelinessVerdict` (tri-estado)                                | —                       | —       | R1: somente leitura                                   | `RAIT.TRIAGE_TIMELINESS_READONLY`    | `rait.forms.triagem.tempestividade`                            |
| `outcome`                                                      | `z.enum(['triage','admit','reject'])`                                                 | sim                     | —       | `triage` salva parcial; R4 admit; R6 estado           | `RAIT.CASE_STATE_INVALID`            | `rait.forms.triagem.outcome`                                   |
| `nonAdmissionReason`                                           | `z.enum(['intempestivo','ilegitimo','sem_assinatura','pedido_incompativel'])`, `null` | sim quando reject       | —       | R2a obrigatório; R5 coerente com o critério reprovado | `RAIT.NON_ADMISSION_REASON_REQUIRED` | `rait.forms.triagem.nonAdmissionReason`                        |
| `nonAdmissionGrounds`                                          | `z.string().trim()`                                                                   | sim quando reject       | —       | R2b: cita o art. 4º e o inciso (OD-R12-051)           | `RAIT.NON_ADMISSION_REASON_REQUIRED` | `rait.forms.triagem.nonAdmissionGrounds`                       |
| `context.caseState`                                            | `z.enum(RAIT_CASE_STATES).nullable()`                                                 | sim                     | —       | R6: `TRIAGEM_ADMISSIBILIDADE`                         | —                                    | —                                                              |

| Gate                | pré-estado                | papéis                           | pré-condições                                                                         | comando                                     | pós-estado          | `errorCodes`                                                                                                          |
| ------------------- | ------------------------- | -------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| TRIAGEM_GATE        | `TRIAGEM_ADMISSIBILIDADE` | `rait-analyst`, `rait-secretary` | `TRIAGEM_ADMISSIBILIDADE` (§7); tempestividade somente leitura (§9)                   | `rait-case:triage` → `inf:rait-case:triage` | — (checklist salvo) | `RAIT.TRIAGE_TIMELINESS_READONLY`, `RAIT.PROCURATION_UNVERIFIED`, `RAIT.CASE_STATE_INVALID`, `RAIT.VALIDATION_FAILED` |
| TRIAGEM_ADMIT_GATE  | `TRIAGEM_ADMISSIBILIDADE` | `rait-analyst`                   | 4 vereditos registrados (§7); passa nos 4 critérios ([WF-RAIT-001])                   | `rait-case:admit` → `inf:rait-case:admit`   | `ADMITIDO`          | `RAIT.TRIAGE_INCOMPLETE`, `RAIT.INTAKE_SIGNATURE_MISSING`, `RAIT.CASE_STATE_INVALID`                                  |
| TRIAGEM_REJECT_GATE | `TRIAGEM_ADMISSIBILIDADE` | `rait-analyst`                   | 4 vereditos registrados (§7); fundamento citando o inciso do art. 4º da Res. 900 (§9) | `rait-case:reject` → `inf:rait-case:reject` | `NAO_CONHECIDO`     | `RAIT.TRIAGE_INCOMPLETE`, `RAIT.NON_ADMISSION_REASON_REQUIRED`, `RAIT.CASE_STATE_INVALID`                             |

## 4. Diligência (`diligencia`)

Rota `/casos/:id/diligencias` ([IU-RAIT-010]); [UC-RAIT-003]; [RN-RAIT-003], [RN-RAIT-004],
[RN-RAIT-005]; §6.6 "abrir diligência / responder / vencer"; §9 linha "Diligência"; catálogo §3.5.
Prazo padrão: parâmetro `rait.timer.T-DIL.default` no servidor.

| Campo                                | Tipo zod                                             | Obrig. | Máscara | Validação (cliente)                                | Erro do servidor                                              | Chave i18n                               |
| ------------------------------------ | ---------------------------------------------------- | ------ | ------- | -------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------- |
| `addressee`                          | `z.enum(RAIT_INQUIRY_ADDRESSEES)`                    | sim    | —       | R1 com `officialDocument`                          | `RAIT.INQUIRY_ADDRESSEE_FORBIDDEN`                            | `rait.forms.diligencia.addressee`        |
| `subject`                            | `z.string().trim().min(1)`                           | sim    | —       | não vazio                                          | `RAIT.VALIDATION_FAILED`                                      | `rait.forms.diligencia.subject`          |
| `dueOn`                              | `isoDate.nullable()`                                 | não    | `date`  | R2: > `context.today`; `null` = padrão do servidor | `RAIT.VALIDATION_FAILED`                                      | `rait.forms.diligencia.dueOn`            |
| `officialDocument`                   | `z.boolean()`                                        | sim    | —       | controle proposto (OD-R12-042)                     | —                                                             | `rait.forms.diligencia.officialDocument` |
| `context.today`, `context.caseState` | `isoDate`, `z.enum(RAIT_CASE_STATES).nullable()`     | sim    | —       | R5: `EM_INSTRUCAO`                                 | —                                                             | —                                        |
| prorrogação: `reason`                | `z.string().trim().min(1).optional()`                | não    | —       | —                                                  | —                                                             | `rait.forms.diligencia.extension.reason` |
| prorrogação: `context`               | `{ extensionCount: int ≥ 0, outcome: enum \| null }` | sim    | —       | R3: `extensionCount === 0`; R4: `outcome === null` | `RAIT.INQUIRY_EXTENSION_LIMIT`, `RAIT.INQUIRY_ALREADY_CLOSED` | —                                        |

Regras: R1 destinatário "requerente" bloqueado para documento do órgão
(`rait.forms.diligencia.addressee.official_document`); R2 prazo no passado
(`rait.forms.common.date_past`); R3 prorrogação 1x (`rait.forms.diligencia.extension.limit`);
R4 diligência encerrada (`rait.forms.diligencia.extension.closed`).

| Gate                   | pré-estado     | papéis                            | pré-condições                                                                                    | comando                                                          | pós-estado     | `errorCodes`                                                                                          |
| ---------------------- | -------------- | --------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| DILIGENCIA_GATE        | `EM_INSTRUCAO` | `rait-analyst`, `rait-rapporteur` | `EM_INSTRUCAO` / `DILIGENCIA` (§7); destinatário bloqueado (§9); sem prazo nunca ([RN-RAIT-004]) | `rait-case:open-inquiry` → `inf:rait-case:open-inquiry`          | `DILIGENCIA`   | `RAIT.INQUIRY_ADDRESSEE_FORBIDDEN`, `RAIT.CASE_OFFICIAL_DOCUMENT_REQUIRED`, `RAIT.CASE_STATE_INVALID` |
| DILIGENCIA_ANSWER_GATE | `DILIGENCIA`   | `rait-analyst`, `rait-rapporteur` | resposta tempestiva anexada ([WF-RAIT-001])                                                      | `rait-case:answer` → `inf:rait-case:answer-inquiry` (OD-R12-026) | `EM_INSTRUCAO` | `RAIT.INQUIRY_ALREADY_CLOSED`, `RAIT.CASE_STATE_INVALID`                                              |
| DILIGENCIA_EXTEND_GATE | `DILIGENCIA`   | `rait-analyst`, `rait-rapporteur` | prorrogação 1x (§9); nova prorrogação exige ato motivado ([IU-RAIT-010])                         | `rait-case:extend` → `inf:rait-case:extend-inquiry` (OD-R12-026) | `DILIGENCIA`   | `RAIT.INQUIRY_EXTENSION_LIMIT`, `RAIT.INQUIRY_ALREADY_CLOSED`, `RAIT.CASE_STATE_INVALID`              |

## 5. Minuta (`minuta`)

Rota `/casos/:id/minuta` ([IU-RAIT-011]); [UC-RAIT-003]; §6.6 "enviar minuta"; §9 linha "Minuta";
catálogo §3.5; dispositivo `acolher | indeferir` (OD-R12-029).

| Campo               | Tipo zod                              | Obrig. | Máscara | Validação (cliente)                    | Erro do servidor        | Chave i18n                  |
| ------------------- | ------------------------------------- | ------ | ------- | -------------------------------------- | ----------------------- | --------------------------- |
| `facts`             | `z.string().trim().min(1)`            | sim    | —       | não vazio                              | `RAIT.DRAFT_INCOMPLETE` | `rait.forms.minuta.facts`   |
| `grounds`           | `z.string().trim().min(1)`            | sim    | —       | não vazio                              | `RAIT.DRAFT_INCOMPLETE` | `rait.forms.minuta.grounds` |
| `ruling`            | `z.enum(['acolher','indeferir'])`     | sim    | —       | R1: dispositivo ∈ {acolher, indeferir} | `RAIT.DRAFT_INCOMPLETE` | `rait.forms.minuta.ruling`  |
| `context.caseState` | `z.enum(RAIT_CASE_STATES).nullable()` | sim    | —       | R2: `EM_INSTRUCAO`                     | —                       | —                           |

| Gate MINUTA_GATE | Valor                                                                       |
| ---------------- | --------------------------------------------------------------------------- |
| pré-estado       | `EM_INSTRUCAO`                                                              |
| papéis           | `rait-analyst`                                                              |
| pré-condições    | minuta com dispositivo (§7); quem instrui não é quem assina ([IU-RAIT-011]) |
| comando          | `rait-case:submit-draft` → `inf:rait-case:submit-draft`                     |
| pós-estado       | `PRONTO_P_DECISAO`                                                          |
| `errorCodes`     | `RAIT.DRAFT_INCOMPLETE`, `RAIT.CASE_STATE_INVALID`                          |

## 6. Decisão da autoridade (`decisao-autoridade`)

Rotas `/casos/:id/decisao` ([IU-RAIT-012]) e `/assinatura/:caseId` ([IU-RAIT-026]); [UC-RAIT-016];
[RN-RAIT-143], [RN-RAIT-140]; §6.6 "decidir (autoridade)"; §9 linha "Decisão da autoridade";
catálogo §3.5 e §3.6.

| Campo                                   | Tipo zod                            | Obrig.                              | Máscara | Validação (cliente)                | Erro do servidor                                        | Chave i18n                                     |
| --------------------------------------- | ----------------------------------- | ----------------------------------- | ------- | ---------------------------------- | ------------------------------------------------------- | ---------------------------------------------- |
| `kind`                                  | `z.enum(['acolhida','indeferida'])` | sim                                 | —       | R4: só na defesa prévia            | `RAIT.DECISION_KIND_INVALID_FOR_INSTANCE`               | `rait.forms.decisao-autoridade.kind`           |
| `grounds`                               | `z.string().trim().min(1)`          | sim                                 | —       | não vazio                          | `RAIT.DECISION_GROUNDS_REQUIRED`                        | `rait.forms.decisao-autoridade.grounds`        |
| `signature`                             | `{ kind, ref }` ou `null`           | sim se `context.signatureAvailable` | —       | R3 (OD-R12-043)                    | `RAIT.SIGNATURE_FAILED`, `RAIT.SIGNATURE_CERT_MISMATCH` | `rait.forms.decisao-autoridade.signature`      |
| `context.jurisdictionMatches`           | tri-estado                          | sim                                 | —       | R1: circunscrição = do AIT         | `RAIT.DECISION_JURISDICTION`                            | —                                              |
| `context.onDuty`                        | tri-estado                          | sim                                 | —       | R2: escala do dia                  | `RAIT.DECISION_NOT_ON_DUTY`                             | —                                              |
| `context.isDraftAuthor`                 | tri-estado                          | sim                                 | —       | R2: autor da minuta não assina     | `RAIT.DRAFT_AUTHOR_CANNOT_SIGN`                         | —                                              |
| `context.instance`, `context.caseState` | enums do contrato, `null`           | sim                                 | —       | R4, R5: `PRONTO_P_DECISAO`         | `RAIT.CASE_STATE_INVALID`                               | —                                              |
| devolução: `returnGuidance`             | `z.string().trim().min(1)`          | sim                                 | —       | R6 com `context.returnCount === 0` | `RAIT.DRAFT_RETURN_LIMIT`                               | `rait.forms.decisao-autoridade.returnGuidance` |

| Gate                           | pré-estado         | papéis                   | pré-condições                                                                                                                                | comando                                                         | pós-estado                      | `errorCodes`                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------ | ------------------ | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DECISAO_AUTORIDADE_GATE        | `PRONTO_P_DECISAO` | `rait-signing-authority` | `PRONTO_P_DECISAO`, circunscrição, escala (§7); circunscrição = do AIT, escala do dia (§9); assinatura pessoal e territorial ([RN-RAIT-143]) | `rait-decision:sign` → `inf:rait-decision:sign`                 | `DECIDIDO_AUTORIDADE`           | `RAIT.DECISION_JURISDICTION`, `RAIT.DECISION_NOT_ON_DUTY`, `RAIT.DECISION_GROUNDS_REQUIRED`, `RAIT.DECISION_KIND_INVALID_FOR_INSTANCE`, `RAIT.DRAFT_AUTHOR_CANNOT_SIGN`, `RAIT.SIGNATURE_FAILED`, `RAIT.SIGNATURE_CERT_MISMATCH`, `RAIT.DECISION_ALREADY_SIGNED`, `RAIT.EXTINCTION_DECISION_LATE`, `RAIT.FORBIDDEN_CASE_SCOPE`, `RAIT.CASE_STATE_INVALID` |
| DECISAO_AUTORIDADE_RETURN_GATE | `PRONTO_P_DECISAO` | `rait-signing-authority` | 1ª devolução (§7)                                                                                                                            | `rait-decision:return-draft` → `inf:rait-decision:return-draft` | `PRONTO_P_DECISAO` (OD-R12-044) | `RAIT.DRAFT_RETURN_LIMIT`, `RAIT.CASE_STATE_INVALID`                                                                                                                                                                                                                                                                                                      |

## 7. Parecer e voto (`parecer-voto`)

Rota `/colegiado/:orgao/relatoria/:caseId/voto` ([IU-RAIT-031]); [UC-RAIT-004]; [RN-RAIT-140];
§6.6 "registrar voto"; §9 linha "Parecer/voto"; catálogo §3.5 e §3.6.

| Campo                   | Tipo zod                              | Obrig. | Máscara | Validação (cliente)                                  | Erro do servidor                 | Chave i18n                         |
| ----------------------- | ------------------------------------- | ------ | ------- | ---------------------------------------------------- | -------------------------------- | ---------------------------------- |
| `summary`               | `z.string().trim().min(1)`            | sim    | —       | não vazio                                            | `RAIT.DRAFT_INCOMPLETE`          | `rait.forms.parecer-voto.summary`  |
| `analysis`              | `z.string().trim().min(1)`            | sim    | —       | não vazio                                            | `RAIT.DECISION_GROUNDS_REQUIRED` | `rait.forms.parecer-voto.analysis` |
| `vote`                  | `z.enum(RAIT_OPINION_VOTES)`          | sim    | —       | R1: ∈ {provimento, nao_provimento, nao_conhecimento} | `RAIT.ENUM_INVALID`              | `rait.forms.parecer-voto.vote`     |
| `context.memberImpeded` | tri-estado                            | sim    | —       | R2: impedido não relata                              | `RAIT.MEMBER_IMPEDED`            | —                                  |
| `context.caseState`     | `z.enum(RAIT_CASE_STATES).nullable()` | sim    | —       | R3: `EM_INSTRUCAO`                                   | `RAIT.CASE_STATE_INVALID`        | —                                  |

| Gate PARECER_VOTO_GATE | Valor                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| pré-estado             | `EM_INSTRUCAO`                                                                                              |
| papéis                 | `rait-rapporteur`                                                                                           |
| pré-condições          | `EM_INSTRUCAO` (§7); voto obrigatório (§9)                                                                  |
| comando                | `rait-opinion:register` → `inf:rait-opinion:register`                                                       |
| pós-estado             | `PRONTO_P_DECISAO`                                                                                          |
| `errorCodes`           | `RAIT.DRAFT_INCOMPLETE`, `RAIT.DECISION_GROUNDS_REQUIRED`, `RAIT.CASE_STATE_INVALID`, `RAIT.MEMBER_IMPEDED` |

## 8. Lote de sorteio (`lote-sorteio`)

Rotas `/colegiado/:orgao/distribuicao` ([IU-RAIT-028]) e `…/:loteId` ([IU-RAIT-029]);
[WF-RAIT-004] §5 e §9; [RN-RAIT-141], [RN-RAIT-140], [RN-RAIT-142]; §9 linha "Lote de sorteio";
catálogo §3.4. Casos e membros elegíveis são calculados pelo servidor e só exibidos.

| Campo                | Tipo zod                                                         | Obrig. | Máscara | Validação (cliente)                       | Erro do servidor         | Chave i18n                                 |
| -------------------- | ---------------------------------------------------------------- | ------ | ------- | ----------------------------------------- | ------------------------ | ------------------------------------------ |
| `poolId`             | `z.uuid()`                                                       | sim    | —       | pool do órgão                             | `RAIT.VALIDATION_FAILED` | `rait.forms.lote-sorteio.poolId`           |
| `kind`               | `z.enum(['semanal','extraordinario'])` (OD-R12-045)              | sim    | —       | token do contrato                         | `RAIT.ENUM_INVALID`      | `rait.forms.lote-sorteio.kind`             |
| `weekStart`          | `isoDate`                                                        | sim    | `date`  | data civil                                | `RAIT.VALIDATION_FAILED` | `rait.forms.lote-sorteio.weekStart`        |
| `manualExclusions[]` | `{ memberId: z.uuid(), reason: z.string().trim().min(1) }`, `[]` | não    | —       | R1 motivada; R2 membro único (OD-R12-046) | —                        | `rait.forms.lote-sorteio.manualExclusions` |

| Gate                      | pré-estado      | papéis           | pré-condições                                                                                              | comando                                         | pós-estado      | `errorCodes`                                                                                                                                       |
| ------------------------- | --------------- | ---------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| LOTE_SORTEIO_GATE         | — (criação)     | `rait-secretary` | casos sem relator (§7); lote semanal, `LOTE_ABERTO` ([WF-RAIT-004] §5 passo 1)                             | `rait-batch:open` → `inf:rait-batch:open`       | `LOTE_ABERTO`   | `RAIT.BATCH_STATE_INVALID`, `RAIT.IDEMPOTENCY_REPLAY`                                                                                              |
| LOTE_SORTEIO_DRAW_GATE    | `LOTE_ABERTO`   | `rait-secretary` | elegíveis `ATIVO` e `DISPONIVEL`/`EM_PLANTAO`; exclui quem lavrou o AIT ou tem impedimento (§5 passos 2–3) | `rait-batch:draw` → `inf:rait-batch:draw`       | `LOTE_SORTEADO` | `RAIT.BATCH_NO_ELIGIBLE_MEMBERS`, `RAIT.BATCH_STATE_INVALID`, `RAIT.MEMBER_IMPEDED`, `RAIT.MEMBER_NOT_AVAILABLE`, `RAIT.ASSIGNMENT_ALREADY_ACTIVE` |
| LOTE_SORTEIO_APPROVE_GATE | `LOTE_SORTEADO` | `rait-chair`     | ata assinada pelo presidente (§5 passo 4)                                                                  | `rait-batch:approve` → `inf:rait-batch:approve` | `LOTE_ACEITO`   | `RAIT.BATCH_SEED_TAMPERED`, `RAIT.BATCH_STATE_INVALID`                                                                                             |

## 9. Pauta (`pauta`)

Rota `/colegiado/:orgao/pauta` ([IU-RAIT-032]); [UC-RAIT-005]; [WF-RAIT-003] §Formação de pauta,
§Convocação (piso 5 dias úteis, pendente regimento — parâmetro `rait.timer.T-CONV`); §6.6
"fechar pauta"; §9 linha "Pauta"; catálogo §3.7.

| Campo                                                        | Tipo zod                                                                         | Obrig.        | Máscara | Validação (cliente)                                                     | Erro do servidor                                                                                 | Chave i18n                        |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------- | ------------- | ------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------- |
| `sessionId`                                                  | `z.uuid()`                                                                       | sim           | —       | R5: sessão em `FORMANDO_PAUTA`                                          | `RAIT.SESSION_STATE_INVALID`                                                                     | `rait.forms.pauta.sessionId`      |
| `items[]`                                                    | `{ caseId: z.uuid(), hasOpinion: tri-estado, riskFlag: enum \| null }`, `min(1)` | sim           | —       | R1 item sem parecer recusado; R2 N3/CRÍTICO incluídos; R4 sem repetição | `RAIT.AGENDA_ITEM_WITHOUT_OPINION`, `RAIT.AGENDA_CRITICAL_MISSING`, `RAIT.AGENDA_ITEM_DUPLICATE` | `rait.forms.pauta.items`          |
| `shortNoticeAck`                                             | `z.boolean()`                                                                    | sim quando R3 | —       | R3: convocação abaixo do mínimo exige confirmação                       | `RAIT.AGENDA_SHORT_NOTICE`                                                                       | `rait.forms.pauta.shortNoticeAck` |
| `context.criticalCaseIds`                                    | `z.array(z.uuid())`                                                              | sim           | —       | casos `ALERTA_N3`/`CRITICO` pendentes (servidor)                        | —                                                                                                | —                                 |
| `context.daysUntilSession`, `context.shortNoticeMinimumDays` | `int \| null`                                                                    | sim           | —       | ambos do servidor; o cliente nunca conta dias                           | —                                                                                                | —                                 |

| Gate PAUTA_GATE | Valor                                                                                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pré-estado      | `FORMANDO_PAUTA` (sessão); casos `PRONTO_P_DECISAO` → `PAUTADO` (§6.6)                                                                                     |
| papéis          | `rait-chair`                                                                                                                                               |
| pré-condições   | itens com parecer; N3/CRÍTICO incluídos (§7); convocação com no mínimo 5 dias úteis, pendente regimento ([WF-RAIT-003])                                    |
| comando         | `rait-agenda:close` → `inf:rait-agenda:close`                                                                                                              |
| pós-estado      | `PAUTA_FECHADA`                                                                                                                                            |
| `errorCodes`    | `RAIT.AGENDA_ITEM_WITHOUT_OPINION`, `RAIT.AGENDA_CRITICAL_MISSING`, `RAIT.AGENDA_SHORT_NOTICE`, `RAIT.AGENDA_ITEM_DUPLICATE`, `RAIT.SESSION_STATE_INVALID` |

## 10. Sessão ao vivo (`sessao-ao-vivo`)

Rota `/colegiado/:orgao/sessoes/:id` ([IU-RAIT-034]); [UC-RAIT-006]; [RN-RAIT-140], [RN-RAIT-142];
[WF-RAIT-003] §Quorum, §Votação e empate; [WF-RAIT-004] §6; §9 linha "Sessão ao vivo"; catálogo §3.7.

| Campo (voto)          | Tipo zod                                                                                                         | Obrig. | Máscara | Validação (cliente)                                     | Erro do servidor                                                             | Chave i18n                              |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- | ------ | ------- | ------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------- |
| `agendaItemId`        | `z.uuid()`                                                                                                       | sim    | —       | item corrente (oculto)                                  | `RAIT.VOTE_ITEM_NOT_OPEN`                                                    | —                                       |
| `vote`                | `z.enum(RAIT_VOTE_VALUES)`                                                                                       | sim    | —       | R1 impedido; R2 item aberto; R3 sem voto repetido       | `RAIT.VOTE_MEMBER_IMPEDED`, `RAIT.VOTE_ITEM_NOT_OPEN`, `RAIT.VOTE_DUPLICATE` | `rait.forms.sessao-ao-vivo.vote`        |
| `castingVote`         | `z.boolean()`                                                                                                    | sim    | —       | R4 só em empate; R5 só o presidente                     | `RAIT.CASTING_VOTE_NOT_TIED`, `RAIT.CASTING_VOTE_NOT_CHAIR`                  | `rait.forms.sessao-ao-vivo.castingVote` |
| `context.*`           | `memberImpeded`, `itemOpen`, `alreadyVoted`, `tied`, `isChair` (tri-estado); `sessionState`                      | sim    | —       | espelho do servidor                                     | —                                                                            | —                                       |
| abertura: `context.*` | `quorumRequired` (int > 0), `quorumObserved` (int ≥ 0), `chairPresent`, `parityMet` (tri-estado), `sessionState` | sim    | —       | R6 quorum; R7 presidente/suplente; R8 paridade (CETRAN) | `RAIT.SESSION_QUORUM_MISSING`                                                | —                                       |

| Gate                             | pré-estado             | papéis                          | pré-condições                                                                                          | comando                                                       | pós-estado      | `errorCodes`                                                                                                                              |
| -------------------------------- | ---------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| SESSAO_AO_VIVO_GATE              | `VOTACAO`              | `rait-rapporteur`, `rait-chair` | item em votação, não impedido (§7); impedido no item não vota nem conta para o quorum ([RN-RAIT-140])  | `rait-session:vote` → `inf:rait-session:vote`                 | —               | `RAIT.VOTE_MEMBER_IMPEDED`, `RAIT.VOTE_ITEM_NOT_OPEN`, `RAIT.VOTE_DUPLICATE`, `RAIT.SESSION_QUORUM_MISSING`, `RAIT.SESSION_STATE_INVALID` |
| SESSAO_AO_VIVO_CASTING_VOTE_GATE | `DESEMPATE_PRESIDENTE` | `rait-chair`                    | votos empatados — voto de qualidade do presidente ([WF-RAIT-003])                                      | `rait-session:casting-vote` → `inf:rait-session:casting-vote` | —               | `RAIT.CASTING_VOTE_NOT_TIED`, `RAIT.CASTING_VOTE_NOT_CHAIR`, `RAIT.SESSION_STATE_INVALID`                                                 |
| SESSAO_AO_VIVO_OPEN_GATE         | `CONVOCACAO_ENVIADA`   | `rait-chair`                    | quorum confirmado (§7); maioria simples com presidente ou suplente; paridade no CETRAN ([RN-RAIT-142]) | `rait-session:open` → `inf:rait-session:open`                 | `SESSAO_ABERTA` | `RAIT.SESSION_QUORUM_MISSING`, `RAIT.BENCH_INSUFFICIENT`, `RAIT.SESSION_STATE_INVALID`                                                    |

## 11. Desistência (`desistencia`)

Rota `/protocolo/desistencias` ([IU-RAIT-024]); [UC-RAIT-012]; [RN-RAIT-004]; [WF-RAIT-001]
bloco "desistência"; §6.6 "desistir"; §9 linha "Desistência"; catálogo §3.3.

| Campo                 | Tipo zod                              | Obrig. | Máscara    | Validação (cliente)            | Erro do servidor                 | Chave i18n                                   |
| --------------------- | ------------------------------------- | ------ | ---------- | ------------------------------ | -------------------------------- | -------------------------------------------- |
| busca por protocolo   | controle da página                    | —      | `protocol` | resolve `caseId`               | `RAIT.TENANT_MISMATCH`           | `rait.forms.desistencia.protocolNumber`      |
| `caseId`              | `z.uuid()`                            | sim    | —          | R1: só pré-decisão (8 estados) | `RAIT.WITHDRAWAL_AFTER_DECISION` | `rait.forms.desistencia.caseId`              |
| `termDocumentId`      | `z.uuid()`                            | sim    | —          | termo anexado                  | `RAIT.VALIDATION_FAILED`         | `rait.forms.desistencia.termDocumentId`      |
| `signerPartyId`       | `z.uuid()`                            | sim    | —          | R2: `context.signerLegitimate` | `RAIT.WITHDRAWAL_LEGITIMACY`     | `rait.forms.desistencia.signerPartyId`       |
| `legitimacyConfirmed` | `z.literal(true)`                     | sim    | —          | confirmação explícita          | `RAIT.WITHDRAWAL_LEGITIMACY`     | `rait.forms.desistencia.legitimacyConfirmed` |
| `context.caseState`   | `z.enum(RAIT_CASE_STATES).nullable()` | sim    | —          | R1                             | —                                | —                                            |

Estados pré-decisão (WITHDRAWAL_PRE_DECISION_STATES, origens de `→ ENCERRADO_DESISTENCIA` em
[WF-RAIT-001]): `PROTOCOLADO`, `TRIAGEM_ADMISSIBILIDADE`, `AGUARDANDO_REMESSA_JARI`,
`DISTRIBUIDO`, `EM_INSTRUCAO`, `DILIGENCIA`, `PRONTO_P_DECISAO`, `PAUTADO` (`ADMITIDO` não consta
do diagrama — OD-R12-047).

| Gate DESISTENCIA_GATE | Valor                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------- |
| pré-estado            | os 8 estados acima                                                                        |
| papéis                | `rait-secretary`                                                                          |
| pré-condições         | pré-decisão, termo assinado (§7); desistir por escrito até o julgamento ([RN-RAIT-004])   |
| comando               | `rait-case:withdraw` → `inf:rait-case:withdraw`                                           |
| pós-estado            | `ENCERRADO_DESISTENCIA`                                                                   |
| `errorCodes`          | `RAIT.WITHDRAWAL_AFTER_DECISION`, `RAIT.WITHDRAWAL_LEGITIMACY`, `RAIT.CASE_STATE_INVALID` |

## 12. Escala (`escala`)

Rota `/organizacao/escala` ([IU-RAIT-046]); [UC-RAIT-013]; [WF-RAIT-004] §3 e §9; §9 linha
"Escala"; catálogo §3.4. Dias úteis do período vêm do servidor (calendário, [RN-RAIT-005]).

| Campo                                          | Tipo zod                                                                         | Obrig.                      | Máscara | Validação (cliente)                        | Erro do servidor               | Chave i18n                                     |
| ---------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------- | ------- | ------------------------------------------ | ------------------------------ | ---------------------------------------------- |
| `poolId`                                       | `z.uuid()`                                                                       | sim                         | —       | —                                          | `RAIT.VALIDATION_FAILED`       | `rait.forms.escala.poolId`                     |
| `kind`                                         | `z.enum(['escala_semanal','plantao_risco','escala_assinatura','escala_balcao'])` | sim                         | —       | token do contrato (OD-R12-045)             | `RAIT.ENUM_INVALID`            | `rait.forms.escala.kind`                       |
| `periodStart`, `periodEnd`                     | `isoDate`                                                                        | sim                         | `date`  | R4 período bloqueado; R5 fim ≥ início      | `RAIT.SCHEDULE_PERIOD_LOCKED`  | `rait.forms.escala.periodStart` / `.periodEnd` |
| `entries[].memberId`                           | `z.uuid()`                                                                       | sim                         | —       | R2 sem repetição                           | —                              | `rait.forms.escala.entries.memberId`           |
| `entries[].wipLimit`                           | `int ≥ 0 \| null` (`null` = parâmetro `rait.wip.limit`)                          | não                         | —       | —                                          | `RAIT.ASSIGNMENT_WIP_LIMIT`    | `rait.forms.escala.entries.wipLimit`           |
| `entries[].slots[].slotOn`                     | `isoDate`                                                                        | sim                         | `date`  | R6 dentro do período                       | —                              | `rait.forms.escala.slots.slotOn`               |
| `entries[].slots[].availability`               | `z.enum(RAIT_AVAILABILITIES)`                                                    | sim                         | —       | R1 plantonista (`EM_PLANTAO`) por dia útil | `RAIT.SCHEDULE_NO_DUTY_MEMBER` | `rait.forms.escala.slots.availability`         |
| `entries[].slots[].absenceReason`              | `z.enum(['ferias','licenca','curso','sessao_externa'])`, `null`                  | sim se `AUSENTE_PROGRAMADO` | —       | R3                                         | —                              | `rait.forms.escala.slots.absenceReason`        |
| `context.businessDays`, `context.periodLocked` | `z.array(isoDate).nullable()`, tri-estado                                        | sim                         | —       | R1, R4                                     | —                              | —                                              |

| Gate ESCALA_GATE | Valor                                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pré-estado       | — (sem token de rascunho no contrato, OD-R12-048)                                                                                                       |
| papéis           | `rait-coordinator`, `rait-chair`                                                                                                                        |
| pré-condições    | plantonista por dia (§7); plantonista por dia útil (§9); só membros `DISPONIVEL` puxam casos, ausência programada rebaixa WIP a zero ([WF-RAIT-004] §3) |
| comando          | `rait-schedule:publish` → `inf:rait-schedule:publish`                                                                                                   |
| pós-estado       | — (elegibilidade atualizada)                                                                                                                            |
| `errorCodes`     | `RAIT.SCHEDULE_NO_DUTY_MEMBER`, `RAIT.SCHEDULE_PERIOD_LOCKED`, `RAIT.IDEMPOTENCY_REPLAY`                                                                |

## 13. Mandato (`mandato`)

Rota `/organizacao/membros` ([IU-RAIT-047]); [UC-RAIT-037]; [RN-RAIT-140], [RN-RAIT-142];
[WF-RAIT-004] §9 (`ATIVO`); §9 linha "Mandato"; catálogo §3.10.

| Campo                 | Tipo zod                                                                                | Obrig.                                    | Máscara | Validação (cliente)                | Erro do servidor            | Chave i18n                                |
| --------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------- | ------- | ---------------------------------- | --------------------------- | ----------------------------------------- |
| `poolId`, `personId`  | `z.uuid()`                                                                              | sim                                       | —       | R1: dupla composição JARI × CETRAN | `RAIT.MANDATE_DUAL_BODY`    | `rait.forms.mandato.poolId` / `.personId` |
| `memberRole`          | `z.enum(['analista','relator','presidente','coordenador','secretaria','autoridade'])`   | sim                                       | —       | token do contrato (OD-R12-045)     | `RAIT.ENUM_INVALID`         | `rait.forms.mandato.memberRole`           |
| `appointmentActRef`   | `z.string().trim().min(1)`                                                              | sim                                       | —       | ato publicado                      | `RAIT.MANDATE_ACT_REQUIRED` | `rait.forms.mandato.appointmentActRef`    |
| `representationBlock` | `z.enum(['executivo_estadual','municipal_rodoviario','sociedade_civil'])`, `null`       | sim se `context.judgingBody === 'cetran'` | —       | R3 paridade ([RN-RAIT-142])        | `RAIT.ENUM_INVALID`         | `rait.forms.mandato.representationBlock`  |
| `isSubstitute`        | `z.boolean()`                                                                           | sim                                       | —       | titular/suplente                   | —                           | `rait.forms.mandato.isSubstitute`         |
| `mandateStartsOn`     | `isoDate`                                                                               | sim                                       | `date`  | R2 sobreposição                    | `RAIT.MANDATE_OVERLAP`      | `rait.forms.mandato.mandateStartsOn`      |
| `mandateEndsOn`       | `isoDate.nullable()`                                                                    | não                                       | `date`  | R4 fim ≥ início                    | `RAIT.VALIDATION_FAILED`    | `rait.forms.mandato.mandateEndsOn`        |
| `context.*`           | `judgingBody` (enum \| null), `otherBodyActiveMandate`, `overlapsExisting` (tri-estado) | sim                                       | —       | R1, R2, R3                         | —                           | —                                         |

| Gate MANDATO_GATE | Valor                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| pré-estado        | — (criação)                                                                                                                                 |
| papéis            | `rait-hr`                                                                                                                                   |
| pré-condições     | ato publicado (§7); sem posse não há distribuição ([IU-RAIT-047])                                                                           |
| comando           | `rait-member:mandate` → `inf:rait-member:mandate`                                                                                           |
| pós-estado        | `ATIVO`                                                                                                                                     |
| `errorCodes`      | `RAIT.MANDATE_ACT_REQUIRED`, `RAIT.MANDATE_DUAL_BODY`, `RAIT.MANDATE_OVERLAP`, `RAIT.MANDATE_ACTIVE_ASSIGNMENTS`, `RAIT.IDEMPOTENCY_REPLAY` |

## 14. Reatribuição (`reatribuicao`)

Rota `/gestao/radar/:caseId` ([IU-RAIT-040]); [UC-RAIT-011]; [RN-RAIT-141], [RN-RAIT-140]; §6.6
"reatribuir"; §9 linha "Reatribuição"; catálogo §3.4.

| Campo           | Tipo zod                                                                       | Obrig. | Máscara | Validação (cliente)                             | Erro do servidor                                                                   | Chave i18n                              |
| --------------- | ------------------------------------------------------------------------------ | ------ | ------- | ----------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------- |
| `memberId`      | `z.uuid()`                                                                     | sim    | —       | R1 ≠ atual; R2 nunca ao impedido; R3 disponível | `RAIT.REASSIGN_TO_SAME_MEMBER`, `RAIT.MEMBER_IMPEDED`, `RAIT.MEMBER_NOT_AVAILABLE` | `rait.forms.reatribuicao.memberId`      |
| `releaseReason` | `z.enum(['impedimento','afastamento','rebalanceamento','risco_prescricao'])`   | sim    | —       | motivo tipado ([RN-RAIT-141])                   | `RAIT.REASSIGN_REASON_REQUIRED`                                                    | `rait.forms.reatribuicao.releaseReason` |
| `context.*`     | `currentMemberId`, `impededMemberIds[]`, `unavailableMemberIds[]`, `caseState` | sim    | —       | R1–R4                                           | `RAIT.CASE_STATE_INVALID`                                                          | —                                       |

| Gate REATRIBUICAO_GATE | Valor                                                                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| pré-estado             | `DISTRIBUIDO`, `EM_INSTRUCAO`, `DILIGENCIA`                                                                                                    |
| papéis                 | `rait-coordinator`, `rait-manager`, `rait-chair`                                                                                               |
| pré-condições          | motivo tipado (§7); nunca ao impedido (§9)                                                                                                     |
| comando                | `rait-assignment:reassign` → `inf:rait-assignment:reassign`                                                                                    |
| pós-estado             | — (inalterado; responsável muda)                                                                                                               |
| `errorCodes`           | `RAIT.REASSIGN_REASON_REQUIRED`, `RAIT.REASSIGN_TO_SAME_MEMBER`, `RAIT.MEMBER_IMPEDED`, `RAIT.MEMBER_NOT_AVAILABLE`, `RAIT.CASE_STATE_INVALID` |

## 15. Ato de suspensão (`ato-suspensao`)

Rota `/admin/atos/suspensao` ([IU-RAIT-064]); [UC-RAIT-022]; [RN-RAIT-105], [RN-RAIT-005];
[WF-RAIT-001] §Relógios de extinção; §9 linha "Ato de suspensão"; catálogo §3.9.

| Campo                | Tipo zod                                   | Obrig. | Máscara | Validação (cliente)                                         | Erro do servidor                                              | Chave i18n                                      |
| -------------------- | ------------------------------------------ | ------ | ------- | ----------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------- |
| `caseIds[]`          | `z.array(z.uuid()).min(1)`                 | sim    | —       | ≥ 1 caso (OD-R12-046)                                       | `RAIT.VALIDATION_FAILED`                                      | `rait.forms.ato-suspensao.caseIds`              |
| `startsOn`, `endsOn` | `isoDate`                                  | sim    | `date`  | R2 fim ≥ início                                             | `RAIT.VALIDATION_FAILED`                                      | `rait.forms.ato-suspensao.startsOn` / `.endsOn` |
| `reason`             | `z.string().trim().min(1)`                 | sim    | —       | fundamento de força maior                                   | `RAIT.VALIDATION_FAILED`                                      | `rait.forms.ato-suspensao.reason`               |
| `legalBasis`         | `z.string().trim().nullable()`             | não    | —       | —                                                           | —                                                             | `rait.forms.ato-suspensao.legalBasis`           |
| `timerCodes[]`       | `z.array(z.enum(RAIT_TIMER_CODES)).min(1)` | sim    | —       | R1: nenhum de `T-DEC`, `T-JUL-24M`, `T-PAR-3A` (OD-R12-049) | `RAIT.SUSPENSION_LEGAL_TIMER`, `RAIT.DEADLINE_LEGAL_READONLY` | `rait.forms.ato-suspensao.timerCodes`           |
| `evidenceDocumentId` | `z.uuid()`                                 | sim    | —       | prova anexada                                               | `RAIT.SUSPENSION_EVIDENCE_REQUIRED`                           | `rait.forms.ato-suspensao.evidenceDocumentId`   |

| Gate ATO_SUSPENSAO_GATE | Valor                                                                                                                         |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| pré-estado              | — (criação)                                                                                                                   |
| papéis                  | `rait-signing-authority`, `rait-chair`                                                                                        |
| pré-condições           | prova de força maior (§7); nunca automática — ato motivado e auditado ([IU-RAIT-064]; [RN-RAIT-105])                          |
| comando                 | `rait-suspension-act:create` → `inf:rait-suspension-act:create`                                                               |
| pós-estado              | `vigente` (enum do contrato)                                                                                                  |
| `errorCodes`            | `RAIT.SUSPENSION_LEGAL_TIMER`, `RAIT.SUSPENSION_EVIDENCE_REQUIRED`, `RAIT.DEADLINE_LEGAL_READONLY`, `RAIT.IDEMPOTENCY_REPLAY` |

## 16. Parâmetro (`parametro`)

Rota `/admin/parametros` ([IU-RAIT-062]); [UC-RAIT-043]; [RN-RAIT-005], [RN-RAIT-105]; §9 linha
"Parâmetro"; catálogo §3.9; `parameter-catalogue.md` (`value_type`, `legal_readonly`, `source_pending`).

| Campo           | Tipo zod                                                                                          | Obrig. | Máscara | Validação (cliente)                                                                 | Erro do servidor                     | Chave i18n                           |
| --------------- | ------------------------------------------------------------------------------------------------- | ------ | ------- | ----------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------ |
| `key`           | `z.string().min(1)`                                                                               | sim    | —       | R1: prazos legais somente leitura                                                   | `RAIT.PARAMETER_LEGAL_READONLY`      | `rait.forms.parametro.key`           |
| `value`         | `z.unknown()`                                                                                     | sim    | —       | R2 por `context.valueType` (int, dias úteis, F, %, num, BRL, enum, json, rule, str) | `RAIT.VALIDATION_FAILED`             | `rait.forms.parametro.value`         |
| `reason`        | `z.string().trim().min(1)`                                                                        | sim    | —       | motivo                                                                              | `RAIT.VALIDATION_FAILED`             | `rait.forms.parametro.reason`        |
| `effectiveFrom` | `isoDate`                                                                                         | sim    | `date`  | R3: ≥ `context.today`                                                               | `RAIT.PARAMETER_EFFECTIVE_DATE_PAST` | `rait.forms.parametro.effectiveFrom` |
| `context.*`     | `today`, `legalReadonly`, `sourcePending` (tri-estado), `valueType` (string \| null), `allowed[]` | sim    | —       | R1–R3; `sourcePending` só informa                                                   | `RAIT.PARAMETER_SOURCE_PENDING`      | —                                    |

| Gate PARAMETRO_GATE | Valor                                                                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| pré-estado          | — (valor vigente)                                                                                                                      |
| papéis              | `agency-admin`                                                                                                                         |
| pré-condições       | motivo e vigência (§7); prazos legais somente leitura (§9)                                                                             |
| comando             | `rait-parameter:update` → `inf:rait-parameter:update`                                                                                  |
| pós-estado          | — (nova versão vigente)                                                                                                                |
| `errorCodes`        | `RAIT.PARAMETER_LEGAL_READONLY`, `RAIT.PARAMETER_EFFECTIVE_DATE_PAST`, `RAIT.PARAMETER_SOURCE_PENDING`, `RAIT.DEADLINE_LEGAL_READONLY` |

## 17. Exportação (`exportacao`)

Rota `/auditoria/exportacoes` ([IU-RAIT-061]); [UC-RAIT-042]; §9 linha "Exportação"; §10.6;
catálogo §3.11; parâmetro `rait.export.dpo_threshold_rows` no servidor.

| Campo                                                   | Tipo zod                                                                    | Obrig.        | Máscara | Validação (cliente)                         | Erro do servidor                    | Chave i18n                                   |
| ------------------------------------------------------- | --------------------------------------------------------------------------- | ------------- | ------- | ------------------------------------------- | ----------------------------------- | -------------------------------------------- |
| `purpose`                                               | `z.string().trim().min(1)`                                                  | sim           | —       | finalidade obrigatória                      | `RAIT.EXPORT_PURPOSE_REQUIRED`      | `rait.forms.exportacao.purpose`              |
| `scope.periodStart`, `scope.periodEnd`, `scope.nominal` | `isoDate`, `isoDate`, `z.boolean()` (OD-R12-050)                            | sim           | `date`  | R2 fim ≥ início                             | `RAIT.VALIDATION_FAILED`            | `rait.forms.exportacao.scope.*`              |
| `dpoApprovalRequested`                                  | `z.boolean()`                                                               | sim quando R1 | —       | R1: nominal em massa exige aprovação do DPO | `RAIT.EXPORT_DPO_APPROVAL_REQUIRED` | `rait.forms.exportacao.dpoApprovalRequested` |
| `context.*`                                             | `estimatedRowCount` (int ≥ 0 \| null), `dpoThresholdRows` (int > 0 \| null) | sim           | —       | ambos do servidor                           | —                                   | —                                            |

| Gate EXPORTACAO_GATE | Valor                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| pré-estado           | — (criação)                                                                                    |
| papéis               | `AUDITOR`                                                                                      |
| pré-condições        | finalidade (§7); finalidade obrigatória, nominal em massa exige aprovação do DPO (§9)          |
| comando              | `rait-export:create` → `inf:rait-export:create`                                                |
| pós-estado           | `solicitada` (`aguardando_dpo` quando R1)                                                      |
| `errorCodes`         | `RAIT.EXPORT_PURPOSE_REQUIRED`, `RAIT.EXPORT_DPO_APPROVAL_REQUIRED`, `RAIT.IDEMPOTENCY_REPLAY` |

## 18. Regras de lint (`apps/rait/web/eslint/local-rules.js`, plugin `rait`)

| Regra                           | Proíbe                                                                                                                                                                                                                                                                                                   | Onde vale                                                                 | Base                                   |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------- |
| `rait/no-client-deadline-math`  | `Date.now()`; `new Date()` sem argumento; `+`/`-` entre expressões com `getTime()`, `new Date(...)` ou `Date.*`; chamadas `add\|sub\|differenceIn` + `Days\|BusinessDays\|CalendarDays\|Hours`; atribuição a `due_on`, `dueOn`, `ceiling_on`, `ceilingOn`, `deadline`, `days_remaining`, `daysRemaining` | `src/**/*.ts` exceto `src/testing/**`; allow-list `src/app/data/clock.ts` | [RN-RAIT-005]; plan M12; OD-R12-032    |
| `rait/no-static-token-i18n-key` | literal de string (ou primeiro quasi de template) casando `^rait\.(caseState\|sessionState\|infractionState\|infractionSubstate\|riskFlag\|memberStatus\|orgState\|closureMotive\|timer)\.`                                                                                                              | todo `src/**/*.ts` (o verificador de parâmetros varre `src/**`)           | plan A1/M5; `verify.mjs --check-usage` |

Composição continua permitida: `tokenKey('caseState', state)` (`core/i18n-token-key.ts`) e
templates cujo primeiro segmento não é o namespace literal. Mensagens fixas e seletores AST:
contrato §6. Casos positivos e negativos por regra: `RuleTester` em `src/app/lint/*.spec.ts`.

## 19. Questões abertas

Registradas no contrato §9.2 como OD-R12-036 … OD-R12-052 (defaults explícitos valem até a
decisão): formulários "mínimos" sem nome no M11 (036); vocabulário do canal de intake (037);
resolução placa + AIT → `ait_id` (038); formatos de AIT e protocolo (039); tamanho máximo de
upload (040); endereço do requerente sem campo no contrato (041); controle `officialDocument`
(042); assinatura PAdES indisponível (043); pós-estado da devolução da minuta (044); tokens sem
lista em `tokens.ts` (045); campos da §9 sem transporte no contrato (046); `ADMITIDO` fora do
bloco de desistência do workflow (047); escala sem token de rascunho (048); `T-PRESC-5A` no
catálogo × `T-PAR-3A` no workflow (049); forma do `scope` da exportação (050); regex do art. 4º
na triagem (051); transição `PROTOCOLADO` → `TRIAGEM_ADMISSIBILIDADE` sem comando (052). As
divergências comando M8 × chave de política (`answer`/`extend` renomeadas; 7 ações só de ficha
sem chave) continuam em OD-R12-026/027 e estão tabuladas no contrato §3.
