---
id: RN-RAIT-117
title: Competência do CETRAN-AM para o recurso de 2ª instância contra decisão da JARI
status: draft
apps: [rait, portal]
sources:
  [
    REF-CTB-280-290,
    REF-CONTRAN-918,
    REF-CONTRAN-900,
    REF-CONTRAN-357,
    REF-CONTRAN-901-2022,
    REF-DETRANAM-SERVICOS,
  ]
updated: 2026-08-28
---

**Regra.** Tratando-se de penalidade imposta por **órgão ou entidade de trânsito estadual** — o que é
o caso do DETRAN-AM — o recurso de 2ª instância contra a decisão da JARI é julgado pelo **CETRAN**,
isto é, pelo **CETRAN-AM**. Não há, no CTB, instância recursal ordinária além dessa
([RN-RAIT-119]).

**Base legal.**

- [REF-CTB-280-290] art. 289, II: _"tratando-se de penalidade imposta por órgão ou entidade de
  trânsito estadual, municipal ou do Distrito Federal, pelos CETRAN e CONTRANDIFE, respectivamente."_
- [REF-CONTRAN-918] art. 16 (remissão aos arts. 288 e 289 do CTB).
- [REF-CONTRAN-357] item 4.1.c: separação estrita — integrante de JARI **não pode** compor o CETRAN,
  o que assegura que a 2ª instância seja materialmente distinta da 1ª.
- Carta de serviço "Recurso ao CETRAN" do DETRAN-AM ([REF-DETRANAM-SERVICOS]).

**Composição e quorum do CETRAN — piso nacional (achado 2026-08-28, resolve DT-087).** A Res.
CONTRAN 901/2022 (diretrizes de Regimento Interno, gestão e operacionalização dos CETRAN/
CONTRANDIFE — análogo, para o CETRAN, do que a Res. 357/2010 é para a JARI) fixa, em Anexo:

| Aspecto               | Regra                                                                                                                                                                                                                                                    | Fonte                                   |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Composição mínima     | Presidente + **no mínimo 14 membros** com suplentes (15 no piso), com paridade obrigatória entre executivo estadual, executivo municipal/rodoviário e sociedade civil, mais assentos técnicos (nível superior, medicina, psicologia, meio ambiente, PRF) | [REF-CONTRAN-901-2022] Anexo 5.1, 5.1.2 |
| Quorum de deliberação | **Maioria simples dos integrantes**, observada a paridade de representação                                                                                                                                                                               | [REF-CONTRAN-901-2022] Anexo 12.2       |
| Decisão               | Fundamentada, aprovada por maioria de votos                                                                                                                                                                                                              | [REF-CONTRAN-901-2022] Anexo 12.3       |
| Desempate             | **Voto de qualidade do presidente**                                                                                                                                                                                                                      | [REF-CONTRAN-901-2022] Anexo 12.3       |
| Incompatibilidade     | Vedado a integrante de CETRAN compor JARI (simétrico ao item 4.1.c da Res. 357/2010)                                                                                                                                                                     | [REF-CONTRAN-901-2022] Anexo 5.4        |
| Mandato               | 2 anos, admitidas reconduções; nomeação pelo Governador do Estado                                                                                                                                                                                        | [REF-CONTRAN-901-2022] Anexo 7, 8       |

Isso resolve, em norma nacional, o que [WF-RAIT-003] marcava como `(pendente regimento
CETRAN-AM)` para quorum e desempate. **Permanece pendente** apenas o que a própria Res. 901/2022
delega ao regimento local (periodicidade de reuniões, forma de convocação, pauta, prazo interno
de voto, e se o presidente também vota nominalmente além de desempatar) — e a **sustentação
oral**, que não é mencionada em nenhum ponto da norma nacional. Ver [REF-CONTRAN-901-2022] para o
cotejo completo com a resposta institucional de "19 conselheiros" (ainda não reconciliada — o piso
nacional é 15).

**Verificação.** Ao registrar decisão da JARI e transcorrer a interposição de 2ª instância
([RN-RAIT-103]), o RAIT transita para `REMETIDO_2A_INSTANCIA`, registra `data_remessa_cetran` e
`data_recebimento_cetran` ([RN-RAIT-111]) e mantém o efeito suspensivo de [RN-RAIT-108] até o
encerramento da instância.

**Especificidade local a corrigir.** A carta de serviço exige do cidadão a juntada do **parecer e da
conclusão da JARI** ao recurso ao CETRAN. Esses são documentos **produzidos pelo próprio órgão**;
exigi-los do administrado contraria [REF-CTB-280-290] art. 285 §4º e [REF-CONTRAN-900] art. 5º,
parágrafo único ([RN-RAIT-003], [RN-RAIT-122]). No fluxo digital o RAIT deve **anexar de ofício** o
parecer e a conclusão ao recurso, e nunca condicionar a admissibilidade à juntada pelo cidadão.

**Gaps.** (a) Regimento interno do CETRAN-AM **não localizado** publicamente — existência,
número e ementa do Decreto Estadual AM nº 34.398/2014 **confirmados** por citação verbatim em dois
decretos que o alteram (2026-08-27, ver [REF-DECRETO-34398-2014]); quorum de deliberação e regra
de desempate **resolvidos por norma nacional** (Res. CONTRAN 901/2022, ver tabela acima) — o que
falta do texto do decreto local em si é só o procedimental residual (convocação, pauta, prazo de
voto, sustentação oral). (b) Não há calendário público de sessões do CETRAN-AM.
(c) Sem integração, a data de recebimento pelo CETRAN — marco do relógio de prescrição — depende de
comunicação manual. `_intake/legal-assessment.md`, itens 13 e 14.
