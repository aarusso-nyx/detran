from pathlib import Path
import json,hashlib,subprocess,os
root=Path('/Volumes/Development/.codex/worktrees/completion-roadmap/detran');out=Path(__file__).resolve().parent
a=json.loads((out/'postintegration-evidence-standing.json').read_text())
assert a['postintegration_ci40060467337_all_jobs_pass'] is True and a['delivery_head522_all_five_required_green'] is True and a['all_light_checks_pass'] is True
assert a['actual_merge']=='f50b9ce7dd32dff66646fd01e99b0556e4d76bdb'
assert json.loads((out/'preexecution-review1.json').read_text())['overall_verdict']=='PASS'
reviewsha=hashlib.sha256((out/'preexecution-review1.json').read_bytes()).hexdigest()
fallback=str(a['successful_postintegration_fallback_check'])
D6=f"""
## D-6 — Bounded measurement closing judgment

**Status: adopted.** Architect accepts only the original R-0042/BL-0024
measurement scope under D-1/D-2 and approved M1. Actual #224 merge
`{a['actual_merge']}` preserves the independently reviewed delivery tree
and the measured source `21427c25fe2e1c7977ca0311156d4c59d8cfea35`.

Actual post-integration DETRAN CI **40060467337** passed its complete backend,
foundation, mock, evidence, invariant and BOAT jobs; original optional stack-smoke
remained skipped. Its own remote-backend fallback check is **{fallback}**.
The five required checks were green at delivery head `522e61d3` before #224
merged. This does not describe every workflow on the merge as green:
trusted-RC run **40060467323**, job **120772645725** and check
**120772707099** remain failed for the missing exact-tree attestation tag and
secondary missing-summary output. Those failures remain retained. The merged tree
is not described as signed or attested.

All 43 applicable cells have supported source-X observations and zero cell gaps;
native **26 PASS / 12 REVIEW / 5 FAIL + two unchanged N/A, overall FAIL** remains.
The original seven targets are supported: F3:T1/T6/T7/T8 PASS and F3:T2/T3/T5
REVIEW. Complete measurement does not accept the residual quality findings.
Independent closeout review PASS is bound by SHA-256 `{reviewsha}`;
actual CI, material equivalence, light gates and review receipts are retained in
`reports/m1-closeout-20261024/`.

D-1…D-5 remain intact. Local D-3 is the withheld, unexecuted companion proposal,
not the generic register D-3 closing category. Historical and failed attempts,
all available canonical bytes and the same 13 historical artifact limitations
remain explicit; native proof-anchor verification is a separate dimension.
Only registered verbs may append acceptance evidence, allocate the PC,
materialize the declaration/index, seal and resolve BL-0024. No PC or seal is
asserted by this judgment before actual machine emission.

The final clean closeout candidate still requires a fresh signed RC, independent
exact-commit verification, final review and all five required checks before its
own protected PR merge; actual main must then verify by exact tree. Keep #211
unmerged, S3 runtime held, all nine C6 producers inactive and the withheld protocol
untouched. R-0020/0041/0044/0045, BL-0020/0025 and all genuine residual findings
retain their separate obligations. No product, legal, qualification, operational
or whole-campaign readiness follows.
"""
local=root/'work/rounds/R-0042/decisions.md';before=local.read_bytes();assert b'## D-6' not in before;local.write_bytes(before+D6.encode())
ledger=root/'law/register/DECISIONS.md';old=ledger.read_bytes();assert b'### D-6' not in old
annex=f"""
### D-6

**Fechamento posterior da rodada — Architect.** Quando os atos locais anteriores
já usam outros IDs, D-6 pode registrar o julgamento posterior de fechamento após
os gates próprios. A autorização e o escopo continuam limitados ao
`AUTHORIZATION.md`, às decisões e ao anexo da própria rodada. Esta entrada não
fecha nenhuma rodada nem amplia a autoridade do Owner.

## Anexo de R-0042

- **D-1 — Owner:** pedido original das sete lacunas em `work/rounds/R-0042/decisions.md`;
  autoridade existente projetada em `work/rounds/R-0042/AUTHORIZATION.md`.
- **D-2 — Owner/Architect:** continuidade M1 expressamente instruída e adoção governada
  de DEVAI 2.7.0 sob ADR-0061, sem alterar aceitação, thresholds ou C6.
- **D-3 — Architect:** proposta local de companion retida e não executada; não é o
  D-3 genérico deste registro nem julgamento de fechamento desta rodada.
- **D-4 — Architect:** época nova, fonte congelada e inventários genuínos antes da
  primeira emissão de prova; nenhum resultado cruzado entre SHAs.
- **D-5 — Architect:** custódia completa dos novos artefatos e preservação dos bytes
  disponíveis, com as mesmas 13 limitações históricas explicitamente mantidas.
- **D-6 — Architect:** julgamento de fechamento restrito às medições completas de
  `21427c25`, integradas no PR #224 / `{a['actual_merge']}`.
  CI pós-integração **40060467337** aprovada, incluindo fallback remoto
  **{fallback}**, e gates leves aprovados. O run trusted-RC **40060467323**,
  job **120772645725** e check **120772707099** continuam **FAIL** por tag de
  atestação ausente e falha secundária do resumo, preservados sem waiver.
  A árvore integrada não é declarada assinada/atestada nem verde em todos os workflows.
  Revisão independente PASS `{reviewsha}`; recibos em
  `work/rounds/R-0042/reports/m1-closeout-20261024/`.

O resultado nativo permanece 26 PASS / 12 REVIEW / 5 FAIL + 2 N/A, overall FAIL;
43 células medidas e zero lacunas não aprovam qualidade ou prontidão. PC, declaração
fechada, selo e resolução de BL-0024 só existem após os verbos oficiais.
O candidato final limpo de closeout ainda exige RC assinado novo, verificação
exact-commit, revisão e checks obrigatórios verdes antes da integração protegida.
#211 não integrado, S3 retido e C6 bloqueado; demais rodadas, BL-0020/0025,
históricos e limitações permanecem com seu próprio escopo.
"""
ledger.write_bytes(old+annex.encode())
env=os.environ.copy();env['PATH']='/Volumes/Development/runtimes/nvm/versions/node/v24.20.0/bin:'+env['PATH']
env['NODE_AUTH_TOKEN']=subprocess.check_output(['gh','auth','token'],text=True).strip()
subprocess.run(['pnpm','exec','prettier','--write','work/rounds/R-0042/decisions.md','law/register/DECISIONS.md'],cwd=root,env=env,check=True)
assert local.read_bytes().startswith(before) and ledger.read_bytes().startswith(old),'Original decision bytes must remain exact prefix'
print('D6adopted on actual completed acceptance facts; no PC/seal/backlog transition yet.')
