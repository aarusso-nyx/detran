---
id: RN-RAIT-136
title: Retenção e eliminação do caso RAIT — término do tratamento no encerramento; conservação ancorada no prazo de prescrição quinquenal, não indefinida
status: draft
apps: [rait, dashboard]
sources: [REF-LEI-13709-2018, REF-LEI-9873-1999]
updated: 2026-08-26
---

**Regra.** Nenhuma norma ou artefato deste corpus define por quanto tempo o RAIT deve conservar um
caso após seu encerramento (`TRANSITADO`, `ENCERRADO_DESISTENCIA` — [WF-RAIT-001]). É o mesmo
padrão de lacuna identificado no BOAT, onde a marcação de fato do modelo de dados era
`"retention": "forever"` sem fundamento (`[RN-BOAT-125]`) — juridicamente insustentável, porque a
LGPD faz da **eliminação a regra** e da conservação a **exceção condicionada**. Diferente do BOAT,
o RAIT ainda não tem essa marcação de fato para corrigir — é oportunidade de desenhar corretamente
desde já, em vez de corrigir depois.

**Base legal.**

- [REF-LEI-13709-2018] art. 15, I e II: o tratamento termina quando _"a finalidade foi alcançada"_
  ou no _"fim do período de tratamento"_. Para o RAIT, a finalidade (decidir o requerimento) é
  alcançada no encerramento do caso — os estados terminais de [WF-RAIT-001].
- [REF-LEI-13709-2018] art. 16, I: conservação após o término é autorizada para _"cumprimento de
  obrigação legal ou regulatória pelo controlador"_ — a hipótese aplicável aqui, pelo mesmo
  raciocínio de [RN-RAIT-133]. **Não é permissão para reter indefinidamente**: a obrigação legal que
  a sustenta tem, ela própria, um horizonte temporal.
- [REF-LEI-9873-1999] art. 1º, _caput_: prescrição quinquenal da ação punitiva da Administração —
  já adotada neste corpus como um dos relógios de extinção do RAIT ([RN-RAIT-113]). É o prazo mais
  próximo, no próprio domínio, de uma resposta normativa a "até quando o órgão ainda pode precisar
  deste caso".

**Posição prudencial adotada (interpretação, não conclusão).**

1. **Retenção identificada, com prazo, ancorada no relógio de 5 anos já modelado.** Enquanto o
   caso puder, em tese, ainda ser objeto de controle, revisão judicial ou nova exigência do próprio
   requerente (ex. pedido de certidão do desfecho), a conservação identificada é sustentável sob o
   art. 16, I. Usar como âncora de trabalho o prazo de 5 anos do art. 1º, _caput_ da Lei 9.873/1999
   ([RN-RAIT-113]) — não porque a lei fixe esse prazo para retenção de dado (ela não fixa), mas
   porque é o único horizonte temporal com base legal já reconhecido neste domínio, evitando
   inventar um prazo sem qualquer âncora.
2. **Após o prazo, duas camadas — não uma.** Dado identificado além desse horizonte deveria ser
   anonimizado; o registro estatístico (contagem de casos, tempo de tramitação, taxa de provimento,
   consumido pelo [APP-DASHBOARD]) permanece sem prazo, porque deixou de ser dado pessoal (art. 12).
   Mesmo padrão de duas camadas já adotado em [RN-BOAT-125] para o BOAT.
3. **O dado do procurador ([RN-RAIT-135]) pode ter horizonte de retenção diferente do dado do
   processo**, se a prática de "dispensar novo reconhecimento" implicar guarda para além de um
   único caso — tratado separadamente naquela regra, não aqui.

**Verificação.** (a) Hoje não existe mecanismo de expurgo ou anonimização de caso RAIT encerrado —
é greenfield, sem regressão a corrigir. (b) Qualquer modelo de dados do RAIT deve registrar a data
de encerramento do caso como gatilho do relógio de retenção, do mesmo modo que já registra as
datas que disparam os relógios de prescrição/decadência ([WF-RAIT-001] §Relógios de extinção). (c)
O DASHBOARD deve consumir exclusivamente a camada estatística anonimizada para qualquer exposição
agregada além do prazo de retenção identificada — mesma disciplina de reidentificação já adotada
em [RN-DASH-160]-[RN-DASH-172].

**Controvérsia/risco.** _Severidade: MÉDIA-ALTA — mesmo grau do achado equivalente no BOAT._ O
prazo de 5 anos é **proposta de trabalho**, não posição validada: é defensável um prazo maior,
alinhado à prática documental administrativa geral (não identificada em nenhuma fonte deste
corpus) ou ao prazo de guarda de processo administrativo que sirva de prova em eventual disputa
judicial posterior ao encerramento — horizonte tipicamente mais longo que 5 anos no direito
brasileiro, e não pesquisado nesta rodada. Precisa de validação jurídica antes de qualquer
implementação de expurgo automático. Ver `_meta/open-issues.md` (DT-052) e
`_meta/lgpd-assessment.md` §RAIT.
