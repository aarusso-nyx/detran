@AGENTS.md

## Governance anchors (checked by `devai doctor` agents-claude-sync)

The sensor reads this file literally and does not follow the `@AGENTS.md` import, so the anchors it
requires are restated here; `AGENTS.md` remains the single source of the rules.

| Anchor                | Where it lives                                                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Authority by path     | Constitution Article 6 (`law/constitution.md`, the pinned copy in `.devai/pin/constitution.md`)                                        |
| Human roles           | Constitution Article 7 — Owner, Architect, Engineer, Inspector, Auditor; declare the task packet's role in one line before scoped work |
| Reading-order sources | `README.md`, `law/constitution.md`, `law/adr`, `law/schemas` — then `AGENTS.md` routes to the specific file for the change             |
