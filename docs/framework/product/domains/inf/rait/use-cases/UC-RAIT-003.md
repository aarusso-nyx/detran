---
id: UC-RAIT-003
title: Analista instrui o caso e conduz diligência
status: approved
apps: [rait]
sources: [REF-CONTRAN-900, REF-CONTRAN-918]
updated: 2026-08-26
---

## Ator e objetivo

Analista (1º circuito) ou relator (2º circuito, antes de preparar o voto — ver [UC-RAIT-004])
reúne e examina o dossiê do caso admitido, solicitando documentos/provas complementares
quando necessário, até reunir condições de decidir.

## Pré-condições

Caso em `DISTRIBUIDO`, já assumido pelo responsável ([WF-RAIT-002]).

## Fluxo principal

1. Responsável assume o caso da fila ([WF-RAIT-002] §2 — pull/round-robin/balanceamento) →
   caso passa a `EM_INSTRUCAO`.
2. Responsável examina o dossiê: AIT, NA/NP, evidências (do TEAT, quando aplicável), petição e
   anexos do requerente.
3. Se a instrução está completa, caso passa a `PRONTO_P_DECISAO` — segue para
   `DECIDIDO_AUTORIDADE` (1º circuito, [UC-RAIT-003] encerra aqui) ou `PAUTADO` (2º circuito,
   segue para [UC-RAIT-004]/[UC-RAIT-005]).
4. Se faltam provas/documentos, responsável abre diligência fixando prazo ao requerente ou ao
   órgão autuador → caso passa a `DILIGENCIA` (900 art.9º, [RN-RAIT-004]).
5. Resposta chega dentro do prazo → anexada ao dossiê, caso retorna a `EM_INSTRUCAO`.
6. Prazo expira sem resposta → sistema **não arquiva** — caso avança automaticamente a
   `PRONTO_P_DECISAO`, julgando-se no estado em que se encontra ([RN-RAIT-004]).

## Fluxos alternativos / exceções

- **2a.** Informação/documento que o próprio órgão já possui está ausente do dossiê:
  responsável deve suprir de ofício, não pode exigir do requerente ([RN-RAIT-003], CONTRAN-900
  art.10).
- **4a.** Requerente desiste por escrito durante a instrução ou a diligência → segue
  [UC-RAIT-012], caso encerra em `ENCERRADO_DESISTENCIA`.
- **6a.** Diligência expirada em caso próximo do relógio B/C de prescrição
  ([WF-RAIT-002] §4): o avanço automático a `PRONTO_P_DECISAO` é ainda mais crítico para não
  perder o SLA — o dashboard deve destacar esses casos.

## Pós-condições

Caso em `PRONTO_P_DECISAO`, dossiê completo (ou completo no limite do que foi possível
diligenciar), pronto para decisão de autoridade ou inclusão em pauta.

## Critérios de aceitação

**AC-RAIT-003-1 — assumir o caso é o que inicia a instrução**

- **Dado** um caso em `DISTRIBUIDO`
- **Quando** o responsável o assume pela estratégia configurada no pool ([WF-RAIT-002] §2)
- **Então** o caso passa a `EM_INSTRUCAO`, com responsável e timestamp registrados, e o relógio C (paralisação) é reiniciado pela movimentação

**AC-RAIT-003-2 — diligência exige prazo explícito**

- **Dado** um responsável abrindo diligência
- **Quando** a diligência é registrada
- **Então** o sistema exige prazo, aplica o default de 15 dias úteis prorrogável 1x (steering A.7) e nunca permite diligência sem prazo ([RN-RAIT-004])

**AC-RAIT-003-3 — diligência vencida avança, não arquiva**

- **Dado** um caso em `DILIGENCIA` cujo prazo expirou sem resposta
- **Quando** o timer T-DIL vence
- **Então** o sistema transita automaticamente para `PRONTO_P_DECISAO` — julga-se no estado em que se encontra ([RN-RAIT-004]) — e em nenhuma hipótese arquiva ou encerra o caso

**AC-RAIT-003-4 — prorrogação de diligência é única**

- **Dado** uma diligência já prorrogada uma vez
- **Quando** o responsável tenta prorrogar novamente
- **Então** o sistema recusa, salvo ato administrativo motivado e auditado ([RN-RAIT-105])

**AC-RAIT-003-5 — não se exige do requerente o que o órgão já tem**

- **Dado** um documento ausente do dossiê que consta de sistema do próprio órgão (AIT, NA, NP, evidências do TEAT)
- **Quando** o responsável abre diligência
- **Então** o sistema impede endereçar essa diligência ao requerente e a direciona ao órgão autuador ([RN-RAIT-003], CONTRAN-900 art.10)

**AC-RAIT-003-6 — resposta tempestiva retoma a instrução**

- **Dado** um caso em `DILIGENCIA` com resposta anexada dentro do prazo
- **Quando** a resposta é registrada
- **Então** o caso retorna a `EM_INSTRUCAO`, a resposta integra o dossiê e o relógio C é reiniciado

## Regras aplicáveis

- [RN-RAIT-003] (dever de suprir de ofício)
- [RN-RAIT-004] (diligência com prazo; julgamento no estado se não atendida)
- [RN-RAIT-005] (contagem do prazo de diligência)
