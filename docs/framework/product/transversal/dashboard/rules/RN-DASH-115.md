---
id: RN-DASH-115
title: Relatório anual de gestão da ouvidoria — conteúdo mínimo de quatro itens e publicação integral obrigatória na internet
status: draft
apps: [dashboard, portal]
sources: [REF-LEI-13460-2017]
updated: 2026-08-24
---

**Regra.** A ouvidoria do DETRAN-AM deve **elaborar, anualmente, relatório de gestão**, com conteúdo
mínimo fixado em lei, e esse relatório deve ser **(i) encaminhado à autoridade máxima do órgão e (ii)
disponibilizado integralmente na internet**. A publicação não é ato discricionário nem depende de
pedido: é **transparência ativa por comando expresso**, e é auto-executável — não há regulamento
intermediário a esperar.

**Base legal.** [REF-LEI-13460-2017] arts. 14, II e 15 _(verbatim)_:

> Art. 14. Com vistas à realização de seus objetivos, as ouvidorias deverão: I - receber, analisar e
> responder [...] as manifestações [...]; e II - **elaborar, anualmente, relatório de gestão** [...]
>
> Art. 15. O relatório de gestão [...] deverá indicar, ao menos: I - **o número de manifestações
> recebidas no ano anterior**; II - **os motivos das manifestações**; III - **a análise dos pontos
> recorrentes**; e IV - **as providências adotadas** [...]
> Parágrafo único. O relatório de gestão será: I - encaminhado à autoridade máxima do órgão [...]; e
> **II - disponibilizado integralmente na internet**.

**Periodicidade / prazo.** **Anual**, referente ao **ano anterior**. A lei **não fixa data-limite**
dentro do ano para a elaboração nem para a publicação — é periodicidade sem dia certo. Adotar uma data
interna (ex.: 31 de março, alinhado à prestação de contas) é decisão do órgão e deve ser rotulada como
tal no painel.

**Consequência do descumprimento.** **Não localizada sanção específica.** O dever de publicação é
auto-executável e sua omissão é aferível de fora — é achado típico de controle social e de controle
externo, e também objeto possível de pedido via LAI ([RN-DASH-118]), que converte a omissão em
processo com prazo.

**O que o DASHBOARD deve exibir para provar cumprimento.**

1. **Relógio anual de exercício** com estado `em elaboração → encaminhado à autoridade máxima →
publicado na internet`. Os três estados são distintos e **encaminhar não é publicar** — o
   parágrafo único exige as duas coisas cumulativamente.
2. **URL pública viva.** O estado `publicado` só é legítimo se o painel guardar a **URL** e checar
   periodicamente que ela responde. Relatório publicado e depois removido é descumprimento
   superveniente, e é exatamente o tipo de falha que ninguém percebe sem monitoramento.
3. **Checklist dos quatro incisos do art. 15** como itens verificáveis do relatório, não como texto
   livre: número de manifestações do ano anterior; motivos; análise de recorrência; providências. O
   painel pode **pré-computar os incisos I e II** a partir do próprio acervo de manifestações — e é
   nisso que o DASHBOARD agrega valor real, transformando o relatório de exercício redacional em
   consolidação de dado já existente.
4. **Os números do relatório devem bater com o painel operacional.** Divergência entre o volume de
   manifestações informado no relatório publicado e o registrado no sistema é achado grave — indica
   que o relatório foi construído fora da fonte de verdade.
5. **Histórico de exercícios publicados**, com link para cada ano. A série é, em si, prova de
   regularidade.

**Controvérsia/risco.** _Severidade: baixa._ A Lei 13.460/2017 aplica-se à administração pública
direta e indireta de todos os entes (art. 1º), o que abrange o DETRAN-AM como autarquia estadual —
esta é a **família de deveres próprios com aplicabilidade estadual menos controversa** de todo o
bloco, diferentemente da Lei 14.129/2021 ([RN-DASH-150]). O risco prático é organizacional: a
ouvidoria costuma estar fora da governança do produto, e o painel pode acabar monitorando um
processo sobre o qual a equipe não tem visibilidade de dado.
