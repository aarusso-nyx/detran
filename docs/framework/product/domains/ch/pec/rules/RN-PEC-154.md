---
id: RN-PEC-154
title: Dado biométrico é dado sensível — coleta imposta por norma, provedor externo sujeito à LGPD por disposição expressa, e a exceção biométrica como ponto de maior risco
status: draft
apps: [pec]
sources:
  [
    REF-LEI-13709-2018,
    REF-SENATRAN-PORTARIA-968-2022,
    REF-CTB-147-148-habilitacao,
  ]
updated: 2026-08-24
---

**Regra.** Impressão digital, imagem facial e assinatura são **dado pessoal sensível** por definição
legal expressa, quando vinculados a pessoa natural — categoria autônoma, ao lado do dado de saúde.
No PEC eles são tratados em **todos** os atendimentos, por **imposição normativa federal**
([RN-PEC-130]), e por um **provedor externo** que a própria norma de trânsito submete à LGPD.

Quatro consequências específicas:

1. **A base legal é a mesma de [RN-PEC-151]** — art. 11, II, "a": a validação de presença é
   **obrigatória por norma**, e não pode ser cumprida sem tratar o dado biométrico. O consentimento é
   igualmente inadequado, pela mesma razão (o candidato não tem alternativa).
2. **O provedor biométrico é agente de tratamento com dever expresso.** A Portaria SENATRAN 968/2022
   impõe às empresas coletoras _"a responsabilidade pela salvaguarda e sigilo dos dados biométricos
   coletados, nos termos da [LGPD]"_ — dever de origem regulatória, que **não substitui** o contrato
   de operador exigido pela LGPD nem desloca a responsabilidade do controlador.
3. **A validade do dado é normativa, não indefinida.** Os dados capturados têm **a mesma validade da
   CNH**, com reutilização permitida nesse período — o que é, materialmente, um **prazo de
   tratamento** (LGPD art. 15, II). Retenção biométrica além disso precisa de fundamento próprio, e
   nenhuma norma capturada o fornece.
4. **A exceção biométrica é o ponto de maior risco do domínio.** [RN-PEC-003] descreve falha de
   captura, justificativa, aprovação e liberação temporária. Sob a LGPD, a "auditoria reforçada" que
   a regra prevê **não é zelo extra — é obrigação** (art. 37, registro das operações; art. 46,
   medidas de segurança), e é precisamente o caminho por onde um atendimento pode ser concluído sem
   a validação que a norma federal exige ([RN-PEC-131] item 1).

**Base legal.**

- [REF-LEI-13709-2018] art. 5º, II (_"dado genético ou biométrico, quando vinculado a uma pessoa
  natural"_); art. 11, II, "a"; art. 15, II; art. 37; art. 46; art. 48.
- [REF-SENATRAN-PORTARIA-968-2022] art. 1º, parágrafo único (imagem facial, assinatura e impressões
  digitais são dados biométricos); art. 2º, § 2º (coleta somente presencial); art. 2º, § 5º _(texto de 2022)_: _"As empresas [...] deverão assumir [...] a responsabilidade pela salvaguarda e sigilo dos
  dados biométricos coletados, nos termos da Lei nº 13.709 [...] (LGPD)"_; art. 3º (validade = validade
  da CNH); art. 4º (validação obrigatória de presença).
- [REF-CTB-147-148-habilitacao] art. 147, § 1º (identificação do examinador no RENACH — a biometria do
  perito de [RN-PEC-005] serve a essa finalidade, não à do art. 4º da Portaria).

**Verificação.**

1. **Duas finalidades distintas, dois titulares distintos.** Biometria do **candidato** = validação de
   presença imposta pela Portaria 968/2022. Biometria do **perito** = garantia de pessoalidade do ato
   e de identificação do examinador ([RN-PEC-107], CTB art. 147, § 1º). Bases, prazos e titulares
   diferentes — **não podem compartilhar política de retenção nem de acesso**.
2. **Dado biométrico de profissional é dado de empregado/prestador**, não de usuário do serviço — e
   atrai, além da LGPD, a assimetria de poder típica da relação de trabalho. Não há norma que o
   trate; é um risco silencioso do modelo antifraude.
3. **Contrato de operador com o provedor** é exigência da LGPD (art. 39) que a Portaria não substitui
   — deve fixar finalidade, instruções, segurança, subcontratação, incidentes e término.
4. **Incidente biométrico é irreversível.** Diferentemente de senha, digital e face não se trocam —
   o que eleva a gravidade da comunicação do art. 48 e justifica tratamento de incidente próprio.
5. **`pec.biometric_exceptions` é o acervo mais sensível do sistema por unidade de volume**: concentra
   justamente os casos em que a identificação falhou. Acesso restrito, finalidade declarada, e
   `expires_at` efetivamente aplicado.

**Controvérsia/risco.** _Severidade: média-alta._ (a) A **retenção do dado biométrico** após o
vencimento da validade (= validade da CNH) não é tratada por norma alguma: apagar, anonimizar ou
manter? O modelo de duas camadas de [RN-BOAT-125] **não se transporta**, porque biometria
anonimizada não é biometria — é descarte. (b) A **reutilização** autorizada pelo art. 3º cria um
acervo persistente no RENACH cuja governança é federal, mas cujo ponto de coleta é a clínica
credenciada — a repartição de responsabilidade é a mesma indefinição de [RN-PEC-152] item 2. (c) O
uso de **reconhecimento facial** como fallback ([RN-PEC-131]) introduz risco de viés e de erro
diferencial que nenhuma norma capturada endereça e que a ANPD tem tratado com rigor crescente.
Recomenda-se que o **RIPD** de [RN-PEC-151] cubra explicitamente o componente biométrico. Item 18 de
`_intake/legal-assessment.md`.
