---
id: JRN-DASH-006
title: Gestor compara unidades e circuitos sem transformar pessoas em ranking punitivo
status: draft
apps: [dashboard, rait, boat]
sources: [WF-RAIT-002, RN-BOAT-004, JRN-BOAT-004]
updated: 2026-08-24
---

## Persona e contexto

Roberto é Gestor DETRAN, com visão cross-tenant. Uma vez por mês ele precisa comparar o
desempenho de unidades e circuitos — quantos processos cada pool do RAIT está julgando dentro do
prazo, quantos sinistros cada unidade de campo do BOAT está registrando com dado completo. O
propósito legítimo dessa comparação é identificar onde investir treinamento, redistribuir carga,
ou revisar um processo mal desenhado. O risco — e é aqui que o desenho do DASHBOARD precisa ser
deliberado — é que a mesma comparação, exibida sem cuidado, vire um ranking que pressiona pessoas
a julgar mais rápido em vez de melhor, ou a registrar mais rápido em vez de completo. O próprio
corpus já registrou esse risco: [JRN-BOAT-004] descreve o painel de qualidade de Renato como
"pedagógico, não punitivo... para retroalimentar o treinamento de field-agents, não gerar uma
lista de 'atrasados'".

## Narrativa ponta-a-ponta

1. **A tela nunca abre em ranking.** Roberto não vê uma lista ordenada de "melhor para pior"
   assim que entra — vê uma distribuição (quantas unidades estão dentro da faixa esperada, quantas
   fora) antes de qualquer comparação nomeada. A primeira leitura é sobre o sistema como um todo,
   não sobre quem está no topo ou na base.
2. **Quando ele pede o detalhe por unidade, o contexto vem junto com o número.** Uma unidade do
   BOAT com taxa de `pending_complement` acima da média aparece ao lado do volume que ela
   processa e da composição da equipe (rotatividade recente, por exemplo) — nunca o número
   isolado, que convida à leitura mais simples e mais injusta ("essa unidade é pior").
3. **Produtividade nunca aparece sozinha — sempre pareada com qualidade.** No RAIT, o mecanismo
   de accountability de [WF-RAIT-002] §5 (`ADVERTIDO`→`AFASTADO_TEMP`, modelo CETRAN-ES) existe
   para atraso reincidente na relatoria — mas o DASHBOARD nunca apresenta "casos julgados por
   relator" como métrica isolada de mérito, porque isso incentivaria decisões apressadas. Volume
   de julgamento só aparece ao lado de indicador de qualidade (taxa de decisão anulada em
   instância superior, quando existir esse dado) — nunca um sem o outro.
4. **Nenhum indicador individual nomeado é exposto fora do canal de gestão direta.** Roberto pode
   ver o desempenho agregado de um pool ou de uma unidade; o desempenho de uma pessoa física
   específica (um relator, um agente de campo) fica num nível de acesso mais restrito, com
   finalidade declarada — o mesmo princípio de revelação auditada já usado para dado sensível de
   saúde (ver `ux-notes.md` §e), aplicado aqui a dado de desempenho individual.
5. **"Correr para julgar sem instruir" é um padrão que o painel precisa conseguir mostrar, não
   esconder atrás de um número de produtividade alto.** Se uma unidade decide rápido mas com alta
   taxa de diligência reaberta ou decisão revertida depois, o DASHBOARD expõe esse padrão junto —
   velocidade sem qualidade aparece como alerta de processo, não como destaque de desempenho.
6. **A conversa que a tela habilita é "o que essa unidade precisa", não "quem é o pior".** Quando
   Roberto identifica uma unidade fora da faixa esperada, a ação sugerida pelo desenho da tela é
   abrir um plano de apoio/treinamento — não existe, no DASHBOARD, um botão de ação disciplinar
   diretamente vinculado ao ranking, porque essa vinculação automática é exatamente o incentivo
   perverso que a jornada busca evitar.

## Pontos de contato (apps/canais)

DASHBOARD (visão agregada e comparativa, cross-domínio); RAIT/BOAT (contexto operacional de
apoio, quando Roberto decide investigar uma unidade específica); canal de gestão de pessoas (fora
do sistema, para qualquer desdobramento disciplinar).

## Métricas de sucesso

Nenhum indicador de produtividade exibido sem indicador de qualidade pareado; zero ranking nomeado
de indivíduos acessível fora do canal de gestão direta; adoção de planos de apoio/treinamento
originados de uma leitura do painel (sinal de que a tela está gerando ação construtiva, não
ansiedade de ranking).
