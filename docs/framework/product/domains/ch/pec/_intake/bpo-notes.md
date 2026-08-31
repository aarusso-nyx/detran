---
id: PEC-BPO-NOTES
title: Notas do especialista BPO — rodada de calibração de processo PEC (2026-08-25)
status: draft
apps: [pec, portal, dashboard]
sources:
  [
    WF-PEC-001,
    WF-PEC-002,
    WF-PEC-003,
    WF-PEC-004,
    WF-PEC-005,
    RN-PEC-102,
    RN-PEC-105,
    RN-PEC-108,
    RN-PEC-110,
    RN-PEC-111,
    RN-PEC-112,
  ]
updated: 2026-08-25
---

# Notas do BPO — calibração de processo PEC

Produzido pelo especialista BPO ao revisar [WF-PEC-001]..[WF-PEC-003] e desenhar
[WF-PEC-004]/[WF-PEC-005] e os 5 novos casos de uso (UC-PEC-010..014), a partir do dossiê
CRAWLER (`_intake/research-dossier.md`, modo confirm-extend, 4 CONTRADICT). Registra: (1)
decisões que precisam do Owner em conversa de steering; (2) premissas do modelo de capacidade;
(3) lista de métricas para o dashboard (espelhada em [APP-PEC] §KPIs); (4) itens onde a
restruturação desta rodada divergiu deliberadamente de uma fusão automática entre processo legal
e implementação.

## 1. Decisões que precisam do Owner (steering)

Nenhuma destas foi respondida em `_meta/steering.md` — o domínio PEC não fazia parte da rodada de
steering de 2026-08-24 (essa rodada cobriu RAIT/TEAT/BOAT/shared). Todos os itens abaixo são
propostas novas desta rodada.

1. **Regime de distribuição de exames** ([WF-PEC-004]) — adotar o Regime A (aleatório/impessoal,
   CFM 1.636/2002 art. 3º) ou manter o Regime B (escolha livre, como implementado hoje)? Risco
   de conformidade real no Regime B, custo de engenharia (orquestrador cross-tenant novo) e
   possível perda de acesso geográfico no Regime A — ver a tabela de consequências completa em
   [WF-PEC-004].
2. **Pergunta estrutural da junta médica/psicológica** ([WF-PEC-002]) — **parcialmente resolvida
   pela rodada LEGAL paralela** ([RN-PEC-110]): o legitimado do requerimento é o candidato, não o
   encaminhamento administrativo interno (Auditor/Gestor) que a fila `SUBMITTED` usa hoje. O que
   resta ao Owner é o desenho de implementação — corrigir o canal existente para capturar o
   candidato como solicitante, ou substituí-lo — e uma pergunta que nem LEGAL resolveu: a Junta de
   2ª instância refaz o exame (novo `encounter`) ou só revisa o dossiê já produzido?
3. **Escopo do exame toxicológico periódico pós-CNH** ([WF-PEC-005], art. 10-A) — o PEC deve
   processar o alerta/resultado desse ciclo recorrente (a cada 2,5 anos), ou é inteiramente
   externo (SENATRAN ↔ condutor ↔ laboratório)? [UC-PEC-012] permanece `stub` até esta decisão.
4. **Natureza do descumprimento dos prazos da junta** (30d/15du/30d/30d/20du, Res. 927/2022 arts.
   12-14) — **parcialmente resolvida por [RN-PEC-112]**: prazos do administrado (requerer,
   recorrer) são preclusivos; prazos do órgão (designar, decidir, remeter) são SLA legais sem
   sanção expressa — nenhum descumprimento gera efeito automático de estado. Resta ao Owner
   decidir apenas a intensidade operacional do acompanhamento (escada de alerta, item 6).
5. ~~Ordem entre os dois exames clínicos~~ — **RESOLVIDA por [RN-PEC-108]**: não é bloqueio
   técnico, é sequência administrativa; o modelo paralelo do encounter está confirmado como
   correto. Mantido aqui apenas como registro histórico da proposta original.
6. **Escada de escalonamento de prazos da junta** ([WF-PEC-002] §"Escada de escalonamento") —
   marcos propostos em 50/75/90/100% de cada um dos cinco prazos legais. Aprovar como proposto
   (mesmo padrão já aprovado para RAIT, `_meta/steering.md` A.1) ou recalibrar?
7. **Mapeamento de vocabulário de resultado** ([APP-PEC] §"Vocabulário de resultado") — **regra já
   produzida pela rodada LEGAL** ([RN-PEC-105]): `CONDICIONADO` ≡ "apto com restrições" (só na
   trilha médica); "PENDENTE" é estado de processo, não resultado. O que resta ao Owner: consulta
   formal ao DETRAN-AM sobre a correspondência exata prazo↔rótulo (30/60/90/365 dias para 5
   rótulos — indeterminado no texto capturado) antes de congelar o enum. BPO sinaliza que
   qualquer decisão tem efeito direto nos KPIs de % apto/restrições propostos em [APP-PEC].

## 2. Premissas do modelo de capacidade — dados não levantados

Nenhum dado quantitativo real foi obtido nesta rodada (mesma lacuna que a rodada RAIT tratou como
prioridade em `_meta/steering.md` item B). Ver [APP-PEC] §"Pedidos de capacidade" para a lista de
perguntas formatadas para o Owner. Resumo dos dois pontos de maior risco de dimensionamento:

- **Janela de atendimento 08h-13h, dias úteis** (Portaria DETRAN-AM 005/2021 art. 40) combinada
  com até dois exames por candidato (médico + psicológico) é um teto de capacidade que nenhum
  WF-PEC atual modela como restrição de agenda — recomenda-se levantar throughput real por
  clínica antes de tratar essa janela como fixa em qualquer desenho de UX de agendamento.
- **Volume de casos de junta** (trilha implementada vs. trilha legal, ver decisão nº 2 acima) —
  sem saber se são a mesma contagem, não é possível calibrar a escada de escalonamento do item 6
  contra throughput real de designação de Junta/Junta Especial de Saúde.

## 3. Lista de métricas para o feed do dashboard

Espelha os KPIs propostos em [APP-PEC] §"KPIs operacionais propostos" — ver lá a tabela completa
com granularidade e fonte de dado por métrica. Não duplicado aqui para evitar divergência entre
os dois documentos.

## 4. Reestruturação vs. fusão automática — registro de decisão de modelagem

Esta rodada é `confirm-extend`, mas o dossiê trouxe 4 CONTRADICT que exigiram mais reestruturação
que confirmação, especialmente em [WF-PEC-002]. Registro explícito da escolha metodológica: onde
a base legal recém-capturada (Res. 927/2022 arts. 12-15) descreve um processo mais rico que o
implementado, **este BPO optou por modelar as duas trilhas lado a lado, sem fundir uma na
outra**, em vez de reescrever a trilha implementada como se já fosse a trilha legal. A razão: a
fusão implícita esconderia a pergunta estrutural (item 2 acima) que só o Owner/LEGAL pode
responder — se o BPO tivesse assumido que as duas são a mesma coisa, a Junta Especial de Saúde
teria sido modelada como um novo estado da fila `SUBMITTED→DECIDED` existente, o que poderia
estar simplesmente errado se a trilha implementada for, de fato, um mecanismo interno paralelo
sem relação com o direito do candidato do art. 12. O mesmo padrão foi aplicado a
[WF-PEC-004] (dois regimes, não um regime "corrigido" silenciosamente).

## 5. Reconciliação com a rodada LEGAL paralela (mesma data)

Enquanto este BPO trabalhava, LEGAL produziu [RN-PEC-101] a [RN-PEC-112] em `ch/pec/rules/` —
forward-reference sanctionado pelo orquestrador. Onde as duas rodadas tocaram o mesmo ponto, os
workflows/UCs deste BPO foram **atualizados para citar e incorporar** a posição de LEGAL, em vez
de manter uma leitura própria divergente:

- **Erro evitado**: o dossiê CRAWLER recomendava propagar "5 anos, 3 para maiores de 65" (Res.
  789/2020 art. 4º) como validade do exame médico para [WF-PEC-001]. [RN-PEC-102] identificou que
  esse texto está superado por lei posterior (CTB art. 147 §2º, redação da Lei 14.071/2020, faixas
  de 10/5/3 anos) — a correção foi incorporada antes da publicação deste workflow, evitando
  propagar um dado legal desatualizado para produção.
- **Convergência independente**: [RN-PEC-110]/[RN-PEC-111]/[RN-PEC-112] chegaram, por caminho de
  pesquisa jurídica separado, à mesma cadeia de três instâncias e à mesma escada de alertas
  50/75/90% que este BPO já havia desenhado para [WF-PEC-002] — sinal de que a leitura estrutural
  estava correta, mesmo antes da confirmação formal de LEGAL.
- **Perguntas fechadas por LEGAL que este BPO havia deixado em aberto**: natureza dos prazos
  (preclusivo vs. SLA sem sanção, [RN-PEC-112]); ordem entre os exames clínicos (não é bloqueio,
  [RN-PEC-108]); vocabulário de resultado (`CONDICIONADO` ≡ "apto com restrições", só na trilha
  médica, [RN-PEC-105]).
- **Pendências que sobrevivem mesmo após a rodada LEGAL**: prazo de designação/decisão da Junta
  Especial de Saúde (nem [RN-PEC-112] o localiza); se a revisão de 2ª instância refaz o exame ou
  só revisa o dossiê; regimento interno do CETRAN-AM (mesmo gap já registrado pela rodada RAIT).
