---
id: UC-BOAT-005
title: Registro é transmitido, complementado e encerrado
status: reviewed
apps: [boat, teat]
sources:
  [
    'teat:docs/framework/product/workflows/crash-records.md',
    'teat:docs/adopters/integrations/adapters/renaest.md',
    'senatran:domain/renaest/api/src/renaest.service.ts',
    'senatran:docs/framework/contracts/openapi-transactional.yaml',
  ]
updated: 2026-08-26
---

## Ator e objetivo

Operador de processamento/autoridade valida o registro, encerra-o administrativamente e o
sistema o transmite à base nacional RENAEST, com possibilidade de complemento/correção posterior.

## Pré-condições

`CrashRecord` com veículos/pessoas registrados ([UC-BOAT-002]) e, se aplicável, vítimas
classificadas ([UC-BOAT-003]).

## Fluxo principal

1. Sistema/operador valida o registro — `POST .../:id/validate` (de `recorded`,
   `pending_complement`; atores processing-operator, traffic-authority) → move a `validated`.
2. Autoridade ou supervisor encerra o registro — `POST .../:id/close` (atores field-supervisor,
   traffic-authority) → move a `closed`; exige ao menos 1 veículo/pessoa ([RN-BOAT-004]).
3. Sistema transmite o sinistro à RENAEST — `POST /v1/renaest/sinistros` no mock/base nacional,
   com chave natural `(uf, codigoMunicipio, dataHoraSinistro, orgaoResponsavel)`; registro nacional
   nasce em `RECEBIDO` (fonte: senatran-mock contracts).
4. `CrashRecord` local move a `integrated`; protocolo RENAEST é armazenado.

## Fluxos alternativos / exceções

- **1a.** Validação encontra dados mínimos ausentes: registro permanece/retorna a
  `pending_complement` até complementação.
- **3a. Reenvio.** Reenvio da mesma tupla natural sem `Idempotency-Key` → base nacional recusa
  como duplicado (`RENAEST.CRASH.DUPLICATED`, 402) — não gera registro nacional duplicado.
- **3b. Dados incompletos na base nacional.** Gravidade com vítima e array `vitimas` vazio →
  `RENAEST.CRASH.INCOMPLETE_DATA` (402) — ver [RN-BOAT-002].
- **Complementação/correção pós-envio.** `POST .../{idSinistro}/complementos` ou `.../correcoes`
  cria retificação nacional em `EM_ANALISE`; registro nacional original permanece ativo até
  decisão (`RECEBIDO`/`EM_ANALISE` → `CONSOLIDADO`|`REJEITADO`).
- **Registro nacional terminal.** Uma vez `CONSOLIDADO` ou `REJEITADO`, novo
  complemento/correção é bloqueado (`RENAEST.CRASH.CORRECTION_NOT_ALLOWED`, 402) — eventual
  ajuste exige novo registro formal (mecanismo exato: fonte pendente).

## Pós-condições

Registro local `closed`/`integrated` com protocolo nacional associado; registro nacional em
`RECEBIDO`/`EM_ANALISE` (ativo) ou `CONSOLIDADO`/`REJEITADO` (terminal) — ver [WF-BOAT-001].

## Critérios de aceitação

**AC-BOAT-005-1 — encerrar exige o mínimo, e o mínimo é verificado**

- **Dado** um registro sem nenhum veículo nem pessoa
- **Quando** se tenta `close`
- **Então** o sistema recusa ([RN-BOAT-004])

**AC-BOAT-005-2 — gravidade com vítima exige vítima registrada**

- **Dado** gravidade `COM_VITIMA_FERIDA` ou `COM_VITIMA_FATAL` e nenhuma `CrashVictim`
- **Quando** a transmissão é tentada
- **Então** o sistema bloqueia **antes** de enviar, em vez de colher
  `RENAEST.CRASH.INCOMPLETE_DATA` da base nacional ([RN-BOAT-002]) — o gate é local

**AC-BOAT-005-3 — a chave natural e a idempotência evitam duplicidade**

- **Dado** um reenvio da mesma tupla `(uf, município, instante, órgão)`
- **Quando** ocorre
- **Então** o envio carrega `Idempotency-Key` e não gera registro nacional duplicado; sem a chave,
  a base recusa com `RENAEST.CRASH.DUPLICATED` e o sistema trata a recusa como esperada

**AC-BOAT-005-4 — estado terminal nacional é respeitado, e explicado**

- **Dado** um registro nacional `CONSOLIDADO` ou `REJEITADO`
- **Quando** se tenta complemento ou correção
- **Então** o sistema bloqueia e informa que eventual ajuste exigiria novo registro formal —
  rotulado **PENDENTE-DE-NORMA**, porque nenhuma norma prevê o caminho ([WF-BOAT-003] §Gap)

**AC-BOAT-005-5 — anonimização é condição da conservação estatística**

- **Dado** um registro cujo prazo de retenção do dado identificado expira
- **Quando** o dado é conservado para fim estatístico
- **Então** passa por anonimização efetiva ([RN-BOAT-131]) — conservar identificado "porque é
  estatística" não é hipótese válida

**AC-BOAT-005-6 — o SLA de transmissão é operacional, nunca relógio de extinção**

- **Dado** um registro além do `T-BOAT-TRANSM` proposto
- **Quando** o sistema sinaliza
- **Então** o alerta é operacional e assim rotulado — este domínio **não tem** relógio de extinção
  normado, e apresentá-lo como tal seria falso ([WF-BOAT-001] §Prazos)

## Regras aplicáveis

- [RN-BOAT-002] (gate de vítima por gravidade na submissão nacional)
- [RN-BOAT-004] (encerramento local exige dados mínimos)
