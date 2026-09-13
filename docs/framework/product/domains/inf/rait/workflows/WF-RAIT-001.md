---
id: WF-RAIT-001
title: Ciclo de vida do caso RAIT — protocolo, triagem, instrução, julgamento e comunicação
status: approved
apps: [rait, portal, dashboard]
sources:
  [
    REF-CONTRAN-900,
    REF-CONTRAN-918,
    REF-CONTRAN-357,
    REF-CTB-extracts-raw,
    REF-LEI-9873-1999,
    REF-DETRANAM-SERVICOS,
  ]
updated: 2026-09-12
---

## Parametrização do caso

Este diagrama é **genérico por tipo de pleito** — a mesma máquina de estados processa qualquer
um dos três tipos abaixo, diferenciados por dois atributos do caso:

| `instancia`                     | `circuito` | Quem decide                            | Onde julga                                 |
| ------------------------------- | ---------- | -------------------------------------- | ------------------------------------------ |
| `defesa_previa`                 | 1º         | Autoridade de trânsito (revisor único) | `DECIDIDO_AUTORIDADE`                      |
| `jari` (recurso 1ª instância)   | 2º         | Colegiado JARI                         | `PAUTADO → JULGADO_SESSAO` ([WF-RAIT-003]) |
| `cetran` (recurso 2ª instância) | 2º         | Colegiado CETRAN-AM                    | `PAUTADO → JULGADO_SESSAO` ([WF-RAIT-003]) |

Um mesmo AIT pode gerar **até três casos RAIT sucessivos** (defesa → recurso JARI → recurso
CETRAN), cada um com protocolo próprio, ligados por `ait_id` (todos) e `caso_origem_id` (do
segundo em diante). O RAIT não trata isso como "reabertura" do mesmo caso — é um novo
requerimento ([RN-RAIT-002]: um requerimento por AIT, mas nada impede requerimentos
sucessivos sobre o mesmo AIT em instâncias diferentes). Ver "Ponte com [WF-INF-003]" abaixo
para como este diagrama se encaixa no ciclo de vida da infração.

## Estados

`PROTOCOLADO` · `TRIAGEM_ADMISSIBILIDADE` · `NAO_CONHECIDO` · `ADMITIDO` ·
`AGUARDANDO_REMESSA_JARI` (só `instancia=jari`) · `DISTRIBUIDO` · `EM_INSTRUCAO` ·
`DILIGENCIA` · `PRONTO_P_DECISAO` · `DECIDIDO_AUTORIDADE` (1º circuito) · `PAUTADO` ·
`JULGADO_SESSAO` (2º circuito — sub-máquina em [WF-RAIT-003]) · `COMUNICADO` ·
`TRANSITADO` · `REMETIDO_2A_INSTANCIA` · `ENCERRADO_DESISTENCIA`.

Este é o **vocabulário canônico** — nenhum outro documento do corpus RAIT pode introduzir
nome de estado próprio. Ver §Vocabulário canônico e reconciliações ao final.

## Transições e gatilhos

```mermaid
stateDiagram-v2
    [*] --> PROTOCOLADO : intake multi-canal (balcão, postal,\nportal, protocolo virtual)\n[RN-RAIT-002] · UC-RAIT-001

    PROTOCOLADO --> TRIAGEM_ADMISSIBILIDADE : secretaria confere conteúdo mínimo\n[RN-RAIT-002] · UC-RAIT-002

    TRIAGEM_ADMISSIBILIDADE --> NAO_CONHECIDO : intempestivo\|ilegítimo\|sem assinatura\|\npedido incompatível — 900 art.4\n[RN-RAIT-001]
    TRIAGEM_ADMISSIBILIDADE --> ADMITIDO : passa nos 4 critérios de admissibilidade\n[RN-RAIT-001]

    ADMITIDO --> AGUARDANDO_REMESSA_JARI : instancia=jari — autoridade recebeu o recurso\ne tem 10 dias para remeter à JARI\n(T-REM10, CTB 285 §2º) [RN-RAIT-107]
    AGUARDANDO_REMESSA_JARI --> DISTRIBUIDO : JARI recebe o recurso —\nMARCO INICIAL do relógio B (24 meses)\n[RN-RAIT-110]
    ADMITIDO --> DISTRIBUIDO : instancia=defesa_previa\|cetran —\nentra direto no pool do circuito [WF-RAIT-002]

    DISTRIBUIDO --> EM_INSTRUCAO : analista (1º) ou relator sorteado (2º) assume\n[WF-RAIT-002] · UC-RAIT-003/UC-RAIT-004

    EM_INSTRUCAO --> DILIGENCIA : instância fixa prazo p/ prova/documento\n900 art.9 [RN-RAIT-004]
    DILIGENCIA --> EM_INSTRUCAO : resposta tempestiva anexada
    DILIGENCIA --> PRONTO_P_DECISAO : (T-DIL) prazo expira sem resposta\n→ julga no estado em que se encontra\n[RN-RAIT-004]
    EM_INSTRUCAO --> PRONTO_P_DECISAO : instrução concluída, sem diligência necessária

    PRONTO_P_DECISAO --> DECIDIDO_AUTORIDADE : 1º circuito — autoridade decide\nacolhida\|indeferida — 918 art.9 · UC-RAIT-003
    PRONTO_P_DECISAO --> PAUTADO : 2º circuito — entra em pauta\n[WF-RAIT-003] · UC-RAIT-005
    PAUTADO --> JULGADO_SESSAO : sessão delibera — provido\|negado\|não conhecido\n[WF-RAIT-003] · UC-RAIT-006

    DECIDIDO_AUTORIDADE --> COMUNICADO : notificação ao requerente — 918 art.17 · UC-RAIT-007
    JULGADO_SESSAO --> COMUNICADO : publicação + notificação; se provido,\ninforma se autoridade vai recorrer\n918 art.17 §ú · UC-RAIT-007/UC-RAIT-008
    NAO_CONHECIDO --> COMUNICADO : notificação da não admissão

    COMUNICADO --> TRANSITADO : esgotado o prazo/direito de recorrer\nsem interposição — CTB art.290
    COMUNICADO --> REMETIDO_2A_INSTANCIA : recorrente recorre (negado\|não conhecido)\nOU autoridade recorre (provido), em 30d\nCTB art.288 · UC-RAIT-008/UC-RAIT-009

    REMETIDO_2A_INSTANCIA --> [*] : abre NOVO caso RAIT\n(instancia=cetran, caso_origem_id=este caso)\n— ver "Reentrância" abaixo
    TRANSITADO --> [*]

    %% desistência — disponível em qualquer estado pré-decisão (900 art.11)
    PROTOCOLADO --> ENCERRADO_DESISTENCIA : UC-RAIT-012
    TRIAGEM_ADMISSIBILIDADE --> ENCERRADO_DESISTENCIA
    AGUARDANDO_REMESSA_JARI --> ENCERRADO_DESISTENCIA
    DISTRIBUIDO --> ENCERRADO_DESISTENCIA
    EM_INSTRUCAO --> ENCERRADO_DESISTENCIA
    DILIGENCIA --> ENCERRADO_DESISTENCIA
    PRONTO_P_DECISAO --> ENCERRADO_DESISTENCIA
    PAUTADO --> ENCERRADO_DESISTENCIA
    ENCERRADO_DESISTENCIA --> [*]
```

### Reentrância — escalonamento a 2ª instância (`REMETIDO_2A_INSTANCIA`)

`REMETIDO_2A_INSTANCIA` não é um loop dentro do mesmo caso — é o gatilho que abre um **novo**
caso RAIT com `instancia=cetran`, `caso_origem_id` apontando ao caso da JARI, `ait_id`
herdado. Dois sub-caminhos, com admissibilidade tratada de forma distinta:

- **Recorrente recorre** (decisão `negado` ou `não conhecido` da JARI): é uma **nova petição**
  do cidadão — reentra em `PROTOCOLADO` normalmente, passa por `TRIAGEM_ADMISSIBILIDADE`
  completa (prazo de 30 dias contado da comunicação é o próprio critério de tempestividade —
  CTB art.288). [RN-RAIT-103] (prazo), [RN-RAIT-104] (termo inicial conforme o canal de ciência).
- **Autoridade recorre** (decisão `provido`, CTB art.288 §1º; 918 art.17 §ú — ver
  UC-RAIT-008): é remessa **interna**, não uma petição externa — o caso nasce diretamente em
  `ADMITIDO`/`DISTRIBUIDO` do novo caso CETRAN, sem passar por triagem de admissibilidade
  cidadã (a legitimidade da autoridade é presumida pelo próprio cargo). [RN-RAIT-130]
  (legitimidade recursal bilateral — CTB art.288 §1º).

Decisões do CETRAN são **irrecorríveis** administrativamente (CTB art.290 — encerramento da
instância) — todo caso `instancia=cetran` só pode terminar em `TRANSITADO`, nunca em novo
`REMETIDO_2A_INSTANCIA`.

## Relógios de extinção de punibilidade (cross-cutting, correm em paralelo aos estados)

Três relógios distintos podem extinguir a pretensão punitiva **por inércia do próprio
sistema** — nenhum é uma "consequência normal" de atraso, são extinções de mérito. O desenho
de SLA ([WF-RAIT-002]) existe para que nenhum dos três seja atingido na prática.

| Relógio                                       | Prazo total                        | Conta a partir de                                           | Extingue                             | Base                                                                                                                                                                                                                 |
| --------------------------------------------- | ---------------------------------- | ----------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decadência do direito de aplicar a penalidade | 180d (360d com defesa prévia)      | cometimento da infração                                     | direito de aplicar a penalidade (NP) | CTB art.282 §§6º-7º — herdado de [WF-INF-003] `T-DEC`; delimita o teto do 1º circuito (`DECIDIDO_AUTORIDADE`)                                                                                                        |
| Prescrição por inércia do órgão julgador      | 24 meses                           | recebimento do recurso pelo órgão julgador (JARI ou CETRAN) | pretensão punitiva inteira           | CTB art.289-A c/c 285 §6º / 289 _caput_ — delimita o teto do 2º circuito (`ADMITIDO`→`JULGADO_SESSAO`) [RN-RAIT-110] (teto 1ª instância), [RN-RAIT-111] (teto 2ª instância), [RN-RAIT-112] (prescrição do art.289-A) |
| Prescrição por paralisação processual         | 3 anos (36 meses) sem movimentação | último ato/movimentação registrada, em QUALQUER estado      | ação punitiva                        | Lei 9.873/1999 art.1º §1º — corre mesmo dentro do teto de 24 meses, se o caso ficar parado [RN-RAIT-113]                                                                                                             |

Ver [WF-RAIT-002] §SLA para a escada de alertas calibrada contra estes três tetos.

## Prazos e timers (base legal por prazo)

| Timer     | Prazo                                                                                                   | Gatilho                                                      | Consequência                                                                             | Base                                                                                                                                                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T-REM10   | 10 dias                                                                                                 | recurso tempestivo recebido pela autoridade (instancia=jari) | remessa à JARI                                                                           | CTB art.285 §2º [RN-RAIT-107]                                                                                                                                                                                                                       |
| T-DIL     | fixado caso a caso pela instância — sem piso/teto legal expresso no corpus capturado                    | abertura de diligência                                       | prazo expira sem resposta → julga-se no estado em que se encontra (não arquiva)          | 900 art.9 [RN-RAIT-004]; default operacional de **15 dias úteis, prorrogável 1x** — aprovado pelo Owner em steering (2026-08-24), ver `_meta/steering.md` A.7                                                                                       |
| T-R2      | 30 dias                                                                                                 | comunicação da decisão de 1ª instância (JARI)                | direito de recorrer ao CETRAN precluído (→ `TRANSITADO`)                                 | CTB art.288 [RN-RAIT-103]                                                                                                                                                                                                                           |
| T-JUL-24M | 24 meses                                                                                                | recebimento do recurso pelo órgão julgador                   | prescrição da pretensão punitiva (art.289-A) — nunca deve ser alcançado operacionalmente | CTB art.285 §6º / art.289 _caput_ / art.289-A                                                                                                                                                                                                       |
| T-PAR-3A  | 3 anos sem movimentação, em qualquer estado                                                             | último ato do processo                                       | prescrição por paralisação                                                               | Lei 9.873/1999 art.1º §1º                                                                                                                                                                                                                           |
| T-DEC     | 180d (360d com defesa)                                                                                  | cometimento da infração                                      | decadência do direito de aplicar a penalidade — herdado de [WF-INF-003]                  | CTB art.282 §§6º-7º                                                                                                                                                                                                                                 |
| Contagem  | dias consecutivos; exclui dia inicial da notificação/edital; inclui vencimento; prorroga ao 1º dia útil | —                                                            | —                                                                                        | [RN-RAIT-005]; CONTRAN-918 art.29                                                                                                                                                                                                                   |
| Suspensão | prazos processuais NÃO se suspendem, salvo força maior regulamentada pelo CONTRAN                       | —                                                            | (regulamentação não localizada — CTB art.290-A)                                          | CTB art.290-A — (fonte pendente, handoff LEGAL). Owner decidiu (steering.md C.20, 2026-08-24): enquanto o regulamento não for localizado, suspensão só existe como **ato administrativo motivado e auditado**, nunca automática — ver [RN-RAIT-105] |

## Atores por transição

| Ator                                                  | Transições onde atua                                                                                                     |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Secretaria/Recepção (multi-canal)                     | `[*]→PROTOCOLADO`, `TRIAGEM_ADMISSIBILIDADE`, `*→COMUNICADO` (expedição), `PROTOCOLADO→ENCERRADO_DESISTENCIA` (registro) |
| Analista (1º circuito)                                | `DISTRIBUIDO→EM_INSTRUCAO`, `EM_INSTRUCAO↔DILIGENCIA`, `PRONTO_P_DECISAO` (prepara para decisão)                         |
| Autoridade de trânsito                                | `PRONTO_P_DECISAO→DECIDIDO_AUTORIDADE`, decide se recorre em caso de provimento JARI ([UC-RAIT-008])                     |
| Relator (2º circuito)                                 | `DISTRIBUIDO→EM_INSTRUCAO`, `EM_INSTRUCAO↔DILIGENCIA`, prepara voto ([UC-RAIT-004])                                      |
| Presidente JARI/CETRAN                                | `PRONTO_P_DECISAO→PAUTADO` (monta pauta), preside `JULGADO_SESSAO` ([WF-RAIT-003])                                       |
| Colegiado (JARI/CETRAN em sessão)                     | `PAUTADO→JULGADO_SESSAO`                                                                                                 |
| Requerente (cidadão/procurador, via PORTAL ou balcão) | `[*]→PROTOCOLADO`, `COMUNICADO→REMETIDO_2A_INSTANCIA` (interpõe recurso), `*→ENCERRADO_DESISTENCIA`                      |
| Gestor RAIT                                           | monitora relógios de extinção cross-cutting; força reatribuição/escalonamento ([UC-RAIT-010], [UC-RAIT-011])             |

## Ponte com [WF-INF-003]

Este workflow é a máquina **operacional interna** do RAIT (filas, atores, SLA); [WF-INF-003]
é a máquina de **estados legais** da infração, cruzando teat/rait/portal (substituiu
[WF-INF-001] por decisão do Owner em 2026-09-12 — ADR-0014). Cada caso RAIT corresponde a um
estado de fase da infração; os eventos desta máquina (§Eventos) são os gatilhos das transições
de [WF-INF-003] §2.

| Este workflow (instancia)                                       | Estado da infração em [WF-INF-003]                                                                                   | Transição de saída em [WF-INF-003]                                                             |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Caso `defesa_previa` (`PROTOCOLADO`→`COMUNICADO`)               | `DEFESA_EM_JULGAMENTO`                                                                                               | acolhida → `AIT_CANCELADO`; indeferida / não conhecida / desistência → `PENALIDADE_A_APLICAR`  |
| Caso `jari` (`PROTOCOLADO`→`COMUNICADO`)                        | `RECURSO_1A_INSTANCIA` (`EM_ADMISSIBILIDADE_1A` → `EM_REMESSA_JARI` → `EM_JULGAMENTO_JARI`)                          | decisão publicada → `AGUARDANDO_RECURSO_2A` (`PROVIDO_1A` \| `NEGADO_1A`)                      |
| `NAO_CONHECIDO` ou `ENCERRADO_DESISTENCIA` (instancia=jari)     | `RECURSO_1A_INSTANCIA`                                                                                               | volta a `NOTIFICADO_PENALIDADE` se `T-NP-VENC` ainda corre; senão `INSTANCIA_ENCERRADA`        |
| Caso `cetran` (`PROTOCOLADO`/`ADMITIDO`→`TRANSITADO`)           | `RECURSO_2A_INSTANCIA` (`EM_ADMISSIBILIDADE_2A` → `EM_JULGAMENTO_CETRAN`; recurso da autoridade nasce em julgamento) | penalidade mantida → `INSTANCIA_ENCERRADA`; favorável ao administrado → `CANCELADO_DEFINITIVO` |
| `TRANSITADO` (instancia=jari, sem recurso em `T-R2`)            | `AGUARDANDO_RECURSO_2A`                                                                                              | `NEGADO_1A` → `INSTANCIA_ENCERRADA`; `PROVIDO_1A` → `CANCELADO_DEFINITIVO`                     |
| `AGUARDANDO_REMESSA_JARI → DISTRIBUIDO` (recebimento pela JARI) | `EM_REMESSA_JARI` → `EM_JULGAMENTO_JARI`                                                                             | arma `T-JUL-24M` e `T-PAR-3A` na infração                                                      |

## Vocabulário canônico e reconciliações

A rodada BPO (que escreveu esta máquina de estados) e a rodada LEGAL (que escreveu
[RN-RAIT-101]..[RN-RAIT-132]) correram em paralelo e cunharam nomes de estado divergentes para
os mesmos fatos. Este documento é a **autoridade** sobre nomes de estado; a tabela abaixo fixa
as reconciliações feitas na rodada de endurecimento de especificação (2026-08-26) e vale como
mapa de leitura para qualquer regra que ainda cite o nome antigo.

| Nome cunhado alhures           | Onde apareceu | Estado/vocabulário canônico                                                                 | Decisão                                                                                                                                                                                                                                             |
| ------------------------------ | ------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AGUARDANDO_REMESSA_JARI`      | [RN-RAIT-107] | `AGUARDANDO_REMESSA_JARI`                                                                   | **adotado** — estado novo entre `ADMITIDO` e `DISTRIBUIDO` para `instancia=jari`. Sem ele não há como marcar o início do relógio B, que corre do _recebimento pela JARI_ e não da admissão                                                          |
| `ARQUIVADO_INTEMPESTIVO`       | [RN-RAIT-109] | `NAO_CONHECIDO` + `motivo_nao_conhecimento='intempestivo'` + `arquivado=true`               | **não vira estado** — o arquivamento do art.285 §5º é consequência do não conhecimento por intempestividade, não um ramo próprio da máquina. O efeito jurídico distinto (sem efeito suspensivo desde a interposição) é atributo do caso, não estado |
| `REMETIDO_CETRAN`              | [RN-RAIT-117] | `REMETIDO_2A_INSTANCIA`                                                                     | renomeado — a máquina é genérica por instância                                                                                                                                                                                                      |
| `ENCERRADO_POR_DESISTENCIA`    | [RN-RAIT-123] | `ENCERRADO_DESISTENCIA`                                                                     | renomeado                                                                                                                                                                                                                                           |
| `DECIDIDO`                     | [RN-RAIT-123] | `DECIDIDO_AUTORIDADE` (1º circuito) ou `JULGADO_SESSAO` (2º)                                | desambiguado — não existe estado "decidido" genérico                                                                                                                                                                                                |
| `DECISAO_PUBLICADA`            | [RN-RAIT-130] | **evento**, não estado                                                                      | permanece como evento de domínio disparado na transição `DECIDIDO_AUTORIDADE\|JULGADO_SESSAO → COMUNICADO`                                                                                                                                          |
| `EM_RECURSO`                   | [RN-RAIT-108] | `RECURSO_1A_INSTANCIA` / `RECURSO_2A_INSTANCIA` com `efeito_suspensivo=true` ([WF-INF-003]) | pertence ao ciclo de vida da **infração**, não ao caso RAIT — o RAIT publica o evento que o provoca (efeito suspensivo), não o possui                                                                                                               |
| `ABERTA` / `ENCERRADA(motivo)` | [RN-RAIT-119] | vocabulário da **instância administrativa**                                                 | vocabulário próprio e legítimo, de granularidade distinta da máquina do caso — não conflita                                                                                                                                                         |

### Eventos de domínio publicados por esta máquina

Consumidos por PORTAL, DASHBOARD e pelo ciclo de vida da infração ([WF-INF-003]):

| Evento                              | Disparado em                                            | Consumidor principal                                  |
| ----------------------------------- | ------------------------------------------------------- | ----------------------------------------------------- |
| `RAIT_CASO_PROTOCOLADO`             | `[*] → PROTOCOLADO`                                     | PORTAL (acompanhamento), DASHBOARD                    |
| `RAIT_EFEITO_SUSPENSIVO_INSTAURADO` | `TRIAGEM_ADMISSIBILIDADE → ADMITIDO`, quando tempestivo | [WF-INF-003] (bloqueio de restrições — [RN-RAIT-108]) |
| `RAIT_RECURSO_RECEBIDO_JULGADOR`    | `AGUARDANDO_REMESSA_JARI → DISTRIBUIDO`                 | DASHBOARD (marco inicial do relógio B)                |
| `RAIT_DECISAO_PUBLICADA`            | `DECIDIDO_AUTORIDADE\|JULGADO_SESSAO → COMUNICADO`      | PORTAL, [WF-INF-003], SNE ([RN-RAIT-125])             |
| `RAIT_CASO_TRANSITADO`              | `COMUNICADO → TRANSITADO`                               | [WF-INF-003] (RENACH/pontuação — [RN-RAIT-131])       |
| `RAIT_ALERTA_PRESCRICAO`            | mudança de bandeira em [WF-RAIT-002] §4                 | DASHBOARD, cadeia de escalonamento                    |

## Decisões de modelagem pendentes

- ~~Prazo de diligência (T-DIL)~~ — **RESOLVIDO (steering.md A.7, 2026-08-24):** 15 dias úteis,
  prorrogável 1x.
- Regulamentação de "força maior" (CTB art.290-A) para suspensão de prazo — ainda não
  localizada; handoff ao LEGAL já registrado em `refs/INDEX.md` §Gaps. **Decisão interina do
  Owner (steering.md C.20, 2026-08-24):** só ato administrativo motivado e auditado, nunca
  suspensão automática, até o regulamento ser localizado.
- Se um caso `instancia=defesa_previa` `NAO_CONHECIDO` gera, por si, direito a recurso próprio
  ao 2º circuito, ou se o não-conhecimento da defesa simplesmente segue o rito comum de
  "sem defesa" em [WF-INF-003] (que já permite recurso JARI contra a penalidade resultante) —
  tratado aqui como o segundo caminho (mais simples, sem duplicar direito recursal); confirmar
  com LEGAL. _(não coberto pela rodada de steering de 2026-08-24 — segue em aberto)_

## Decisões

- **2026-08-24** — Owner, em conversa de steering (`_meta/steering.md` A.7, C.20): T-DIL
  fixado em 15 dias úteis prorrogável 1x; suspensão de prazo só por ato motivado e auditado
  enquanto o regulamento CONTRAN de força maior não for localizado. Ver seções acima.
- **2026-09-12** — Owner: [WF-INF-003] substitui [WF-INF-001] (ADR-0014). §Ponte reescrita
  contra o novo vocabulário; consumidores dos eventos e o mapeamento de `EM_RECURSO` atualizados.
  Sem alteração nos estados, transições ou prazos deste workflow.
