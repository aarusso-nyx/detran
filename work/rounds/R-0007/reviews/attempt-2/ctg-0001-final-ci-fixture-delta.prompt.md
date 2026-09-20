# Independent final ordinary-fixture delta review — R-0007 / TASK-0022

Role: independent read-only Auditor Fable 5. The prior CI orchestration
candidate `09dd35545ccc7798710661d0215da2e5cca3229d18cae240655d974781fa26f5`
had valid PASS. Its full runtime run passed unit/integration, then E2E
108/110: remit lacked DEFENSE_DRAFT because historical signed draft has null
document_id; claim-next lacked a slot because UTC day differed from
America/Manaus day. The orchestration driver restored dedicated DB fresh
after failure, as designed. No full GREEN is claimed.

Review only changed fixture/prep/driver bytes in frozen readset. Ordinary
fixture prep now runs current closed `SEED_PROFILE=legacy-upgrade` after the
historical upgrade, proves signed draft document, and is repeated after
integration to erase its mutations before E2E. The final directed upgrade
test remains unchanged and rebuilds its own historical baseline; current seed
must not enter that sensor. E2E claim-next fixture inserts a second slot on
UTC day only when the captured Manaus day differs; test assertions and product
service remain unchanged. Assess correctness, blast radius, role separation,
restoration on failure, and no weakened gate. No shell, edit, or DB access.

Return **only** native structured JSON with five keys `mode`, `round`,
`verdict`, `findings`, `notes`; mode `prompt-review`, round `R-0007`,
verdict PASS/REVIEW/FAIL. Each finding: high/low severity, item 1–13,
existing relative file, one-based line, concrete claim and fix. PASS has
zero high. No prose wrapper.
