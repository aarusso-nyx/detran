# R-0025 A-C3-01 — revisão restrita, ciclo 2

Papel Auditor, somente leitura, reviewer Claude alias CLI opus; maestro Codex.
Worktree /Volumes/Development/.codex/worktrees/r0033-portal-preview/detran, branch
codex/r0025-jw01. Não edite nem execute testes, servidores, instalação, Git mutável
ou verbos de estado/evidência. Responda só JSON estrito, sem cercas/preâmbulo;
primeira string de notes declara Papel: Auditor — Artigo 7.

Leia integralmente `reviews/prompt-review-A-C3-01-1.json` antes de julgar.
Escopo exclusivo: três high e dois low anteriores e os trechos alterados abaixo;
não reabra pontos aceitos no ciclo1, decisões Owner ou escopo fora dos achados.

Correções a conferir nos arquivos finais:

1. High1 — contracts/JW01-admissibility.md §8, TASK-0024.md e ADR-0041:
   quatro operações (triage, createRaitAdmissibility, admit, non-admission) com
   requestBody estrito obrigatório, id path quando aplicável, If-Match e
   Idempotency-Key, response {data,events}/ETag; fonte OpenAPI manuscrita completa
   e regeneração sem create colidindo ou requestBody never.
2. High2 — contrato §9 e TASK-0025/0027: reason = nonAdmissionReason código de
   NON_ADMISSION_REASONS; legalBasis = nonAdmissionGrounds texto humano do schema;
   non_admission_reason retirado da assinatura. Nenhuma inferência jurídica.
3. High3 — contrato “Assinaturas públicas fixas”, facade, idempotency/M8:
   triage é F01 {} retornando caso; saveAdmissibility novo obrigatório grava um
   critério; aliases derivados de operations geradas, facade e idempotency targets
   explícitos. Nova chave rait-admissibility:create soma-se às64 existentes;
   preview tem quatro overrides sem super e inventário65 sem exclusões.
4. Low1 — TASK-0024 materializa conforme fontes existentes; POST conserva
   Resource inf:rait-admissibility, Action create, Audit
   INF_RAIT_ADMISSIBILITY_CREATE/entity inf.rait_admissibility; sem nova policykey.
   TASK-0026 permite handwritten/index.ts para export dos símbolos aprovados,
   evitando deadlock entre geração e implementação sem tocar gerados manualmente.
5. Low2 — TASK-0025/0026/0027 JSON acceptance_commands agora cobrem prose:
   sensores backend e quatro frontend, presença/format/lint, unit/integration/e2e,
   typechecks, contratos/blueprint/decorators/role/RLS e frontend full/preview/smoke.
   DB indisponível é blocked, não skipped. Inspector registra RED esperado até
   implementação; isso não se converte em sensor enfraquecido ou PASS do produto.

Leia contract, ADR-0041, prompts/tasks0024…27 e compositions.json atuais; confira
hashes e apenas as fontes que sustentam as correções (schema triagem, server RULES,
OpenAPI atual, decorators gerados, assinaturaClient/Facade existentes). Nenhum
blueprint/gerado/runtime foi alterado nesta correção; TASK0024 só começa após PASS.

Rubrica preservada: PASS se todos os high resolvidos; low sem risco material
podem ser notas. REVIEW para lacuna técnica corrigível remanescente; FAIL para
violação concreta de autoridade, fonte ou weakening. Cite arquivo/linha atual e
qual achado anterior continua aberto; não invente novo escopo de aceite.

JSON único: mode="prompt-review", round="R-0025", cycle=2,
verdict="PASS" ou "REVIEW" ou "FAIL", findings=[{severity,file,line,claim,fix}],
notes=[declaração de papel, identidade/limites e achados anteriores resolvidos].
Não inclua texto fora desse JSON.
