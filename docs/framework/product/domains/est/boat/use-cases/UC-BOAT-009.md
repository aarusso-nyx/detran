---
id: UC-BOAT-009
title: Coordenador de RENAEST valida e retifica registro em nível municipal/estadual
status: reviewed
apps: [boat]
sources: [REF-CONTRAN-808-2020, WF-BOAT-003]
updated: 2026-08-26
---

## Ator e objetivo

Coordenador de RENAEST (municipal, onde aplicável, ou estadual — DETRAN-AM) atesta a consistência
dos dados de um sinistro recebido antes de encaminhá-lo ao próximo nível da cascata de validação
(municipal→estadual→federal — Res. CONTRAN 808/2020 art. 5º §1º), podendo solicitar retificação.

## Pré-condições

Registro BOAT encerrado localmente ([WF-BOAT-001] `closed`), em `RECEBIDO_LOCAL` de
[WF-BOAT-003].

## Fluxo principal

1. Sistema determina o nível de entrada: `VALIDACAO_MUNICIPAL` se o município é integrado ao SNT
   (art. 5º §1º, I), ou `VALIDACAO_ESTADUAL` diretamente, quando não integrado (art. 5º §2º).
2. Coordenador do nível correspondente revisa os dados do BAT (pessoa/vítima/condutor; veículo;
   via; sinistro — art. 4º, I-IV) e **atesta a consistência dos dados coletados** (art. 4º §3º).
3. Se inconsistência é encontrada, coordenador solicita retificação ao órgão de origem —
   mecanismo exato de retificação **não normado** nesta rodada (**PROPOSTA OPERACIONAL**: reenvio
   ao processing-operator do registro local, análogo ao `pending_complement` de [WF-BOAT-001]).
4. Coordenador municipal, satisfeito com a consistência, envia ao órgão estadual (art. 10, II);
   coordenador estadual (DETRAN-AM, art. 7º), satisfeito, envia à União (art. 9º, II) —
   `ENVIADO_NACIONAL`.
5. Registro entra na submáquina nacional de [WF-BOAT-001] em `RECEBIDO`, onde a homologação
   federal ocorre.

## Fluxos alternativos / exceções

- **3a. Retificação não resolvida.** Nenhum prazo ou consequência normada para retificação não
  atendida — decisão operacional de escalonamento fica com o Owner.
- **Registro nacional já terminal (`CONSOLIDADO`/`REJEITADO`).** Tentativa de retificação é
  bloqueada (`RENAEST.CRASH.CORRECTION_NOT_ALLOWED`) — gap normativo confirmado, ver
  [WF-BOAT-003] §Gap.

## Pós-condições

Registro validado em todos os níveis aplicáveis, encaminhado à União para homologação federal; ou
retido em um dos níveis, pendente de retificação.

## Critérios de aceitação

**AC-BOAT-009-1 — município não integrado ao SNT pula o nível municipal**

- **Dado** um sinistro de município não integrado
- **Quando** entra na cascata
- **Então** vai direto a `VALIDACAO_ESTADUAL` (art. 5º §2º) — o sistema deriva o nível do cadastro
  do município, sem escolha manual do coordenador ([RN-BOAT-104])

**AC-BOAT-009-2 — atestar consistência é ato nominal**

- **Dado** um coordenador que valida um nível
- **Quando** atesta
- **Então** o ato fica vinculado à sua identidade ([RN-BOAT-105], Res. 808/2020 art. 7º) — a
  responsabilidade pelo dado é nominal, não do órgão em abstrato

**AC-BOAT-009-3 — os quatro grupos de dados do BAT são revisados**

- **Dado** a revisão de nível
- **Quando** o coordenador a conclui
- **Então** pessoa/vítima/condutor, veículo, via e sinistro (art. 4º, I-IV) foram percorridos
  ([RN-BOAT-103])

**AC-BOAT-009-4 — retificação tem caminho, mesmo sem norma**

- **Dado** uma inconsistência encontrada
- **Quando** o coordenador solicita retificação
- **Então** o registro local volta ao operador de origem, análogo a `PENDENTE_COMPLEMENTO`, e a
  solução é rotulada **PROPOSTA OPERACIONAL** — o mecanismo não é normado, e o rótulo impede que
  vire jurisprudência interna por acidente

**AC-BOAT-009-5 — retificação não atendida escala, não expira**

- **Dado** uma retificação pendente sem resposta
- **Quando** o tempo passa
- **Então** o sistema escala operacionalmente — nenhum prazo ou consequência é normado, e nada
  caduca por decurso

## Regras aplicáveis

- [RN-BOAT-104] (validação em três níveis — DETRAN-AM valida o nível estadual e o municipal de
  municípios não integrados ao SNT)
- [RN-BOAT-105] (Coordenador de RENAEST — designação obrigatória e responsabilidade nominal)
- [RN-BOAT-002] (gate de dados de vítima na submissão nacional — validado neste UC antes do envio)
