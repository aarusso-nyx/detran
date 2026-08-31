---
id: RN-RAIT-123
title: Desistência por escrito, admissível até a realização do julgamento
status: approved
apps: [rait, portal]
sources: [REF-CONTRAN-900, REF-CTB-280-290]
updated: 2026-08-26
---

**Regra.** O requerente pode **desistir, por escrito, até a realização do julgamento** da defesa
prévia ou do recurso apresentado. Requisitos e efeitos:

- **Forma:** escrita (o texto exige "por escrito"; no canal digital, manifestação eletrônica
  identificada e registrada, com a mesma legitimidade/representação do requerimento originário —
  [RN-RAIT-120], [RN-RAIT-121]).
- **Limite temporal:** até a **realização do julgamento**. Depois disso, a desistência é ineficaz — o
  ato decisório já existe.
- **Efeito:** encerra a apreciação daquele requerimento. **Não** é reconhecimento da infração, **não**
  é pagamento e **não** encerra, por si só, a instância administrativa: o encerramento continua
  regido pelas hipóteses taxativas de [RN-RAIT-119].

**Base legal.** [REF-CONTRAN-900] art. 11: _"O requerente poderá desistir, por escrito, até a
realização do julgamento, da defesa prévia ou do recurso apresentado."_

**Verificação.** Ação "desistir" disponível no PORTAL enquanto o processo não estiver no estado
`DECIDIDO_AUTORIDADE`/`JULGADO_SESSAO`; ao ser exercida, transita para `ENCERRADO_DESISTENCIA` com o termo de desistência
anexado. O RAIT **recalcula** o estado da instância: se ainda couber recurso e o prazo estiver em
curso, a instância permanece **aberta** e o efeito suspensivo de [RN-RAIT-108] persiste até que se
verifique uma hipótese do art. 290.

**Controvérsia/risco.** Desistir da **defesa da autuação** e desistir do **recurso** têm consequências
materialmente distintas: no primeiro caso o prazo de expedição da NP permanece o de 360 dias, por já
ter havido defesa tempestiva ([RN-RAIT-114]) — a desistência não restaura os 180 dias. O texto não
regula esse ponto; a leitura adotada decorre do art. 282 §6º do CTB, que condiciona o prazo maior à
_"interposição de defesa prévia"_, e não ao seu julgamento. `_intake/legal-assessment.md`, item 17.

**Decisão.** Owner, em steering (`_meta/steering.md` C.26, 2026-08-24), sem parecer jurídico
formal: confirma que a **desistência não restaura os 180 dias** — a leitura acima é adotada
como regra do sistema.

**Distinção — desistência ≠ reconhecimento com pagamento.** A hipótese do art. 290, III (pagamento
com reconhecimento da infração e requerimento de encerramento) é **outro** instituto, com outro
efeito (encerra a instância) e outro pressuposto (não ter apresentado defesa ou recurso). O RAIT deve
oferecer as duas ações separadamente e com linguagem que não as confunda.
