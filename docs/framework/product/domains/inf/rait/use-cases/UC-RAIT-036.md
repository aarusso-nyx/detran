---
id: UC-RAIT-036
title: Secretaria apura presenças e relatorias e gera a folha de remuneração por sessão (jeton)
status: draft
apps: [rait, dashboard]
sources: [REF-CONTRAN-357, REF-CONTRAN-901-2022, REF-JARI-ORGANIZACAO-BENCHMARK]
updated: 2026-09-12
---

## Ator e objetivo

Secretaria do colegiado apura, por período, as sessões realizadas, as presenças válidas e as relatorias de cada membro, aplica as regras locais de remuneração por sessão (teto mensal, exigência de relatoria mínima, sessões extraordinárias) e envia a folha ao RH/financeiro para pagamento.

## Pré-condições

- Sessões do período em `ATA_ASSINADA`; presenças em `rait_attendance`; votos e relatorias registrados.
- Regra local de jeton (valor, teto mensal, condições) **(fonte pendente — legislação/regimento do AM não localizados; benchmark em [REF-JARI-ORGANIZACAO-BENCHMARK])**.

## Fluxo principal

1. Sistema consolida por membro: sessões com presença válida (chegada/saída dentro da sessão), itens relatados, votos proferidos, faltas justificadas e injustificadas.
2. Aplica a regra parametrizada: valor por sessão, teto mensal de sessões remuneradas (benchmarks: 8 a 15), condição de relatoria mínima por sessão (RS: um processo relatado), presidente remunerado ou não (DF: não), extraordinárias.
3. Gera a folha do período com memória de cálculo por membro; secretaria confere e o presidente homologa.
4. Folha enviada ao RH/financeiro por integração ou arquivo assinado; eventos de pagamento retornam ao sistema para conciliação.

## Fluxos alternativos / exceções

- **2a.** Sessão além do teto: marcada como não remunerada, com anuência prévia registrada ([UC-RAIT-021] 2a).
- **1a.** Presença sem voto em nenhum item: conforme a regra local, pode não gerar jeton; o sistema aplica o parâmetro e explica.
- **3a.** Contestação do membro: retificação com nova homologação; histórico preservado.

## Pós-condições

Folha de jeton gerada, homologada e enviada; memória de cálculo auditável.

## Critérios de aceitação

**AC-RAIT-036-1 — a folha nasce dos registros de sessão**

- **Dado** um mês com 6 sessões
- **Quando** a folha é gerada
- **Então** cada linha aponta as sessões, presenças e relatorias que a sustentam

**AC-RAIT-036-2 — o teto é aplicado automaticamente**

- **Dado** um membro com 10 presenças e teto de 8
- **Quando** a folha é gerada
- **Então** 8 remuneradas, 2 marcadas como excedentes

**AC-RAIT-036-3 — parâmetro sem fonte bloqueia**

- **Dado** regra de jeton não configurada
- **Quando** a folha é solicitada
- **Então** o sistema não gera valores e aponta o parâmetro pendente

## Regras aplicáveis

- [RN-RAIT-116], [RN-RAIT-117] (colegiados)
- [RN-RAIT-142] (faltas e suplência)
- [REF-CONTRAN-357] item 9.2 (apoio financeiro do órgão)
