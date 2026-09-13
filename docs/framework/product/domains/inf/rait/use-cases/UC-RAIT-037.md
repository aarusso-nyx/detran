---
id: UC-RAIT-037
title: RH e gabinete gerem os mandatos dos membros: nomeação, posse, recondução, término e perda
status: draft
apps: [rait]
sources: [REF-CONTRAN-357, REF-CONTRAN-901-2022]
updated: 2026-09-12
---

## Ator e objetivo

Área de gestão de pessoas e gabinete do órgão (JARI: chefe do Executivo ou delegado; CETRAN-AM: Governador, com aprovação da ALEAM) registram no sistema os atos de nomeação, posse, recondução, término e perda de mandato, que determinam quem pode integrar pools, bancas e sorteios.

## Pré-condições

- Ato de nomeação/designação publicado (JARI: 357 item 6.2; CETRAN: 901 Anexo 7); vagas por representação definidas ([RN-RAIT-116], [RN-RAIT-117]).

## Fluxo principal

1. Gabinete registra o ato: membro, representação, titular/suplente, mandato (JARI 1 a 2 anos; CETRAN 2 anos), recondução permitida conforme regimento.
2. Sistema cria/atualiza o membro no pool com `mandate_starts_on`/`mandate_ends_on`; membro `ATIVO` a partir da posse.
3. Alertas de fim de mandato (proposta: 90, 60 e 30 dias) ao gabinete e ao presidente para recondução ou substituição, evitando `TURMA_SUSPENSA` ([WF-RAIT-004] §7).
4. Término sem recondução → `MANDATO_ENCERRADO` na data; casos abertos redistribuídos em lote ([UC-RAIT-011] 1a). Perda por faltas/retenção ([RN-RAIT-142]) → afastamento e ato de substituição.

## Fluxos alternativos / exceções

- **1a.** Vaga de representação da sociedade sem indicação: substituição por servidor habilitado pelo tempo restante (357 itens 4.1.a.1/4.1.b.1) com registro da excepcionalidade.
- **2a.** Membro nomeado para CETRAN que integra JARI (ou vice-versa): o sistema bloqueia a ativação (357 item 4.1.c; 901 Anexo 5.4).
- **4a.** Perda de mandato contestada: membro fica `AFASTADO_TEMP` até a decisão do procedimento com ampla defesa.

## Pós-condições

Composição dos colegiados sempre válida e vigente; elegibilidade de distribuição e banca derivada dos mandatos.

## Critérios de aceitação

**AC-RAIT-037-1 — sem posse não há distribuição**

- **Dado** um membro nomeado sem posse registrada
- **Quando** um lote é sorteado
- **Então** o membro não é elegível

**AC-RAIT-037-2 — mandato vencido encerra a elegibilidade no dia**

- **Dado** um mandato terminando em D
- **Quando** D chega sem recondução
- **Então** o membro passa a `MANDATO_ENCERRADO` e seus casos abertos entram em reatribuição

**AC-RAIT-037-3 — dupla composição é impedida**

- **Dado** um conselheiro do CETRAN-AM
- **Quando** é cadastrado na JARI
- **Então** o sistema recusa e cita a vedação

## Regras aplicáveis

- [RN-RAIT-116] (composição e mandato da JARI)
- [RN-RAIT-117] (composição e mandato do CETRAN)
- [RN-RAIT-142] (perda de mandato)
- [RN-RAIT-139] (dimensionamento)
