---
id: UC-RAIT-019
title: Membro pede vista de item em sessão e o presidente reprograma o julgamento
status: draft
apps: [rait]
sources: [REF-CONTRAN-901-2022, REF-CONTRAN-357, REF-JARI-ORGANIZACAO-BENCHMARK]
updated: 2026-09-12
---

## Ator e objetivo

Membro do colegiado, após a leitura do relatório, pede vista de um item pautado; o presidente concede prazo e o item volta à pauta seguinte com prioridade, sem parar os relógios legais.

## Pré-condições

- Sessão em `RELATORIA_LIDA` ou `VOTACAO` para o item ([WF-RAIT-003]); membro presente, não impedido no item.

## Fluxo principal

1. Membro pede vista; presidente defere com prazo (proposta: até a sessão ordinária seguinte, prorrogável uma vez por motivo registrado — benchmarks PB e MG).
2. Item sai da votação e retorna a `PRONTO_P_DECISAO` marcado como "vista concedida", com prioridade obrigatória na próxima pauta ([UC-RAIT-005]).
3. Membro registra voto-vista no sistema até o fechamento da pauta seguinte.
4. Na sessão seguinte, o item é julgado com o voto do relator e o voto-vista; se o relator for vencido, o presidente designa redator do acórdão (benchmark PB art. 43 e MG art. 34 §2º).

## Fluxos alternativos / exceções

- **1a.** Regimento local não admitir vista **(pendente regimento)**: o pedido é registrado como manifestação e o item é votado.
- **3a.** Voto-vista não registrado no prazo: item entra na pauta assim mesmo e a omissão conta como retenção no perfil do membro ([WF-RAIT-002] §5).
- **2a.** Item em `CRITICO`: o presidente pode indeferir a vista por risco de prescrição, com registro.

## Pós-condições

Item reprogramado com prioridade; voto-vista anexado; relógios legais inalterados.

## Critérios de aceitação

**AC-RAIT-019-1 — vista não suspende nenhum relógio**

- **Dado** um item com vista concedida
- **Quando** o prazo da vista corre
- **Então** `T-JUL-24M` e `T-PAR-3A` seguem correndo; a vista é movimentação que reinicia só o relógio C

**AC-RAIT-019-2 — o item volta com prioridade**

- **Dado** um item com vista
- **Quando** a próxima pauta é fechada
- **Então** o item é obrigatório na pauta, à frente da ordem FIFO

**AC-RAIT-019-3 — redator do voto vencedor**

- **Dado** um relator vencido
- **Quando** a decisão é proclamada
- **Então** o sistema exige designação de redator e o registra na ata

## Regras aplicáveis

- [RN-RAIT-116], [RN-RAIT-117] (colegiado e quorum)
- [RN-RAIT-105] (prazos não se suspendem)
- [REF-CONTRAN-901-2022] Anexo 11.1 (processo de relatoria e pedido de vistas — regimento local)
