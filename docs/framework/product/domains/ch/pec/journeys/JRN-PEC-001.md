---
id: JRN-PEC-001
title: Jornada do candidato — do agendamento ao resultado publicado no RENACH
status: draft
apps: [pec]
sources:
  - pec:docs/framework/pec/flows/happy-path.md
  - pec:docs/framework/pec/flows/diagrams/atendimento-pec.mmd
  - pec:docs/framework/pec/flows/encerramento-exportacao.md
  - pec:docs/roles/candidate.md
  - pec:docs/framework/pec/rbac-matrix.md
  - REF-CONTRAN-927-2022
  - REF-CONTRAN-923-1009-toxicologico
  - REF-CFM-1636-2002
  - REF-SENATRAN-PORTARIA-968-2022
updated: 2026-08-24
---

## Persona e contexto

Ana, candidata a uma primeira habilitação categoria B, já tem um processo RENACH aberto pelo
DETRAN/AM (`renach_process_key`) e precisa passar pelo exame de aptidão física e mental e
pela avaliação psicológica antes de seguir para a prova. Ela interage com o PEC apenas como
"Candidato" — o único ator do sistema que se autentica como usuário final do próprio processo,
com acesso somente-leitura ao próprio dossiê [pec:docs/roles/candidate.md].

## Narrativa ponta-a-ponta

1. **Agendamento.** A recepção da clínica credenciada cria o agendamento de Ana
   (`POST /appointments`) para a data escolhida — ver [WF-PEC-003]. **Nota de conformidade
   (não resolvida).** [REF-CFM-1636-2002] art. 3º exige que "todos os exames [...] devem ser
   distribuídos imparcialmente, através de divisão equitativa obrigatória, aleatória e
   impessoal [...] pelo órgão executivo do trânsito - DETRAN, e nunca por escolha do
   periciado". A tela de agendamento do PEC, como documentada, não modela esse mecanismo — o
   fluxo de `POST /appointments` parece pressupor que a clínica (ou, indiretamente, Ana)
   escolhe onde agendar. Enquanto essa validação jurídica não é resolvida (handoff LEGAL
   prioritário do dossiê de pesquisa), nenhuma tela deveria reforçar visualmente a ideia de
   "escolha livre de clínica" — ver anti-padrão em `_intake/ux-notes.md`.
2. **Check-in com biometria.** No dia, Ana comparece à clínica; a recepção faz o check-in
   biométrico (validação de presença por comparação com os dados coletados na abertura do
   formulário RENACH — [REF-SENATRAN-PORTARIA-968-2022] art. 4º). A coleta em si só pode
   ocorrer presencialmente (art. 2º §2º, redação 2025). Um `MATCH` segue o fluxo normal; um
   `NO_MATCH` (HTTP 412) aciona o fallback de dupla validação com justificativa — ver
   [JRN-PEC-003] (a tecnologia LFD e o fallback por reconhecimento facial citados ali vêm do
   texto de 2022 do art. 4º, hoje com ressalva de vigência — os parágrafos técnicos foram
   substituídos por "(NR)" na redação de 2025 e o texto de substituição não foi localizado).
3. **Abertura do atendimento.** Com o check-in confirmado, a recepção abre o encounter
   (`POST /encounters`) — estado inicial `OPEN` — ver [WF-PEC-001].
4. **Duas trilhas em paralelo:**
   - **Exame médico**: anamnese + exame físico pelo Médico; ao final, laudo médico assinado
     digitalmente (ICP-Brasil + carimbo de tempo).
   - **Exame psicológico**: instrumentos e entrevista pelo Psicólogo; laudo psicológico
     assinado digitalmente. [REF-CONTRAN-927-2022] art. 9º §3º fixa **dois dias úteis** como
     prazo de disponibilização do resultado psicológico — o único prazo numérico de "produção
     de resultado" encontrado em todo o corpus PEC. Se, mesmo apto, Ana tiver algum
     comprometimento psicológico temporariamente sob controle, o resultado ainda é "apto",
     mas com prazo de validade reduzido (art. 9º §2º) — informação que a tela de resultado
     precisa comunicar, não só o rótulo.
     Cada assinatura passa por `POST /encounters/:id/sign` ou `POST /reports` — ver [WF-PEC-001]
     para a nuance de "primeiro laudo assinado força o status para `SIGNED`".
5. **Pré-condição toxicológica (se categoria C/D/E).** Antes de liberar o encerramento, o
   orquestrador confere se o exame toxicológico é válido; se não for, o processo fica
   bloqueado até resultado válido — ver [RN-PEC-007]. A base legal correta é
   [REF-CONTRAN-923-1009-toxicologico] art. 10 (não a 1.009/2024 isolada, que é mera emenda);
   a validade do exame é de **90 dias** contados da coleta (art. 10 §1º) — é validade do
   _resultado_, não um prazo para _obter_ o exame. Ana, categoria B, não passa por este gate.
6. **Encerramento do episódio.** Quando ambos os laudos existem, não há bloqueios ativos e não
   há junta pendente, o encounter é encerrado (`PATCH /encounters/:id/close`) — ver
   [WF-PEC-001] §"Gate de encerramento".
7. **Publicação no RENACH.** O resultado (apto / apto com restrições / inapto temporário /
   inapto, com códigos de restrição quando aplicável — nomenclatura de
   [REF-CONTRAN-927-2022] art. 8º, médico, e art. 9º, psicológico) é publicado no RENACH; o
   encerramento só é permitido depois que essa transmissão foi confirmada (`ACKED`) — ver
   [WF-PEC-001] e [RN-PEC-008]. **Nota de nomenclatura.** O schema do PEC guarda esse
   resultado internamente como `medical_result` (com valor `'CONDICIONADO'` para o caso de
   restrição) — nenhuma tela deveria expor esse rótulo interno a Ana; o texto voltado ao
   candidato usa sempre "apto com restrições", o termo legal. A Portaria DETRAN-AM 005/2021
   art. 34 §9º usa ainda um vocabulário próprio de cinco rótulos (incluindo "PENDENTE") com
   prazos de 30/60/90/365 dias — divergência entre nomenclatura federal e estadual ainda sem
   resolução de qual prevalece nos dados que o RENACH espera; ver mapa de vocabulário em
   `_intake/ux-notes.md`.
8. **Fim da jornada no PEC.** Ana não recebe o resultado diretamente do PEC — a leitura do
   resultado e os próximos passos da habilitação seguem no RENACH/DETRAN, fora do escopo do
   PEC.

## Pontos de contato (apps/canais)

- Clínica credenciada (presencial) — recepção, técnico biométrico, médico, psicólogo.
- PEC (sistema clínico, não visível diretamente a Ana além de eventual portal de
  acompanhamento — não confirmado nos documentos do PEC).
- RENACH/DETRAN (fora do PEC) — publica o resultado final ao processo de habilitação.

## Métricas de sucesso

- SLA de publicação RENACH ≤ 10s (p95); janela de transmissão ≤ 15 min
  [pec:CONTEXT.md] — indireto, mas cadenciando o encerramento.
- Disponibilização do resultado psicológico em ≤ 2 dias úteis
  ([REF-CONTRAN-927-2022] art. 9º §3º) — único prazo de produção de resultado com base legal
  encontrada nesta pesquisa; candidato a métrica de SLA operacional visível ao candidato.
- Zero exposição de rótulo interno (`CONDICIONADO`) ou de vocabulário não confirmado
  ("PENDENTE") em tela voltada a Ana.
- Nenhuma métrica de experiência do candidato (tempo de espera, satisfação) foi encontrada nos
  documentos do PEC — (fonte pendente), backlog de pesquisa.

## Notas de revisão (2026-08-25)

Rodada confirm-extend sobre a base minerada: vocabulário de resultado já estava correto em
espírito (passo 7) e ganhou citação legal direta ([REF-CONTRAN-927-2022] art. 8º/9º) mais o
alerta sobre `CONDICIONADO`/"PENDENTE" nunca vazarem à tela do candidato; passo 5
(pré-condição toxicológica) corrigido para citar a base legal correta (923/2022, não
1.009/2024 isolada) com a validade de 90 dias; passo 2 (biometria) ganhou base legal direta
(Portaria SENATRAN 968/2022) com ressalva de vigência explícita; passo 1 ganhou nota de
conformidade não resolvida sobre distribuição imparcial de clínica (CFM 1.636/2002 art. 3º).
