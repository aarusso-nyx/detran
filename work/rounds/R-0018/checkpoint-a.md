# Checkpoint (a) — R-0018 CTG-0001 (maestro, Engineer, 2026-09-26)

Contrato `contracts/CTG-0001.md` §10. Base `220a4020` + TASK-0003; `origin/main` sem avanço; ADR-0035 livre.

## Passo 1 — `pnpm adr:renumber` (dry-run), exit 0

```text
 WARN  Issue while reading "/Users/aarusso/Development/detran-worktrees/index-state/.npmrc". Failed to replace env in config: ${NODE_AUTH_TOKEN}
 WARN  Issue while reading "/Users/aarusso/Development/detran-worktrees/index-state/.npmrc". Failed to replace env in config: ${NODE_AUTH_TOKEN}
MOVE docs/meta/adr/ADR-0006-ops-field-operations-port.md -> docs/meta/adr/ADR-0036-ops-field-operations-port.md
STUB docs/meta/adr/ADR-0006-ops-field-operations-port.md -> ADR-0036
MOVE docs/meta/adr/ADR-0024-rait-legal-priority-owner-policy.md -> docs/meta/adr/ADR-0037-rait-legal-priority-owner-policy.md
STUB docs/meta/adr/ADR-0024-rait-legal-priority-owner-policy.md -> ADR-0037
MOVE docs/meta/adr/ADR-0028-provisionamento-operacional-offline.md -> docs/meta/adr/ADR-0038-provisionamento-operacional-offline.md
STUB docs/meta/adr/ADR-0028-provisionamento-operacional-offline.md -> ADR-0038
REWRITE docs/meta/knowledge-base/open-decisions-rait.md:52 ADR-0024 -> ADR-0037
REVIEW docs/meta/knowledge-base/open-decisions-rait.md:68 ADR-0024 sem slug
REWRITE docs/meta/knowledge-base/open-decisions-rait.md:96 ADR-0024 -> ADR-0037
REWRITE docs/meta/knowledge-base/open-decisions-rait.md:147 ADR-0024 -> ADR-0037
REVIEW docs/meta/knowledge-base/backlog.md:473 ADR-0024 sem slug
REVIEW docs/meta/knowledge-base/decision-closure-plan.md:101 ADR-0024 sem slug
REVIEW docs/framework/arch/rait-build-pack.md:20 ADR-0028 sem slug
REVIEW docs/framework/arch/rait-build-pack.md:226 ADR-0006 sem slug
REVIEW docs/framework/arch/teat-build-pack.md:170 ADR-0028 sem slug
REVIEW docs/framework/arch/portal-build-pack.md:31 ADR-0024 sem slug
REVIEW docs/framework/arch/portal-build-pack.md:57 ADR-0024 sem slug
REVIEW docs/framework/arch/portal-build-pack.md:186 ADR-0024 sem slug
REVIEW docs/framework/arch/portal-build-pack.md:208 ADR-0024 sem slug
REVIEW docs/framework/arch/portal-build-pack.md:215 ADR-0024 sem slug
adr:renumber dry-run: 9 pending, 11 review
```

## Passo 2 — `pnpm adr:renumber -- --write`, exit 0

```text
 WARN  Issue while reading "/Users/aarusso/Development/detran-worktrees/index-state/.npmrc". Failed to replace env in config: ${NODE_AUTH_TOKEN}
 WARN  Issue while reading "/Users/aarusso/Development/detran-worktrees/index-state/.npmrc". Failed to replace env in config: ${NODE_AUTH_TOKEN}
MOVE docs/meta/adr/ADR-0006-ops-field-operations-port.md -> docs/meta/adr/ADR-0036-ops-field-operations-port.md
STUB docs/meta/adr/ADR-0006-ops-field-operations-port.md -> ADR-0036
MOVE docs/meta/adr/ADR-0024-rait-legal-priority-owner-policy.md -> docs/meta/adr/ADR-0037-rait-legal-priority-owner-policy.md
STUB docs/meta/adr/ADR-0024-rait-legal-priority-owner-policy.md -> ADR-0037
MOVE docs/meta/adr/ADR-0028-provisionamento-operacional-offline.md -> docs/meta/adr/ADR-0038-provisionamento-operacional-offline.md
STUB docs/meta/adr/ADR-0028-provisionamento-operacional-offline.md -> ADR-0038
REWRITE docs/meta/knowledge-base/open-decisions-rait.md:52 ADR-0024 -> ADR-0037
REVIEW docs/meta/knowledge-base/open-decisions-rait.md:68 ADR-0024 sem slug
REWRITE docs/meta/knowledge-base/open-decisions-rait.md:96 ADR-0024 -> ADR-0037
REWRITE docs/meta/knowledge-base/open-decisions-rait.md:147 ADR-0024 -> ADR-0037
REVIEW docs/meta/knowledge-base/backlog.md:473 ADR-0024 sem slug
REVIEW docs/meta/knowledge-base/decision-closure-plan.md:101 ADR-0024 sem slug
REVIEW docs/framework/arch/rait-build-pack.md:20 ADR-0028 sem slug
REVIEW docs/framework/arch/rait-build-pack.md:226 ADR-0006 sem slug
REVIEW docs/framework/arch/teat-build-pack.md:170 ADR-0028 sem slug
REVIEW docs/framework/arch/portal-build-pack.md:31 ADR-0024 sem slug
REVIEW docs/framework/arch/portal-build-pack.md:57 ADR-0024 sem slug
REVIEW docs/framework/arch/portal-build-pack.md:186 ADR-0024 sem slug
REVIEW docs/framework/arch/portal-build-pack.md:208 ADR-0024 sem slug
REVIEW docs/framework/arch/portal-build-pack.md:215 ADR-0024 sem slug
adr:renumber write: 9 applied, 11 review
```

`git status --short` (fora de `tools/docs/**`, `package.json`, `work/rounds/R-0018/**`) = exatamente os 4 `M` + 3 `??` do §10 passo 2; `git diff --stat`: 4 arquivos, 13 inserções, 426 remoções (`open-decisions-rait.md`: 3 linhas trocadas). Cauda de cada renumerada (0036/0037/0038) = bytes do original em `HEAD` (`cmp` idêntico).

## Passo 3 — `pnpm adr:renumber` de novo, exit 0

```text
 WARN  Issue while reading "/Users/aarusso/Development/detran-worktrees/index-state/.npmrc". Failed to replace env in config: ${NODE_AUTH_TOKEN}
 WARN  Issue while reading "/Users/aarusso/Development/detran-worktrees/index-state/.npmrc". Failed to replace env in config: ${NODE_AUTH_TOKEN}
SKIP docs/meta/adr/ADR-0006-ops-field-operations-port.md -> ADR-0036
SKIP docs/meta/adr/ADR-0024-rait-legal-priority-owner-policy.md -> ADR-0037
SKIP docs/meta/adr/ADR-0028-provisionamento-operacional-offline.md -> ADR-0038
REVIEW docs/meta/knowledge-base/open-decisions-rait.md:68 ADR-0024 sem slug
REVIEW docs/meta/knowledge-base/backlog.md:473 ADR-0024 sem slug
REVIEW docs/meta/knowledge-base/decision-closure-plan.md:101 ADR-0024 sem slug
REVIEW docs/framework/arch/rait-build-pack.md:20 ADR-0028 sem slug
REVIEW docs/framework/arch/rait-build-pack.md:226 ADR-0006 sem slug
REVIEW docs/framework/arch/teat-build-pack.md:170 ADR-0028 sem slug
REVIEW docs/framework/arch/portal-build-pack.md:31 ADR-0024 sem slug
REVIEW docs/framework/arch/portal-build-pack.md:57 ADR-0024 sem slug
REVIEW docs/framework/arch/portal-build-pack.md:186 ADR-0024 sem slug
REVIEW docs/framework/arch/portal-build-pack.md:208 ADR-0024 sem slug
REVIEW docs/framework/arch/portal-build-pack.md:215 ADR-0024 sem slug
adr:renumber dry-run: 0 pending, 11 review
```

## Passo 4 — `prettier --check` nos sete arquivos → OK

## Citações sem slug para revisão do TASK-0004 (regra §5.3)

Dentro da fronteira do TASK-0004 (`docs/meta/knowledge-base/**`): `open-decisions-rait.md:68`, `backlog.md:473`, `decision-closure-plan.md:101`. Fora da fronteira (`docs/framework/arch/*-build-pack.md`: rait 20/226, teat 170, portal 31/57/186/208/215): não editar no CTG-0001 — resolvidas por alias; `teat-build-pack.md:170` fica com o CTG-0002 (lock de build packs), conforme o contrato.
