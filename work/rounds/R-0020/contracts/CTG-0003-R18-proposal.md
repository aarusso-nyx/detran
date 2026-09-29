# Proposta ao Owner — correção de PC-0015 antes do selo de R-0018

**Papel:** Architect. **Estado:** proposta reversível, sem autorização ou efeito governado. **Escopo:** somente o critério histórico `fail` de PC-0015 (R-0018). A decisão OD-R20-001/002 para as demais rodadas segue independente e pendente.

## Fato e prova substituta

O PC-0015, `record/proofs/compliance/closures/PC-0015.json`, registra exatamente:

```json
{
  "criterion": "git check-ignore -v dist → ignored",
  "verdict": "fail",
  "evidence": "Not met as written: exit 1 before and after the change because `dist/` only matches directories. Substitute proof C-02-21 (git check-ignore --no-index dist/x → exit 0). Criterion not renegotiated; recorded as not met."
}
```

O critério literal de `work/rounds/R-0018/plan.md` é `git check-ignore -v dist → ignorado`. O contrato `work/rounds/R-0018/contracts/CTG-0002.md` §5.3 explica que `dist/` casa diretório, enquanto o caminho `dist` não existe como diretório raiz; a execução literal saiu 1 antes e depois da alteração. O contrato fixou **C-02-21**: `git check-ignore --no-index dist/x` imprime `dist/x` e sai 0; `reports/x` e `coverage/x` também saem 0. `work/rounds/R-0018/reports/TASK-0007.md` registra a execução com exit 0 para os três caminhos. A prova substituta demonstra que um filho de `dist/` é ignorado. Não demonstra cumprimento retroativo do comando literal `git check-ignore -v dist`.

No candidato local de 2026-09-28, `git check-ignore --no-index -v dist/x` saiu 0 e imprimiu `.gitignore:3:dist/\tdist/x`. A medição será repetida depois da integração do CTG-0002 e antes do novo closure.

O runtime DEVAI 1.5.6 recusa `round seal` quando qualquer `validation_criteria` do PC escolhido tem `verdict: fail`. PC-0015 tem exatamente esse `fail`; os cinco gates estão `pass`, mas não removem a guarda. O `n/a` já existente de OD-R18-003 permanece fora desta correção.

## Alteração proposta para um novo closure

Somente com autorização expressa do Owner, o maestro poderá emitir por `devai round close` um **novo** PC corretivo append-only para R-0018. O ID será o próximo disponível no momento da emissão (`source_pending`); o novo objeto terá `supersedes: "PC-0015"`. PC-0015, inclusive seu `fail` e seus bytes, permanece intocado. A nova observação serve para o selo e não reescreve o julgamento histórico.

| Campo do novo PC                                                               | Proposta                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schemaVersion`, `round_id`, `title`, `declaring_decision`, `closing_decision` | Iguais a PC-0015 (`1.0.0`, `R-0018`, título completo, `D-1`, `D-2`). Se OD-R20-001 escolher novos vínculos `DII-*`, reconciliar a decisão antes de emitir; não preencher por antecipação.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `batches`, `gates`, `source_repo_deleted`, `merged_as`, `release_disposition`  | Cópia sem alteração semântica de PC-0015; os três CTGs, os cinco gates `pass`, `false`, merge `4bd1d553478e1eb831353d30dd6769183c2b3990` e `none-needed` são fatos do fechamento original.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `validation_criteria`                                                          | Preservar ordem, texto, veredito e evidência dos outros 14 itens. No único item `git check-ignore -v dist → ignored`, conservar `criterion` literal, trocar **somente no PC corretivo** `verdict` para `n/a` e explicar que o critério literal permaneceu `fail` em PC-0015, mas foi substituído por autorização específica. Acrescentar um item próprio com `criterion: "C-02-21: git check-ignore --no-index dist/x → ignored (exit 0)"`, `verdict: "pass"` **apenas após reexecutar a prova no candidato**, e evidência que cite contrato §5.3, relatório TASK-0007 e saída observada. Se a prova atual falhar, não emitir o corretivo como verde. |
| `id`, `closed_at`                                                              | Novos, gerados pelo verbo DEVAI. Não copiar `PC-0015` nem sua data.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `supersedes`                                                                   | `PC-0015`, vinculando a correção append-only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `notes`                                                                        | Preservar as notas históricas de PC-0015 e acrescentar referência à autorização específica do Owner, ao `fail` mantido no PC-0015, ao `n/a` por substituição no novo PC e ao PASS medido de C-02-21. Não afirmar que o critério literal passou.                                                                                                                                                                                                                                                                                                                                                                                                       |

O par de entradas proposto em `validation_criteria`, depois da autorização e medição, tem a forma:

```json
[
  {
    "criterion": "git check-ignore -v dist → ignored",
    "verdict": "n/a",
    "evidence": "Critério literal não cumprido (exit 1) e preservado como fail em PC-0015. Substituição específica autorizada pelo Owner para a observação corretiva; prova C-02-21 registrada em item próprio."
  },
  {
    "criterion": "C-02-21: git check-ignore --no-index dist/x → ignored (exit 0)",
    "verdict": "pass",
    "evidence": "work/rounds/R-0018/contracts/CTG-0002.md §5.3 e work/rounds/R-0018/reports/TASK-0007.md; nova execução no candidato: source_pending."
  }
]
```

`source_pending` no segundo `evidence` é marcador da proposta: deve ser substituído pela saída real antes do fechamento. O corretivo não dispensa `pnpm check`, CI, review da outra família, cadeia válida, decisões resolvíveis, índice e demais guardas do selo.

## Ordem de ensaio, sem efeito nesta proposta

1. Obter autorização escrita do Owner que nomeie **R-0018, PC-0015, o critério literal, C-02-21, `supersedes` e a manutenção do `fail` original**. O precedente `work/rounds/R-0017/SEAL-AUTHORIZATION.md` autorizou apenas PC-0017→PC-0018 e quatro critérios daquela rodada; não cobre R-0018.
2. Após a decisão OD-R20-001 sobre os vínculos de decisões e OD-R20-002 sobre o índice, integrar o HEAD correto, liberar locks de `record/` e conferir PC-0015 e as fontes. Preparar o input de `round close` em clone descartável, sem modificar o PC original.
3. No clone, reexecutar C-02-21 e registrar stdout/exit. Ensaiar `devai round close` para a correção append-only. Comparar o novo PC campo a campo à tabela acima; verificar ID novo, `supersedes: PC-0015`, apenas o `fail` substituído por `n/a` e o critério C-02-21 acrescido com prova. Validar que hash/bytes de PC-0015 não mudaram.
4. No mesmo clone, gerar/atualizar o índice conforme a decisão autorizada, transcrever `record.md` de R-0018 com o **novo** PC e `merged_as` original, executar `round seal` e conferir o `close-state.jsonl` gerado. O comando de seal escreve sem `--write`; por isso o clone é indispensável. Rodar gates e verificação da cadeia no candidato.
5. Só com ensaio verde, aplicar pelo maestro o mesmo fluxo governado na worktree real com lock livre, revisão e integração serial do CTG-0003. Se a seleção final de PC, decisões ou índice divergir do clone, repetir ensaio. Nenhum atalho manual em `record/` ou `close-state.jsonl`.

## Riscos e decisão solicitada

- A aprovação deve **substituir o critério efetivo para o selo**, mantendo `fail` em PC-0015. Mudar diretamente PC-0015 ou promovê-lo a `pass` quebraria a trilha histórica.
- O novo PC ainda depende da escolha OD-R20-001 (`D-1`/`D-2` ou `DII-*`) e do índice OD-R20-002; um `record.md` escrito antes dessas escolhas pode ficar inconsistente.
- Um novo fechamento pode alocar ID diferente do previsto por concorrência. O `record.md`, índice e `close-state.jsonl` devem usar o ID realmente emitido, nunca um número reservado nesta proposta.
- A medição C-02-21 é sobre `dist/x`, não sobre `dist`; seu PASS não muda a semântica do comando antigo. A nova prova precisa ser reproduzida no candidato integrado.

**Texto proposto para decisão do Owner:**

> Autorizo, exclusivamente para o selo de R-0018, uma correção governada append-only do PC-0015 por novo PhaseClosure com `supersedes: PC-0015`. O critério histórico `git check-ignore -v dist → ignored` permanece `fail` e intocado em PC-0015; no novo closure ele será `n/a` por substituição autorizada. A prova efetiva será C-02-21, `git check-ignore --no-index dist/x` com exit 0, registrada como critério próprio `pass` somente se reproduzida no candidato. Todos os outros critérios, gates, CTGs e o `merged_as` de PC-0015 permanecem; o maestro ensaiará fechamento, índice, record e seal em clone descartável antes de qualquer escrita governada real. Esta autorização não decide OD-R20-001/002 nem dispensa review, CI ou cadeia válida.

Até essa decisão, o PC corretivo, o selo de R-0018 e a TASK-0007 continuam pendentes.
