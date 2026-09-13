---
id: UC-RAIT-013
title: Coordenador publica a escala semanal e designa o plantão
status: draft
apps: [rait]
sources: [REF-CONTRAN-357, REF-DETRANAM-SERVICOS]
updated: 2026-09-12
---

## Ator e objetivo

Coordenador do pool (defesa prévia) ou secretaria do colegiado (JARI/CETRAN-AM, sob orientação do
presidente) publica, para a semana seguinte, quem está disponível, quem está em plantão e quais
ausências estão programadas, de modo que a distribuição só alcance quem pode trabalhar.

## Pré-condições

- Membros cadastrados no pool com estado de accountability `ATIVO` ([WF-RAIT-002] §5).
- Calendário de feriados nacional + AM carregado (steering A.6).

## Fluxo principal

1. Coordenador abre a escala da semana seguinte; sistema pré-preenche com a escala vigente e as
   ausências já registradas.
2. Coordenador ajusta disponibilidade por membro e dia (`DISPONIVEL` / `AUSENTE_PROGRAMADO`) e o
   limite de casos simultâneos (`WIP`) quando diferente do padrão do pool.
3. Coordenador designa o plantão de risco (`EM_PLANTAO`) e, no colegiado, o suplente de plantão por
   sessão do calendário.
4. Sistema valida: há ao menos um plantonista por dia útil; a capacidade projetada (membros
   disponíveis × meta diária) cobre a chegada média; nenhum membro `AFASTADO_TEMP` ou
   `MANDATO_ENCERRADO` está escalado.
5. Coordenador publica; a escala fica visível a todos os membros e ao gestor RAIT, com histórico
   de versões.

## Fluxos alternativos / exceções

- **4a.** Capacidade projetada abaixo da chegada média: sistema alerta e o coordenador registra a
  medida (hora extra, redistribuição, pedido de reforço) ou aceita o risco com justificativa.
- **5a.** Ausência imprevista após a publicação: membro passa a `AUSENTE_PROGRAMADO` a partir da
  data informada; casos com prazo vencendo no período são reatribuídos ([UC-RAIT-011]); o plantão
  passa ao substituto designado.

## Pós-condições

Escala publicada; elegibilidade de distribuição atualizada; plantão do período definido.

## Critérios de aceitação

**AC-RAIT-013-1 — só quem está escalado recebe trabalho**

- **Dado** um membro `AUSENTE_PROGRAMADO` no dia
- **Quando** a fila é consumida ou um lote é sorteado
- **Então** o membro não é elegível, e o sistema registra a escala vigente no ato de distribuição

**AC-RAIT-013-2 — todo dia útil tem plantonista**

- **Dado** uma escala em publicação
- **Quando** algum dia útil fica sem `EM_PLANTAO`
- **Então** a publicação é bloqueada até a designação

**AC-RAIT-013-3 — a escala é auditável**

- **Dado** um caso distribuído em D
- **Quando** se consulta o histórico
- **Então** aparece quem estava escalado e de plantão em D

## Regras aplicáveis

- [RN-RAIT-141] (distribuição impessoal e auditável)
- [RN-RAIT-142] (suplência e substituição)
- [RN-RAIT-116] (mandato e perda de mandato)
