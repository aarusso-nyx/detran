# Delivery-review — manutenção de segurança do docs/site (advisories npm de 2026-09)

> Reviewer da família oposta (Codex Sol 6). Papel: **Auditor** (Art. 18), somente leitura na worktree
> `/private/tmp/claude-501/-Users-aarusso-Development-detran--claude-worktrees-r-0022-stynx-sse-tenancy-c949d9/b1c1803b-45c2-401e-9bf3-6408f6685798/scratchpad/wtaudit` (branch `fix/docs-site-audit-2026-09-30`, a partir de `main`).
> Responda **apenas** com JSON: {"mode":"delivery-review","scope":"hotfix-docs-audit","verdict":"PASS|REVIEW|FAIL","findings":[{"severity":"high|low","file":"…","line":1,"claim":"…","fix":"…"}],"notes":["…"]}

O job `foundation` de todo PR contra `main` falha em `pnpm docs:security` (`npm audit --audit-level=moderate`
em `docs/site`) por advisories novos nos _overrides_ fixados `brace-expansion@1.x: 1.1.18` e
`fast-uri@3.x: 3.1.7`. Revise `git diff origin/main..HEAD`: os dois _overrides_ sobem para 1.1.21 e 3.1.8
(mesma linha maior), com o `package-lock.json` regenerado por `npm install`. Evidência do maestro:
`npm run security:check` → "found 0 vulnerabilities"; `npm run build` exit 0. Confira que o diff só toca
essas duas versões, que o lockfile resolve exatamente elas e que nada fora de `docs/site` muda.
