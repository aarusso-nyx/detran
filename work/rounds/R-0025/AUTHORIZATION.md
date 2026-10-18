# Autorização direta — R-0025 `rait-web-wiring`

**Papel decisor:** Owner. **Recebimento local nesta sessão:** 2026-09-29
(America/Sao_Paulo). A fonte textual da adenda A-C2-15 em
`work/campaigns/C-0002-consolidacao.md` é datada de 2026-09-30; essa data é
registrada como proveniência do texto, sem afirmar que já ocorreu no relógio local.

O prompt direto da Sessão A autorizou o pré-trabalho da R-0025 nos limites da
A-C2-15: TASK-0001, TASK-0002, TASK-0003 e TASK-0006, somente análise e contratos.
A branch parte de `origin/main`; há um prompt-review restrito às tarefas liberadas,
comandos de aceitação por tarefa, push sem PR e checkpoint. TASK-0004/0005/0007/0008
esperam R-0022/R-0023; TASK-0009 em diante esperam R-0024. Os contratos desta
sessão serão reconferidos contra `origin/main` na retomada, com adenda numerada se
houver divergência.

Maestro e workers: Codex Sol 6 e escada Codex. Reviewer: Claude Code Opus 5.5
pela ponte `tools/orchestra/bridge.sh claude`.

## Adenda A-C3-01 — retomada e primeiro recorte (Owner, 2026-10-18)

Fonte: mensagem expressa do Owner na sessão de continuação, texto literal:

> Resume R-0025 from orchestra/rait-web-wiring, reconcile it with current main, apply A-C3-01, and start with JW-01. Refresh stale planning records, preserve existing local changes, run the required checks, and open a PR.

Diante da divergência documentada entre claim-next e admissibilidade, o maestro
perguntou sobre iniciar pelo caso protocolado → triagem → checklist → admitir/rejeitar,
deixando claim e instrução para depois. Resposta literal do Owner:

> Proceed with the admissibility slice (recommended)

Autoriza o primeiro PR limitado de admissibilidade, reconciliação, checks e revisão.
Não autoriza merge/close/seal. Não reduz a aceitação integral da R-0025 nem declara
JW-01 completa. As quatro tarefas da Sessão A permanecem completed/históricas.
O restante dos 64 comandos, F-02/instrução, claim, minuta e jornadas posteriores
permanece no plano integral, sem PASS por ausência de execução.

A-C3-01 aplica C-0003 §4/A-C2-16: main e padrão v0 entregues pela R-0033 substituem
espera obrigatória por R-0022/23/24. R-0022 continua parada; não é retomada nem
fundida integralmente. Costuras e limites atuais estão no adendo do plano e no
contrato `contracts/JW01-admissibility.md`. Maestro família Codex, reviewer Claude
via alias CLI `opus`; sem inferência de modelo exato a partir do alias.
