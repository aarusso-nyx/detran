---
id: RN-TEAT-001
title: Nenhum ato legal offline é aceito sem idempotência, numeração, hash e contexto completo
status: draft
apps: [teat]
sources:
  [
    'teat:law/invariants/INV-OFFLINE-001.json',
    'teat:docs/framework/product/blueprints/BP-OFFLINE-SYNC-001.json',
    'teat:docs/framework/product/workflows/offline-sync.md',
    'teat:docs/meta/prototypes/docs/RN-1_Regras_de_Negocio_Talonario_Eletronico.md',
    REF-CONTRAN-918,
    REF-SENATRAN-997,
  ]
updated: 2026-08-24
---

> **Nota de revisão (2026-08-24, especialista LEGAL).** Regra **confirmada**, com **upgrade de
> fonte**: três dos sete atributos exigidos (identidade do agente, contexto de numeração, hash de
> conteúdo) deixaram de ser inferência técnica e passaram a ter âncora normativa expressa na
> Portaria SENATRAN 997/2022. A afirmação anterior de que "não há regulação explícita" foi
> corrigida: ela permanece verdadeira **apenas quanto à idempotência de reenvio**. Acrescentado o
> deslinde frente à regra de sessão concorrente, que é problema distinto e agora tem regra própria
> ([RN-TEAT-111]).

**Regra.** Nenhum ato legal originado offline (AIT, medida administrativa, procedimento de
etilômetro, sinistro) pode ser aceito pela API de sincronização móvel sem, simultaneamente: (a)
chave de idempotência; (b) contexto de numeração reservada; (c) hash de conteúdo local; (d)
identidade do dispositivo; (e) identidade do agente; (f) timestamp; (g) contexto de localização;
(h) identificador do pacote normativo vigente. Em consequência de negócio: **nenhum ato legal é
duplicado por reenvio** — um mesmo item de fila reenviado (falha de rede, retry do agente,
reprocessamento) resulta no mesmo estado final, nunca em dois AITs/medidas/sinistros distintos
para o mesmo fato.

**Base legal.** A **idempotência de reenvio** em si permanece sem regulação explícita: a regra
decorre da necessidade de preservar a integridade e a unicidade do AIT enquanto ato administrativo
que inicia o processo de imposição de punição ([REF-CONTRAN-918] art. 2º, I e art. 3º) — a
duplicação indevida de AITs para o mesmo fato compromete a defensabilidade jurídica do ato. Mas
**três dos sete atributos exigidos têm, desde esta rodada, base normativa expressa**:

- **identidade do agente** — [REF-SENATRAN-997] art. 2º §3º (_"O acesso ao Talão Eletrônico deverá
  seguir padrões de segurança da informação que permitam a identificação do agente autuador."_) e
  art. 3º, III (_"identificar o agente da autoridade de trânsito responsável pela lavratura do
  AIT"_); ver [RN-TEAT-110];
- **contexto de numeração reservada** — [REF-SENATRAN-997] art. 3º, I e Anexo II, c) (numeração
  sequencial automática, pré-estabelecida pela autoridade, _"pode estar pré-carregada no aparelho,
  inclusive para permitir o registro do AIT quando o preenchimento for off-line"_); ver
  [RN-TEAT-113];
- **hash de conteúdo / integridade** — [REF-SENATRAN-997] art. 3º, V e Anexo II, b) (elementos de
  segurança que _"impeçam sua alteração após o término da lavratura do AIT"_); ver [RN-TEAT-112].

A **operação offline em si** também deixou de ser apenas escolha arquitetural:
[REF-SENATRAN-997] Anexo I, e) — _"Deverá permitir o preenchimento on-line e off-line do AIT"_ — é
requisito normativo do talão eletrônico. A fila local cifrada atende ao Anexo II, e) (_"Quando os
dados forem lidos, gravados e transmitidos estes devem ser criptografados"_) e f)
(_"Deverá armazenar os AIT até a sua transmissão ao órgão ou entidade de trânsito"_).

**Verificação.** `SyncQueueItem.payload_hash` é único por tenant; `POST
/v1/offline-sync/sync-batches` é idempotente por tenant+dispositivo+id de lote local; ausência de
qualquer um dos sete atributos exigidos bloqueia a aceitação do ato pela API ([INV-OFFLINE-001],
severidade `hard-fail`, aprovação humana obrigatória para qualquer enfraquecimento). Regra de
detecção complementar no corpus de protótipo: RN-AIT-014 — mesma placa, local, horário,
enquadramento e agente/operação sinaliza possível duplicidade.

**Delimitação frente a [RN-TEAT-111].** Esta regra trata do **mesmo ato reenviado a partir do
mesmo dispositivo** (falha de rede, retry, reprocessamento) e seu efeito é **convergência** — o
reenvio produz o mesmo estado final. Não cobre, e nunca cobriu, o problema **inverso e mais
grave**: atos **distintos** produzidos pelo **mesmo agente em dispositivos diferentes** no mesmo
intervalo, hipótese em que [REF-SENATRAN-997] Anexo II, h) determina que os registros **não sejam
processados** e o fato seja apurado pela autoridade. São mecanismos com gatilhos, efeitos e
severidades opostos; ver [RN-TEAT-111]. O bloqueio de [RN-TEAT-111] é **anterior** à idempotência
desta regra na ordem de avaliação do lote recebido.
