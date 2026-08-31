---
id: RN-RAIT-129
title: Pagamento antecipado não prejudica o processo; provimento gera restituição atualizada
status: reviewed
apps: [portal, rait]
sources: [REF-CTB-280-290, REF-CONTRAN-918]
updated: 2026-08-28
---

**Regra.** Duas garantias encadeadas:

1. **Recurso sem recolhimento e pagamento antecipado sem prejuízo.** O recurso pode ser interposto no
   prazo legal **sem o recolhimento** do valor da multa. Inversamente, é **facultado antecipar** o
   pagamento em **qualquer fase** do processo administrativo, **sem prejuízo da continuidade** dos
   procedimentos — expedição das notificações, apresentação da defesa da autuação e dos respectivos
   recursos seguem normalmente. Havendo pagamento antecipado, a NP é expedida com a informação de que
   a multa se encontra paga, com indicação do prazo de recurso e **sem código de barras**.
2. **Restituição em caso de provimento.** Se o infrator recolheu o valor e apresentou recurso, e a
   penalidade vier a ser **julgada improcedente**, a importância paga **ser-lhe-á devolvida,
   atualizada** em UFIR ou por índice legal de correção dos débitos fiscais.

**Base legal.**

- [REF-CTB-280-290] art. 286, _caput_: _"O recurso contra a imposição de multa poderá ser interposto
  no prazo legal, sem o recolhimento do seu valor."_
- [REF-CTB-280-290] art. 286 §2º: _"Se o infrator recolher o valor da multa e apresentar recurso, se
  julgada improcedente a penalidade, ser-lhe-á devolvida a importância paga, atualizada em UFIR ou por
  índice legal de correção dos débitos fiscais."_
- [REF-CONTRAN-918] art. 33, _caput_ e parágrafo único.
- [REF-CTB-280-290] art. 284 §2º: o recolhimento não implica renúncia ao questionamento
  administrativo (ressalvada a faixa de 40% — [RN-RAIT-127]).

**Verificação.** A decisão de provimento com `pagamento_registrado = true` **dispara automaticamente**
a tarefa de restituição, com o valor corrigido — não depende de novo requerimento do cidadão. O
PORTAL informa a restituição devida e seu andamento. Nenhum ponto do fluxo pode condicionar
admissibilidade ou julgamento a pagamento ([RN-RAIT-122]).

**Controvérsia/risco.**

1. **Índice de correção.** O art. 286 §2º menciona a **UFIR**, indexador extinto para a generalidade
   dos fins, "ou índice legal de correção dos débitos fiscais". Qual índice o DETRAN-AM aplica na
   prática **não consta do corpus**; é definição da legislação estadual/fazendária, não do CTB.
   `_intake/legal-assessment.md`, item 19. **Decisão do Owner** (`_meta/steering.md` C.25,
   2026-08-24): usar o **índice fiscal padrão de correção de débitos do estado do AM**.
   **Índice confirmado (2026-08-28, resposta a `_meta/open-issues.md` DT-013): IPCA-E**. Sem
   parecer jurídico ou confirmação institucional formal junto à área fazendária estadual — tratar
   como decisão de trabalho do Owner, mesma disciplina de risco do resto do corpus.
2. **Terminologia.** O art. 286 §2º condiciona a devolução a penalidade _"julgada improcedente"_,
   enquanto o art. 288 §1º fala em _"provimento"_. São o mesmo desfecho favorável; o RAIT deve usar
   vocabulário canônico único de desfecho e mapear a terminologia legal a ele no glossário.
3. **Remissão morta.** O art. 286 §1º remete ao "parágrafo único do art. 284", que **não existe** na
   redação vigente (convertido em §§ numerados pela Lei 13.281/2016). Não derivar regra desse
   parágrafo: aplicar diretamente o art. 284 §4º ([RN-RAIT-128]).
