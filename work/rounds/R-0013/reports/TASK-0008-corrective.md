# TASK-0008 — relatório corretivo da iteração 3

Papel: Inspector.

A mesma iteração foi escalada após duas entregas incompletas e terminou com a matriz P0–P6
executável. A suíte cobre bindings A5 positivos/negativos nas oito operações, efeitos persistidos,
INV-OFFLINE-001, ETag/idempotência/restart, concorrência real, atomicidade/outbox/crash, revogação e
readiness completa.

## Estado RED congelado

- integration: 602 executados, 596 RED comportamentais e 6 PASS.
- e2e domínio: 10 RED comportamentais.
- unit: 7 RED comportamentais.
- HTTP: 14 executados, 5 RED comportamentais e 9 PASS.
- contracts: 46 PASS; shared: 407 PASS; typecheck e formatação: PASS.

Não há falha de importação, configuração ou fixture. O replay é provado em processo Node separado e
os checkpoints `after-domain`, `after-numbering`, `after-outbox` e `before-commit` exigem rollback
integral. Os positivos de identidade são exaustivos no seam de domínio autenticado; nenhum header
HTTP confiável foi inventado.

Após o Engineer identificar a colisão entre a idempotência scoped por comando e a unicidade da
outbox, o Inspector fez um refreeze focal na mesma iteração. Os três hashes abaixo já incorporam:
outbox `${commandName}:${rawKey}`, reutilização da mesma chave em comandos distintos e o ciclo
readiness ETag → challenge → register com rejeição de literal `1`, token stale e corrida concorrente.

## Hashes congelados

```text
8d5fd00f0f0436ea1cca41e8255073193ee75482c68cb583a1c7a1d6d6af2227  backend/domains/ops/provisioning/src/handwritten/provisioning.red.spec.ts
30559f57a66562171b40360ba47e0e67e38ef224ffec71ed700221aecb3b7f1f  backend/domains/ops/provisioning/tests/integration/harness.ts
b3d8ac29b925ceeeb5ea38665d3cdd32e373786896025501f769a0e014cb83c9  backend/domains/ops/provisioning/tests/integration/provisioning.integration.spec.ts
c3d336a111b961a12cfcfd6bf92be722b214ba137be339127cda8431b26e54c8  backend/domains/ops/provisioning/tests/integration/provisioning-behavior.integration.spec.ts
dc325e0bd85abbb8ca8f19c92c96fddc21e925c0a1351cda795b596a9a617299  backend/domains/ops/provisioning/tests/e2e/provisioning.e2e.spec.ts
1514d50024719023c12c24ec67a88316f7ea74f4920924f41b7ccb8a41c84d09  backend/app/tests/e2e/ops-provisioning.e2e.spec.ts
3f0922d29ec564e2adce6073b29bd5a57d055ad5a9b3b0e8204f7b1682503270  backend/domains/shared/src/policy.spec.ts
0201fb33652f01b745c91b29ecdd8da9f85387ca2baf0b5928676cefb178da9c  tools/contracts/tests/provisioning-commands.test.mjs
b13b2f31c3b2a09461533f969079863661a7675d5cf7e926e46c21f7e8085312  tools/contracts/tests/check-commands.test.mjs
6d0718bb03f4caf3d28264cb38977466f09a38b44d29b09702f189f4e8cb097f  backend/database/seed/29-fixtures-ops-provisioning.sql
978a88e7b34371d4d8c237c5d422623bbbb9bc4fb91a4b1ed3192f05a88da957  backend/database/seed.sh
```
