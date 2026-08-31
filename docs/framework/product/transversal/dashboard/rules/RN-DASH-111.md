---
id: RN-DASH-111
title: Relatório mensal de arrecadação por cartão — o único dever periódico do corpus com sanção expressa
status: draft
apps: [dashboard, rait]
sources: [REF-CONTRAN-918]
updated: 2026-08-24
---

**Regra.** Se o DETRAN-AM adotar a arrecadação de multas por **cartão de débito ou crédito**, passa a
dever **encaminhar relatórios mensais** ao órgão máximo executivo de trânsito da União, contendo o
**montante arrecadado de forma discriminada**, para controle dos repasses ao FUNSET. É o **único
dever periódico de todo o corpus DETRAN pesquisado cuja norma comina consequência expressa ao
descumprimento**: a **suspensão da autorização** para admitir aquele meio de pagamento. Isso muda a
natureza do alerta — aqui o painel não monitora um dever moral de pontualidade, monitora a
**precondição de continuidade de um canal de arrecadação em produção**.

**Base legal.** [REF-CONTRAN-918] art. 27, §§ 6º e 7º _(verbatim)_:

> § 6º Os órgãos arrecadadores que adotarem essa modalidade de arrecadação de multas por meio de
> cartões de débito ou crédito deverão **encaminhar relatórios mensais** ao órgão máximo executivo de
> trânsito da União, contendo o **montante arrecadado de forma discriminada**, para fins de controle
> dos repasses relativos ao FUNSET.
> § 7º **Na ausência de prestação de contas a que se refere o § 6º, o órgão máximo executivo de
> trânsito da União poderá suspender a autorização** para que os órgãos arrecadadores admitam o
> pagamento parcelado ou à vista de multas de trânsito por meio de cartões de débito ou crédito.

Precondição do dever — [REF-CONTRAN-918] art. 27, §§ 1º-2º: a modalidade depende de **autorização
prévia** solicitada ao órgão máximo executivo da União e expedida _"por meio de ofício ao dirigente
máximo da entidade solicitante"_. O dever do § 6º nasce **com a adoção da modalidade**, não com a
autuação.

**Periodicidade / prazo.** **Mensal.** A norma **não fixa dia-limite** dentro do mês — diferentemente
do art. 26 ([RN-DASH-110]). Adotar o dia 20 por analogia ao art. 26 é **decisão de política interna
do órgão**, defensável e recomendável (mesmo ciclo de conciliação FUNSET), mas deve ser rotulada no
painel como _prazo interno adotado_, jamais como prazo legal — mesma disciplina de honestidade
adotada em [RN-BOAT-106] para o vazio normativo do RENAEST.

**Consequência do descumprimento.** **Suspensão da autorização** para admitir pagamento por cartão
(§ 7º). Note-se a redação: _"poderá suspender"_ — é competência discricionária do órgão federal, não
efeito automático. Ainda assim é a **sanção mais concreta localizada em todo o corpus** e a única com
efeito operacional imediato e visível ao cidadão (canal de pagamento indisponível).

**O que o DASHBOARD deve exibir para provar cumprimento.**

1. **Gatilho de aplicabilidade explícito**: o painel exibe primeiro _se_ a modalidade cartão está
   autorizada e ativa. Se não estiver, o relógio aparece como **"não aplicável — modalidade não
   adotada"**, com referência ao ofício de autorização (ou à sua ausência). Um relógio silenciosamente
   ausente é indistinguível de um relógio esquecido.
2. **Relógio mensal** com estado por competência, idêntico em mecânica ao de [RN-DASH-110], porém com
   **rótulo de severidade elevado**: o vencimento não gera apenas atraso, gera exposição a suspensão
   de canal. A escada de alerta deve escalar para o **dirigente máximo** — é ele o interlocutor
   nomeado da autorização (§ 2º).
3. **Discriminação do montante**, e não apenas total: o § 6º exige o montante _"de forma
   discriminada"_. O painel deve evidenciar que a discriminação existe (por modalidade — débito,
   crédito à vista, crédito parcelado — e por competência), porque um relatório enviado sem
   discriminação é envio, mas não é cumprimento.
4. **Indicador de risco de suspensão**: número de competências em aberto ou atrasadas. Duas ou mais
   competências pendentes devem ser tratadas como incidente, não como pendência.
5. **Efeito cruzado com [RN-DASH-112]**: o relatório é meio de controle do **repasse dos 5%**. Um
   relatório em dia com repasse divergente é conformidade formal com inconformidade material — e o
   painel deve conseguir mostrar as duas coisas separadamente.

**Controvérsia/risco.** _Severidade: baixa-média._ Se o DETRAN-AM **não** opera cartão hoje, esta
regra é dormente — mas deve permanecer modelada, porque a adoção da modalidade é decisão de negócio
frequente e o dever nasce junto com ela, sem período de graça. O risco real é implantar o canal de
pagamento sem implantar simultaneamente o relatório mensal.
