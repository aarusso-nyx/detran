---
id: RN-PORTAL-127
title: Recorrer não exige recolher e antecipar o pagamento não prejudica o processo — a restituição corrigida é automática
status: draft
apps: [portal, rait]
sources: [REF-CTB-280-290, REF-CONTRAN-918]
updated: 2026-08-24
---

**Regra.** Duas garantias que o PORTAL tem de tornar visíveis exatamente onde a decisão do cidadão
acontece — a tela que oferece "pagar" ao lado de "defender-se":

1. **Recurso sem recolhimento.** O recurso pode ser interposto no prazo legal **sem pagar** a multa.
   Nenhuma tela pode sugerir, por ordem visual, rótulo ou fluxo, que é preciso pagar antes.
2. **Antecipação sem prejuízo.** É **facultado antecipar** o pagamento em **qualquer fase** do
   processo, **sem prejuízo da continuidade** dos procedimentos — expedição das notificações,
   apresentação da defesa e dos recursos seguem normalmente. Havendo pagamento antecipado, a NP é
   expedida com a informação de que a multa está paga, com indicação do prazo de recurso e **sem
   código de barras**.
3. **Restituição atualizada em caso de provimento.** Recolhido o valor e apresentado recurso, se a
   penalidade for julgada improcedente, a importância paga **é devolvida, atualizada**. A restituição
   é **automática**, disparada pela decisão de provimento com pagamento registrado — não depende de
   novo requerimento do cidadão, e o PORTAL informa o valor devido e o andamento.

Ressalva única e importante: tudo acima vale para a faixa de 20% de desconto (pagar 80%) e para o
pagamento sem desconto. **Não** vale para a faixa de 40% (pagar 60%), que pressupõe renúncia expressa
— ver [RN-PORTAL-128].

**Base legal.**

- [REF-CTB-280-290] art. 286, _caput_: _"O recurso contra a imposição de multa poderá ser interposto
  no prazo legal, sem o recolhimento do seu valor."_
- [REF-CTB-280-290] art. 286, § 2º: _"Se o infrator recolher o valor da multa e apresentar recurso, se
  julgada improcedente a penalidade, ser-lhe-á devolvida a importância paga, atualizada em UFIR ou por
  índice legal de correção dos débitos fiscais."_
- [REF-CTB-280-290] art. 284, § 2º: _"O recolhimento do valor da multa não implica renúncia ao
  questionamento administrativo, que pode ser realizado a qualquer momento, respeitado o disposto no
  § 1º."_
- [REF-CONTRAN-918] art. 33, _caput_: _"É facultado antecipar o pagamento do valor correspondente à
  multa, junto ao órgão autuador, em qualquer fase do processo administrativo, sem prejuízo da
  continuidade dos procedimentos previstos nesta Resolução para expedição das notificações,
  apresentação da defesa da autuação e dos respectivos recursos."_ Parágrafo único: NP expedida com a
  informação de multa paga, prazo de recurso indicado e **sem código de barras**.
- [REF-CONTRAN-918] art. 23, § 4º: _"Interposto recurso no prazo legal, se julgado improcedente, a
  incidência de juros de mora deverá ser considerada a partir do encerramento da instância
  administrativa."_; § 5º: recurso fora do prazo → juros a partir do vencimento da NP
  ([RN-RAIT-128]).

**Verificação.** (a) A tela de detalhe da autuação apresenta os caminhos (defender, indicar condutor,
pagar) **sem viés visual para pagar** — requisito já registrado em `_intake/ux-notes.md` §a, aqui
convertido em critério de conformidade jurídica, e não apenas de design. (b) Nenhum caminho de código
condiciona a abertura de defesa/recurso a `pagamento_registrado`. (c) Provimento com
`pagamento_registrado = true` dispara automaticamente a tarefa de restituição com valor corrigido
([RN-RAIT-129]); a ausência do disparo é defeito, não pendência operacional. (d) Quando há pagamento
antecipado, o documento de NP gerado não contém código de barras e informa expressamente o prazo de
recurso. (e) O PORTAL exibe o marco de juros aplicável conforme a tempestividade do recurso — dado que
muda o valor final e que o cidadão não tem como calcular sozinho.

**Controvérsia/risco.** (a) **Índice de correção da restituição.** O art. 286, § 2º menciona a
**UFIR**, indexador extinto para a generalidade dos fins, "ou índice legal de correção dos débitos
fiscais". O Owner decidiu (`_meta/steering.md` C.25, 2026-08-24) usar o **índice fiscal padrão de
correção de débitos do estado do AM** — o índice específico **ainda precisa ser identificado** junto à
área fazendária estadual antes de implementar o cálculo. Sem ele, o PORTAL pode informar que há
restituição devida, mas não o valor. (b) **Terminologia divergente**: o art. 286, § 2º fala em
penalidade _"julgada improcedente"_ e o art. 288, § 1º em _"provimento"_ — mesmo desfecho, vocabulário
diferente; o glossário deve mapear ambos ao desfecho canônico ([RN-RAIT-129]). (c) **Remissão morta**:
o art. 286, § 1º remete ao "parágrafo único do art. 284", inexistente na redação vigente (convertido
em §§ numerados pela Lei 13.281/2016) — não derivar regra desse dispositivo; aplicar diretamente o
art. 284, § 4º.
