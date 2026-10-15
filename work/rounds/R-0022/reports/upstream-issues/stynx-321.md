Requisito upstream do DETRAN, campanha C-0002, rodada consumidora **R-0022** (contrato
**CTG-0005**, SSE dos quatro apps web pelo `provideStynxEventStream`). Todos os itens desta issue são
**MUST**, conforme OD-S15-01. Registro autorizado pelo Owner em 2026-09-29 (DETRAN
`work/rounds/R-0022/AUTHORIZATION.md`, Adenda B4 — modelo e autorização de issues; Adenda B12 —
decisão OD-R22-46). Esta issue registra o contrato de consumo; implementação, release e governança
seguem o STYNX. Não é declaração de que a lacuna continua ausente na HEAD atual: verificar a API
efetivamente publicada e anexar evidência se já atendida.

Consumidor: **R-0022 / CTG-0005**. Alvo: grupo fixo `@stynx-nyx/*` **1.5.x final** (o DETRAN fixa a
maior 1.5.x final publicada; Adenda A-C2-13). Desenvolvimento pode usar `1.5.x-rc.N`; merge DETRAN
somente com final e conformidade preenchida. MUST ausente bloqueia o CTG consumidor (OD-R22-02 (a)),
sem _shim_ nem cópia do mecanismo genérico.

Esta issue **não reabre** https://github.com/stynx-nyx/stynx/issues/292. UPS-NGSSE-01…10 foram
entregues em 1.5.0 com `provideStynxEventStream`, `StynxEventStreamConfig`, `StynxEventStreamService`
(`start`, `stop`, `status`, `polling`, `lastEventId`, `events$`, `tick$`), `StynxEventStreamTransport`,
`StynxEventStreamClock` e `STYNX_SSE_REQUEST`, e o DETRAN os confirma **conformes como mecanismo**
(spec C-0002 §8.2; CTG-0005 §0). A divergência está na **configuração que o Owner DETRAN mandou
preservar** em RAIT, DASHBOARD e Portal (OD-R22-03 (a)): cinco comportamentos do cliente publicado
não são configuráveis e contradizem os casos de caracterização desses apps. Os IDs continuam a
numeração (a partir de 11) e declaram o ID pai.

## Contexto do consumidor DETRAN

- Quatro apps web consomem SSE hoje com serviço próprio sobre `HttpClient`: RAIT (W1,
  `/v1/inf/rait/stream`), DASHBOARD (W2, `/v1/dashboard/stream`), Portal (W3, `/v1/portal/stream`) e
  TEAT web (W4, `/v1/ops/stream`). A migração ao cliente publicado (CTG-0005) é delegação pura mais
  "camada fina" que só traduz nomes e estados, deduplica por versão do agregado e cria injetor filho
  por conjunto de opções; nada de transporte, _parser_, temporizador ou política local (CTG-0005 §2).
- **OD-R22-03 (a):** preservar os parâmetros de cada app como configuração — _polling_ 15 s (RAIT,
  TEAT), 30 s (DASHBOARD), 60 s (Portal); _backoff_ 1 → 30 s em RAIT/DASHBOARD; Portal sem _backoff_
  (reabre no compasso do _tick_) (CTG-0005 §3).
- O comportamento preservado está fixado por casos de caracterização executáveis (DETRAN CTG-0001 de
  R-0022, C-01-20…C-01-39, `HttpTestingController` e relógio falso); CTG-0005 §2 prediz, por leitura
  do `.mjs` publicado, quais falham sob delegação pura.
- **OD-R22-46 (a)** (Adenda B12): checkpoint de CTG-0005 para RAIT, DASHBOARD e Portal e este pedido
  consolidado; **TEAT web migra** já, com os padrões publicados (OD-R22-57 (b): 1 000 → 30 000 ms,
  _polling_ após 2 falhas em 60 s).
- Servidor: os fluxos DETRAN enviam `: connected` na abertura e `: heartbeat` a cada 20 000 ms
  (C-01-12, C-01-13); o enquadramento de servidor migra para o `StynxEventStreamService` de
  `@stynx-nyx/backend` (OD-R22-45).

## Base analisada

`@stynx-nyx/angular@1.5.0`, tarball SHA-256
`cce512e628a6027cb7a6085b8cc14355fa53ce0c6b48269cc80187d55fb85421` (conferido com
`~/.cache/detran-r22/stynx-1.5.0/SHA256SUMS`), em `package/dist/`: `fesm2022/stynx-nyx-angular.mjs`
(`HttpStynxEventStreamTransport`, `FrameParser`, `StynxEventStreamService`) e
`types/stynx-nyx-angular.d.ts`. A cópia instalada no DETRAN é idêntica byte a byte ao tarball. Nesta
issue o `.mjs` publicado **foi** lido nos pontos citados (linhas abaixo), sem cópia.

## Contrato e provas (resumo)

| ID            | Nível | Origem                                   | Comportamento exigido (resumo)                                                                                                  |
| ------------- | ----- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| UPS-NGSSE-11  | MUST  | UPS-NGSSE-04 (e -03); CTG-0005 §0, P-05-1 | Reabertura ao **entrar** em _polling_ configurável: imediata (1.5.0) ou pelo _backoff_/compasso configurado                      |
| UPS-NGSSE-12  | MUST  | UPS-NGSSE-05; CTG-0005 §0, P-05-1         | Fecho pelo servidor (200 que termina, e 204) tratado como fim de fluxo configurável: não conta falha, cursor descartado, reabertura imediata ou pelo _backoff_ |
| UPS-NGSSE-13  | MUST  | UPS-NGSSE-02/04/06; CTG-0005 §0, P-05-1   | Linha de comentário (`: heartbeat`, `: connected`) como atividade de `live`, por opção: estado `live` e contadores zerados       |
| UPS-NGSSE-14  | MUST  | UPS-NGSSE-05; CTG-0005 §2, P-05-1         | Sinal público de _resync_ emitido uma vez quando o cursor é descartado                                                          |
| UPS-NGSSE-15  | MUST  | UPS-NGSSE-07 (e -02); CTG-0005 §2, P-05-1 | Último erro exposto por _signal_, e atraso de nova tentativa extraível do corpo por função configurável (além do `Retry-After`)  |

Os detalhes vinculantes de cada ID estão abaixo.

### UPS-NGSSE-11 — reabertura ao entrar em _polling_ configurável

**Origem e ID.** UPS-NGSSE-04 exige _fallback_ para _polling_ após `failuresBeforePolling` falhas em
`failureWindowMs`; não fixa quando a primeira reabertura acontece. ID novo: UPS-NGSSE-04 foi entregue
e o mecanismo está conforme.

**Evidência (1.5.0 publicada).**

- `stynx-nyx-angular.mjs:358-373` (`StynxEventStreamService.failed`): ao passar de fora para dentro
  de _polling_ (`polling && !wasPolling && !freshCursor`, `:369`), chama `open()` **imediatamente**
  (comentário publicado em `:370`: a primeira tentativa de recuperação em _polling_ é imediata; as
  seguintes usam _backoff_). Nenhuma opção de `StynxEventStreamConfig`
  (`types/stynx-nyx-angular.d.ts:129-146`) altera isso.
- `:374-382`: fora desse ramo, reabertura em `max(backoff, Retry-After)`, com `retryMode: 'fixed'`
  usando `initialMs`.

**Efeito DETRAN (casos que falham, CTG-0005 §2).**

- W1 RAIT C-01-22/C-01-23: duas falhas em 60 000 ms → _polling_ com `tick$` a cada 15 000 ms e
  reaberturas **no compasso do _backoff_** (1 000, 2 000, 4 000… ms); a 2ª falha reabre na hora.
- W2 DASHBOARD C-01-28: mesmo padrão, _tick_ de 30 000 ms.
- W3 Portal C-01-33: queda → _polling_ com _tick_ de 60 000 ms e **nenhuma requisição antes de
  60 000 ms**; com `failuresBeforePolling: 1` e `retryMode: 'fixed'`/`initialMs: 60000` (CTG-0005 §3),
  a 1ª falha reabre na hora.

**Comportamento exigido.**

1. Opção pública (nome proposto `reopenOnPollingEntry: 'immediate' | 'backoff'`), padrão
   `'immediate'` (comportamento de 1.5.0).
2. Com `'backoff'`, a entrada em _polling_ agenda a reabertura exatamente como qualquer outra falha
   (`max(backoff, Retry-After)`, respeitando `retryMode`/`initialMs`/`maxMs`); `tick$` segue no
   compasso de `pollingIntervalMs` desde a entrada.
3. 401/403, sessão inativa e troca de tenant mantêm a precedência atual.

**Prova exigida.** `FakeStynxEventStreamTransport` + `FakeStynxEventStreamClock`: com `'backoff'` e
padrões 2/60 000 ms, falhas sucessivas geram requisições em 1 000, 2 000, 4 000… ms, sem requisição
imediata na entrada em _polling_, e `tick$` a cada `pollingIntervalMs`; com `failuresBeforePolling: 1`,
`retryMode: 'fixed'`, `initialMs = pollingIntervalMs = 60000`, nenhuma requisição antes de 60 000 ms
e uma em 60 000 ms; sem a opção, o comportamento de 1.5.0.

### UPS-NGSSE-12 — fecho pelo servidor como fim de fluxo

**Origem e ID.** UPS-NGSSE-05 fixa `Last-Event-ID` e "204 → reabre sem ele"; não fixa o 200 que
termina nem o atraso da reabertura. ID novo.

**Evidência (1.5.0 publicada).**

- `stynx-nyx-angular.mjs:289-295`: evento `HttpEventType.Response` — com 204 zera o cursor e a janela
  de deduplicação (`:290-293`) e chama `failed(generation, undefined, status === 204)` (`:294`); com
  200 (fecho normal do corpo) chama `failed` como **falha**, sem tocar o cursor. `complete` do
  transporte também vai a `failed` (`:298`).
- `:352-357`: fora do 204, a falha entra na janela e em `consecutiveFailures` (pode levar a _polling_).
- `:369` e `:374-382`: o 204 (`freshCursor`) não conta falha, mas reabre **após o _backoff_**, nunca
  imediato.

**Efeito DETRAN (casos que falham).**

- W1 RAIT C-01-25: servidor fecha (200 sem frame ou 204) com cursor → nova requisição **imediata**
  **sem** `Last-Event-ID` e `resync$` uma vez; nenhum evento sintetizado.
- W2 DASHBOARD C-01-30: servidor fecha → cursor descartado, `resync$` uma vez, próxima requisição sem
  `Last-Event-ID`, **imediata se houve frame** na conexão, senão após o _backoff_.
- W3 Portal C-01-33: fecho pelo servidor → _polling_, com `Last-Event-ID` do último `id` a cada _tick_
  (o Portal conserva o cursor; C-01-34: só o 204 o descarta).

**Comportamento exigido.**

1. Política pública de fecho pelo servidor (nome proposto `serverClose`), configurável ao menos em:
   (a) se o 200 que termina **conta como falha** (padrão: sim, 1.5.0) ou é fim de fluxo normal;
   (b) se o cursor é **mantido** ou **descartado** no 200 que termina (o 204 continua descartando);
   (c) atraso da reabertura depois do fecho: imediato, imediato só se a conexão entregou frame, ou
   _backoff_ (padrão 1.5.0: _backoff_ para 204).
2. Fim de fluxo normal não entra em `failureWindowMs` nem leva a _polling_ por si.
3. Descarte do cursor emite o sinal de UPS-NGSSE-14.

**Prova exigida.** Transporte e relógio falsos: 200 que termina com a política "fim de fluxo,
descarta cursor, imediato" → requisição seguinte sem avanço de relógio e sem `Last-Event-ID`, sem
falha contada; "imediato se houve frame" → imediato após conexão com frame e após o _backoff_ sem
frame; 204 com reabertura imediata configurada → imediato; política "falha, mantém cursor" → mesmo
resultado de 1.5.0; nenhum evento sintetizado em nenhum caso.

### UPS-NGSSE-13 — comentário SSE como atividade de `live`

**Origem e ID.** UPS-NGSSE-02 (estados), UPS-NGSSE-04 ("reabertura com primeiro frame → `live`,
contadores zerados") e UPS-NGSSE-06 (silêncio). Os fluxos DETRAN passam longos períodos só com
`: heartbeat`. ID novo.

**Evidência (1.5.0 publicada).**

- `stynx-nyx-angular.mjs:116` e `:125-126` (`FrameParser.feed`): toda linha chama `onActivity()`;
  linha de comentário (`:`) é descartada sem frame.
- `:252-255`: `onActivity` só rearma o temporizador de silêncio (`armStale`, `:329-332`).
- `:320-323` (`deliver`): só frame de dados com `id` zera `failures`/`consecutiveFailures`, limpa os
  temporizadores de _retry_/_polling_ e marca `live`.
- `:257`: na abertura, o estado vira `live` **antes** de qualquer linha se não houver falhas
  anteriores; depois de falhas fica `reconnecting`/`polling` até um frame de dados.

**Efeito DETRAN (casos que falham).** W1 C-01-21 (`: heartbeat` → `live` sem evento) e C-01-23
(casos 2–4, segundo CTG-0005 §2: `: heartbeat` não leva a `live` nem zera o _backoff_ na
reabertura, e o silêncio de 40 s na reabertura conta falha dentro dos 61 s); W2 C-01-28 e C-01-30
(`: heartbeat` → `live`).

**Comportamento exigido.**

1. Opção pública (nome proposto `commentActivity: 'stale-only' | 'live'`), padrão `'stale-only'`
   (1.5.0).
2. Com `'live'`, a primeira linha de comentário recebida numa conexão aberta tem o mesmo efeito de
   estado de um frame de dados — `live`, `polling()` falso, janela de falhas e `consecutiveFailures`
   zerados, _retry_ e _polling_ cancelados —, sem emitir evento, sem mover o cursor e sem entrar na
   deduplicação.
3. Opção separada ou documentada para o estado na abertura: permanecer no estado anterior até a
   primeira linha recebida, em vez de `live` imediato (hoje a camada fina do Portal simula
   `connecting`).

**Prova exigida.** Transporte e relógio falsos: em _polling_ após duas falhas, reabertura que recebe só
`: heartbeat` → `live`, `polling()` falso, próxima falha reabre em `initialMs`; nenhum evento em
`events$`, `lastEventId()` inalterado; silêncio de `heartbeatMs × staleFactor` depois do último
comentário → falha contada; com `'stale-only'`, o comportamento de 1.5.0.

### UPS-NGSSE-14 — sinal público de _resync_

**Origem e ID.** UPS-NGSSE-05 manda descartar o cursor em 204; o app precisa saber que perdeu a
continuidade para recarregar o estado por consulta. ID novo.

**Evidência (1.5.0 publicada).** `stynx-nyx-angular.mjs:290-293`: o descarte do cursor em 204 é
silencioso; a troca de tenant também zera o cursor (`:195`). A API pública
(`types/stynx-nyx-angular.d.ts:158-162`, `:180-181`) expõe `status`, `polling`, `lastEventId`,
`events$`, `tick$`, `start`, `stop` — nenhum sinal de _resync_.

**Efeito DETRAN.** W1 C-01-25 e W2 C-01-30 exigem `resync$` emitido **uma vez** por descarte de cursor
pelo servidor; os consumidores do RAIT e do DASHBOARD recarregam listas por ele. Inferir o descarte
por `lastEventId()` virando `null` exige política local, vedada à camada fina.

**Comportamento exigido.**

1. `resync$: Observable<StynxEventStreamResync>` (nome proposto) público, emitido uma vez por descarte
   de cursor, com o motivo (`'no-content'` para 204, `'server-close'` para o fecho de UPS-NGSSE-12,
   `'tenant-change'`), antes da reabertura correspondente.
2. Nunca emitido por falha comum que conserva o cursor, nem na primeira abertura sem cursor.

**Prova exigida.** Transporte e relógio falsos: 204 com cursor → uma emissão `'no-content'` e
requisição seguinte sem `Last-Event-ID`; fecho configurado para descartar → uma emissão
`'server-close'`; troca de tenant → `'tenant-change'`; falha 5xx com cursor → nenhuma emissão; primeira
abertura → nenhuma emissão.

### UPS-NGSSE-15 — último erro exposto e atraso lido do corpo

**Origem e ID.** UPS-NGSSE-07 fixa 429 → `max(backoff, Retry-After)`; UPS-NGSSE-02 fixa os estados,
não o erro. ID novo.

**Evidência (1.5.0 publicada).**

- `stynx-nyx-angular.mjs:376-381`: o atraso vem **só** do cabeçalho `Retry-After` de um
  `HttpErrorResponse` (segundos ou data HTTP); o corpo não é lido.
- `:297` e `:339-351`: o erro recebido decide parada (401/403, `UnauthorizedError`) ou falha contada e
  depois é descartado; a API pública (`types/stynx-nyx-angular.d.ts:158-162`) não o expõe.

**Efeito DETRAN (casos que falham).**

- W2 DASHBOARD C-01-29: 429 com `context.retryAfter: 45` no corpo → próxima requisição só em
  45 000 ms.
- W3 Portal C-01-35: 429 com corpo `PORTAL.RATE_LIMITED` e `retryAfter: 120` → `polling`,
  `lastError().messageKey` = `portal.errors.rate_limited`, nenhuma requisição em 60 000 ms e uma em
  120 000 ms.

**Comportamento exigido.**

1. `lastError: Signal<StynxEventStreamError | null>` (nome proposto) com status HTTP, corpo já
   decodificado quando JSON, instante e se o erro levou a parada, _retry_ ou _polling_; zerado quando a
   conexão volta a `live`. O serviço não traduz o erro em texto de tela (UPS-NGSSE-09); o app mapeia.
2. Opção pública `retryAfterFrom?: (error: HttpErrorResponse) => number | null` (nome proposto),
   devolvendo milissegundos; o atraso efetivo é `max(backoff, cabeçalho, função)`. O STYNX não embute
   o envelope de erro de nenhum consumidor.
3. Sem a opção, o comportamento de 1.5.0.

**Prova exigida.** Transporte e relógio falsos: 429 com corpo `{ "context": { "retryAfter": 45 } }` e
função que o lê → nenhuma requisição antes de 45 000 ms e uma em 45 000 ms; 429 com cabeçalho e corpo
divergentes → o maior; `lastError()` preenchido com status e corpo em 429 e 5xx, `null` depois de
frame ou comentário que leve a `live`; 401 → `lastError()` preenchido e `stopped`.

## Divergências registradas sem pedido nesta issue

- **Query por `HttpParams` e cabeçalho `Accept`.** O transporte publicado usa a URL fixa por injetor
  (`stynx-nyx-angular.mjs:256`) e `HttpClient.get` sem `params` nem `Accept: text/event-stream`
  (`:60-68`). O Owner DETRAN aceitou a ausência de `Accept` e a leitura da query pela URL completa
  (OD-R22-56 (a), adenda de robustez dos testes), com injetor filho por conjunto de opções
  (CTG-0005 §3). Não bloqueia; fica registrado para o STYNX avaliar.
- **`stop()` → `stopped`** (não `idle`): tratado pela camada fina (`disconnect()` → `idle`,
  C-01-26); sem pedido.

## Compatibilidade vinculante

- **Aditivo em 1.5.x.** Toda opção nova tem padrão igual ao comportamento de 1.5.0;
  `provideStynxEventStream`, `StynxEventStreamConfig` e a API de `StynxEventStreamService` continuam
  válidas. `resync$` e `lastError` são membros novos.
- **Configuração por app.** As opções valem por `provideStynxEventStream` (por injetor), porque cada
  app DETRAN tem valores próprios (OD-R22-03 (a)).
- **Dublês.** `FakeStynxEventStreamTransport` e `FakeStynxEventStreamClock` (UPS-TEST-01) cobrem as
  opções novas, inclusive corpo de erro e fecho 200.
- **Segurança inalterada.** 401/403 e sessão inativa continuam parando; tenant e _bearer_ continuam
  vindo dos interceptores; nunca `EventSource`.

## Critérios de conclusão

- [ ] UPS-NGSSE-11 atendido por API pública e testes verificáveis com transporte e relógio falsos.
- [ ] UPS-NGSSE-12 atendido por API pública e testes verificáveis (200 que termina e 204, cursor e atraso).
- [ ] UPS-NGSSE-13 atendido por API pública e testes verificáveis (comentário leva a `live` e zera contadores, sem evento).
- [ ] UPS-NGSSE-14 atendido por API pública e testes verificáveis (uma emissão por descarte, com motivo).
- [ ] UPS-NGSSE-15 atendido por API pública e testes verificáveis (erro exposto; atraso do corpo por função).
- [ ] Informar versão publicada, símbolos reais exportados, testes/CI e desvios da proposta para cada ID; nome de símbolo proposto pode mudar, comportamento e prova não.
- [ ] Documentar consumo e migração das opções novas; não marcar atendido somente por código local ou RC sem evidência de publicação.

## Rastreabilidade

DETRAN (`aarusso-nyx/detran`, branch `orchestra/stynx-sse-tenancy`): `work/rounds/R-0022/contracts/
CTG-0005.md` (SHA-256 `d76ad22440867c30cd6ca1fa710e53e4a334869def83b8cb5503277142a7b27a`) §0, §2, §3,
§8 (P-05-1, P-05-2, P-05-3); `work/rounds/R-0022/contracts/CTG-0001.md` (SHA-256
`335d18caaa42178b73341021dab91d3f5e32b22cd2d92c7b7d9b1a357282e638`) C-01-12, C-01-13, C-01-20…C-01-36;
spec `work/campaigns/C-0002-stynx-upstream-spec.md` §8.2 (SHA-256
`c02c48433238e14ba1eb1a79193045f529f5ed9abe6d143cbbc4bb78ebd16d38`); `work/rounds/R-0022/
AUTHORIZATION.md` Adendas B4 e B12; `docs/meta/knowledge-base/open-decisions-rait.md` §C-0002
"R-0022 — decisões do Owner" (OD-R22-02, -03, -45, -46, -56, -57).

STYNX: https://github.com/stynx-nyx/stynx/issues/292 (UPS-NGSSE-01…10, entregues em 1.5.0).

<!-- detran-c0002-upstream:R22-NGSSE -->

Índice: #319 · Índice anterior: https://github.com/stynx-nyx/stynx/issues/289
