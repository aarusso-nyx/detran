---
id: RN-PEC-001
title: Laudo assinado é imutável — retificação somente via adendo assinado
status: draft
apps: [pec]
sources:
  - pec:docs/framework/pec/signatures.md
  - pec:docs/framework/pec/checklist-conformidade.md
  - pec:docs/framework/pec/rbac-matrix.md
  - REF-CFM-1821-2007
  - REF-MP-2200-2-2001
  - REF-LEI-13787-2018
  - REF-CFM-1636-2002
  - REF-CONTRAN-927-2022
updated: 2026-08-24
---

**Regra.** Documentos clínicos assinados (laudo médico, laudo psicológico) são imutáveis.
Qualquer correção é feita exclusivamente por um adendo: um novo documento PDF/A que referencia
o original por ID e hash, assinado com sua própria assinatura PAdES+TSA e validação OCSP
(fallback CRL), vinculado ao prontuário em `pec.documents (kind='ADENDO')`, mantendo
encadeamento de hash em auditoria. O original nunca é editado ou substituído. A solicitação de
retificação pode partir de Médico, Psicólogo ou Supervisor, mas a aprovação exige dupla
assinatura de papéis distintos: Supervisor **e** Admin Clínica.

**Base legal.** _(Resolvida na rodada LEGAL de 2026-08-24 — deixa de ser "(fonte pendente)".)_
A imutabilidade e o adendo **não são apenas convenção de arquitetura**: são a única forma
disponível de retificação, porque a norma proíbe as alternativas.

- [REF-CFM-1636-2002] art. 1º, parágrafo único: _"É vedado ao médico perito assinar laudos
  realizados por outros profissionais"_ — replicado e estendido ao psicólogo pela
  [REF-DETRANAM-PORTARIA-005-2021] art. 34, § 8º. Logo, **não há substituto para o autor**:
  a correção só pode vir de novo ato do próprio perito. Ver [RN-PEC-107].
- [REF-CONTRAN-927-2022] art. 10: _"A realização e o resultado [...] são, respectivamente, de
  exclusiva responsabilidade do médico perito examinador de trânsito e do psicólogo perito
  examinador de trânsito."_
- [REF-CFM-1821-2007] arts. 3º-5º: a eliminação da obrigatoriedade do papel exige o **NGS2**, que
  _"exige o uso de assinatura digital"_, autorizado o **certificado padrão ICP-Brasil** — ver
  [RN-PEC-140].
- [REF-MP-2200-2-2001] art. 10, § 1º: presunção de veracidade quanto aos signatários — que só
  subsiste enquanto o conteúdo assinado permanecer íntegro.
- [REF-LEI-13787-2018] art. 5º: _"terá o mesmo valor probatório do documento original para todos os
  fins de direito."_
- [REF-CONTRAN-927-2022] art. 10, § 1º: arquivamento _"conforme determinação dos Conselhos Federais
  de Medicina e Psicologia"_ — ver [RN-PEC-141] quanto ao prazo.

**Verificação.** `pec.reports` tem `UNIQUE (encounter_id, kind)` — não há segunda linha de
laudo do mesmo tipo por encounter; qualquer alteração pós-assinatura só pode ocorrer via
`POST /reports/:id/addendum`, nunca por update do laudo original. Auditoria (`audit.events`)
registra cada operação de emissão e de adendo. Ver [UC-PEC-006] e [UC-PEC-007].

**Lacunas identificadas na auditoria legal (2026-08-24).**

1. **Retenção não tratada.** A regra cobre a imutabilidade, mas **não** por quanto tempo o laudo e
   o adendo permanecem armazenados nem o que ocorre depois. O piso legal é de **20 anos a partir do
   último registro** ([REF-LEI-13787-2018] art. 6º), e um adendo **reinicia** esse relógio para todo
   o prontuário. Nova regra dedicada: [RN-PEC-141].
2. **Autor indisponível.** A norma impede que outro profissional assine o adendo. Um laudo cujo
   autor esteja descredenciado, afastado ou falecido **não é retificável** — o caso exige novo exame,
   não adendo. Hipótese não prevista nesta regra nem em [UC-PEC-007].
3. **Aprovação ≠ autoria.** A dupla aprovação Supervisor + Admin Clínica é **governança de
   processo**; nenhum dos dois pode figurar como signatário do adendo ([RN-PEC-107]).

**Revisão (2026-08-24, especialista LEGAL).** Base legal preenchida; nenhuma correção de mérito —
a regra é **confirmada** pelo corpus normativo. Acrescentadas as três lacunas acima.
