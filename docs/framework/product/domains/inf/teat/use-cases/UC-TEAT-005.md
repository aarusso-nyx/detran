---
id: UC-TEAT-005
title: Dispositivo sincroniza lote de atos offline
status: approved
apps: [teat]
sources:
  [
    'teat:docs/framework/product/blueprints/BP-OFFLINE-SYNC-001.json',
    'teat:docs/framework/product/workflows/offline-sync.md',
    'teat:docs/framework/product/workflows/phase-e-mobile.md',
    'teat:docs/framework/product/workflows/phase-c-workers.md',
    'teat:law/invariants/INV-OFFLINE-001.json',
  ]
updated: 2026-08-26
---

## Ator e objetivo

O dispositivo do agente, ao recuperar conectividade, envia o lote de atos legais finalizados
localmente (AITs, medidas, sinistros, evidências) para a retaguarda, de forma idempotente e sem
duplicação.

## Pré-condições

Um ou mais atos legais finalizados localmente, enfileirados na fila local cifrada
(`MobileEncryptedStorePort`), cada um com chave de idempotência, reserva de numeração consumida,
hash local, identidade de dispositivo/agente, timestamp, localização e pacote normativo
associados ([RN-TEAT-001]).

## Fluxo principal

1. Dispositivo detecta conectividade e inicia envio (tela `sync`, UX-MOB-080 fila de
   sincronização).
2. Aplicativo envia `POST /v1/offline-sync/sync-batches` com o lote, em sequência local monotônica
   por dispositivo.
3. Backend valida idempotência: aceitação do lote é idempotente por tenant+dispositivo+id de lote
   local.
4. Cada `SyncQueueItem` avança `pending → sent → received`.
5. Worker de sincronização (`OfflineSyncWorkerService`) aplica os itens recebidos:
   `received → applied`; item aplicado com sucesso gera o(s) recurso(s) definitivo(s) no domínio
   correspondente (ex.: AIT passa a `received` em [WF-TEAT-001]).
6. Dispositivo recebe confirmação e marca os itens locais como sincronizados; recibo de impressão
   simulado é exibido (item de mobile-runtime).

## Fluxos alternativos / exceções

- **3a. Reenvio do mesmo lote** (falha de rede, retry): backend reconhece o mesmo id de lote e
  não duplica o processamento — mesmo resultado final, sem novos AITs/medidas/sinistros
  ([RN-TEAT-001]).
- **5a. Conflito de sincronização:** worker abre `SyncConflict` (`status = open`) quando o item
  não pode ser aplicado diretamente (ex.: dado já alterado na retaguarda). Resolução por
  `field-supervisor`/`processing-operator` via `POST /v1/offline-sync/sync-conflicts/:id/resolve`;
  jornada de referência resolve com política `device-wins`; item local transita a `synced` após
  resolução (tela `sync-conflict`, UX-MOB-082).
- **Detalhe:** item rejeitado (`error_code`/`error_message`) permanece visível ao agente
  (`sync-item`, UX-MOB-081) para nova tentativa manual.

## Pós-condições

Todos os atos do lote têm correspondência definitiva na retaguarda (`server_entity_id` gravado em
`SyncQueueItem`) ou estão em conflito aberto aguardando resolução; nenhum ato é processado duas
vezes para o mesmo envio.

## Critérios de aceitação

**AC-TEAT-005-1 — reenviar o mesmo lote não duplica nada**

- **Dado** um lote já aceito pela retaguarda
- **Quando** o dispositivo o reenvia após falha de rede
- **Então** o backend reconhece a chave de idempotência (tenant + dispositivo + id de lote local) e
  devolve o mesmo resultado, sem criar novos AITs, medidas ou sinistros ([RN-TEAT-001])

**AC-TEAT-005-2 — nada sai da fila sem o invariante offline completo**

- **Dado** um ato finalizado localmente
- **Quando** ele entra na fila
- **Então** carrega chave de idempotência, reserva consumida, `content_hash`, identidade de
  dispositivo e agente, timestamp, localização e pacote normativo — a ausência de qualquer um
  impede o enfileiramento, não a transmissão ([RN-TEAT-001])

**AC-TEAT-005-3 — o protocolo de recebimento é único**

- **Dado** um lote recebido
- **Quando** o backend emite `receipt_protocol`
- **Então** ele é único por tenant e sistema, e reenvios do mesmo lote não geram um segundo

**AC-TEAT-005-4 — conflito abre tarefa, não descarta o ato**

- **Dado** um item que não pode ser aplicado diretamente
- **Quando** o worker o processa
- **Então** abre `SyncConflict` em `open` para resolução humana por supervisor ou operador — o item
  jamais é descartado nem aplicado à força

**AC-TEAT-005-5 — item rejeitado permanece visível ao agente**

- **Dado** um item rejeitado com `error_code`
- **Quando** o agente abre a fila de sincronização
- **Então** vê o item, o erro e a ação disponível — a fila nunca esconde o que falhou

**AC-TEAT-005-6 — a transmissão respeita a sequência local**

- **Dado** vários lotes pendentes no mesmo dispositivo
- **Quando** a conectividade retorna
- **Então** são enviados em sequência monotônica por dispositivo, preservando a ordem dos atos

## Regras aplicáveis

- [RN-TEAT-001] (idempotência de payload)
- [WF-TEAT-002] (numeração consumida deve corresponder a reserva válida)
