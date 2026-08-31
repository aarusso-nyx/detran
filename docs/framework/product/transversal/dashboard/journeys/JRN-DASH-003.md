---
id: JRN-DASH-003
title: Responsável pela prestação de contas na véspera do dia 20 — preparar, submeter, comprovar
status: draft
apps: [dashboard]
sources: [REF-CONTRAN-918, REF-LEI-13460-2017, REF-LEI-12527-2011]
updated: 2026-08-24
---

## Persona e contexto

Cristiane é a responsável, na área administrativo-financeira do DETRAN-AM, por prestar contas da
arrecadação de multas ao órgão máximo executivo de trânsito da União — dever com prazo explícito:
**até o 20º dia do mês subsequente ao da arrecadação** ([REF-CONTRAN-918] art. 26). É um dever
estruturalmente diferente dos relógios de prescrição que Aline acompanha ([JRN-DASH-002]): não
existe processo individual em risco, existe uma **obrigação periódica do próprio órgão**, que se
repete todo mês e cuja falha não extingue direito de ninguém — mas expõe o DETRAN-AM a
responsabilização institucional e, no caso do relatório de cartão do art. 27 §6º, a **suspensão
da autorização de pagamento parcelado/à vista por cartão** (art. 27 §7º) — uma consequência
concreta, não hipotética.

## Narrativa ponta-a-ponta

1. **Dia 15, cinco dias antes do vencimento.** O DASHBOARD mostra o dever de prestação de contas
   do mês ainda em `JANELA_ABERTA` ([WF-DASH-002]), já com alerta de aproximação de data-limite
   aberto na trilha de irregularidade de [WF-DASH-001] — não porque algo deu errado, mas porque
   é o marco de preparação da escada
   proposta para deveres periódicos (paridade com [WF-RAIT-002] §4, adaptada a um ciclo mensal em
   vez de um teto de anos). O card mostra a data-limite (dia 20), a base legal (art. 26) e o status
   de preparação: dados ainda não consolidados.
2. **Cristiane consolida os dados de arrecadação.** Essa etapa acontece fora do DASHBOARD, nos
   sistemas de origem — o painel não substitui o trabalho, apenas acompanha se ele está
   acontecendo dentro do tempo necessário para não colidir com o prazo.
3. **Dia 18, o card muda para `PREPARADO`.** Cristiane registra que o relatório está
   consolidado. O DASHBOARD não considera isso "cumprido" — a diferença entre "preparado" e
   "cumprido" é intencional: um dever periódico só está cumprido quando existe **comprovante de
   envio**, nunca apenas uma marcação manual de "feito" (ver `ux-notes.md` §d, honestidade do
   dado).
4. **Dia 19, ela submete ao canal do órgão federal.** O ato de submissão gera um comprovante
   (protocolo, recibo, ou equivalente) que o DASHBOARD anexa ao card — o estado passa a
   `SUBMETIDO_PUBLICADO` e, só com o comprovante arquivado, a `COMPROVADO` ([WF-DASH-002]). Se o canal de submissão falhar ou não gerar comprovante, o card
   permanece em alerta, mesmo que Cristiane "ache" que enviou.
5. **Dia 20, o teto.** Se por qualquer razão o comprovante não existir até o fim do dia, o card
   muda para um estado vermelho distinto de todos os outros vermelhos do DASHBOARD — não é risco
   de extinção de direito de terceiro (como no RAIT), é **descumprimento de dever do próprio
   órgão**, com a consequência específica já prevista em norma para o relatório de cartão
   (suspensão da autorização, art. 27 §7º) citada explicitamente no card, não escondida atrás de
   um rótulo genérico de "atrasado".
6. **Mês seguinte — o ciclo reabre, sem herdar o histórico como desculpa.** Um mês cumprido no
   prazo não dá margem para atraso no mês seguinte; o DASHBOARD trata cada ciclo como
   independente, e mantém visível o histórico de cumprimento (útil para auditoria, ver
   [JRN-DASH-005]) sem deixar esse histórico suavizar a urgência do ciclo corrente.
7. **Deveres irmãos, mesmo padrão.** O mesmo desenho se replica para os outros deveres periódicos
   compilados no dossiê de pesquisa — resposta à LAI em 20+10 dias ([REF-LEI-12527-2011] art. 11),
   resposta da ouvidoria em 30+30 dias, relatório anual de gestão da ouvidoria
   ([REF-LEI-13460-2017] arts. 15-16) — cada um como uma linha própria no catálogo de indicadores
   do DASHBOARD (forward reference — catálogo em elaboração paralela pelo BPO), com seu próprio
   prazo, sua própria base legal e sua própria consequência (quando localizada) ou a marcação
   explícita "consequência não localizada" quando não houver.

## Pontos de contato (apps/canais)

DASHBOARD (card do dever periódico, ciclo de preparação→submissão→comprovação); canal externo de
submissão ao órgão federal (fora do sistema, apenas o comprovante retorna ao DASHBOARD).

## Métricas de sucesso

100% dos ciclos mensais com comprovante de envio registrado até o vencimento; zero dever marcado
"cumprido" sem comprovante anexado; tempo médio entre o marco de preparação (dia 15) e a submissão
efetiva — sinal de folga real, não apenas de sorte; para cada linha do catálogo de deveres, se a
consequência de descumprimento existe na norma, ela aparece no card; se não existe, o card diz
isso explicitamente em vez de inventar uma.
