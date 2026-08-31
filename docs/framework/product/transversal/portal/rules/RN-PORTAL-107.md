---
id: RN-PORTAL-107
title: Exigência de uma só vez — tudo o que o serviço precisa é pedido no início; exigência posterior só por dúvida superveniente motivada
status: draft
apps: [portal, rait]
sources:
  [REF-LEI-14129-2021, REF-LEI-13460-2017, REF-CONTRAN-900, REF-CONTRAN-918]
updated: 2026-08-24
---

**Regra.** Corolário operacional de [RN-PORTAL-106]. Cada serviço do PORTAL declara, **antes** de o
cidadão começar, o conjunto **completo** de informações e documentos que dele serão exigidos. Pedir
mais depois só é legítimo diante de **dúvida superveniente**, e sob três condições cumulativas:
(a) a dúvida é **motivada** e registrada no processo, com autor e data; (b) o pedido é veiculado como
**diligência com prazo** ([RN-RAIT-004]), não como rejeição do protocolo já feito; (c) o pedido
**não** alcança documento que o órgão detém ([RN-PORTAL-106], camada 1).

Quatro regras de checklist, verificáveis mecanicamente:

| #   | Regra                                                                                                            | Consequência do descumprimento                       |
| --- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 1   | Nenhum anexo obrigatório pode ser documento emitido pelo órgão autuador (NA, NP, AIT, parecer/conclusão da JARI) | _Contra legem_ — camada 1 de [RN-PORTAL-106]         |
| 2   | Nenhum campo pode pedir dado que o PORTAL já tem no perfil ou pode derivar do CPF/placa/AIT                      | Retrabalho vedado; pré-preencher e permitir correção |
| 3   | O checklist é mostrado **integralmente na entrada** do fluxo, não revelado passo a passo                         | Viola a exigência "de uma única vez"                 |
| 4   | Documento pedido **depois** do protocolo tem que apontar para um evento de dúvida motivada                       | Exigência posterior sem justificativa                |

Para a trilha de multas, o conjunto exigível reduz-se, na prática, a: **quem é o requerente** (CPF —
[RN-PORTAL-103]), **qual o processo** (placa + número do AIT), **o que se alega e o que se pede**
(exposição dos fatos e pedido), **a assinatura** ([RN-PORTAL-101]), e **a prova da representação**
quando houver procurador ou pessoa jurídica ([RN-RAIT-121]). Tudo o mais é do órgão.

**Base legal.**

- [REF-LEI-14129-2021] art. 3º, XII: _"a imposição imediata e de uma única vez ao interessado das
  exigências necessárias à prestação dos serviços públicos, justificada exigência posterior apenas em
  caso de dúvida superveniente"_; X: _"a simplificação dos procedimentos de solicitação, oferta e
  acompanhamento dos serviços públicos, com foco na universalização do acesso e no autosserviço"_;
  XI: _"a eliminação de formalidades e de exigências cujo custo econômico ou social seja superior ao
  risco envolvido"_.
- [REF-LEI-13460-2017] art. 5º, XI (mesma diretriz de eliminação de formalidades, em lei sem cláusula
  de adesão) e IV: vedação de _"exigências, obrigações, restrições e sanções não previstas na
  legislação"_ — o rol de documentos da defesa/recurso está **na** legislação ([REF-CONTRAN-900] art.
  5º), e o que não estiver lá não é exigível.
- [REF-CONTRAN-900] art. 3º: rol taxativo do conteúdo mínimo do requerimento (I a VI), e parágrafo
  único: _"O requerimento de defesa prévia ou recurso deverá ter somente um AIT como objeto."_
- [REF-CONTRAN-900] art. 4º: as hipóteses de **não conhecimento** são quatro e fechadas
  (intempestividade, legitimidade não comprovada, ausência de assinatura, ausência ou
  incompatibilidade do pedido) — nenhuma delas é "documento faltante". Ausência documental, portanto,
  **não** autoriza recusa de protocolo: autoriza, no máximo, diligência.
- [REF-LEI-14129-2021] art. 27, IV: direito ao _"recebimento de protocolo, físico ou digital, das
  solicitações apresentadas"_ — o protocolo é devido **na entrega**, não após conferência documental.

**Verificação.** (a) O catálogo de serviços ([WF-PORTAL-001]) armazena, por serviço, a lista fechada
`exigencias[]`, e o motor de formulário só pode renderizar campo/anexo presente nessa lista. (b)
Cobertura de teste: submeter um requerimento com o mínimo do art. 3º e **nenhum** anexo deve produzir
protocolo válido, com o processo seguindo para triagem — nunca erro de validação de formulário. (c)
Toda exigência posterior gera evento `diligencia_aberta` com `motivo` textual obrigatório e prazo
calculado por [RN-RAIT-005]; diligência sem motivo é rejeitada pelo próprio sistema.

**Interação com a admissibilidade.** Esta regra não afrouxa o juízo de admissibilidade de
[RN-RAIT-001] e [RN-RAIT-122] — ela apenas impede que a **ausência de papel** seja convertida em
inadmissibilidade. Os quatro fundamentos do art. 4º continuam plenamente operantes, e a falta de
assinatura (inciso III) segue sendo causa de não conhecimento, agora aferida pelo nível eletrônico de
[RN-PORTAL-101].

**Controvérsia/risco.** O fundamento mais literal — art. 3º, XII da Lei 14.129/2021 — está na camada
condicionada de [RN-PORTAL-106]. No cenário de não adesão, a regra 3 da tabela ("checklist integral
na entrada") perde a sua âncora textual mais direta e passa a apoiar-se em [REF-LEI-13460-2017] art.
5º, XI e XIII e no dever geral de eficiência — argumento sólido, porém menos literal. As regras 1, 2
e 4 não dependem da adesão: derivam da camada 1 e do rol fechado do art. 4º da Res. 900/2022. Item 1
de `_intake/legal-assessment.md`.
