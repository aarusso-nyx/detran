---
id: UC-BOAT-006
title: Agente registra sinistro com vítima em via que exige remoção de veículo
status: reviewed
apps: [boat, teat]
sources:
  [
    REF-CTB-sinistro-cena-renaest,
    'teat:docs/framework/product/workflows/crash-records.md',
  ]
updated: 2026-08-26
---

## Ator e objetivo

Agente de trânsito atende um sinistro **com vítima** em que, além do socorro, é necessário remover
um ou mais veículos da via — cenário em que o dever de **preservar o local para a perícia** (CTB
art. 176, III) tensiona com a necessidade operacional de **liberar a via**. Este UC documenta a
fronteira de campo entre o registro BOAT e a medida administrativa de remoção (TEAT), sem
remodelar a remoção em si.

## Pré-condições

`CrashRecord` em `in_attendance`, com ao menos uma `CrashVictim` registrada ([UC-BOAT-003]);
sinistro classificado com necessidade de remoção de veículo(s).

## Fluxo principal

1. Agente avalia se o veículo sinistrado tem responsável no local. Se sim, a remoção segue o
   regime comum de medida administrativa (CTB arts. 269-271, [WF-TEAT-004]) — **reuso por
   referência, não remodelado aqui**.
2. Se **não há responsável no local**, aplica-se o regime específico de veículo sinistrado (CTB
   art. 279-A — [RN-BOAT-120]) — remoção ao depósito independentemente de infração, nos termos da
   regulamentação do CONTRAN, com as mesmas disposições do art. 328 (CTB art. 279-A §2º).
3. Agente registra, no `CrashRecord`, que houve remoção associada e referencia a medida
   administrativa/`Termo de Recolhimento` correspondente — mesmo vínculo não rígido já descrito em
   [UC-BOAT-004] (`crash_record_id` sem FK rígida em medidas administrativas).
4. Preservação do local para perícia (art. 176, III) é registrada como conduta observada — ver
   [UC-BOAT-007] — antes da remoção ser efetivada, sempre que operacionalmente possível.
5. Se veículo envolvido possui registrador instantâneo de velocidade/tempo (tacógrafo) e o
   sinistro tem vítima, **somente perito oficial** pode retirar o disco/unidade de registro (CTB
   art. 279 — [RN-BOAT-119]) — agente de campo não remove esse componente.

## Fluxos alternativos / exceções

- **1a. Remoção por infração autônoma (não relacionada ao sinistro em si).** Segue
  [WF-TEAT-004] normalmente, sem tratamento especial deste UC.
- **2a. Tensão preservação × fluidez.** Quando a preservação do local (art. 176, III) e a
  necessidade de liberar a via (regime de fluidez, próximo do espírito do art. 178, embora este
  artigo trate especificamente de sinistro **sem** vítima) entram em conflito prático, **não há
  critério normativo de precedência** — decisão fica com o agente/autoridade em campo, confirmado
  por [RN-BOAT-118].
- **5a. Tentativa de remoção de disco por agente não perito.** Bloqueada — competência exclusiva
  do perito oficial (art. 279 — [RN-BOAT-119]).

## Pós-condições

`CrashRecord` com vítima e remoção associados, preservação de local documentada, e — quando
aplicável — referência ao componente de registrador instantâneo preservado para perícia.

## Critérios de aceitação

**AC-BOAT-006-1 — sem responsável no local, o regime é o do art. 279-A**

- **Dado** um veículo sinistrado sem responsável presente
- **Quando** a remoção é acionada
- **Então** aplica-se o regime do CTB art. 279-A ([RN-BOAT-120]) — independe de infração, e as
  disposições do art. 328 seguem junto

**AC-BOAT-006-2 — o disco do tacógrafo é intocável pelo agente**

- **Dado** um sinistro com vítima e veículo com registrador instantâneo de velocidade e tempo
- **Quando** o agente opera na cena
- **Então** o sistema não oferece nenhuma ação de retirada do disco ou unidade, e registra que a
  retirada compete exclusivamente ao perito oficial ([RN-BOAT-119], CTB art. 279)

**AC-BOAT-006-3 — a tensão preservação × fluidez é registrada, não resolvida pelo sistema**

- **Dado** conflito entre preservar o local e liberar a via
- **Quando** o agente decide
- **Então** o sistema captura a decisão e sua motivação, sem impor precedência — **não existe
  critério normativo** ([RN-BOAT-118]), e embutir um seria inventar norma

**AC-BOAT-006-4 — preservação do local é conduta registrada antes da remoção**

- **Dado** uma remoção iminente em sinistro com vítima
- **Quando** ela é efetivada
- **Então** a conduta de preservação do art. 176, III já está registrada ([UC-BOAT-007]) sempre que
  operacionalmente possível

**AC-BOAT-006-5 — proprietário hospitalizado não tem prazo suspenso**

- **Dado** veículo removido cujo proprietário está hospitalizado
- **Quando** o prazo de 60 dias do art. 328 corre
- **Então** o sistema não o suspende automaticamente — não há previsão normativa; a posição
  institucional é pendência do Owner (DT-019), e o caso é sinalizado para tratamento humano

## Regras aplicáveis

- [RN-BOAT-001], [RN-BOAT-002], [RN-BOAT-003] (vítima)
- [RN-BOAT-118] (tensão preservação × remoção — sem critério normativo de precedência)
- [RN-BOAT-119] (tacógrafo — remoção de disco/unidade só por perito oficial)
- [RN-BOAT-120] (remoção de veículo sinistrado sem responsável no local, art. 279-A)
- [WF-TEAT-004] (remoção — reuso por referência)
