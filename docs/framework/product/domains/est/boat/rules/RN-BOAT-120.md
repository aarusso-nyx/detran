---
id: RN-BOAT-120
title: Remoção do veículo sinistrado sem responsável no local (CTB art. 279-A) — independe de infração e entra no regime de custódia e leilão
status: draft
apps: [boat, teat]
sources: [REF-CTB-sinistro-cena-renaest, REF-CONTRAN-1025-2026]
updated: 2026-08-24
---

**Regra.** O veículo **sinistrado** pode ser removido para depósito **independentemente da existência
de infração de trânsito**, quando **não houver responsável por ele no local do sinistro**. É figura
autônoma: não é medida administrativa decorrente de AIT, não pressupõe infração e não depende de
conduta do condutor. Uma vez removido, o veículo entra no **regime geral de custódia, notificação e
alienação** do art. 328 do CTB — expressamente aplicável por remissão do art. 279-A, § 2º, e
reafirmado pela Res. CONTRAN 1.025/2026, art. 16. Isso significa **prazo de sessenta dias** contado
do recolhimento, findo o qual o veículo não reclamado é avaliado e levado a leilão.

**Base legal.**

- [REF-CTB-sinistro-cena-renaest] art. 279-A: _"O veículo em estado de abandono ou sinistrado poderá
  ser removido para o depósito fixado pelo órgão ou entidade competente do Sistema Nacional de
  Trânsito independentemente da existência de infração à legislação de trânsito, nos termos da
  regulamentação do Contran. § 1º A remoção do veículo sinistrado será realizada quando não houver
  responsável por ele no local do sinistro. § 2º Aplicam-se à remoção de veículo em estado de
  abandono ou sinistrado as disposições constantes do art. 328, sem prejuízo das demais disposições
  deste Código."_ _(Redação dada pela Lei nº 14.599, de 2023)_
- [REF-CONTRAN-1025-2026] art. 16: _"Ao recolhimento de veículos abandonados, sinistrados,
  identificados com restrição policial ou judicial sobre seu prontuário, aplicam-se as disposições
  do art. 328 do Código de Trânsito Brasileiro, sem prejuízo do cumprimento das demais regras
  estabelecidas nesta Resolução."_
- CTB art. 328, _caput_ (texto compilado, `refs/ctb/planalto_plain.txt`): _"O veículo apreendido ou
  removido a qualquer título e não reclamado por seu proprietário dentro do prazo de sessenta dias,
  contado da data de recolhimento, será avaliado e levado a leilão, a ser realizado preferencialmente
  por meio eletrônico."_ _(Redação dada pela Lei nº 13.160, de 2015)_

**Verificação — este é o ponto de cruzamento BOAT↔TEAT.** Consequências:

1. A remoção do art. 279-A produz um **Termo de Recolhimento** ([REF-CONTRAN-1025-2026] art. 14) —
   documento do domínio TEAT — **sem AIT de origem**, hipótese que [RN-TEAT-118] já reconhece
   ("nem toda medida administrativa nasce de um AIT"). O `AdministrativeTerm` resultante deve
   referenciar o `CrashRecord`, e não um auto inexistente.
2. O **prazo a imprimir no termo é de sessenta dias** contados do recolhimento, e não os trinta dias
   do edital — erro já identificado e corrigido na rodada TEAT ([RN-TEAT-126], [RN-TEAT-128], item
   29 de `inf/teat/_intake/legal-assessment.md`). O mesmo erro aplicado ao veículo sinistrado é
   ainda mais gravoso: o proprietário pode estar **hospitalizado** e desconhecer o prazo.
3. O gatilho é factual — **ausência de responsável no local** — e precisa ser capturado como fato
   observado do atendimento (`CrashRecord`), com identificação de quem constatou. Sem esse registro,
   a remoção fica sem fundamento documentado.
4. O encerramento do registro de sinistro ([WF-BOAT-001]) deve admitir a hipótese de **veículo
   removido sem responsável**, que hoje não aparece no fluxo.

**Controvérsia/risco.** (a) O art. 279-A remete a _"regulamentação do Contran"_; a Res. 1.025/2026,
seu regulamento mais recente, é norma **publicada em 30/06/2026**, sem fonte secundária de
conferência — validação jurídica humana é pré-requisito para tratá-la como base definitiva de
produto (mesma ressalva já registrada no §2.4 de `inf/teat/_intake/legal-assessment.md`). (b) A
combinação "vítima hospitalizada + veículo removido + prazo de 60 dias correndo" é um cenário de
**prejuízo real e previsível ao cidadão** que nenhuma das duas normas endereça: não há suspensão de
prazo por internação, incapacidade ou óbito do proprietário. É lacuna material, não de pesquisa —
item 21 de `_intake/legal-assessment.md`.
