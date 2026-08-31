---
id: UC-RAIT-006
title: Colegiado julga em sessão
status: approved
apps: [rait]
sources: [REF-CONTRAN-357, REF-CETRAN-PROCESSO-INTERNO]
updated: 2026-08-28
---

## Ator e objetivo

Colegiado (JARI ou CETRAN-AM) delibera em sessão sobre os casos pautados, produzindo decisão
fundamentada por caso, registrada em ata.

## Pré-condições

Sessão convocada, casos em `PAUTADO` ([UC-RAIT-005]).

## Fluxo principal

1. Secretaria abre a sessão na data/hora convocada; sistema verifica quorum (maioria simples
   - presidente/suplente presente — CONTRAN-357 item 8.2; `pendente regimento` para o número
     mínimo do CETRAN-AM).
2. Com quorum, para cada caso pautado: relator apresenta parecer/voto (`RELATORIA_LIDA`).
3. Sustentação oral (`SUSTENTACAO_ORAL`) é **omitida por padrão** — decisão do Owner
   (`_meta/open-issues.md` DT-011, 2026-08-28), não configurável. O fluxo padrão segue direto de
   `RELATORIA_LIDA` para `VOTACAO`; o estado só é alcançado se um regimento local vier a admiti-la
   formalmente no futuro.
4. Membros votam (`VOTACAO`) — decisão por maioria simples (CONTRAN-357 item 8.3).
5. Se houver empate, aplica-se a regra de desempate (`DESEMPATE_PRESIDENTE` —
   `pendente regimento`, proposta de voto de qualidade do presidente).
6. Presidente proclama a decisão (`DECISAO_PROCLAMADA`) — provido, negado, ou não-conhecido.
7. Repete-se 2-6 para cada caso da pauta; ao final, secretaria lavra a ata consolidada da
   sessão (`ATA_LAVRADA`) e o presidente (+ relator) assina (`ATA_ASSINADA`).
8. Cada caso julgado retorna a [WF-RAIT-001] como `JULGADO_SESSAO`, seguindo para comunicação
   ([UC-RAIT-007]).

## Fluxos alternativos / exceções

- **1a.** Sem quorum: sessão adiada (`SESSAO_ADIADA`), todos os casos pautados retornam à
  formação de pauta; relógios de prescrição continuam correndo — sessões adiadas
  repetidamente devem ser sinalizadas no dashboard como risco sistêmico.
- **6a.** Decisão de provimento em caso `instancia=jari`: sistema registra a necessidade de
  informar ao recorrente se a autoridade recorrerá (CONTRAN-918 art.17 §ú) — segue
  [UC-RAIT-008].
- **6b.** Decisão em caso `instancia=cetran`: é irrecorrível administrativamente (CTB art.290)
  — o caso só pode seguir para `TRANSITADO` após comunicação.

## Pós-condições

Cada caso pautado tem decisão fundamentada registrada e ata assinada; casos avançam a
`JULGADO_SESSAO`→`COMUNICADO`.

## Critérios de aceitação

**AC-RAIT-006-1 — sem quorum a sessão não abre**

- **Dado** uma sessão convocada da JARI com presença inferior à maioria simples dos integrantes, ou sem o presidente nem seu suplente
- **Quando** a secretaria tenta abrir a sessão
- **Então** o sistema recusa a abertura, transita a sessão para `SESSAO_ADIADA` ([WF-RAIT-003]), devolve todos os casos a `PRONTO_P_DECISAO` e registra o adiamento como sinal de risco ([RN-RAIT-116], CONTRAN-357 item 8.2)

**AC-RAIT-006-2 — relógios continuam correndo durante o adiamento**

- **Dado** uma sessão adiada por falta de quorum
- **Quando** os casos retornam à formação de pauta
- **Então** nenhum relógio de prescrição é pausado ou reiniciado pelo adiamento, e as bandeiras de risco seguem evoluindo

**AC-RAIT-006-3 — quorum de deliberação é verificado por caso, não só na abertura**

- **Dado** uma sessão aberta em que um membro se retira antes da votação de um caso
- **Quando** aquele caso é votado
- **Então** o sistema reverifica o quorum antes de proclamar a decisão e impede a proclamação se o quorum não se mantém

**AC-RAIT-006-4 — impedimento por caso é respeitado na votação**

- **Dado** um membro impedido para um caso específico ([RN-RAIT-116], CONTRAN-357 item 5.1.c)
- **Quando** aquele caso é votado
- **Então** o sistema não computa seu voto e o desconta do cálculo de maioria daquele caso

**AC-RAIT-006-5 — a decisão é por maioria simples, com voto individual registrado**

- **Dado** um caso em `VOTACAO`
- **Quando** os votos são registrados
- **Então** cada voto individual fica vinculado ao membro e ao caso, o resultado é apurado por maioria simples (CONTRAN-357 item 8.3), e a decisão exige fundamentação registrada para ser proclamada

**AC-RAIT-006-6 — empate resolve por voto de qualidade do presidente**

- **Dado** uma votação empatada
- **Quando** o presidente exerce o voto de qualidade (`DESEMPATE_PRESIDENTE`)
- **Então** o desempate é registrado como tal na ata, distinguível de um voto ordinário — sujeito à validação do regimento local quando obtido ([WF-RAIT-003])

**AC-RAIT-006-7 — a ata é gerada dos registros, não redigida do zero**

- **Dado** uma sessão com decisões proclamadas
- **Quando** a secretaria lavra a ata
- **Então** o sistema a gera a partir dos registros ao vivo (pauta, presentes, quorum, relatoria, votos individuais, resultado, fundamentação) e a submete a assinatura PAdES+TSA do presidente ([WF-RAIT-003], steering A.8)

**AC-RAIT-006-8 — provimento em JARI abre a janela da autoridade**

- **Dado** um caso `instancia=jari` com resultado `provido`
- **Quando** a decisão é proclamada
- **Então** o sistema abre a janela de 30 dias para a autoridade decidir se recorre ([UC-RAIT-008], CTB art.288 §1º) e marca a comunicação para informar o requerente a respeito ([RN-RAIT-130], CONTRAN-918 art.17 §ú)

**AC-RAIT-006-9 — decisão do CETRAN encerra a instância**

- **Dado** um caso `instancia=cetran` julgado
- **Quando** a decisão é proclamada e comunicada
- **Então** o único destino disponível ao caso é `TRANSITADO` — o sistema não oferece caminho de recurso administrativo ([RN-RAIT-119], CTB art.290)

## Regras aplicáveis

- [RN-RAIT-116] (quorum e composição da JARI); [RN-RAIT-117] (competência do CETRAN-AM)
- Referência: [WF-RAIT-003] (máquina completa da sessão)
