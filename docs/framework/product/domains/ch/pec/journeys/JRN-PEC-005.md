---
id: JRN-PEC-005
title: A longa disputa de Elza — da junta médica à Junta Especial de Saúde, com os prazos como seus direitos
status: draft
apps: [pec]
sources:
  - REF-CONTRAN-927-2022
  - JRN-PEC-002
  - WF-PEC-002
updated: 2026-08-24
---

## Persona e contexto

Elza é motorista há 30 anos e foi considerada inapta na renovação da CNH categoria B. Ela
discorda — acha que a avaliação não levou em conta seu tratamento em curso. Esta jornada é a
versão **completa e de longo prazo** do caminho que [JRN-PEC-002] abre: não é um caso pontual
de Carlos sendo submetido à junta por decisão de terceiros, é a trajetória inteira de Elza,
como titular do direito de contestar, através de **três instâncias sucessivas** — Junta Médica,
recurso ao CETRAN, e a "Junta Especial de Saúde" que o CETRAN designa para efetivamente julgar
esse recurso ([REF-CONTRAN-927-2022] arts. 12-15). A terceira instância é o achado mais
importante desta rodada de pesquisa para o domínio: **não existe, em nenhum artefato do PEC
minerado até agora, uma entidade ou estado que represente essa Junta Especial de Saúde** —
[WF-PEC-002] trata `escalateToCetran=true` como um simples reforço de assinatura na mesma
decisão. Esta jornada é escrita deliberadamente como o **fluxo legal completo**, mesmo sabendo
que a implementação de hoje é mais simples — para que o time de produto veja, em uma narrativa
só, a distância entre os dois, e possa decidir com informação completa se fecha essa distância
ou a assume como simplificação consciente.

Como em [JRN-RAIT-004], o princípio de desenho aqui é que **nenhum prazo desta jornada pode
ser mostrado a Elza como se fosse um prazo dela quando na verdade é um prazo do órgão** — dos
cinco prazos do capítulo III da Resolução 927/2022, dois são dela (requerer junta, recorrer ao
CETRAN) e três são do órgão (designar junta, junta decidir, remeter documentos). Confundir os
dois é o erro de UX mais grave que esta jornada pode cometer.

## Narrativa ponta-a-ponta

1. **Elza sabe do resultado — o relógio dela começa.** A partir da ciência do resultado de
   inaptidão, Elza tem **30 dias** para requerer a instauração de Junta Médica
   ([REF-CONTRAN-927-2022] art. 12). Qualquer comunicação do resultado deveria, já nesse
   momento, informar esse prazo e o caminho para exercê-lo — não como nota de rodapé, mas como
   parte central da mensagem, no mesmo espírito de dignidade que a rodada BOAT deu à
   comunicação de um sinistro com vítima: uma informação que afeta a vida de Elza não pode
   estar escondida atrás de um link secundário.
2. **Ela requer a junta.** O sistema, hoje, modela esse requerimento como um ato de Auditor,
   Gestor ou Gestor DETRAN em nome do processo (ver nota de gap em [JRN-PEC-002] Persona) — o
   caminho que Elza efetivamente usa para _pedir_ isso (balcão da clínica? canal do DETRAN-AM?
   um futuro portal?) não está confirmado nos documentos capturados. Esta é uma pergunta de
   produto em aberto que a UX não deveria resolver sozinha, mas que precisa aparecer
   explicitamente no backlog: **qual é a interface pela qual Elza exerce um direito que a lei
   já garante a ela?**
3. **O órgão tem 15 dias úteis para designar a Junta Médica — composta por três médicos.**
   Art. 14 §1º e art. 12 §1º. Se o painel/tela que acompanha esse caso existir (interno,
   equivalente ao console de coordenação de [JRN-BOAT-004] ou ao radar de [JRN-RAIT-004]), ele
   deveria mostrar esse prazo com a mesma urgência de um prazo de decadência — é um prazo do
   órgão, e estourá-lo sem justificativa é uma falha institucional, não uma "demora normal".
4. **A Junta analisa e decide em até 30 dias da designação.** Art. 14 §3º. Três médicos (ou
   três psicólogos, se o resultado contestado for o psicológico) revisam o caso de Elza — não
   um "papel único" indiferenciado. Se a Junta mantém a inaptidão, Elza é informada com a mesma
   franqueza da primeira comunicação: o resultado permanece, mas ela ainda tem um próximo
   passo, e o próximo passo tem prazo próprio (não é "fim de linha" disfarçado).
5. **Elza recorre ao CETRAN — 30 dias a partir de saber da decisão da junta.** Art. 13. É o
   segundo prazo que é _dela_ — simétrico ao do passo 1, e a interface deveria tratá-lo com a
   mesma proeminência, não como uma opção secundária "para quem insistir".
6. **O órgão tem 20 dias úteis para remeter os documentos ao CETRAN.** Art. 14 §2º. Prazo do
   órgão, não de Elza — ela já fez sua parte ao recorrer a tempo.
7. **A decisão final não é do CETRAN colegiado — é da Junta Especial de Saúde que ele
   designa.** Art. 15: "para o julgamento de recurso, o Conselho de Trânsito do Estado [...]
   deverá designar Junta Especial de Saúde", composta por "no mínimo, três médicos, sendo dois
   especialistas em Medicina de Tráfego" (ou o equivalente psicológico). Esta é a instância que
   [WF-PEC-002] não modela em nenhum grau — hoje o sistema trataria essa decisão como
   `escalatedToCetran=true` na mesma linha de decisão da Junta de 1ª instância, sem um novo
   caso, sem os assentos dos três (ou mais) profissionais, sem prazo próprio de julgamento
   distinto do art. 14 §3º. Se Elza perguntasse "quem, exatamente, decidiu meu recurso?", a
   resposta honesta hoje seria "o campo `signerName` foi trocado para `'CETRAN'`" — uma
   resposta tecnicamente correta e humanamente insatisfatória. Esta jornada registra essa
   distância deliberadamente: é o ponto de maior risco de comunicação incorreta a um candidato
   em toda a base PEC revisada até agora.
8. **Fim da linha — o resultado é o que é, mas o caminho até ele foi rastreável.** Seja qual
   for a decisão final da Junta Especial de Saúde, o valor desta jornada para Elza não é
   garantir um resultado favorável — é garantir que, em nenhum momento dos possivelmente meses
   de espera (30+15 úteis+30+30+20 úteis dias, no pior caso, mais de 4 meses só nos prazos
   formais, sem contar o tempo de reunião de documentos), ela tenha ficado sem saber em qual
   etapa seu caso estava ou quanto tempo faltava para a próxima resposta obrigatória do órgão.

## Pontos de contato (apps/canais)

- PEC — módulo `juntas-medical-board` (mecânica de submissão e decisão, hoje simplificada
  frente ao desenho normativo de três instâncias).
- Junta Médica/Psicológica (1ª instância, 3 profissionais) — hoje sem representação de
  composição no sistema.
- CETRAN (órgão que designa) e Junta Especial de Saúde (2ª instância recursal, quem de fato
  julga, ≥3 profissionais com 2 especialistas) — nenhuma das duas modelada como entidade
  distinta hoje.
- Eventual canal pelo qual Elza requer/acompanha (não confirmado — ver passo 2).

## Métricas de sucesso

- Zero prazo do órgão (15 dias úteis, 30 dias da junta, 20 dias úteis de remessa) estourado
  sem uma ação/justificativa registrada e visível.
- Zero comunicação a Elza que atribua a decisão do recurso ao "CETRAN" quando, normativamente,
  quem decide é a Junta Especial de Saúde por ele designada — até que a modelagem feche essa
  distância, usar linguagem que não afirme uma atribuição que o sistema não sustenta (ex.:
  "seu recurso foi decidido pela instância designada pelo CETRAN", nunca "o CETRAN decidiu
  pessoalmente seu caso" como afirmação categórica de composição).
- Elza sabe, a qualquer momento da jornada, em qual das cinco etapas seu caso está e qual é o
  próximo prazo — mesmo objetivo de "nenhuma surpresa amanhã" de [JRN-RAIT-004].
- Item de produto explicitamente registrado (não resolvido por esta jornada): a interface pela
  qual um candidato exerce, na prática, o direito de requerer junta/recurso que a lei já lhe
  garante.
