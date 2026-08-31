---
id: RN-PEC-150
title: Todo o núcleo de dados do PEC é dado pessoal sensível — o regime do bloco RN-BOAT-122..129 aplica-se por remissão, com deltas próprios do exame de aptidão
status: draft
apps: [pec]
sources:
  [
    REF-LEI-13709-2018,
    REF-CTB-147-148-habilitacao,
    REF-SENATRAN-PORTARIA-968-2022,
  ]
updated: 2026-08-24
---

**Regra.** O PEC trata **dado pessoal sensível em duas categorias simultâneas** da mesma definição
legal — _dado referente à saúde_ **e** _dado biométrico_ — e trata-os no **núcleo** do domínio, não
na periferia: anamnese, exame médico, avaliação psicológica, laudo, restrições de CNH, resultado de
aptidão, impressões digitais, imagem facial e assinatura. **Não existe operação do PEC que não
envolva dado sensível.**

**O regime aplicável já está escrito neste repositório.** O bloco [RN-BOAT-122] a [RN-BOAT-129],
produzido na rodada BOAT sobre a mesma [REF-LEI-13709-2018], estabelece o tratamento de dado de
saúde no ecossistema DETRAN: incidência integral da LGPD, base legal do art. 11, minimização
reforçada, retenção e eliminação, direitos do titular e governança, papel controlador/operador e
regime de compartilhamento. **Esse bloco é adotado aqui por remissão e não é reescrito.** As regras
[RN-PEC-151] a [RN-PEC-154] registram **apenas os deltas** — os pontos em que o caso do PEC difere
do caso do sinistro e a conclusão muda.

**Os cinco deltas, em resumo (detalhados nas regras seguintes):**

| #   | No BOAT                                                                                            | No PEC                                                                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | titular é **vítima** — não consente, muitas vezes inconsciente                                     | titular é **candidato presente, identificado e biometricamente validado** — mas igualmente **sem escolha real**: o exame é condição legal para dirigir |
| 2   | dado sensível é **de saúde**                                                                       | dado sensível é **de saúde e biométrico**, cumulativamente                                                                                             |
| 3   | art. 11, II, **"f"** (tutela da saúde) **indisponível** — órgão de trânsito não é serviço de saúde | a "f" é **aparentemente** disponível (há profissionais de saúde) e **é uma armadilha**: a finalidade é pericial, não assistencial — ver [RN-PEC-151]   |
| 4   | retenção: **eliminação é a regra**, conservação exige enquadramento ([RN-BOAT-125])                | retenção: **conservação por 20 anos é obrigação legal** ([RN-PEC-141]) — a lógica se inverte                                                           |
| 5   | compartilhamento com **RENAEST**, base estatística                                                 | compartilhamento com o **RENACH**, base **registral e vinculante**, com resultado que produz efeito direto sobre direito do titular — ver [RN-PEC-152] |

**Base legal.**

- [REF-LEI-13709-2018] art. 5º, II: _"dado pessoal sensível: dado pessoal sobre [...] **dado
  referente à saúde** ou à vida sexual, **dado genético ou biométrico**, quando vinculado a uma
  pessoa natural"_.
- [REF-LEI-13709-2018] art. 11, § 1º: _"Aplica-se o disposto neste artigo a qualquer tratamento de
  dados pessoais que **revele** dados pessoais sensíveis e que possa causar dano ao titular."_ — o
  próprio **resultado** ("inapto por motivo irreversível") revela dado de saúde, ainda que despido de
  conteúdo clínico.
- [REF-LEI-13709-2018] art. 4º, III (exclusão de segurança pública) — **não alcança o PEC**, pelas
  mesmas razões desenvolvidas em [RN-BOAT-122]: a finalidade é registral-administrativa, e o § 1º
  exigiria legislação específica que não existe.
- [REF-SENATRAN-PORTARIA-968-2022] art. 2º, § 5º: sujeição expressa do coletor biométrico à LGPD.
- [REF-CTB-147-148-habilitacao] art. 147, § 1º (o resultado vai ao RENACH por imposição legal).

**Verificação.**

1. **A classificação `pii` do modelo de dados precisa alcançar o resultado**, não só o conteúdo
   clínico: `medical_result` é dado que **revela** saúde (art. 11, § 1º). É o mesmo erro de marcação
   apontado em [RN-BOAT-122] para `severity`.
2. **Não há opção de "não coletar dado sensível"** — como no BOAT, o núcleo é sensível por natureza.
   A questão desloca-se para **base legal e salvaguardas**.
3. **O papel `Auditor` e o `Suporte`** ([APP-PEC] §Atores) precisam da mesma delimitação já imposta
   no BOAT ([RN-BOAT-126], item 2): metadados e trilha por padrão, dado bruto sensível só por acesso
   excepcional justificado. O corpus PEC já descreve mascaramento para `Suporte` — mas não para
   `Auditor`.
4. **O `DPO` já é papel binding do PEC** ([APP-PEC] §Atores) — vantagem sobre o BOAT, onde o
   Encarregado não estava modelado. O canal do titular, porém, continua inexistente ([RN-PEC-153]).

**Controvérsia/risco.** A remissão em bloco é deliberada e tem um limite: as conclusões de
[RN-BOAT-122]..[RN-BOAT-129] foram construídas sobre um caso de uso **diferente** (vítima de
sinistro, dado colhido em campo, finalidade estatística). Onde o delta muda o resultado, ele está
registrado em [RN-PEC-151]..[RN-PEC-154]; onde não está registrado, presume-se que a conclusão do
BOAT se transporta — **presunção de trabalho, não verificação artigo a artigo**. Um parecer humano
deve confirmá-la. Item 18 de `_intake/legal-assessment.md`.
