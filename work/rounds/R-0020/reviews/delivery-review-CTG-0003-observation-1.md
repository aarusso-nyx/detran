Return exactly one JSON object. First character `{`, last character `}`. No Markdown, narration or files written.

# R-0020 — delivery-review da observação pós-merge CTG-0003

Você é Claude Code Opus 5.5, reviewer da outra família e Inspector constitucional. Faça somente leitura em `/Users/aarusso/.codex/worktrees/devai-sensors/detran`.

Revise **apenas** o commit Machine `5959f5fb` contra seu pai `1fe16cbc0b6f6ea30be2efde044901db64cdd6b1`, merge do PR #156. Esse commit foi gerado por `devai audit observe --at 1fe16cbc... --round R-0020 --as-role auditor --write`, depois de ensaio em clone, e altera a cadeia de provas e cinco artefatos em `.devai/state/audit-observations/1fe16cbc0b6f6ea30be2efde044901db64cdd6b1/`. Leia `git show --stat --oneline 5959f5fb`, o diff e as provas, `work/rounds/R-0020/plan.md` último checkpoint CTG-0003, `.devai/pin/constitution.md` Art. 29–36/41 e o contrato CTG-0003. Confirme âncora no SHA exato, autoria DEVAI Machine, cadeia íntegra, ausência de promoção indevida do CTG-0004 e se há qualquer correção necessária antes de publicar em PR exclusivo. A comparação dos cinco hashes com clone foi registrada no checkpoint; não execute `audit observe`, `evidence record`, sensor ou qualquer `--write`.

Esta revisão não cobre o wrapper de sensores nem autoriza CTG-0004. Responda JSON estrito:
{"mode":"delivery-review","round":"R-0020","group":"CTG-0003-observation","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","file":"...","line":1,"claim":"...","fix":"..."}],"notes":[]}
