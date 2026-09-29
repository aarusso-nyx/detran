# ADR-0039: Vínculo do candidato PEC e leitura clínica sob demanda no Portal

## Status

Proposed pelo Architect em R-0032, CTG-0001, 2026-09-30. OD-R32-001 = (C) foi decidida pelo Owner em 2026-09-26; esta ADR documenta essa escolha e a exceção restrita ao ADR-0020. OD-R32-002…005 ainda exigem decisão expressa do Owner. Proposta não habilita acesso clínico nem serviço novo.

## Contexto

ADR-0019 dá ao Portal a identidade cidadã, o ciclo de pedidos e a delegação das decisões. ADR-0024 determina CPF como sujeito de negócio, `CIDADAO` como único papel da sessão gov.br, níveis por ato em `portal.act_level_policy` e ausência de linha como negativa. ADR-0020 exige projeções de eventos para leituras entre domínios. ADR-0034 coloca P-01…P-07 no Portal e exige acesso do titular ao dossiê sem máscara, minimização, vocabulário legal, assinatura visível e prazos como direito.

O PEC atual identifica o titular do dossiê por `ch.patient.user_id = actorId`, enquanto a identidade do Portal é o CPF verificado. `portal.exam_view` ainda é esqueleto, e os eventos `ch.exam.*` ainda não são produzidos. Copiar laudos, adendos ou notas clínicas para `portal.*` criaria outra superfície de saúde, auditoria e retenção. Expor `v1/ch/*` ao navegador cidadão violaria a fronteira do Portal.

## Decisão proposta

1. **Vínculo pelo dono.** O produtor `ch` emite evento mínimo, versionado, com `tenantId`, `aggregate`, `subjectCpfHash` do `ch.patient.national_id` validado na presença biométrica (RN-PEC-130) e identificador do exame. O projetor cria/atualiza `portal.entitlement` com `target_kind='exam'`, `relation='holder'`, `origin='pec-event'`, sempre no mesmo tenant. O CPF bruto, o `user_id`, o papel `CANDIDATO` e conteúdo clínico não atravessam o evento. O hash usa o mesmo SHA-256 vigente de `cpfHashOf`; OD-P23 acompanha o risco herdado, sem criar segundo algoritmo.
2. **Metadados projetados.** `portal.exam_view` e `portal.pec_{appointment,review,tox}_view` guardam só identificadores opacos, rótulo legal, datas/prazos calculados pelo dono, estado cidadão e recibo de evento/versão. O projetor é idempotente por `event.id`, rejeita versão desconhecida e permite replay. Nenhum laudo, adendo, código clínico detalhado, instrumento psicológico, anotação técnica, CPF ou biometria é persistido em `portal.*`.
3. **Exceção estreita ao ADR-0020 §1.** Só o dossiê sensível e as restrições do próprio titular são consultados no momento da requisição via `CandidateDossierQueryPort` de `@detran/ch-clinical-reports`, composta no backend. Não há leitura direta de tabela `ch.*` pelo Portal, credencial HTTP técnica ou chamada `v1/ch/*` pelo navegador. O dono faz a consulta e conserva sua trilha e retenção. A consulta exige, nesta ordem, `PortalCitizenGuard`, política `portal:*`, nível do ato, `portal.entitlement` holder válido, identificação do paciente no mesmo tenant e auditoria bilateral `PORTAL_PEC_DOSSIER_READ` / `CH_CANDIDATE_DOSSIER_READ` com `onBehalfOf`. Outro CPF ou tenant recebe 404; nível insuficiente recebe 403. `SUPORTE` permanece mascarado; titular autorizado recebe seu conteúdo permitido sem máscara (RN-PEC-153).
4. **Comandos no dono.** O Portal só recebe `v1/portal/*` e usa o ciclo de pedidos/delegação do ADR-0019. OD-R27-001 = (a): ator técnico `portal-delegation`, cidadão `onBehalfOf`, candidato como requerente; nenhuma sessão ganha `CANDIDATO`. Junta médica foi autorizada por OD-R27-002 = (b). Ciência, termo inicial e todos os prazos são registrados/calculados pelo `ch`; dias úteis usam o calendário de `@detran/inf-deadlines`. SSE único do Portal reflete projeções, sem segundo stream `ch` ao cidadão.
5. **Ativação fail-closed.** OD-R32-002 não autoriza linha nova de nível: ausência de `act_level_policy` nega o ato e `legal_basis` pendente é `source_pending (OD-R32-002)`. OD-R32-003: emissão ou disponibilização não constituem ciência; sem ciência expressa ou presencial registrada pelo dono não começa prazo preclusivo. OD-R32-004: serviços PEC novos ficam indisponíveis, exceto `junta_medica` já autorizada. OD-R32-005: o contrato delimita o conteúdo máximo proposto, mas o acesso clínico novo continua bloqueado até decisão, sem instrumento psicológico ou anotação técnica. Os estados públicos citam o id da decisão pendente.

## Consequências e verificação

- `contracts/CTG-0002.md` fixa eventos, views, porta, vínculo, RLS e negativos; `CTG-0003.md` fixa comandos e prazos; `CTG-0004.md` fixa as rotas e estados P-01…P-07. O contrato não altera código, política ou eventos nesta O1.
- Replays não criam vínculo para outro CPF; vínculos expirados, outro tenant, falta de `CIDADAO`, `*` técnico e falta de nível falham. Auditoria em ambas as pontas e nenhum conteúdo clínico em projeção são critérios de teste.
- O dossiê não pode ser servido apenas com a checagem legada `patient.user_id = actorId`; a porta precisa comparar o CPF derivado do evento ao paciente no tenant. A ativação espera implementação e teste dessa guarda.
- Esta exceção não altera a regra geral de projeções do ADR-0020 para dados não clínicos. ADR-0019/0024 permanecem válidas.
