---
id: UC-TEAT-012
title: Sistema impede sessão concorrente do mesmo agente em dispositivos diferentes
status: approved
apps: [teat]
sources: [REF-SENATRAN-997]
updated: 2026-08-26
---

## Ator e objetivo

O sistema garante que um mesmo agente não opere sessões simultâneas em dispositivos diferentes —
gate de segurança normativo, não apenas boa prática técnica. Quando a concorrência é detectada
apenas no momento da sincronização (não no login), os registros envolvidos são bloqueados e
apurados pela autoridade, nunca processados silenciosamente.

## Pré-condições

- Agente possui sessão STYNX ativa em um dispositivo.
- Um segundo dispositivo tenta autenticar com as mesmas credenciais, ou um lote sincronizado revela
  registros do mesmo agente originados em dois dispositivos no mesmo intervalo de tempo.

## Fluxo principal

1. **Gate de bootstrap** (preventivo): ao autenticar em um dispositivo, o sistema verifica se o
   agente já possui sessão ativa em outro equipamento — "o agente de trânsito não poderá estar
   logado simultaneamente em mais de um equipamento" ([REF-SENATRAN-997] Anexo II, h).
   2a. **Sem sessão concorrente**: autenticação prossegue normalmente, entra em [WF-TEAT-001] a partir
   de `RASCUNHO_OFFLINE`.
   2b. **Sessão concorrente detectada no bootstrap**: sistema bloqueia a nova autenticação, ou força
   encerramento da sessão anterior (comportamento exato de UX é decisão de produto — ver
   `_intake/bpo-notes.md` §2).
2. **Gate de sincronização** (detectivo, cobre o caso em que dois dispositivos operaram offline sem
   comunicação entre si): ao receber um lote (`POST /v1/offline-sync/sync-batches`), o backend
   verifica se há registros do mesmo agente, em dispositivos diferentes, no mesmo intervalo de
   tempo.
   4a. **Sem concorrência**: lote segue o fluxo normal de validação em [WF-TEAT-001].
   4b. **Concorrência detectada**: registros envolvidos movem para `SUSPEITO_CONCORRENCIA` — **não são
   processados** até apuração — "esses registros não deverão ser processados e o fato deve ser
   apurado pela autoridade de trânsito" ([REF-SENATRAN-997] Anexo II, h).
3. Traffic-authority/auditor analisa o caso (ex.: dispositivo perdido/roubado usado por terceiro,
   erro de reautenticação, ou uso fraudulento intencional).
   6a. **Apuração conclui legitimidade**: registros liberados, retornam a `RECEBIDO` e seguem
   validação normal.
   6b. **Apuração conclui irregularidade**: registros permanecem bloqueados (`REJEITADO`), evento de
   auditoria registrado.

## Fluxos alternativos / exceções

- **Troca legítima de dispositivo em campo** (ex. equipamento avariado durante o turno): fluxo
  operacional recomendado é o agente **encerrar explicitamente a sessão** no dispositivo anterior
  antes de autenticar no novo, para não disparar o gate de concorrência — procedimento a
  formalizar em treinamento operacional, não modelado como exceção normativa própria.
- **Registro de auditoria obrigatório**: toda operação de autuação deve registrar, no mínimo, data,
  hora, agente, veículo, local e número do aparelho utilizado, para permitir auditorias
  ([REF-SENATRAN-997] Anexo II, j) — é a base de dados que sustenta a própria detecção de
  concorrência do passo 3.

## Pós-condições

Nenhum agente opera duas sessões simultâneas sem detecção; nenhum par de registros concorrentes do
mesmo agente em dispositivos diferentes é processado sem apuração prévia da autoridade.

## Critérios de aceitação

**AC-TEAT-012-1 — sessão do agente é exclusiva por dispositivo**

- **Dado** um agente com sessão ativa no dispositivo A
- **Quando** abre sessão no dispositivo B
- **Então** o sistema impede a coexistência ([RN-TEAT-111], Res. 997 Anexo II h) — não há
  "multi-dispositivo" para o mesmo agente

**AC-TEAT-012-2 — registros concorrentes não são processados**

- **Dado** registros do mesmo agente vindos de dispositivos diferentes no mesmo intervalo
- **Quando** o lote chega à retaguarda
- **Então** os registros vão a `SUSPEITO_CONCORRENCIA` e **não** são processados — bloqueio, não
  alerta ([RN-TEAT-111])

**AC-TEAT-012-3 — a apuração pela autoridade é obrigatória**

- **Dado** uma detecção de concorrência
- **Quando** ela ocorre
- **Então** abre apuração para `traffic-authority`, que a encerra liberando (`RECEBIDO`) ou
  confirmando irregularidade (`REJEITADO`) — nunca expira sozinha nem é descartada

**AC-TEAT-012-4 — handoff autorizado é distinguível de anomalia**

- **Dado** um agente que troca de aparelho por falha do primeiro
- **Quando** declara o incidente de dispositivo antes de abrir a nova sessão
- **Então** a retaguarda distingue handoff autorizado de sessão concorrente anômala — sem essa
  declaração, a troca é indistinguível de fraude e cai em `SUSPEITO_CONCORRENCIA`

**AC-TEAT-012-5 — a janela de "mesmo intervalo" é um parâmetro explícito**

- **Dado** a detecção de concorrência
- **Quando** é avaliada
- **Então** a janela temporal é configuração declarada e auditável, não constante escondida — o
  valor segue pendente de decisão do Owner, com risco bilateral registrado em
  `_intake/legal-assessment.md`

**AC-TEAT-012-6 — o agente é identificado eletronicamente por meio admitido**

- **Dado** a abertura de sessão
- **Quando** o agente autentica
- **Então** o meio usado é um dos três admitidos pela norma do talão ([RN-TEAT-110]), e fica
  registrado no ato para compor a autoria do auto

## Regras aplicáveis

- [RN-TEAT-001] (idempotência/numeração/contexto offline — regra de concorrência é complementar,
  não substitui a idempotência de reenvio já modelada)
- [RN-TEAT-111] (sessão do agente é exclusiva por dispositivo — registros concorrentes NÃO são
  processados e geram apuração)
