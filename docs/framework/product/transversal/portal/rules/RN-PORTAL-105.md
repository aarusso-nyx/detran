---
id: RN-PORTAL-105
title: O canal digital nunca é o único — atendimento presencial preservado e assinatura presencial não recusável
status: draft
apps: [portal]
sources:
  [
    REF-LEI-14129-2021,
    REF-LEI-13460-2017,
    REF-DECRETO-10543-2020,
    REF-CONTRAN-900,
  ]
updated: 2026-08-24
---

**Regra.** A existência do PORTAL **não extingue** nenhuma das vias não digitais de acesso ao serviço,
e o desenho do produto não pode produzir esse efeito por via oblíqua. Três proibições concretas:

1. **Não fechar a via presencial.** Todo serviço ofertado no PORTAL permanece obtenível
   presencialmente. Se um serviço passar a ser oferecido **exclusivamente** no canal digital, isso é
   decisão de política pública — exige ato do órgão e enfrenta a diretriz legal expressa de
   permanência do atendimento presencial; não é escolha de roadmap.
2. **Não recusar assinatura presencial.** Uma peça assinada de próprio punho e protocolada no balcão,
   ou remetida pelos Correios, é válida ainda que exista fluxo digital equivalente. O nível mínimo de
   assinatura eletrônica de [RN-PORTAL-101] é oponível ao **ato eletrônico**, jamais ao ato
   presencial.
3. **Não degradar o não digital.** O caso que nasceu no balcão ou pelos Correios tem o **mesmo**
   estado, os mesmos prazos e a mesma visibilidade que o nascido no PORTAL. O PORTAL é a fonte única
   de verdade do status para o cidadão, mesmo quando não foi o canal de entrada ([JRN-RAIT-003];
   `_intake/ux-notes.md` §e, anti-padrão 3).

**Base legal.**

- [REF-LEI-14129-2021] art. 3º, XVI: princípio e diretriz do Governo Digital é _"a permanência da
  possibilidade de atendimento presencial"_.
- [REF-DECRETO-10543-2020] art. 4º, § 2º: _"A exigência de níveis mínimos de assinatura eletrônica
  **não poderá ser invocada como fundamento para a não aceitação de assinaturas realizadas
  presencialmente** ou derivadas de procedimentos presenciais para a identificação do interessado."_
- [REF-CONTRAN-900] art. 6º, _caput_ e § 1º: a defesa ou o recurso _"deverá ser protocolado no órgão
  ou entidade de trânsito autuador ou enviado, via postal, para o seu endereço"_, com marcos de
  tempestividade próprios por canal (data de entrega na ECT; data de protocolo no órgão do domicílio);
  § 4º: a protocolização eletrônica é uma **faculdade** do órgão (_"poderá ser feita por meio
  eletrônico, desde que disponibilizado"_), acrescentada às vias do _caput_, não substitutiva delas.
- [REF-LEI-13460-2017] art. 5º, I e IV: direito à _"acessibilidade [...] no atendimento"_ e vedação
  de _"exigências, obrigações, restrições e sanções não previstas na legislação"_ — exigir canal
  digital onde a norma admite postal/presencial é restrição sem base legal.

**Verificação.** (a) Nenhuma tela do PORTAL pode afirmar que um serviço "só pode ser feito pelo
aplicativo/site"; onde houver via presencial ou postal, a tela a informa, com endereço e horário
([RN-PORTAL-108] exige que essa informação exista na Carta de Serviços). (b) O modelo de dados do
processo carrega `canal_entrada ∈ {portal, sne, protocolo_virtual, balcao, postal}` com o marco de
tempestividade correspondente ([RN-RAIT-106]), e o PORTAL exibe o histórico completo do caso
qualquer que seja o canal. (c) Teste negativo: um caso com `canal_entrada = balcao` deve aparecer em
"Meus processos" com a mesma linha do tempo de um caso digital.

**Controvérsia/risco.** O fundamento mais forte do item 1 — art. 3º, XVI da Lei 14.129/2021 — depende
da adesão estadual não confirmada ([RN-PORTAL-106]). O item 2, ao contrário, tem base em decreto
federal que também não vincula o DETRAN-AM diretamente ([RN-PORTAL-101], "Controvérsia/risco"), mas
não precisa dela: se o Decreto 10.543/2020 não obriga o DETRAN-AM, então o DETRAN-AM **também não
tem, por ele, autorização para exigir nível de assinatura** — e a recusa da via presencial fica
igualmente sem fundamento. Nos dois cenários de aplicabilidade a conclusão é a mesma; muda apenas o
caminho. O item 3 não depende de nenhuma das duas normas: decorre diretamente do
[REF-CONTRAN-900] art. 6º, § 3º (_"deverão ser imediatamente remetidos ao órgão ou entidade que
efetuou a autuação"_) e da unicidade do processo administrativo.
