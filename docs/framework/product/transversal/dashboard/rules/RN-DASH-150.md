---
id: RN-DASH-150
title: Escopo dos normativos federais de dados abertos e governo digital sobre uma autarquia estadual — o que vincula e o que é boa prática
status: draft
apps: [dashboard, portal]
sources:
  [
    REF-DECRETO-8777-2016,
    REF-LEI-14129-2021,
    REF-LEI-12527-2011,
    REF-LEI-13460-2017,
  ]
updated: 2026-08-24
---

**Regra.** Antes de aplicar qualquer requisito de dados abertos ou de governo digital ao DASHBOARD é
obrigatório resolver a **questão de escopo federativo**, porque os três instrumentos disponíveis têm
alcances **diferentes** sobre o DETRAN-AM — e tratar os três como se fossem um só é o erro jurídico
mais provável deste bloco.

| Instrumento                                        | Alcance sobre o DETRAN-AM                                                                                                                                                                       | Status                      |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| **LAI — Lei 12.527/2011**                          | **Vincula.** Aplica-se, por comando próprio, à administração direta e indireta de **todos** os entes federados                                                                                  | **Obrigação direta**        |
| **Lei 13.460/2017** (usuário de serviços públicos) | **Vincula.** Alcance nacional expresso                                                                                                                                                          | **Obrigação direta**        |
| **Decreto 8.777/2016** (Política de Dados Abertos) | **Não vincula.** É decreto **do Poder Executivo federal**, hierarquicamente inferior a lei e limitado à esfera federal                                                                          | **Referência técnica**      |
| **Lei 14.129/2021** (Governo Digital)              | **Condicional.** Só se aplica às administrações dos demais entes _"desde que adotem os comandos desta Lei por meio de atos normativos próprios"_ — **ato de adesão do Amazonas não localizado** | **Pendente de verificação** |

Consequência prática: o módulo de dados abertos do DASHBOARD deve ser ancorado **primariamente na
LAI** (art. 8º, § 3º, II-IV — exportação em formato aberto, acesso automatizado legível por máquina,
divulgação dos formatos), que vincula sem condicionante, e tratar o Decreto 8.777/2016 e os arts.
29-32 da Lei 14.129/2021 como **detalhamento técnico de altíssima qualidade e boa prática fortemente
recomendada** — não como fonte de obrigação autônoma. Se o ato estadual de adesão for localizado, a
Lei 14.129/2021 sobe para "obrigação direta" e o bloco inteiro ganha base mais robusta.

**Base legal.**

- [REF-LEI-14129-2021] art. 2º _(verbatim)_:
  > Art. 2º Esta Lei aplica-se: I - aos órgãos da administração pública direta federal [...]; II - às
  > entidades da administração pública indireta federal [...]; e **III - às administrações diretas e
  > indiretas dos demais entes federados, nos termos dos incisos I e II do caput deste artigo, desde
  > que adotem os comandos desta Lei por meio de atos normativos próprios.**
  > § 2º As referências feitas nesta Lei [...] a Estados, Municípios e ao Distrito Federal são cabíveis
  > **somente na hipótese de ter sido cumprido o requisito previsto no inciso III** [...]
- [REF-DECRETO-8777-2016] art. 1º: _"Fica instituída a Política de Dados Abertos **do Poder Executivo
  federal**"_; art. 10: o monitoramento compete à **CGU** — órgão de controle interno **da União**.
  A anotação do próprio REF é explícita: _"hierarquicamente inferior à Lei 14.129/2021 e federal (não
  vincula automaticamente o DETRAN-AM, estadual)"_.
- [REF-LEI-12527-2011] art. 8º, § 3º, II-IV: a exigência de **formato aberto, não proprietário,
  estruturado e legível por máquina** existe **dentro da LAI** — que vincula. É esta a âncora segura.

**Verificação.**

1. **Rotular a fonte de cada requisito.** Todo requisito técnico do módulo de dados abertos deve
   carregar sua base: `LAI art. 8º §3º` (vinculante) ou `Lei 14.129 art. 29` / `Decreto 8.777`
   (referência). Sem esse rótulo, o corpus perde a capacidade de responder "isso é obrigatório?".
2. **Não afirmar obrigação condicional como se fosse incondicional.** Enquanto a adesão estadual não
   for confirmada, nenhuma regra deste corpus pode dizer "o DETRAN-AM deve, nos termos da Lei
   14.129/2021". A formulação correta é "recomenda-se, alinhado à Lei 14.129/2021 e ao dever geral de
   publicidade do art. 37 da CF/88".
3. **A pesquisa do ato de adesão é item de alta prioridade** — não é curiosidade acadêmica: dela
   depende a base legal do **art. 22** (o único dispositivo do corpus que nomeia um painel de
   monitoramento como componente obrigatório) e, no PORTAL, a elevação estatutária do princípio do
   "uso único". Ver `_intake/legal-assessment.md`.
4. **Ausência de adesão não é permissão para não publicar.** A LAI, sozinha, já impõe transparência
   ativa, formato aberto e acesso automatizado. A adesão à Lei 14.129/2021 melhora a base; não a cria.

**Controvérsia/risco.** _Severidade: alta — é o risco de escopo mais estruturante do bloco de deveres
próprios._ O erro típico seria construir o módulo público inteiro sobre os arts. 20-22 e 29-32 da Lei
14.129/2021 e descobrir, em parecer, que o Amazonas nunca editou o ato de adesão — caso em que o
módulo perde sua âncora nominal, ainda que permaneça defensável pela LAI. A mitigação é de
arquitetura documental: **ancorar na LAI, citar a Lei 14.129 como convergência**. Assim, a resposta ao
parecer é "muda a citação", não "muda o produto".
