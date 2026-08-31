---
id: JRN-DASH-001
title: Operador de monitoramento abre o turno — triagem de alertas, não mural de números
status: draft
apps: [dashboard, rait, pec, boat, teat]
sources: [WF-RAIT-002, RN-PEC-112, RN-BOAT-004, RN-PEC-008]
updated: 2026-08-24
---

## Persona e contexto

Marcos é operador de monitoramento do DASHBOARD — não julga nenhum caso, não decide nenhuma
penalidade, não designa nenhuma junta. Seu trabalho é abrir o console às 7h, antes de qualquer
gestor de área chegar, e responder uma única pergunta para cada domínio: **o que cruzou uma linha
esta noite e precisa de um dono agora?** Se a tela inicial fosse um mural de números — "1.204
processos ativos no RAIT, 87 sinistros no BOAT, 342 encontros no PEC" — Marcos não teria como
agir: números absolutos não dizem o que fazer. O desenho do DASHBOARD parte do princípio inverso:
a tela de abertura é uma **lista de ações pendentes com dono**, não um resumo estatístico.

## Narrativa ponta-a-ponta

1. **Login, sem gráfico antes da lista.** A primeira coisa que Marcos vê não é um dashboard de
   BI — é uma fila ordenada por severidade combinada (legal × operacional × técnica, ver
   `ux-notes.md` §c). Cada linha é um alerta que cruzou um limiar definido em algum WF do
   ecossistema — nunca um número que Marcos precisaria interpretar sozinho.
2. **RAIT: três processos entraram em `ALERTA_N3` esta noite.** A escada de [WF-RAIT-002] §4.1
   marca 21 meses (87,5% do teto de 24 meses do art. 289-A) como o gatilho de escalonamento ao
   gestor. Marcos não abre o processo — ele confirma que a notificação automática chegou ao
   gestor RAIT e registra a confirmação; se não chegou, ele mesmo aciona.
3. **PEC: um prazo do órgão está a 90% consumido.** Um caso de junta médica está a 13 dos 15 dias
   úteis para designação ([RN-PEC-112] item 2, marco 90% proposto por paridade com a escada
   RAIT). Marcos sabe, pela tela, que esse é um "prazo do órgão sem sanção expressa" — mas que o
   bloqueio de cadastro nacional ([RN-PEC-106]) segue ativo enquanto o candidato espera. A
   ausência de sanção não vira ausência de urgência na tela.
4. **BOAT: taxa de `pending_complement` subiu acima da faixa normal numa unidade.** Diferente dos
   dois itens acima, aqui não há teto legal ([RN-BOAT-004]) — é um sinal de **qualidade**, não de
   risco jurídico. A tela marca isso com uma severidade visual distinta (ver `ux-notes.md` §c),
   para que Marcos nunca trate os dois tipos de alerta como se fossem a mesma coisa.
5. **Integração: fila `renach_outbox` com registros `ERROR` acumulando.** Um sinal técnico
   ([RN-PEC-008]) que não é sobre nenhum caso individual — é sobre a saúde da integração em si.
   Marcos encaminha para a administração técnica (ver [JRN-DASH-004]), sem tentar diagnosticar a
   causa raiz, que não é seu papel.
6. **O que NÃO aparece na primeira tela.** Volume total de casos, produtividade por analista,
   gráficos de tendência de longo prazo — tudo isso existe, mas em telas de segundo nível
   (vigilância/contexto), nunca competindo por atenção com o que exige ação hoje. A hierarquia
   visual (`ux-notes.md` §b) é o que torna essa separação possível.
7. **Fim da triagem — cada linha tem um dono ou uma ação de Marcos.** Ele não fecha a lista até
   que todo item tenha, ou uma confirmação de que o gestor correto já foi notificado, ou uma ação
   própria registrada (escalar, encaminhar). Um alerta sem dono ao final do turno é, para o
   desenho do painel, uma falha do painel — nunca lida como "responsabilidade do operador".

## Pontos de contato (apps/canais)

DASHBOARD (tela de triagem, único ponto de entrada do turno); RAIT/PEC/BOAT (drill-down, cada um
no seu próprio console, quando Marcos precisa confirmar contexto); canal de notificação do gestor
de área correspondente (fora do escopo de tela, mas cuja confirmação de recebimento é visível no
DASHBOARD).

## Métricas de sucesso

100% dos alertas que cruzaram limiar no turno têm dono registrado até o fechamento; tempo médio
entre alerta e confirmação de recebimento pelo gestor responsável; zero alerta tratado como
"decorativo" (sem ação possível associada) — se um alerta nunca gera ação em nenhum turno, ele é
candidato a remoção do desenho, não a ser ignorado por rotina.
