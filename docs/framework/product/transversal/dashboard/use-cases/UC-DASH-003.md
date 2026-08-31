---
id: UC-DASH-003
title: Responsável prepara e comprova um dever periódico
status: approved
apps: [dashboard]
sources: [WF-DASH-002]
updated: 2026-08-31
---

## Ator e objetivo

Dono de um dever periódico (ex. Administração/Financeiro para IND-DASH-201/202, Ouvidor para
IND-DASH-206/207) quer conduzir um ciclo de obrigação — do início da janela de apuração até a
comprovação arquivada — sem perder o prazo nem deixar de guardar a evidência de cumprimento.

## Pré-condições

- O dever está catalogado em [APP-DASHBOARD] §Catálogo bloco B e conectado a [WF-DASH-002].
- A janela de apuração do período corrente está aberta (`JANELA_ABERTA`).

## Fluxo principal

1. Sistema abre a janela de apuração no início do período (ex. início do mês para deveres
   mensais) e notifica o dono.
2. Dono move o ciclo para `EM_APURACAO` ao iniciar a coleta de dados exigidos.
3. Dono prepara a minuta/relatório/dataset; sistema registra `PREPARADO`.
4. Dono envia ao órgão federal (ex. FUNSET) ou publica no portal (ex. relatório de ouvidoria);
   sistema registra `SUBMETIDO_PUBLICADO`.
5. Dono anexa a evidência de envio/publicação (protocolo, captura, hash do arquivo publicado);
   sistema registra `COMPROVADO`.
6. Sistema arquiva o ciclo (`ARQUIVADO`) — evidência retida para auditoria futura.

## Fluxos alternativos / exceções

- **Data-limite atingida sem avanço**: sistema move o ciclo para `ATRASADO` e gera um alerta na
  trilha de irregularidade de [WF-DASH-001]. Dono ainda pode cumprir o dever
  (`ATRASADO → SUBMETIDO_PUBLICADO`).
- **Ciclo com sanção automática por atraso** (IND-DASH-202): ao entrar em `ATRASADO`, o sistema
  também dispara um alerta na trilha de **extinção** de [WF-DASH-001], porque a suspensão da
  autorização de pagamento por cartão ([REF-CONTRAN-918] art. 27 §7º) já ocorreu e não se desfaz
  com o cumprimento tardio — dono precisa tratar dois alertas distintos, não um só.
- **Dever sem data-limite numérica fixa** (ex. IND-DASH-204, repasse estatístico anual): ciclo
  permanece em `JANELA_ABERTA`/`ATRASADO` indefinidamente; UI exibe "sem prazo definido — lacuna
  normativa", não como falha operacional do dono.
- **Período seguinte se abre sem cumprimento**: sistema move o ciclo anterior para
  `NAO_CUMPRIDO` — registrado permanentemente, não removido do histórico.

## Pós-condições

- Ciclo arquivado com evidência de cumprimento, consultável por auditoria ([UC-DASH-004]); ou
  ciclo marcado `NAO_CUMPRIDO`, igualmente consultável.

## Critérios de aceitação

**AC-DASH-003-1 — cumprido é comprovado, nunca marcado**

- **Dado** um dever cujo dono afirma ter enviado
- **Quando** o ciclo avança
- **Então** só chega a `COMPROVADO` com evidência anexada — protocolo, captura ou hash do arquivo
  publicado ([WF-DASH-002]); marcação manual de "feito" para em `SUBMETIDO_PUBLICADO`

**AC-DASH-003-2 — o relógio do FUNSET é o dia 20**

- **Dado** o dever mensal de prestar informações de arrecadação
- **Quando** o calendário é montado
- **Então** a data-limite é o **20º dia do mês subsequente** ([RN-DASH-110]), citada com seu
  dispositivo

**AC-DASH-003-3 — o único dever com sanção expressa é sinalizado como tal**

- **Dado** o relatório mensal de arrecadação por cartão
- **Quando** entra em atraso
- **Então** o painel distingue esse dever dos demais ([RN-DASH-111]) — é o único do corpus cuja
  norma comina sanção, e tratá-lo como os outros apaga a diferença que importa

**AC-DASH-003-4 — dever próprio e dever derivado não se confundem**

- **Dado** o catálogo
- **Quando** um item é exibido
- **Então** declara sua natureza ([RN-DASH-102]): obrigação da própria Administração, ou teto legal
  derivado de um app de domínio — as consequências do descumprimento são de espécies diferentes

**AC-DASH-003-5 — o relatório anual da ouvidoria tem conteúdo mínimo verificável**

- **Dado** o ciclo anual da ouvidoria
- **Quando** é comprovado
- **Então** os quatro itens de conteúdo mínimo estão presentes e a publicação é integral
  ([RN-DASH-115])

## Regras aplicáveis

- [WF-DASH-002] (ciclo completo)
- [WF-DASH-001] (para o alerta gerado por proximidade/atraso da data-limite)
