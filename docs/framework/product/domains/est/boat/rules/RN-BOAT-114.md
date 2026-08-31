---
id: RN-BOAT-114
title: Cena do sinistro, regime 1 — deveres do condutor envolvido em sinistro COM vítima (CTB art. 176)
status: draft
apps: [boat, teat]
sources: [REF-CTB-sinistro-cena-renaest]
updated: 2026-08-24
---

**Regra.** O condutor **envolvido** em sinistro **com vítima** tem **cinco deveres autônomos**, cuja
omissão configura, cada uma, a infração do art. 176: (I) prestar ou providenciar socorro à vítima,
**podendo fazê-lo**; (II) adotar providências, **podendo fazê-lo**, para evitar perigo para o
trânsito no local; (III) **preservar o local**, de forma a facilitar os trabalhos da polícia e da
perícia; (IV) adotar providências para **remover o veículo** do local, **quando determinadas por
policial ou agente da autoridade de trânsito**; (V) **identificar-se ao policial** e prestar-lhe as
informações necessárias à confecção do boletim de ocorrência. A infração é **gravíssima**, com
**multa multiplicada por cinco**, **suspensão do direito de dirigir** e medida administrativa de
**recolhimento do documento de habilitação**.

**Base legal.** [REF-CTB-sinistro-cena-renaest] art. 176:

> "Art. 176. Deixar o condutor envolvido em sinistro com vítima: _(Redação dada pela Lei nº 14.599,
> de 2023)_
>
> I - de prestar ou providenciar socorro à vítima, podendo fazê-lo;
>
> II - de adotar providências, podendo fazê-lo, no sentido de evitar perigo para o trânsito no
> local;
>
> III - de preservar o local, de forma a facilitar os trabalhos da polícia e da perícia;
>
> IV - de adotar providências para remover o veículo do local, quando determinadas por policial ou
> agente da autoridade de trânsito;
>
> V - de identificar-se ao policial e de lhe prestar informações necessárias à confecção do boletim
> de ocorrência:
>
> Infração - gravíssima; Penalidade - multa (cinco vezes) e suspensão do direito de dirigir; Medida
> administrativa - recolhimento do documento de habilitação."

**Verificação.** Quatro precisões que o modelo de dados precisa refletir:

1. **Os incisos são autônomos.** Um mesmo condutor pode descumprir um deles e cumprir os demais —
   evadir-se do local (V) é fato distinto de deixar de socorrer (I) e de não preservar a cena (III).
   Capturar isso como um único booleano `evaded` **perde informação juridicamente relevante**
   ([RN-BOAT-117]).
2. **"Podendo fazê-lo" (incisos I e II) é elemento do tipo**, não atenuante: se o condutor estava
   ferido, inconsciente ou impedido, a infração **não se configura**. O registro precisa distinguir
   "não socorreu" de "não podia socorrer" — e a segunda hipótese exige registro do motivo observado.
3. O inciso IV pressupõe **determinação de policial ou agente** — sem ordem, não há dever de
   remover por esta via (o dever de remoção sem vítima é outro, art. 178 — [RN-BOAT-116]). O
   registro deve capturar **se houve determinação** e por quem.
4. Este é um **AIT**, lavrado pelo TEAT, com fato ocorrido em cena de sinistro — o que torna a
   associação `CrashRecord`↔AIT ([APP-BOAT] §Interfaces) um vínculo jurídico e não apenas
   conveniência de navegação. O `crash_record_id` sem FK rígida hoje registrado como risco de
   integridade em [WF-BOAT-001] ganha, por isso, peso adicional.

**Controvérsia/risco.** O inciso III cria o dever de **preservar o local** para a perícia; os
incisos IV e o art. 178 criam deveres de **remover o veículo**. A norma não fixa critério de
precedência entre preservar e liberar — ver [RN-BOAT-118]. Registre-se ainda que a mesma omissão de
socorro configura, em paralelo, **crime** do art. 304 do CTB, fora do escopo do BOAT ([RN-BOAT-121]).
