---
id: UC-PEC-013
title: Operar a distribuição de exames entre clínicas credenciadas
status: draft
apps: [pec]
sources: [REF-CFM-1636-2002, REF-CONTRAN-927-2022]
updated: 2026-08-26
---

## Ator e objetivo

Sistema distribui a solicitação de exame entre as clínicas e peritos credenciados, de modo que o
candidato **não escolha o examinador** — exigência do art. 3º da Res. CFM 1.636/2002, cuja
inobservância expõe pessoalmente o diretor médico do DETRAN em regime ético-disciplinar.

> **Decisão de produto em aberto (DT-021).** [RN-PEC-113] propõe quatro posições de conformidade;
> a recomendação técnica de LEGAL é a **P2** — o candidato escolhe região e data, o sistema sorteia
> clínica e perito dentro do conjunto elegível. Este caso de uso está escrito **para P2**, com os
> pontos que mudariam sob P1 (sorteio puro) ou P3 (status quo) marcados. Promovido de `stub` na
> rodada de 2026-08-26; permanece `draft` até a decisão.

## Pré-condições

- Processo RENACH aberto e etapas exigidas determinadas ([UC-PEC-001]).
- Existe ao menos uma clínica credenciada, ativa e elegível na jurisdição.

## Fluxo principal (posição P2)

1. Candidato ou recepção registra a solicitação de exame **sem indicar clínica ou perito** —
   a etapa de "escolher clínica" deixa de existir na interface.
2. Candidato indica **região** e **janela de data** de preferência — a liberdade que P2 preserva,
   e que P1 não teria.
3. Sistema calcula o pool elegível: clínicas credenciadas e ativas na jurisdição, excluídas as de
   credenciamento vencido ou suspenso, e excluídos peritos impedidos para aquele candidato.
4. Sistema sorteia clínica e perito dentro do pool, por mecanismo auditável e equitativo, e
   **registra o sorteio** — semente, pool considerado e resultado — de modo que a impessoalidade
   seja verificável depois, não apenas afirmada.
5. Agendamento é criado com a clínica sorteada e segue [WF-PEC-003] a partir de `SCHEDULED`.

## Fluxos alternativos / exceções

- **3a. Pool vazio na região/janela escolhidas.** Sistema informa e oferece ampliar região ou
  janela — nunca devolve a escolha da clínica ao candidato como saída.
- **4a. Recusa justificada da clínica sorteada** (impedimento superveniente, indisponibilidade):
  novo sorteio no pool remanescente, com o motivo registrado; a recusa não pode virar mecanismo
  indireto de escolha.
- **5a. Reagendamento pelo candidato.** Mantém a clínica sorteada por padrão; alterar a clínica
  exige novo sorteio, não seleção.
- **Sob P1** (sorteio puro): os passos 2 e 5a desaparecem — sem escolha de região ou data.
- **Sob P3** (status quo): este caso de uso não se aplica; o candidato escolhe a clínica, e o
  risco ético-disciplinar sobre o diretor médico permanece documentado em [RN-PEC-113].

## Pós-condições

Solicitação vinculada a clínica e perito determinados por sorteio auditável, com registro que
permite demonstrar a impessoalidade da distribuição; agendamento criado.

## Critérios de aceitação

**AC-PEC-013-1 — o candidato nunca escolhe clínica nem perito**

- **Dado** a solicitação de exame
- **Quando** a interface é apresentada
- **Então** não há seletor de clínica nem de profissional ([RN-PEC-113], CFM 1.636 art. 3º) — sob
  P2 o candidato escolhe **região e data**, o que é coisa diferente

**AC-PEC-013-2 — o sorteio é auditável, não apenas aleatório**

- **Dado** um sorteio executado
- **Quando** é auditado depois
- **Então** o registro permite reconstruir o pool considerado e o critério aplicado — "confie no
  algoritmo" não demonstra impessoalidade perante o conselho profissional

**AC-PEC-013-3 — o pool exclui quem não pode examinar**

- **Dado** o cálculo do pool
- **Quando** ocorre
- **Então** exclui credenciamento vencido ou suspenso e peritos impedidos para aquele candidato

**AC-PEC-013-4 — recusa da clínica não vira escolha indireta**

- **Dado** uma clínica sorteada que recusa
- **Quando** o caso é redistribuído
- **Então** há novo sorteio com motivo registrado, e o sistema detecta padrão de recusas
  recorrentes — que seria burla à impessoalidade

**AC-PEC-013-5 — a distribuição converge com o desenho antifraude**

- **Dado** o objetivo antifraude do PEC (biometria de presença, assinatura qualificada,
  imutabilidade)
- **Quando** a distribuição é implementada
- **Então** ela o reforça: eliminar a escolha livre remove o vetor de _shopping_ por laudo
  favorável, que as demais barreiras não alcançam

## Regras aplicáveis

- [RN-PEC-113] (regime de distribuição — quatro posições de conformidade; recomendação P2)
- [RN-PEC-107] (ato pericial pessoal e indelegável — o perito sorteado é quem examina e assina)
- Referência: [WF-PEC-004] (os dois regimes lado a lado), [WF-PEC-003] (agendamento a jusante)
