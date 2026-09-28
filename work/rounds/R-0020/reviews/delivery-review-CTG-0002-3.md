# Auditor — delivery-review CTG-0002, ciclo 3 de até 4

Você é Claude Code `claude-opus-5-5`, papel constitucional Auditor. Trabalhe somente
em leitura na worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`.
Não edite arquivos, não execute DEVAI com `--write` e responda somente JSON válido,
sem Markdown.

Leia `docs/meta/agents/orchestra/reviewer-prompt.template.md`,
`work/rounds/R-0020/reviews/delivery-review-CTG-0002-1.json` e
`delivery-review-CTG-0002-2.json`. Este é o terceiro ciclo do mesmo item: julgue
as correções dos achados anteriores, especialmente o high de completude, e a
implementação A2 nova necessária para resolvê-lo. Achado novo sobre texto
inalterado só cabe como FAIL canônico e deve explicar por que não apareceu nos
ciclos anteriores. O limite autorizado pelo Owner é quatro ciclos.

## Estado integrado e decisão

- PR #154 da R-0021 mesclado em `main` como
  `d3ec20cb7bb79b4126975810585144857daa0293` com CI verde. O branch
  publicado R-0020 integrou `origin/main` por merge `133530a4`; ao aplicar o
  trabalho local, aceitou a cadeia de `main` integralmente e descartou as
  provas locais concorrentes, sem resolver JSONL/chain por texto.
- O Owner aprovou A2 **só** para `record/proofs/work/generic/R-0021.jsonl`
  sequência física 2, SHA-256
  `c562dfce81ec9ba08c4d3eae22547ad36adb99fbb76dc2632bb20e81fbbfb804`.
  A fala literal, `AUTHORIZATION-A2-2026-09-28.md`, seu SHA-256
  `8058b19e4c19570a8556ce775d4b21aabeebd13399d323742e91f90d20eac40f`
  e `contracts/CTG-0002-exceptions.jsonl` com digest canônico
  `63a3ea15d53b9cd61585104c54cb0282abb53e6cd8b4154d1169f290ad6e9441`
  fixam a única exceção. A baseline de 52 trios históricos está imutável.
- Houve ensaio de seis comandos DEVAI `evidence record --write` em clone
  `/tmp/r20-after154.UMAp2H/repo`, seguido da execução real pelo maestro:
  R-0020 seq. 3 (reancoragem da observação do PR #152), R-0005 seq. 11,
  R-0007 seq. 43, R-0013 seq. 16, R-0017 seq. 8 e R-0021 seq. 5 (A2).
  Não houve edição manual de `record/proofs/**`.
- `pnpm verify:proof-anchors` real: **81 diretas, 53 órfãs declaradas,
  zero não declaradas, zero duplicatas, zero referências inválidas,
  zero erros de validação**; cadeia DEVAI válida no head
  `fa3b777edfa04ab0ffd889dea9436d23e25b489358232ed29a70d682b921760e`.
  Verifique independentemente. Confirme que a A2 só vale após prova declaratória
  diretamente ancorada e que qualquer outro trio novo falha.

## Correções dos achados e gates

1. A allowlist histórica endurecida do ciclo 2 segue com digest embutido,
   metadados 119/67/52 e `proofs.lines`/`proofs.orphans` coerentes. A2 está em
   arquivo segregado de uma linha/cinco campos, com hash de autorização e digest
   exato. O gate não admite nova linha R-0020 declarada.
2. O Inspector cobriu as observações low do ciclo 2 (sequência citada com hash
   de outra linha e contagem isolada adulterada), além de oito cenários A2.
   `pnpm devai:test` passou 56/56. Antes do complemento de baseline houve
   18/19 no teste focal, com único RED positivo A2; depois 19/19 PASS.
3. A comparação da baseline inicialmente apontou `FAIL` por dois fatos reais:
   `status: done` fora do schema nas TASK-0004/0005 e a nova linha física A2
   que o medidor tratava como regressão. Os status foram corrigidos para
   `completed` e os dois schemas DEVAI passaram. `baseline.mjs` mantém
   `anchored:false` e as contagens físicas, mede `proofs.anchor_gate` em modo
   somente leitura e só aceita o trio A2 exato se o gate estrito estiver limpo
   e a cadeia válida. Testes negativos exigem FAIL sem gate, com qualquer erro,
   hash alterado ou outra órfã nova. Compare com `contracts/CTG-0002.md`
   §Comparação final. A medição final em
   `/tmp/r20-baseline-after154-fixed/baseline-final.json` saiu 0, com
   `proofs`, `tasks` e `scorecard` PASS, nenhum eixo FAIL; veredito geral REVIEW
   só por fontes `source_pending` já presentes na abertura. O arquivo oficial
   `baseline-final.*` será versionado no fechamento da R-0020, após todos os
   CTGs.
4. `pnpm format:check` e `pnpm exec devai doctor --repo-root . --format human`
   passaram; `pnpm check` completo deve terminar antes do seu veredito.
5. O achado low de segregação de commits permanece planejado: pelo método da
   rodada, o seu PASS libera os commits por papel; não antecipe uma exigência
   impossível de commits prévios ao PASS. Revise o plano de segregação e a
   ausência de arquivos temporários do bridge no staging. O relatório
   `TASK-0005.md` explica os limites da retenção dos RED antigos sem inventar
   logs; os novos RED/PASS estão registrados.

Inspecione `git diff --stat`, `git diff` completo e os arquivos não rastreados
do CTG-0002: contrato, exceção, autorização A2, cinco inputs de correção,
verificador, testes, relatórios, dois reviews anteriores e prova DEVAI. O
prework CTG-0003 (`CTG-0003.md`, proposta R-0018 e autorização CTG3) está fora
deste review e não deve entrar no PR CTG-0002. Não trate a ausência de commits
antes do PASS como bloqueio; avalie se o conjunto está pronto para segregação,
commit e CI. Cite caminho e linha para qualquer pendência.

Resposta JSON: `mode:"delivery-review"`, `round:"R-0020"`, `verdict`,
`findings:[{severity,item,file,line,claim,fix}]`, `notes:[]`. Primeiro caractere
`{`, último `}`.
