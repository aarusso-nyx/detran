# Propostas de intake — mineração PEC (2026-08-24)

Itens que exigem tocar `shared/`, `refs/`, ou `_meta/backlog.md` — fora do escopo de escrita
deste agente (write-only em `ch/pec/**`). O orquestrador decide o que mesclar.

## Para `_meta/backlog.md` — pesquisa legal

- [ ] **REF-CONTRAN-927** — Resolução CONTRAN 927/2022: procedimentos do exame médico e da
      avaliação psicológica de candidatos/condutores, uso do RENACH, estatísticas regulatórias.
      Citada repetidamente nos docs do PEC como âncora mestra ("MÓDULO 03: PERÍCIA MÉDICA",
      "MÓDULO 04: AVALIAÇÃO PSICOLÓGICA — Res. 927/22 + CFP 01/2019") mas nunca com excerto de
      artigo. É a norma mais citada e mais importante a capturar para o domínio `ch`. Fonte:
      `pec:docs/framework/pec/archive-authoritative-sources.md`.
- [ ] **REF-CONTRAN-789** — Resolução CONTRAN 789/2020 (consolidada 2024): etapas do processo
      de formação de condutores; base do orquestrador de etapas do PEC.
- [ ] **REF-CONTRAN-1009** — Resolução CONTRAN 1.009/2024: posiciona o exame toxicológico
      (categorias C/D/E) antes das demais etapas — sustenta [RN-PEC-007].
- [ ] **CFP 01/2019** — norma técnica do Conselho Federal de Psicologia para avaliação
      psicológica de condutores; citada junto à 927/2022 no módulo psicológico.
- [ ] Portaria DETRAN-AM 005/2021 — controle de sessão única e bloqueio de horário de
      funcionamento (RF-001/RF-003 do SRS arquivado do PEC) — relevante ao domínio `ch` mas de
      escopo estadual/administrativo, não clínico.
- [ ] Portarias SENATRAN/DENATRAN 968/2022, 495/2025, 1.515/2018, 2.145/2020 — coleta e
      validação biométrica (foto, digitais, assinatura), validação de presença — sustentam
      [RN-PEC-003] e [RN-PEC-005].
- [ ] Lei 13.787/2018 (Prontuário Eletrônico do Paciente) e Resolução CFM 1.821/2007 —
      validade do prontuário eletrônico; citadas nos docs do PEC como âncora do modelo de
      encounter/documento.
- [ ] MP 2.200-2/2001 e Lei 14.063/2020 — validade jurídica da assinatura eletrônica/
      qualificada — sustentam [RN-PEC-001] e [RN-PEC-002].
- [ ] Regimento e composição oficial da junta médica de trânsito e do CETRAN aplicável ao
      processo de habilitação — não encontrado em nenhum documento do PEC; o sistema modela
      "Junta" como papel monolítico sem composição. Necessário para aprofundar [WF-PEC-002].

## Para `shared/glossary.md` — termos candidatos

- [ ] **RENACH** — Registro Nacional de Carteira de Habilitação; sistema nacional autoritativo
      do processo de habilitação; PEC é satélite clínico dele.
- [ ] **renach_process_key** — chave que liga um encounter local (e paciente) ao processo
      RENACH nacional; unicidade por `(tenant, paciente, chave)`.
- [ ] **Encounter (atendimento/episódio clínico)** — unidade central do PEC; cobre até um
      exame médico e um exame psicológico e até dois laudos (um por tipo) por episódio.
- [ ] **Laudo** — documento clínico assinado digitalmente (PAdES+TSA), imutável após
      assinatura; corrigido somente por adendo.
- [ ] **Adendo** — documento de retificação que referencia o laudo original por ID e hash,
      assinado independentemente; nunca edita o original.
- [ ] **Junta médica (PEC)** — colegiado de segunda opinião clínica; modelado no PEC como
      papel único sem composição interna definida.
- [ ] **CETRAN (contexto PEC)** — instância recursal sobre decisão da junta médica, distinta
      em modelagem do CETRAN do domínio `inf` (recurso de infrações) — mesmo nome institucional,
      papéis de negócio diferentes; considerar nota de desambiguação no glossário compartilhado.
- [ ] **PAdES / TSA / OCSP / CRL** — mecanismos de assinatura digital qualificada usados
      transversalmente no PEC (e potencialmente reutilizáveis por outros apps do domínio `ch`).

## Para `shared/actors.md` — atores candidatos

- [ ] **Médico (perito examinador)** e **Psicólogo** — já citados de forma agregada em
      `shared/actors.md` como "Perito examinador / Psicólogo"; o PEC distingue claramente os dois
      papéis com RBAC próprio — considerar desdobrar a linha existente.
- [ ] **Junta médica** e **CETRAN** (contexto PEC) — já existe uma linha "JARI (colegiado)" e
      "CETRAN" no catálogo compartilhado para o domínio `inf`; o PEC tem seu próprio par
      Junta/CETRAN com significado distinto (segunda opinião clínica, não julgamento de
      infração) — recomendar não reusar a mesma linha, criar entrada específica ou anotar a
      ambiguidade.
- [ ] **Gestor DETRAN** (cross-tenant) — ator novo, não presente no catálogo compartilhado
      atual.
- [ ] **Técnico Biométrico**, **Supervisor**, **Admin Clínica**, **DPO**, **Auditor** (PEC),
      **Suporte** — todos ausentes do catálogo compartilhado; avaliar quais são específicos do
      PEC vs. reutilizáveis por outros apps do domínio `ch`.

## Observações técnicas encontradas na pesquisa (não normativas, mas relevantes para consumidores deste KB)

- **`CANCELLED` do encounter é um estado morto**: existe no enum/schema e é checado como
  terminal em toda guarda, mas nenhuma rota/serviço grava esse valor. Ver [WF-PEC-001].
- **"Primeiro laudo assinado força `SIGNED`"**: `POST /encounters/:id/sign` marca o encounter
  como `SIGNED` após o primeiro laudo (médico OU psicológico), o que pode impedir o segundo
  profissional de usar a mesma rota independentemente. Ver [WF-PEC-001].
- **`UNDER_REVIEW` da junta médica é um estado morto**: documentado no enum/comentário de
  schema, mas nenhuma rota do módulo `juntas-medical-board` o grava. Ver [WF-PEC-002].
- **Composição da junta médica não é modelada**: é um papel RBAC único (`JUNTA`), sem
  designação de membros, pauta ou especialidade — mesmo a documentação arquivada aspiracional
  (`UCAP-UC-40 Constituir Junta`) descreve uma capacidade que não existe no código atual.
- **Inconsistência de rastreabilidade nos próprios docs do PEC**: o blueprint
  `BP-juntas-medical-board.json` referencia `SUC-UC-13/15` (na verdade sobre laudos),
  enquanto `traceability-summary.md` usa `UC-J1/UC-J2` para o mesmo módulo.
- **RF-013 (dupla validação de estagiário) não foi confirmada no schema atual** — só
  encontrada no SRS arquivado, sem tabela/coluna correspondente localizada em
  `database/ddl/02-pec.sql` nesta pesquisa. Ver [RN-PEC-004].
- Estas observações não são objeto de nenhuma regra normativa (`RN-PEC-*`) — são débito de
  implementação/documentação do próprio PEC, reportadas para que o orquestrador decida se
  vale abrir um item de acompanhamento fora deste KB de negócio.
