---
id: RN-TEAT-123
title: AIT e medida administrativa têm destinos independentes — nos dois sentidos
status: draft
apps: [teat]
sources: [REF-CONTRAN-985-1003-MBFT, REF-CTB-165-277-medidas-alcoolemia]
updated: 2026-08-24
---

**Regra.** A relação entre o auto e a medida é de **independência recíproca**:

- **a ausência de registro no AIT da medida administrativa adotada, ou a impossibilidade de sua
  aplicação ou conclusão, não invalidam a autuação** pela infração; e
- **a eventual invalidação, anulação ou arquivamento do AIT não prejudicará, necessariamente, a
  medida administrativa** aplicada pelo agente.

Consequência de sistema: falha, pendência ou impossibilidade na medida **nunca** bloqueia a
finalização, a transmissão ou o processamento do AIT; e a insubsistência do AIT ([RN-TEAT-119])
**não** dispara, por si, a reversão automática da medida.

**Base legal.** [REF-CONTRAN-985-1003-MBFT] Seção 8:

> "Medidas administrativas são providências de caráter complementar, exigidas para a regularização
> de situações infracionais, sendo, em grande parte, de aplicação momentânea, e têm como objetivo
> prioritário impedir a continuidade da prática infracional, garantindo a proteção à vida e à
> incolumidade física das pessoas e não se confundem com penalidades."
>
> "A ausência de registro no AIT da medida administrativa adotada ou a impossibilidade de sua
> aplicação ou conclusão não invalidam a autuação pela infração de trânsito."
>
> "A eventual invalidação, anulação ou arquivamento do AIT não prejudicará, necessariamente, a
> medida administrativa aplicada pelo agente da autoridade de trânsito."

Ver [REF-CTB-165-277-medidas-alcoolemia] art. 269 §2º (caráter complementar).

**Verificação.** Ancora com **fonte direta e simétrica** o que [RN-TEAT-004] afirmava por
inferência a partir do art. 3º da Res. 918/2022. Regras de implementação: (a) a fila de
sincronização trata AIT e `AdministrativeTerm` como itens **independentes** — falha de um não
retém o outro ([RN-TEAT-001]); (b) o estado do AIT **não** é precondição de nenhuma transição do
termo; (c) o arquivamento do AIT gera, no máximo, uma **tarefa de reavaliação** da medida dirigida
a `traffic-authority` — nunca uma reversão automática, porque o texto diz "não prejudicará,
**necessariamente**", o que preserva o juízo do caso concreto.

**Controvérsia/risco.** O advérbio "necessariamente" é deliberadamente aberto: há medidas que
**não sobrevivem** à queda do auto (a retenção fundada exclusivamente na infração arquivada) e
outras que sobrevivem (remoção por condições de segurança do veículo). Como a norma não separa as
hipóteses, o produto não pode decidir por regra — deve escalar. Item 24 de
`_intake/legal-assessment.md`.
