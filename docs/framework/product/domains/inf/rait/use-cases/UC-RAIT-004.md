---
id: UC-RAIT-004
title: Relator prepara parecer e voto (2º circuito)
status: approved
apps: [rait]
sources: [REF-CONTRAN-357, REF-CETRAN-PROCESSO-INTERNO]
updated: 2026-08-26
---

## Ator e objetivo

Relator (membro da JARI ou do CETRAN-AM sorteado para o caso) elabora parecer fundamentado e
voto sobre um recurso já instruído, para apresentação em sessão de julgamento.

## Pré-condições

- Caso em `EM_INSTRUCAO`/`PRONTO_P_DECISAO`, `instancia` ∈ {`jari`, `cetran`}.
- Relator sorteado/distribuído sem impedimento declarado ([WF-RAIT-002] §5).

## Fluxo principal

1. Relator recebe o caso via distribuição por sorteio ([WF-RAIT-002] §3).
2. Relator declara ausência de impedimento (não lavrou o AIT; não integra simultaneamente
   JARI e CETRAN no mesmo processo — CONTRAN-357 itens 4.1.c, 5.1.c).
3. Relator examina o dossiê completo (instruído em [UC-RAIT-003]) e, se necessário, solicita
   diligência complementar (retorna a [UC-RAIT-003] fluxo de diligência).
4. Relator elabora o parecer: resumo descritivo, análise fundamentada, voto (provimento,
   não-provimento, ou não-conhecimento) — modelo CETRAN-ES art.26.
5. Relator registra o parecer no sistema dentro do prazo interno de elaboração de voto
   (proposta: 20 dias — [WF-RAIT-003] T-VOTO, `pendente regimento JARI-AM/CETRAN-AM`).
6. Caso passa a `PRONTO_P_DECISAO` → aguarda inclusão em pauta ([UC-RAIT-005]).

## Fluxos alternativos / exceções

- **2a.** Impedimento declarado: caso é redistribuído a outro relator antes de qualquer
  trabalho ser iniciado ([WF-RAIT-002] §5, estado `IMPEDIDO`).
- **5a.** Prazo interno de voto vencido sem parecer registrado: modelo de referência
  (CETRAN-ES) prevê advertência ao relator, escalando a afastamento em caso de reincidência —
  ver [WF-RAIT-002] §5 (`ADVERTIDO`→`AFASTADO_TEMP`); caso permanece na fila e é elegível a
  reatribuição ([UC-RAIT-011]) se o atraso ameaçar o relógio B/C de prescrição.

## Pós-condições

Parecer e voto do relator registrados e vinculados ao caso; caso pronto para pauta.

## Critérios de aceitação

**AC-RAIT-004-1 — impedimento é declarado antes de qualquer acesso ao mérito**

- **Dado** um relator recém-distribuído
- **Quando** ele abre o caso pela primeira vez
- **Então** o sistema exige declaração de ausência de impedimento (não lavrou o AIT; não integra simultaneamente JARI e CETRAN no mesmo processo — [RN-RAIT-116], CONTRAN-357 itens 4.1.c e 5.1.c) antes de liberar o dossiê

**AC-RAIT-004-2 — impedimento declarado redistribui sem rastro de mérito**

- **Dado** um relator que declara impedimento
- **Quando** a declaração é registrada
- **Então** o caso retorna ao pool e é redistribuído a outro membro ([UC-RAIT-011]), o impedimento fica registrado no histórico do caso, e nenhum trabalho de mérito daquele relator é aproveitado

**AC-RAIT-004-3 — o voto tem as três partes exigidas**

- **Dado** um relator registrando o parecer
- **Quando** submete
- **Então** o sistema exige resumo descritivo, análise fundamentada e voto conclusivo em {`provimento`, `não-provimento`, `não-conhecimento`} — parecer sem conclusão explícita não é aceito

**AC-RAIT-004-4 — o prazo interno de voto é medido, e é distinto do teto legal**

- **Dado** um caso distribuído a relator em D
- **Quando** D+20 dias corridos é atingido sem parecer registrado (T-VOTO, [WF-RAIT-003])
- **Então** o sistema registra o atraso no perfil do relator ([WF-RAIT-002] §5, `ADVERTIDO`), sinaliza o caso ao coordenador, e apresenta o atraso sempre rotulado como **meta operacional**, jamais como o teto legal de 24 meses

**AC-RAIT-004-5 — atraso de voto que ameaça relógio de prescrição escala**

- **Dado** um caso com parecer pendente e bandeira `ALERTA_N3` ou `CRITICO`
- **Quando** o gestor consulta o radar ([UC-RAIT-010])
- **Então** o caso aparece como elegível a reatribuição obrigatória ([UC-RAIT-011]), independentemente do prazo interno de voto ainda não vencido

## Regras aplicáveis

- [RN-RAIT-116] (composição, quorum e impedimentos da JARI — CONTRAN-357 itens 4-5);
  [RN-RAIT-117] (competência do CETRAN-AM)
- [RN-RAIT-004] (se diligência complementar for aberta durante a relatoria)
