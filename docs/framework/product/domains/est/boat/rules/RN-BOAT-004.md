---
id: RN-BOAT-004
title: Registro grave não pode ser encerrado sem dados mínimos
status: draft
apps: [boat]
sources:
  [
    'teat:docs/framework/product/blueprints/BP-CRASH-RECORDS-001.json',
    'teat:docs/framework/product/workflows/crash-records.md',
    'teat:docs/meta/prototypes/docs/RN-1_Regras_de_Negocio_Talonario_Eletronico.md',
    REF-CONTRAN-808-2020,
    REF-CTB-sinistro-cena-renaest,
  ]
updated: 2026-08-24
---

**Regra.** O encerramento de um registro de sinistro (`POST .../:id/close`) sempre exige ao menos
um veículo ou pessoa envolvida registrada. Para sinistros classificados como graves, essa
exigência de completude mínima é reforçada — o registro deve permitir marcação de prioridade e
tem o encerramento bloqueado sem os dados mínimos correspondentes à gravidade declarada.

**Base legal.** Fechada, quanto ao **fundamento do dever**, na revisão LEGAL de 2026-08-24:

- [REF-CONTRAN-808-2020] art. 4º, § 3º: _"Os órgãos que realizam o registro do BAT **atestarão a
  consistência dos dados coletados**."_ — é a âncora normativa direta da checagem local de
  completude: o dever de atestar consistência é **do órgão que registra**, anterior e independente
  da homologação federal ([RN-BOAT-002], [RN-BOAT-104]).
- [REF-CONTRAN-808-2020] art. 4º, I a IV: as quatro categorias de dados do BAT (pessoa/vítima/
  condutor; veículo; via; sinistro) — o conteúdo mínimo a que a consistência se refere
  ([RN-BOAT-103]).
- [REF-CONTRAN-808-2020] art. 9º, I e III: cabe ao DETRAN _"organizar e manter os dados"_ e
  _"validar os dados e as informações coletados em nível estadual"_.

O **conjunto concreto de campos** exigido por gravidade continua sem fonte normativa: depende do
"normativo específico" do art. 4º, § 1º e dos Manuais do art. 3º, não localizados ([RN-BOAT-103]).

**Verificação.** Invariante de workflow: "Closing requires at least one involved vehicle or
person" (`teat:docs/framework/product/workflows/crash-records.md`). Corpus de protótipo
(evidência): RN-SIN-010 "Sinistro grave deve permitir marcação de prioridade e bloqueio de
encerramento sem dados mínimos" (qualidade do registro). Complementa, no nível de integração
nacional, o gate de vítima por gravidade de [RN-BOAT-002] — aqui a checagem é local (BOAT/TEAT),
antes mesmo da tentativa de transmissão à RENAEST.

**Nota de revisão — LEGAL, 2026-08-24. CONFIRMADA, com "(fonte pendente)" fechado e três
acréscimos.**

1. **Fundamento localizado**: o art. 4º, § 3º da Res. 808/2020 converte o que era "regra de
   qualidade de registro" em **cumprimento de dever normativo de atestação**. Consequência material:
   a atestação deve ser **ato identificado** — quem atestou, quando, sobre qual conteúdo —, não um
   efeito colateral silencioso da transição de estado. Hoje `close` não registra isso.
2. **Acréscimo — a completude mínima depende do regime jurídico da cena, não só da gravidade.**
   Sinistro **com vítima** e sinistro **sem vítima** têm deveres legais distintos na cena
   ([RN-BOAT-114], [RN-BOAT-116]); os fatos a capturar diferem. Um registro sem vítima não deveria
   exigir — nem oferecer — campos de omissão de socorro/preservação.
3. **Acréscimo — dados de tempo e liberação da via.** Hora de chegada, hora da liberação e
   fundamento da liberação são hoje inexistentes em `CrashRecord` e são o único registro que resta
   quando a cena é desfeita; deveriam integrar os dados mínimos, especialmente no sinistro com
   vítima, em que há dever de preservação para a perícia ([RN-BOAT-118]).
4. **Acréscimo — hipóteses de encerramento hoje não previstas**: veículo sinistrado **removido sem
   responsável no local** (CTB art. 279-A — [RN-BOAT-120]) e registro **recebido de outra origem**
   (PM, município, PRF — [RN-BOAT-113]) não passam pelo ciclo de captura de campo e precisam de
   caminho próprio até o encerramento.
