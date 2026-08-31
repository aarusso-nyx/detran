---
id: RN-BOAT-104
title: Validação em três níveis — o DETRAN-AM valida o dado estadual e o dos municípios não integrados ao SNT
status: draft
apps: [boat]
sources: [REF-CONTRAN-808-2020]
updated: 2026-08-24
---

**Regra.** A consolidação de um sinistro na base nacional passa por **validação em três níveis** —
municipal, estadual e federal — seguida de **homologação** e só então de **consolidação**. O
DETRAN-AM é o validador do **nível estadual** e, adicionalmente, o validador do **nível municipal
dos municípios não integrados ao SNT** — hipótese majoritária no Amazonas, onde poucos municípios
possuem órgão executivo de trânsito próprio integrado. A validação estadual é, portanto, um **ato
administrativo com destinatário externo** (a União), não uma etapa interna de qualidade de dado.

**Base legal.** [REF-CONTRAN-808-2020] art. 5º:

> "Art. 5º Os dados e as informações referentes a acidentes e estatísticas de trânsito, coletados e
> enviados ao órgão máximo executivo de trânsito da União, serão **homologados e, então,
> consolidados** na base nacional do RENAEST.
>
> § 1º Para fins de consolidação, os dados e as informações na base nacional do RENAEST serão
> validados em nível: I - municipal: pelos órgãos ou entidades executivos de trânsito dos municípios
> integrados ao SNT; II - estadual: pelos órgãos e entidades executivos de trânsito dos Estados e do
> Distrito Federal; e III - federal: pelo órgão máximo executivo de trânsito da União.
>
> § 2º **Nos municípios não integrados ao SNT, a validação das informações será realizada pelos
> órgãos e entidades executivos de trânsito dos Estados e do Distrito Federal.**"

Complementa: art. 8º, IV (_"validar em nível federal, homologar e consolidar os dados e as
informações na base nacional do RENAEST"_ — competência da União) e art. 9º, III (_"validar os dados
e as informações coletados em nível estadual e, no caso dos municípios não integrados ao SNT, em
nível municipal"_ — competência do DETRAN).

**Verificação.** **CONFIRMA, com fonte normativa, a máquina de estados nacional** hoje documentada
apenas por contrato do mock em [WF-BOAT-001] e [APP-BOAT]: "homologados e, então, consolidados" é a
origem do par `RECEBIDO` → `CONSOLIDADO`; a rejeição nacional (`REJEITADO`) é o desfecho negativo da
mesma homologação. Consequência de modelagem, hoje ausente: o estado local `validated` de
[WF-BOAT-001] corresponde à **validação estadual do art. 5º, §1º, II** — deve registrar
**quem validou, em que nível e sob qual competência** (estadual própria ou municipal supletiva do
§ 2º), porque são fundamentos jurídicos distintos. Um registro validado supletivamente para
município não integrado carrega responsabilidade do DETRAN-AM que um registro de município integrado
não carrega.

**Controvérsia/risco.** A Resolução descreve os níveis de validação, mas **não fixa prazo, forma,
efeito da não-validação nem procedimento de devolução** do dado ao nível inferior. Em consequência:
(a) não há norma que diga o que acontece com um registro municipal rejeitado no nível estadual —
[WF-BOAT-001] modela `pending_complement` por analogia, sem base normativa; (b) o mock nacional
trata `REJEITADO` como **estado terminal sem correção** (`RENAEST.CRASH.CORRECTION_NOT_ALLOWED`),
o que **não** encontra respaldo nem vedação na Resolução — é decisão de contrato técnico. Tratar a
rejeição nacional como definitiva, sem via de retificação, é assumir como norma algo que a norma não
diz. Item 13 de `_intake/legal-assessment.md`.
