---
id: JRN-PEC-003
title: Jornada da falha biométrica — exceção aprovada por supervisor no check-in
status: draft
apps: [pec]
sources:
  - pec:docs/framework/pec/flows/biometria-excecao.md
  - pec:docs/framework/pec/rbac-matrix.md
  - pec:docs/framework/pec/catalogo-uc.md
  - pec:docs/framework/pec/archive-authoritative-sources.md
  - REF-SENATRAN-PORTARIA-968-2022
updated: 2026-08-24
---

## Persona e contexto

Beatriz chega à clínica para seu exame, mas seu dedo está com um curativo e o leitor
biométrico não atinge a qualidade mínima de captura. O Técnico Biométrico não pode
simplesmente ignorar a falha — o PEC exige uma exceção formal, aprovada, com prazo e escopo
limitados. Esta jornada trata do caso **temporário** (curativo, lesão passageira); ver a nota
de acessibilidade em `_intake/ux-notes.md` para a distinção importante entre esse cenário e o
de um candidato com **ausência permanente** de dedo — que não deveria ser tratado, na
experiência de tela, como uma "exceção" a repetir a cada visita.

## Narrativa ponta-a-ponta

1. **Captura biométrica falha.** `B{Qualidade mínima atingida?}` responde "Não"
   [pec:docs/framework/pec/flows/biometria-excecao.md].
2. **Registro de falha e justificativa.** O Técnico Biométrico registra a falha e a
   justificativa (ex.: lesão no dedo) — ação exclusiva desse papel na matriz RBAC.
3. **Solicitação de exceção ao Supervisor.** O caso é encaminhado para aprovação; a
   documentação exige "dupla checagem documental" nesta etapa — checagem redobrada da
   evidência anexada, não necessariamente dois aprovadores humanos distintos da decisão em
   si (a matriz RBAC lista só o Supervisor como aprovador desta exceção especificamente —
   ver nota abaixo).
4. **Decisão do Supervisor:**
   - **Reprovada** → Beatriz é reagendada ou a captura é refeita (`Reagendar/recapturar`).
   - **Aprovada** → liberação temporária controlada: Beatriz segue para o atendimento sem que
     a biometria tenha sido validada normalmente, mas sob prazo e escopo limitados
     (`pec.biometric_exceptions.expires_at`).
5. **Trilha de auditoria reforçada.** Toda a sequência (falha, justificativa, aprovação,
   liberação) gera eventos de auditoria vinculados a ID biométrico, IP/estação e hash — ver
   [RN-PEC-003]. **Base legal (com ressalva de vigência).** [REF-SENATRAN-PORTARIA-968-2022]
   art. 4º exige validação de presença por biometria em todos os exames do processo de
   habilitação; o texto de 2022 desse mesmo artigo (§§3º-4º) descreve exatamente o desenho
   técnico desta exceção — ausência temporária de impressão digital registrada por campo
   específico do dedo, com **fallback obrigatório para reconhecimento facial**. A redação
   dada pela Portaria SENATRAN 495/2025 substituiu esses parágrafos por "(NR)" no texto
   oficial — a evidência técnica continua forte, mas não deve ser citada como texto vigente
   certo até que o normativo de substituição seja localizado. A camada de aprovação humana
   (Supervisor, prazo/escopo limitados) é uma extensão de conformidade do próprio PEC — a
   norma federal não exige nem proíbe esse aprovador.
6. **Continuidade do atendimento.** O encounter de Beatriz segue o ciclo normal de
   [WF-PEC-001] a partir daí — a exceção não bloqueia a abertura do encounter, apenas
   documenta o desvio no processo de captura.

### Nota — não confundir com o controle de estagiário

Uma dupla validação **de pessoas** (dois logins/biometrias distintos) existe no PEC, mas para
um cenário diferente: quando o atendimento é conduzido por um psicólogo estagiário, o sistema
exige a biometria do estagiário **e** a do supervisor no fechamento do laudo (RF-013,
[pec:docs/framework/pec/archive-authoritative-sources.md]) — ver [RN-PEC-004]. A exceção
biométrica de captura (esta jornada) é, pelos documentos capturados, aprovada por um único
papel (Supervisor).

## Pontos de contato (apps/canais)

- Clínica credenciada — Técnico Biométrico, Supervisor.
- PEC — módulo `biometrics-biometric-capture`.

## Métricas de sucesso

- Exceção deve ter prazo e escopo limitados (`expires_at`) — não é uma liberação permanente.
- Auditoria obrigatória e reforçada para toda a sequência — sem número de tolerância/limite de
  exceções por período encontrado nos documentos (fonte pendente).
- Zero candidato com ausência permanente de dedo tratado, na experiência de tela, como um caso
  reincidente de "exceção" — ver `_intake/ux-notes.md` §Acessibilidade.

## Notas de revisão (2026-08-25)

Rodada confirm-extend: a jornada já modelava corretamente o desenho técnico da exceção; o
achado desta rodada é a base legal direta (Portaria SENATRAN 968/2022 art. 4º, com a ressalva
de vigência sobre a redação de 2025) e a distinção, agora explícita, entre falha temporária de
captura (esta jornada) e ausência permanente de dedo (nota de acessibilidade nova, não
existente na versão anterior).
