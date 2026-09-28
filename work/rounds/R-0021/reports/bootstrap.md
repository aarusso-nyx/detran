Papel: Architect (preparação), operações de ambiente registradas separadamente.
Base: e47a68014ffdd24e1f9da03c4fc9e1b78ecf381b. Worktree gerenciada stynx-canonical.
pnpm install --frozen-lockfile: exit 0 (log temporário /tmp/r21-bootstrap-install.log).
pnpm exec devai doctor --repo-root . --format human: exit 0, todos os itens OK, DEVAI 1.5.6; CLIs Codex 0.157.1 e Claude 2.1.283.
round plan --scaffold: exit 2 ROUND_ALREADY_EXISTS; o runtime usa work/rounds/R-0021 já existente, não sobrescrever. Plano/autorização preparados mantidos.
Baseline pnpm check: ainda não concluída; será registrado resultado pelo preparador ou maestro. Nenhuma prova de caracterização foi executada.
Nenhum código de produto/teste alterado nesta preparação.

Prompt-review: ciclo1 REVIEW; ciclo2 transporte inválido; ciclo3 PASS aceito, sem achados. 15 tasks validadas pelo schema instalado e hashes de todos os prompts conferidos.
Baseline pnpm check ainda em andamento na preparação (tool session90578, log /tmp/r21-baseline-check.log). Maestro pode preparar bancos sem executar check concorrente; aguardar /tmp/r21-baseline.done antes de disparar Inspectors. Esse marcador será escrito pelo preparador com o exit code real.

## Continuação pelo maestro Sol

O preparador concluiu o baseline `pnpm check` com exit code **0** em `/tmp/r21-baseline.done`. O log completo foi preservado em `reports/baseline-check.log` (1650 linhas); nenhum segundo `pnpm check` foi iniciado durante a preparação. O maestro verificou `pnpm exec devai evidence verify --scope chain --repo-root . --show-head --format human`: exit 0, head `25f94219921c2f37f927aa55c2aa98d97e96502d753be669134e6245c1b429d1`. `pnpm --filter @detran/ch-clinical-reports build` antes do despacho: exit 0 (`/tmp/r21-clinical-build-pre.log`). `git fetch origin main`: exit 0; base e `origin/main` coincidem no despacho.

PostGIS descartável exclusivo `detran-r21-postgis` (container `a9abf78080db`) na porta local 59640. `pnpm backend:test:prepare-legacy` com destino fixo do runtime `detran_r7_ctg1_a2` nesse container: exit 0, 20 casos. Clones isolados `detran_r21_task2`, `detran_r21_task3`, `detran_r21_ci` criados após DDL/seed canônicos; cada um verificado com 20 casos e PostGIS 3.4.3. Os workers recebem respectivamente `/tmp/r21-task2-env.sh` e `/tmp/r21-task3-env.sh` com variáveis explícitas. Os arquivos de ambiente têm modo 600 e ficam fora do repositório. O runtime `backend:test:ci` exige literalmente `detran_r7_ctg1_a2`; o maestro o executará somente no container da rodada, sem concorrência com os bancos dos workers.

Baseline concluída: pnpm check exit 0 em 2026-09-28T01:35:24.046270+00:00. Log integral versionável reports/baseline-check.log; sha256 002039a261be0d4d1f45eae77dc63d91af86ee79a8f6bb030e354bdea0bf7144. Código de produto/manifests mantidos na baseline1.3.1; somente artefatos de preparação foram corrigidos durante a execução. Nenhuma atestação RC/exact-tree inferida desta baseline.
