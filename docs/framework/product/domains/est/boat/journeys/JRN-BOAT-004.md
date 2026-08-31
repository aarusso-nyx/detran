---
id: JRN-BOAT-004
title: Coordenador estadual valida/retifica e persegue pendências RENAEST — sem prescrição, mas com qualidade estatística em jogo
status: draft
apps: [boat]
sources:
  [
    'REF-CONTRAN-808-2020',
    'RN-BOAT-002',
    'RN-BOAT-004',
    'UC-BOAT-005',
    'WF-BOAT-001',
  ]
updated: 2026-08-24
---

## Persona e contexto

Renato é o Coordenador de RENAEST do DETRAN-AM — papel que a própria Resolução CONTRAN 808/2020
manda o órgão estadual designar ([REF-CONTRAN-808-2020] art. 7º: "responsável pelo controle,
tratamento e fornecimento dos dados referentes a acidentes e estatísticas de trânsito"). Ele
trabalha de escritório, fim de tarde, revisando o lote de sinistros do dia antes de fechar o
expediente. A jornada de Renato é estruturalmente diferente da de [JRN-RAIT-004] (radar de
prescrição): **não existe prazo legal de decadência correndo contra o registro de um sinistro** —
nenhuma fonte lida define prazo por-registro para envio ao RENAEST (o único prazo encontrado,
04/01/2022, é de integração institucional do órgão, já vencido — [REF-CONTRAN-808-2020] art. 16).
O que está em jogo para Renato não é perder um direito por inércia, é a **qualidade e a
completude** da estatística nacional que o Amazonas fornece — e sua própria reputação/coordenação
perante a base federal quando um lote inteiro é rejeitado por dado incompleto.

## Narrativa ponta-a-ponta

1. **Painel de pendências, não fila de prazo.** Renato abre o console web (`crashes`, telas
   UX-WEB-060/061) e vê os sinistros do dia agrupados por situação: `pending_complement` (dado
   mínimo ausente — [RN-BOAT-004]), `recorded` aguardando validação, e os já `integrated` com
   protocolo nacional. Diferente do painel de RAIT, aqui não há coluna de "dias até o teto legal" —
   porque não existe teto legal por-registro a mostrar; mostrar um contador falso seria pior que não
   mostrar nada.
2. **Retificação em curso — sub-máquina nacional visível.** Um sinistro do dia anterior está em
   `EM_ANALISE` na RENAEST (retificação submetida, ver [WF-BOAT-001] sub-máquina nacional): Renato
   só acompanha, não decide — a análise é da base nacional (federal), ele valida em nível
   **estadual** antes de qualquer envio ([REF-CONTRAN-808-2020] art. 5º §1º, II). O console mostra
   os três níveis de validação (municipal/estadual/federal) como uma trilha, não como um segredo de
   sistema — Renato precisa saber em qual nível o registro está preso quando algo demora.
3. **Rejeição por dado incompleto — o gate de vítima em ação.** Um sinistro grave voltou com
   `RENAEST.CRASH.INCOMPLETE_DATA` — gravidade `COM_VITIMA_FERIDA` sem nenhum `CrashVictim`
   registrado ([RN-BOAT-002]). A tela de complementação (UX-WEB-062) mostra exatamente o motivo da
   rejeição em linguagem direta ("faltam dados de vítima para a gravidade declarada"), não um
   código de erro cru (`RENAEST.CRASH.INCOMPLETE_DATA` fica disponível, mas como detalhe técnico
   expansível, não como a primeira coisa que Renato lê). Ele reabre contato com a equipe de campo
   (ou, se a onda estiver ativa, com o parceiro hospitalar de [JRN-BOAT-003]) para obter o dado
   faltante — não pode inventar um valor só para destravar a submissão.
4. **Reenvio duplicado, resolvido sem drama.** Um sinistro foi reenviado por engano (falha de rede
   no fechamento do turno de outro agente) sem `Idempotency-Key` diferente — a base nacional recusa
   como duplicado (`RENAEST.CRASH.DUPLICATED`). A tela não trata isso como incidente grave: mostra
   que o registro original já está `RECEBIDO`/consolidado e que nada foi perdido — Renato só
   confirma e segue.
5. **Estado terminal — sem caminho de correção, e a tela precisa dizer isso com todas as letras.**
   Um sinistro de duas semanas atrás, já `CONSOLIDADO` na base nacional, precisa de uma correção
   (erro de município digitado). A tela **não oferece um botão de "corrigir"** nesse caso — ele
   simplesmente não existe, porque a Resolução 808/2020 não prevê mecanismo de correção pós-
   terminal e o mock nacional bloqueia com `RENAEST.CRASH.CORRECTION_NOT_ALLOWED`. Em vez de deixar
   Renato tentar e falhar, a tela explica a limitação diretamente ("registro consolidado — sem
   mecanismo de correção conhecido; abrir chamado institucional junto à SENATRAN se a correção for
   indispensável") — honestidade sobre uma lacuna normativa real, não um erro de sistema a
   esconder.
6. **Radar de qualidade, não radar de urgência.** No lugar do "radar de prescrição" de RAIT, Renato
   tem um painel de **taxa de rejeição/pendência** por tipo de gravidade e por agente/unidade —
   quantos registros graves saem de campo sem vítima capturada, quantos ficam presos em
   `pending_complement` por mais de X dias (métrica operacional interna, sem base legal de prazo,
   marcada como tal). O objetivo é pedagógico, não punitivo: identificar padrões de captura
   incompleta em campo para retroalimentar o treinamento de field-agents, não gerar uma lista de
   "atrasados" como se houvesse prazo descumprido.
7. **Fim do dia — o que fica pendente, fica visível para amanhã.** Renato fecha o expediente com
   alguns sinistros ainda em `pending_complement`. A tela não faz esses casos desaparecerem nem
   pede confirmação de "arquivar" — eles reaparecem no painel do dia seguinte, com a mesma
   visibilidade, até serem resolvidos.

## Pontos de contato (apps/canais)

Console web BOAT (`crashes`: Lista de sinistros UX-WEB-060, Detalhe UX-WEB-061, Complementação
UX-WEB-062, Integração RENAEST UX-WEB-063); base nacional RENAEST (mock `senatran`, três níveis de
validação); equipe de campo (retorno de pendência, mesmo canal operacional do turno); parceiro
hospitalar quando a onda de [JRN-BOAT-003] estiver ativa.

## Métricas de sucesso

Taxa de rejeição nacional (`RENAEST.CRASH.INCOMPLETE_DATA`) em queda ao longo do tempo; zero
registro com dado de vítima inventado só para destravar submissão; zero contador de prazo legal
falso exibido em painel (distinção clara entre meta operacional interna e ausência de teto legal
por-registro); tempo médio de permanência em `pending_complement` (métrica de saúde operacional,
não de risco jurídico); 100% dos casos em estado terminal sem caminho de correção comunicados como
tal, nunca como erro genérico de sistema.
