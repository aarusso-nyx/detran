# TASK-0049 — segunda e última iteração: reconciliar sensores CTG-0002

Papel Art. 6: Inspector, Terra/high. Continuação 2/2 da TASK-0049; preserve o
histórico e não zere contadores. Leia AGENTS, manual Inspector, CTG-0002,
ADR-0027, TASK-0047/0049/0050 e as matrizes nominais novas de CTG-0002.

Classificação já comprovada pelo Maestro: **sensor-error**, não plant-bug.
Corrija apenas estas inconsistências:

1. Em `document-trust-session-minutes.spec.ts` e
   `rait-session-deliberation-minutes-red.spec.ts`, regexes que hoje exigem uma
   barra literal antes do ponto devem aceitar os códigos canônicos
   `RAIT.SIGNATURE_*` e `RAIT.CASTING_VOTE_NOT_TIED`.
2. Em `policy.spec.ts`, substitua a matriz CTG-0002 histórica de aliases pela
   matriz nominal já congelada nos três sensores dedicados: schedule publish
   apenas coordinator; batch-item accept/impediment apenas rapporteur; session
   adjourn chair+secretary; minutes sign chair+rapporteur conforme ADR-0027.
3. Nos dois asserts M17 de schedule/batch, preserve fail-closed para operações
   sem grant e reconheça somente as exceções nominais expressas; global-admin
   não recebe bypass para os comandos estritos CTG-0002.

Allowlist fechada:

- `backend/domains/shared/src/documents/document-trust-session-minutes.spec.ts`;
- `backend/domains/inf/rait-session/tests/unit/rait-session-deliberation-minutes-red.spec.ts`;
- `backend/domains/shared/src/policy.spec.ts`;
- `work/rounds/R-0007/tasks/TASK-0049.json`.

Proibido tocar produção, outros testes, blueprint/DDL/gerados, package/lock,
banco, corpus, record ou irmãos. Não enfraqueça assert sem substituir pela
expectativa nominal exata. Execute os três sensores alterados, os três sensores
dedicados `policy-ctg2-*`, shared completo, session unit completo, typechecks
shared/session, Prettier e diff-check. Exija contagem positiva. Recalcule e
registre os hashes dos três sensores alterados e confirme que os outros quatro
hashes TASK-0049 continuam idênticos. E2E/wiring permanece para TASK-0008.
