# Prompt-review única — R-0023 O1 (A-C2-14)

Papel: **Auditor** (Constituição DEVAI, Art. 7). Você é reviewer Claude Code
Opus 5.5 da família oposta à do maestro Codex. Trabalhe **somente em
leitura** nesta worktree. Responda **somente JSON**, sem cercas de Markdown:

```json
{
  "mode": "prompt-review",
  "round": "R-0023",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 1,
      "file": "caminho",
      "line": 1,
      "claim": "achado verificável",
      "fix": "correção concreta"
    }
  ],
  "notes": []
}
```

## Escopo e fontes

Leia `AGENTS.md`, `docs/meta/agents/orchestra/README.md` §4–§5,
`docs/meta/agents/README.md` §Regras comuns,
`work/campaigns/C-0002-consolidacao.md` §12–§14,
`work/rounds/R-0023/plan.md` inteiro,
`work/rounds/R-0023/AUTHORIZATION.md`,
`work/rounds/R-0023/prompts/00-maestro.md` e os dois prompts ativos
`prompts/TASK-0001.md`, `prompts/TASK-0002.md`, mais os dois JSONs em
`tasks/` e `compositions.json`. O PR #160 ainda está aberto; o prompt do
Owner da sessão substitui A-C2-14 para esta abertura. A autorização é **só
O1**. Os prompts O2–O5 serão materializados na retomada; não exija execução
nem artefatos dessas ondas agora.

## Rubrica

Julgue exaustivamente, com arquivo e linha, se: papel/autoridade batem com
escrita; listas de leitura bastam e são fechadas; TASK-0001 precede TASK-0002;
fronteiras de escrita e locks são corretos e excluem R-0020/R-0022;
`acceptance_commands` são reais ou entregáveis explícitos e mantidos; a
matriz cobre rotas montadas, 36 papéis, negativos, wildcard, perfis e camada
HTTP; a linha de base B2 está explícita; nenhuma API STYNX futura é presumida
em 1.4.0; as decisões do Owner/ODs são respeitadas; nenhum gate foi
enfraquecido. Frente de segurança: severidade alta para risco de ampliar
acesso ou de caracterização fictícia.

`PASS` se nenhum achado alto; `REVIEW` se houver alto corrigível sem mudar
decisão do Owner; `FAIL` se contradiz decisão canônica ou autoridade.
O reviewer não edita arquivos e não executa comandos mutantes.
