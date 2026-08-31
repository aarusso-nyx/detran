---
id: UC-PORTAL-010
title: Cidadão consulta multas, pontuação e situação da CNH
status: approved
apps: [portal]
sources: [REF-DECRETO-10543-2020, REF-LEI-14129-2021, REF-LEI-13460-2017]
updated: 2026-08-26
---

## Ator e objetivo

Cidadão/condutor consulta, em um só lugar, as multas em aberto, a pontuação acumulada na CNH e a
situação geral de habilitação, sem precisar de nível de assinatura elevado nem de ir a um serviço
por vez ([WF-PORTAL-001] catálogo).

## Pré-condições

- Cidadão identificado via login gov.br ([WF-PORTAL-002] `AUTENTICADO_GOVBR`); nível simples é
  suficiente (Decreto 10.543/2020 art.4º I, "b").
- CPF vinculado a ao menos um veículo/processo/CNH para haver algo a exibir (Lei 13.460 art.10-A).

## Fluxo principal

1. Cidadão acessa "Minhas multas e pontuação" a partir da tela inicial do PORTAL.
2. Sistema verifica elegibilidade (vínculo CPF↔veículo/CNH) e lista, sem exigir seleção prévia de
   categoria: multas em aberto (com prazo de defesa/recurso/pagamento vivo, já calculado), multas
   pagas/quitadas, pontuação atual na CNH (com data de referência do período de contagem).
3. Cada item da lista linka diretamente para a ação seguinte relevante (defender, indicar condutor,
   pagar, ou "sem ação disponível" quando já definitivo) — nunca uma lista passiva sem próximo
   passo, mesmo princípio de [JRN-PORTAL-001] "detalhe da autuação".
4. Cidadão pode filtrar por veículo (se PJ com frota) ou por status.

## Fluxos alternativos / exceções

- **2a.** CPF sem nenhum vínculo encontrado: sistema explica que não há registro, não trata como
  erro técnico.
- **2b.** Dado de pontuação divergente do esperado pelo cidadão (ex. infração já paga não some da
  contagem): tela oferece caminho direto para registrar manifestação de ouvidoria
  ([UC-PORTAL-016]), não apenas um FAQ genérico.

## Pós-condições

Cidadão com visão consolidada e acionável do próprio histórico; nenhuma alteração de dado —
consulta é somente leitura sobre espelho de RENAINF/RENACH.

## Critérios de aceitação

**AC-PORTAL-010-1 — o CPF basta para identificar o cidadão**

- **Dado** um cidadão autenticado
- **Quando** consulta multas e pontuação
- **Então** nenhum outro número é exigido para identificá-lo ([RN-PORTAL-103]) — nem RENACH, nem
  protocolo, nem número de processo

**AC-PORTAL-010-2 — cada item leva à ação seguinte**

- **Dado** a lista de multas
- **Quando** é exibida
- **Então** cada item traz a ação disponível — defender, indicar condutor, pagar — ou diz
  explicitamente que não há ação; nunca uma lista passiva

**AC-PORTAL-010-3 — pontos em disputa não se confundem com pontos definitivos**

- **Dado** uma multa sob recurso com efeito suspensivo
- **Quando** a pontuação é exibida
- **Então** o sistema distingue o que já é definitivo do que está em disputa ([RN-RAIT-131]) — a
  pontuação só é lançada após esgotados os recursos

**AC-PORTAL-010-4 — o prazo vivo aparece calculado por item**

- **Dado** uma multa com prazo em curso
- **Quando** é listada
- **Então** mostra a data-limite, não o número de dias em abstrato

## Regras aplicáveis

- [RN-PORTAL-1xx] (forward ref — legal, uso único/CPF como identificador)
- Mapa de tradução de estado interno → status cidadão (`_intake/ux-notes.md` §c)
