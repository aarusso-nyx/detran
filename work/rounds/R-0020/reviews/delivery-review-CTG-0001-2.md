# Revisão da entrega — CTG-0001, ciclo 2

Você é o reviewer da outra família, **Claude Code Opus 5.5**, papel constitucional
**Auditor**. Trabalhe somente em leitura na worktree
`/Users/aarusso/.codex/worktrees/devai-sensors/detran`. Responda apenas JSON,
sem cerca Markdown, no formato do primeiro ciclo. O maestro e os workers são Codex.

## Escopo do ciclo 2

Leia `docs/meta/agents/orchestra/README.md` §4–§5, o template de reviewer,
`work/rounds/R-0020/contracts/CTG-0001.md`, `plan.md`, o prompt e o veredito do
primeiro ciclo em `reviews/delivery-review-CTG-0001.{md,json}`. Este ciclo é
**restrito às correções dos cinco achados high** do primeiro veredito, pela regra
do método. Não reabra texto ou decisões já aceitas. Uma contradição canônica
descoberta nas correções pode receber `FAIL`.

Examine o diff `git diff HEAD --` dos caminhos de CTG-0001 e leia os novos
relatórios em `reports/TASK-0003-attempt-{1,2}.*` e
`reports/TASK-0003-escalated.*`, inclusive metadados e a limitação declarada
dos transcritos de subagentes. Todos os arquivos do CTG estão staged antes desta
chamada; não edite a worktree. `origin/main` foi integrado antes do primeiro push
após o merge do PR #149 da R-0021, com a seção R-0021 preservada no registro
de ODs. A medição oficial permanece fixada no HEAD de abertura `c848723c`.

## Correções apresentadas

1. **SensorReadings e spec_depth:** o medidor inventaria leituras persistidas por
   kind, estado e referência. `sense run spec_depth` anuncia efeito `remote-write`
   e fica `source_pending` com motivo próprio. O comparador expõe veredito da
   subcomparação `persisted_readings`; o eixo e total ficam REVIEW se spec_depth
   está pendente. Remoção de leitura dá FAIL.
2. **Linhas de prova:** `proofs.lines[]` inclui todas as 119 linhas com caminho,
   sequência, rodada, SHA-256 e âncora, além do subconjunto de órfãs.
3. **Markdown:** contagens de checks e proofs derivam do JSON, com motivos
   `source_pending` de membros e rodadas.
4. **Medição final:** `--final --against <baseline.json>` grava
   `baseline-final.json`/`.md` e compara os oito eixos. Os testes do Inspector
   cobrem preservação e perda de leitura.
5. **Trilha de execução:** TASK-0003 tem três iterações e executor final Sol 6;
   os relatórios por tentativa e a limitação do runtime de subagentes estão
   explícitos, sem apresentar mensagens observáveis como transcritos brutos.

`baseline.json` SHA-256:
`534b44299078b87c915fca543a01ca8b66375ef76704d285f6e2608161bc7388`.
`baseline.md` SHA-256:
`ce57de5425e07f4f57b3ef51da179991d57cd6694694aa3105f2056045220f4e`.
Medição repetida no mesmo clone descartável: bytes idênticos; clone permaneceu
limpo. `pnpm check` exit 0, `pnpm devai:test` 18/18 PASS após a integração de
`main`; `pnpm format:check` e `git diff --check` executados após as correções.

Use os itens 1, 4–7, 10–11 da rubrica. `PASS` se as cinco correções high estão
atendidas; `REVIEW` se resta high corrigível; `FAIL` somente nos casos canônicos
da rubrica. Informe arquivo e linha para qualquer achado. Formato exato:

```json
{
  "mode": "delivery-review",
  "round": "R-0020",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "tools/devai/baseline.mjs",
      "line": 1,
      "claim": "...",
      "fix": "..."
    }
  ],
  "notes": []
}
```
