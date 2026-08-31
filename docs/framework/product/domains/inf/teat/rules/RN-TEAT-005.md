---
id: RN-TEAT-005
title: Assinatura, recusa e impossibilidade são três resultados distintos — nunca confundidos
status: draft
apps: [teat]
sources:
  [
    'teat:docs/framework/product/blueprints/BP-AIT-LIFECYCLE-001.json',
    'teat:docs/framework/product/workflows/ait-lifecycle.md',
    'teat:docs/meta/prototypes/docs/RN-1_Regras_de_Negocio_Talonario_Eletronico.md',
    REF-CTB-165-277-medidas-alcoolemia,
    REF-CONTRAN-432,
    REF-CONTRAN-1025-2026,
    REF-CONTRAN-918,
  ]
updated: 2026-08-24
---

> **Nota de revisão (2026-08-24, especialista LEGAL).** Regra **confirmada** no padrão de três
> resultados, com **uma correção material**: a versão anterior tratava a **recusa no procedimento
> de etilômetro** como um dos três resultados possíveis de um ato de ciência — isto é, como
> **metadado**. É erro de qualificação jurídica. A recusa a qualquer procedimento de verificação de
> alcoolemia é **fato gerador de infração autônoma** (CTB art. 165-A), com penalidade e medidas
> administrativas próprias: ela **produz um novo AIT**, não apenas um campo preenchido. Gap de
> "(fonte pendente)" fechado quanto à alcoolemia e à recusa de assinatura em medida de remoção;
> permanece aberto quanto à recusa de assinatura do AIT em geral. Regra específica derivada:
> [RN-TEAT-134].

**Regra.** Todo ato que oferece ciência ao condutor/pessoa (AIT, termo de medida administrativa,
procedimento de etilômetro) deve registrar um de três resultados distintos e não intercambiáveis:
**assinado** (`signed=true`), **recusa** (`refused_signature=true` /
`refusal_or_impossibility_reason` preenchido com motivo de recusa) ou **impossibilidade técnica**
(mesmo campo preenchido com motivo de impossibilidade — ex.: condutor ausente, incapacitado). A
assinatura registra ciência do ato, **não concordância com o mérito** da infração. No
procedimento de etilômetro, recusa ao teste e falha de equipamento são igualmente distintas e não
podem ser confundidas — a diferenciação tem efeito jurídico distinto.

**Correção material — a recusa ao procedimento de alcoolemia não é um dos três resultados.** No
procedimento de etilômetro convivem **dois eixos independentes** que a versão anterior desta regra
fundia: (i) o eixo de **ciência do ato** (assinado / recusa de assinatura / impossibilidade), que é
o objeto desta regra; e (ii) o eixo de **submissão ao procedimento de verificação**, em que a
**recusa é fato gerador de infração autônoma** ([RN-TEAT-134]) e a **impossibilidade técnica do
aparelho** apenas obriga o uso de outro meio de prova do art. 277 ([RN-TEAT-131]). Um condutor pode
recusar o teste **e** assinar o auto de recusa; pode aceitar o teste **e** recusar assinar. Modelar
os dois eixos no mesmo campo produz erro de enquadramento com consequência de dez vezes a multa e
12 meses de suspensão.

**Base legal.**

- **Recusa ao procedimento (eixo ii):** [REF-CTB-165-277-medidas-alcoolemia] art. 165-A
  (_"Recusar-se a ser submetido a teste, exame clínico, perícia ou outro procedimento que permita
  certificar influência de álcool […]: Infração - gravíssima […]"_) e art. 277 §3º (_"Serão
  aplicadas as penalidades e medidas administrativas estabelecidas no art. 165-A deste Código ao
  condutor que se recusar a se submeter a qualquer dos procedimentos previstos no caput"_);
  [REF-CONTRAN-432] art. 6º, parágrafo único (com a ressalva de remissão desatualizada anotada em
  [RN-TEAT-134]).
- **Recusa de assinatura em medida administrativa de remoção:** [REF-CONTRAN-1025-2026] art. 14
  §2º — _"Considera-se notificado o proprietário ou o condutor presente no momento do recolhimento,
  ainda que se recuse a assinar o termo de recolhimento."_ Confirma o efeito jurídico do padrão de
  três resultados: **a recusa não impede a notificação de se perfectibilizar**. Simétrico ao
  [REF-CTB-165-277-medidas-alcoolemia] art. 271 §7º (notificação recusada considerada recebida).
- **Assinatura do infrator no AIT:** [REF-CTB-280-290] art. 280, VI — exigida _"sempre que
  possível"_, valendo _"como notificação do cometimento da infração"_; [REF-CONTRAN-918] art. 3º
  §5º (hipótese em que o AIT assinado pelo condutor-proprietário vale como NA — [RN-TEAT-107]).
- **(fonte pendente residual):** não foi localizado excerto normativo que discipline o **registro
  da recusa ou da impossibilidade de assinatura do AIT em geral** — a norma diz "sempre que
  possível", sem exigir registro do motivo. O registro estruturado do motivo permanece **boa
  prática de defensabilidade**, não imposição normativa.

**Verificação.** `AitPerson.signed` / `AitPerson.refused_signature` (booleanos mutuamente
distintos); `AitSignature.signature_type` + `refusal_or_impossibility_reason`. O mesmo padrão de
três resultados se repete em `AdministrativeTerm` (medidas administrativas) e em
`AlcoholTest`/`AlcoholRefusal` (procedimento de etilômetro) — corpus de protótipo RN-AIT-007,
RN-MED-012, RN-ALC-004, RN-ALC-010. Nenhum comando de finalização exige assinatura obtida com
sucesso; exige apenas que um dos três resultados esteja registrado.

**Ajuste de modelagem decorrente da revisão.** `AlcoholRefusal` deixa de ser um resultado do
`AlcoholTest` e passa a ser **gatilho de lavratura** de AIT por art. 165-A, com as medidas
administrativas vinculadas ([RN-TEAT-137]). A impossibilidade técnica do aparelho passa a ser um
atributo do **instrumento de medição** ([RN-TEAT-135]), não do sujeito — e não gera enquadramento
algum por si. Consequência de UX: os dois campos não podem compartilhar o mesmo seletor de
"motivo" (ver Handoff UX do `_intake/research-dossier.md`, item 4).
