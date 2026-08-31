---
id: RN-PORTAL-106
title: Princípio do uso único — o PORTAL nunca exige prova de fato que o órgão já detém; três camadas de fundamento, com forças diferentes
status: draft
apps: [portal, rait, teat, boat, pec]
sources:
  [
    REF-LEI-14129-2021,
    REF-LEI-13460-2017,
    REF-CONTRAN-900,
    REF-CTB-280-290,
    REF-CONTRAN-918,
  ]
updated: 2026-08-24
---

**Regra.** O PORTAL **não pede ao cidadão prova de fato que o órgão já possui**, nem documento que o
próprio órgão emitiu, nem informação que ele pode obter por interoperabilidade. A regra é vinculante,
mas o seu **fundamento tem três camadas de força desigual** — e a distinção não é acadêmica: ela
decide o que é exigível hoje e o que depende de uma confirmação jurídica pendente.

| Camada                                | Norma                                                                               | Alcance                                                                                                                                                            | Vincula o DETRAN-AM hoje?                                                                                                                                                         |
| ------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Setorial — a mais forte**        | [REF-CTB-280-290] art. 285, § 4º (lei) e [REF-CONTRAN-900] art. 5º, parágrafo único | Documento **emitido pelo órgão autuador**, em qualquer fase, para efeitos de admissibilidade de defesa/recurso                                                     | **Sim, sem ressalva.** É lei federal de trânsito, matéria de competência privativa da União, aplicável a todo órgão do SNT                                                        |
| **2. Geral do usuário**               | [REF-LEI-13460-2017] art. 5º, XV                                                    | Vedação de **nova prova sobre fato já comprovado** em documentação válida apresentada, em qualquer serviço público                                                 | **Sim.** A Lei 13.460/2017 alcança os entes federados por força do seu art. 1º, § 1º, sem cláusula de adesão                                                                      |
| **3. Governo Digital — a mais ampla** | [REF-LEI-14129-2021] art. 3º, XIII e art. 24, IV-V                                  | Vedação de exigir prova de fato já comprovado **por qualquer documento ou informação válida**, mais o dever positivo de eliminar exigências por interoperabilidade | **Condicionado.** Art. 2º, III: só alcança Estados _"desde que adotem os comandos desta Lei por meio de atos normativos próprios"_ — ato de adesão do Amazonas **não localizado** |

**Leitura consolidada.** A camada 3 é a mais generosa (fala de _fato já comprovado_, não apenas de
documento do órgão) e é a que sustenta o dever **positivo** de buscar o dado por interoperabilidade
em vez de pedi-lo. Ela é, porém, a única cuja aplicabilidade ao DETRAN-AM está em aberto. As camadas
1 e 2 vinculam independentemente, e já bastam para o núcleo operacional do PORTAL — a trilha de
multas está inteiramente coberta pela camada 1, que é **lei**. Em nenhuma hipótese, portanto, o
PORTAL pode pedir de volta NA, NP, AIT, parecer ou conclusão da JARI; o que fica pendente da
confirmação de adesão é a extensão da regra a **fatos** provados por documentos de **terceiros**
(certidões, comprovantes de residência, documentos de outros órgãos).

**Base legal.**

- [REF-CTB-280-290] art. 285, § 4º _(Incluído pela Lei nº 14.071, de 2020)_: _"Na apresentação de
  defesa ou recurso, em qualquer fase do processo, para efeitos de admissibilidade, não serão
  exigidos documentos ou cópia de documentos emitidos pelo órgão responsável pela autuação."_
- [REF-CONTRAN-900] art. 5º, parágrafo único: texto idêntico, em nível de resolução.
- [REF-LEI-13460-2017] art. 5º, XV: direito do usuário à _"vedação da exigência de nova prova sobre
  fato já comprovado em documentação válida apresentada"_.
- [REF-LEI-14129-2021] art. 3º, XIII: _"a vedação de exigência de prova de fato já comprovado pela
  apresentação de documento ou de informação válida"_; art. 24: os órgãos deverão _"IV - eliminar,
  inclusive por meio da interoperabilidade de dados, as exigências desnecessárias ao usuário quanto à
  apresentação de informações e de documentos comprobatórios prescindíveis; V - eliminar a replicação
  de registros de dados, exceto por razões de desempenho ou de segurança"_.
- [REF-LEI-14129-2021] art. 2º, III e § 2º: _"III - às administrações diretas e indiretas dos demais
  entes federados [...] **desde que adotem os comandos desta Lei por meio de atos normativos
  próprios**"_; § 2º: _"As referências feitas nesta Lei [...] a Estados, Municípios e ao Distrito
  Federal são cabíveis somente na hipótese de ter sido cumprido o requisito previsto no inciso III"_.
- Tensão interna já anotada em [REF-CONTRAN-900]: o art. 5º, II lista como documento a apresentar a
  _"cópia da notificação de autuação ou notificação da penalidade"_ — documento do próprio órgão. A
  leitura harmônica, reforçada pelo art. 285, § 4º do CTB (norma de **lei**, prevalente), é que o
  inciso II descreve o que **pode ser juntado** para identificar o processo, não o que **pode ser
  exigido**. Basta placa + número do AIT.

**Verificação.** Ver [RN-PORTAL-107] para os testes operacionais. Aqui, o teste de fundamento: toda
exigência documental do PORTAL carrega o rótulo da camada que a autoriza a existir
(`fundamento_exigencia`), e nenhuma exigência pode existir sem esse rótulo. Exigência sem camada é
**bug de conteúdo**, não escolha de copywriting — formulação já adotada em `_intake/ux-notes.md` §e,
anti-padrão 5.

**Decisão registrada.** A exigência publicada na carta de serviço "Recurso ao CETRAN-AM" de que o
cidadão junte **parecer e conclusão da JARI** é _contra legem_ pela camada 1
([REF-DETRANAM-SERVICOS]). Owner autorizou a correção imediata em `_meta/steering.md` D.28
(2026-08-24), sem aguardar validação jurídica formal. O RAIT anexa esses documentos **de ofício**
([RN-RAIT-003], [RN-RAIT-117], [RN-RAIT-122]).

**Controvérsia/risco (o item nº 1 desta rodada).** A adesão do Estado do Amazonas à Lei 14.129/2021
**não foi localizada** por esta pesquisa. Três observações para o parecerista:

1. **É achado negativo, não prova de inexistência.** Um decreto estadual de adesão pode existir e não
   ter sido indexado. A verificação é barata (consulta ao Diário Oficial do Estado / Procuradoria) e
   destrava toda a camada 3.
2. **A ausência de adesão não torna a camada 3 irrelevante.** Ela permanece como parâmetro
   fortemente recomendável e alinhado ao art. 37 da CF/88 — e, sobretudo, o **conteúdo** do art. 3º,
   XIII já está, em versão mais estreita, no art. 5º, XV da Lei 13.460/2017, que vincula. O que a
   camada 3 acrescenta de próprio é o dever **positivo** de interoperar (art. 24, IV-V), não a
   vedação em si.
3. **Efeito sobre [RN-RAIT-003].** O dossiê de pesquisa propôs elevar aquela regra de "prática
   recomendada" a "dever estatutário" com base na Lei 14.129/2021. A elevação é **desnecessária**:
   [RN-RAIT-003] já tinha, desde sempre, fundamento de **lei** no art. 285, § 4º do CTB — que a
   captura original citava apenas por meio da resolução. A correção a fazer em [RN-RAIT-003] não é
   de status, é de **base legal**: acrescentar o dispositivo do CTB ao lado da Res. 900.

Item 1 de `_intake/legal-assessment.md`.
