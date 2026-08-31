---
id: UC-RAIT-010
title: Gestor RAIT monitora risco de prescrição
status: approved
apps: [rait, dashboard]
sources: [REF-CTB-extracts-raw, REF-LEI-9873-1999]
updated: 2026-08-26
---

## Ator e objetivo

Gestor RAIT acompanha, em painel consolidado, os casos que se aproximam de qualquer um dos
três relógios de extinção de punibilidade ([WF-RAIT-001] §Relógios), intervindo antes que um
caso atinja o teto legal.

## Pré-condições

Existem casos ativos com bandeira de risco calculada pela plataforma ([WF-RAIT-002] §4/§6).

## Fluxo principal

1. Gestor abre o painel de risco de prescrição (dashboard), segmentado por relógio (A —
   decadência 180/360d; B — inércia recursal 24 meses; C — paralisação 3 anos), por pool e por
   nível de alerta (`ALERTA_N1`…`CRITICO`).
2. Sistema notifica automaticamente o gestor a cada caso que atinge `ALERTA_N3` ou `CRITICO`
   ([WF-RAIT-002] §6 — cadeia de escalonamento).
3. Gestor avalia a causa do atraso: sobrecarga de pool, relator ausente/impedido, diligência
   pendente, sessões adiadas por falta de quorum.
4. Gestor aciona a ação corretiva apropriada: reatribuição de caso ([UC-RAIT-011]),
   priorização forçada em pauta ([UC-RAIT-005]), ou escalonamento ao presidente
   JARI/CETRAN para sessão extraordinária.
5. Se, apesar da intervenção, um caso atinge o teto legal (`PRESCRITO_OPERACIONAL`): gestor
   abre registro de incidente, documenta a causa raiz, e comunica ao LEGAL/auditoria.

## Fluxos alternativos / exceções

- **3a.** Padrão sistêmico identificado (ex.: múltiplos casos parados no mesmo pool por falta
  de relator ativo): gestor escala como problema estrutural de capacidade, não caso a caso —
  alimenta o modelo de capacidade em `APP.md`/`bpo-notes.md` (dados de volume pendentes do
  Owner).
- **5a.** Prescrição por paralisação (relógio C) detectada em caso que ainda está longe do
  relógio B: é o cenário típico de "caso esquecido" — sinaliza falha de distribuição/pool, não
  de julgamento.

## Pós-condições

Casos em risco tratados antes do teto legal; incidentes de prescrição (se ocorrerem)
documentados e comunicados.

## Critérios de aceitação

**AC-RAIT-010-1 — o radar segmenta pelos três relógios**

- **Dado** casos ativos com bandeira calculada
- **Quando** o gestor abre o painel
- **Então** pode segmentar por relógio (A — decadência 180/360d; B — inércia 24 meses; C — paralisação 3 anos), por pool e por nível de alerta, e cada caso mostra **dias restantes até o teto legal**, não apenas a cor da bandeira

**AC-RAIT-010-2 — o escalonamento notifica sem depender de o gestor abrir o painel**

- **Dado** um caso que atinge `ALERTA_N3` ou `CRITICO`
- **Quando** a bandeira muda
- **Então** o sistema notifica ativamente a cadeia do nível correspondente ([WF-RAIT-002] §6) e publica `RAIT_ALERTA_PRESCRICAO`

**AC-RAIT-010-3 — movimentação reseta apenas o relógio C**

- **Dado** um caso em `ALERTA_N2` pelo relógio C e `ALERTA_N1` pelo relógio B
- **Quando** uma movimentação é registrada
- **Então** o relógio C reinicia e a bandeira C volta a `SEM_RISCO`, enquanto o relógio B segue inalterado — as bandeiras são por relógio, nunca uma só bandeira agregada

**AC-RAIT-010-4 — atingir o teto legal abre incidente obrigatório**

- **Dado** um caso que atinge `PRESCRITO_OPERACIONAL`
- **Quando** o teto é alcançado
- **Então** o sistema abre registro de incidente, exige documentação de causa raiz e notifica LEGAL/auditoria — o caso não pode ser encerrado silenciosamente

**AC-RAIT-010-5 — a informação crítica não depende de cor**

- **Dado** o radar em uso por pessoa com baixa percepção de cor
- **Quando** os casos são listados
- **Então** a urgência é comunicada também por ordenação e por rótulo textual explícito, além da cor

## Regras aplicáveis

- Referência: [WF-RAIT-001] §Relógios de extinção de punibilidade
- Referência: [WF-RAIT-002] §4-§6 (escada de SLA e escalonamento)
