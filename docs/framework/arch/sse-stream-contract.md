---
id: ARCH-SSE-STREAM
title: Contrato de fio comum dos fluxos SSE (TEAT, Portal, DASHBOARD, RAIT)
status: draft
apps: [rait, teat, portal, dashboard]
updated: 2026-09-29
---

# Contrato de fio comum dos fluxos SSE

Rascunho de R-0022 (TASK-0001). Descreve o fio **como está** sobre STYNX 1.4.0, nos quatro fluxos
do backend e nos quatro clientes web, para que a troca pela plataforma (R-0022, CTG-0004 e
CTG-0005) preserve o que é comum e registre o que diverge. Não descreve API da 1.5.0. O inventário
por arquivo e linha e os critérios de caracterização estão em
`work/rounds/R-0022/contracts/CTG-0001.md`. Catálogo de eventos do RAIT e envelope da outbox:
`rait-events-sse-contract.md` §1 e §2; eventos do BOAT no fluxo do TEAT: `boat-route-contract.md` §7.

| Fluxo     | Rota                       | Política de leitura                         | Cliente web                                        |
| --------- | -------------------------- | ------------------------------------------- | -------------------------------------------------- |
| TEAT      | `GET /v1/ops/stream`       | `ops:stream:read`                           | `apps/teat/web/src/app/core/sse.service.ts`        |
| Portal    | `GET /v1/portal/stream`    | `PortalCitizenGuard` + `portal:stream:read` | `apps/portal/web/src/app/core/realtime.service.ts` |
| DASHBOARD | `GET /v1/dashboard/stream` | `dashboard:alert:read`                      | `apps/dashboard/web/src/app/core/sse/`             |
| RAIT      | `GET /v1/inf/rait/stream`  | `inf:rait-stream:read`                      | `apps/rait/web/src/app/core/`                      |

## 1. Abertura

1. Rota `@Get` com resposta escrita à mão (não `@Sse`), para que o verificador de decoradores e a
   matriz de política vejam `@Resource`/`@Action`.
2. Autenticação e tenant do perfil autenticado com _membership_ (P1 de CTG-0001): _bearer_ da sessão
   STYNX e `X-Tenant-Id`. Sem permissão → 403 antes de qualquer corpo SSE.
3. Cursor resolvido **antes** do cabeçalho: sem `Last-Event-ID` → `now()` do banco; com
   `Last-Event-ID` conhecido e dentro da janela → retoma depois dele; conhecido e fora da janela →
   **204** sem corpo; desconhecido, inclusive de outro tenant (invisível por RLS) → `now()` do
   banco, como se não houvesse cursor.
4. Janela de _replay_: **24 h**.
5. Resposta 200 com `Content-Type: text/event-stream`, `Cache-Control: no-cache`,
   `Connection: keep-alive` e o comentário `: connected` antes de qualquer frame.

## 2. Enquadramento

```text
: connected

id: <id da linha de integration.outbox>
event: <tipo do fluxo>
data: <JSON numa linha>

: heartbeat
```

- Um evento = `id:`, `event:`, uma linha `data:` e linha em branco. `id` é o id da linha da outbox
  e é o cursor do `Last-Event-ID`.
- `data` nunca carrega id de tenant; cada fluxo projeta o envelope (§5).
- Heartbeat `: heartbeat` a cada **20 s** por uma porta de agendamento injetável; a fábrica padrão
  é a única chamadora de `setInterval`.
- Sem campo `retry:`.

## 3. Entrega

- Leitura de `integration.outbox` por cursor `(created_at, id)`, em ordem, sob o contexto do
  tenant (RLS; papel da aplicação), em _ticks_ da porta de agendamento.
- Entrega "pelo menos uma vez": reabertura com `Last-Event-ID` pode repetir; o cliente deduplica.
- Um evento de outro tenant nunca é entregue; o `Last-Event-ID` de outro tenant vale como
  desconhecido.
- Fechamento da requisição ou da resposta cancela heartbeat e leitura.

## 4. Cliente web

- Leitura pelo `HttpClient` da aplicação (herda _bearer_, `X-Tenant-Id` e _request-id_ dos
  interceptores), `observe: 'events'`, `reportProgress: true`, `responseType: 'text'`, com _parser_
  incremental sobre `partialText`. `EventSource` nativo não envia o _bearer_ e não é usado (o TEAT web
  ainda usa: defeito conhecido, §6).
- `Last-Event-ID` = último `id` recebido; nunca gerado no cliente.
- 204, ou fechamento sem frame depois de abrir com cursor → reabre sem cursor e os consumidores
  recarregam; nenhum evento é sintetizado.
- 401/403 → `stopped`, sem nova tentativa.
- Queda → reconexão e, persistindo, _polling_ dos recursos abertos no intervalo do app (§6).
- Nenhum campo do envelope vira texto de tela.

## 5. Respostas e projeções por fluxo

| Tema               | TEAT                                  | Portal                                                                     | DASHBOARD                                                                                                                                       | RAIT                                                                        |
| ------------------ | ------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `event:`           | `type` do envelope                    | `inbox.item`, `request.changed`, `decision.published`, `payment.confirmed` | `alert.changed`, `alert.escalated`, `duty.changed`, `source.freshness`, `integration.health` (um topic pode gerar dois frames com o mesmo `id`) | 2º segmento do topic (`rait.case.changed` → `case`)                         |
| `data`             | `{ aggregate, data }`                 | `{ aggregate, data }` reformatado por tipo                                 | `{ aggregate, domainEvent, data }` sem `tenantId`; `objectRef` nulo em N2 sem `X-Purpose`                                                       | envelope inteiro sem `tenantId`, `tenant_id`, `cpf`, `cpf_hash`, `bankData` |
| Filtro no servidor | chave de leitura por tipo; `?topics=` | sujeito da sessão no SQL; `?topics=`                                       | camada e escopo no SQL; `?topics=`                                                                                                              | `?topics=` pelo 2º segmento; sem filtro por papel                           |
| Escopo do _tick_   | ALS herdado do temporizador           | escopo capturado na abertura                                               | escopo capturado; `tenant_id` explícito no SQL                                                                                                  | ALS herdado do temporizador                                                 |
| _Ticks_            | não serializados                      | serializados                                                               | serializados                                                                                                                                    | não serializados; erro não tratado                                          |
| Idade do cursor    | relógio do processo                   | relógio do processo                                                        | relógio do banco                                                                                                                                | relógio do processo                                                         |
| Linhas por _tick_  | 200                                   | 200                                                                        | 200                                                                                                                                             | 500                                                                         |
| Erros próprios     | —                                     | —                                                                          | 401 `DASH.AUTH_REQUIRED`; 400 `DASH.PURPOSE_REQUIRED`/`DASH.PURPOSE_INVALID`                                                                    | —                                                                           |
| 429 e `: dropped`  | não                                   | não                                                                        | 5 conexões por usuário → 429 JSON sem `Retry-After`; frame > 8 KB → `: dropped <id>`                                                            | não                                                                         |

## 6. Parâmetros e comportamento por cliente

Parâmetros preservados por app (OD-R22-03, pendente): polling 15 s RAIT/TEAT, 30 s DASHBOARD, 60 s
Portal; backoff 1→30 s RAIT/DASHBOARD, sem backoff no Portal.

| Tema            | RAIT                                                 | DASHBOARD                                | Portal                                                          | TEAT web                                 |
| --------------- | ---------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------- | ---------------------------------------- |
| Transporte      | `HttpClient`                                         | `HttpClient`                             | `HttpClient`                                                    | `EventSource` sem _bearer_ (defeito)     |
| Estados         | `idle`, `live`, `reconnecting`, `polling`, `stopped` | idem RAIT                                | `idle`, `connecting`, `live`, `polling`, `stopped`              | —                                        |
| `event:` aceito | `rait.<tipo>` (6 tipos)                              | `<tipo>` ou `dashboard.<tipo>` (5 tipos) | 4 tipos exatos                                                  | `onmessage` ou `addEventListener(topic)` |
| Backoff         | 1, 2, 4, 8, 16, 30 s                                 | idem                                     | nenhum                                                          | nenhum                                   |
| Polling         | 2 falhas em 60 s → 15 s                              | 2 falhas em 60 s → 30 s                  | 1ª falha → 60 s, com reabertura a cada _tick_                   | erro → `GET` a cada 15 s                 |
| Silêncio        | > 40 s (2 × 20 s) → falha                            | > 40 s após o 1º frame → falha           | não detecta                                                     | —                                        |
| 429             | cabeçalho `Retry-After`                              | `context.retryAfter` no corpo            | corpo `PORTAL.RATE_LIMITED` com `retryAfter`, em passos de 60 s | —                                        |
| Deduplicação    | `aggregate.version` por `kind:id`                    | idem                                     | nenhuma                                                         | nenhuma                                  |

## 7. Divergências a resolver na troca

1. **RAIT servidor × cliente:** o servidor envia `event: case`; o cliente só aceita
   `event: rait.case.changed`. O servidor também não filtra por papel/pool, que §3 de
   `rait-events-sse-contract.md` exige. Proposta OD-R22-04 (relatório de TASK-0001).
2. **DASHBOARD:** dois frames com o mesmo `id` e a mesma versão; o cliente descarta o segundo. O 429
   do servidor não traz `Retry-After` nem `context.retryAfter`. Proposta OD-R22-05.
3. **TEAT web:** `EventSource` sem _bearer_ nem `X-Tenant-Id`; sem `topics`, `onmessage` não recebe
   eventos nomeados. Corrigido pela delegação ao serviço da plataforma (CTG-0005).
4. **Escopo implícito** (TEAT, RAIT), _ticks_ não serializados (TEAT, RAIT) e relógios diferentes
   para a janela: a plataforma cobre por UPS-SSE-04/05/07 (especificação upstream §4.1).
5. **Deduplicação:** por versão (RAIT, DASHBOARD) × nenhuma (Portal, TEAT); UPS-NGSSE-05 propõe por
   `id`.
