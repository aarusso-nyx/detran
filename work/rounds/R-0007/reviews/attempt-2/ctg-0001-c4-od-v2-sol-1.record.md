# C4-OD-V2-SOL-1 — registro da revisão ad hoc

- Autorização: OWNER, 2026-09-16, uma revisão independente Sol/alto; exceção
  local à regra ordinária de família oposta, sem reset de outros limites.
- Papel: Auditor, prompt-review, somente leitura.
- Candidato: worktree `/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`,
  branch `orchestra/rait-backend`, HEAD `df1e1769941e527a07b6db7550aee84068f3a872`.
- Comando: `codex exec -m gpt-5.6-sol -c model_reasoning_effort=high -C <worktree> -s read-only --ephemeral --skip-git-repo-check --output-schema <schema> -o <json> - < <prompt>`.
- Sessão da ferramenta: `01a0ab4d-0c30-74c1-8974-eb3c141aac96`.
- Início UTC: `2026-09-16T17:39:08Z`; conclusão observada: antes de
  `2026-09-16T17:47:12Z`; exit code `0`.
- Prompt SHA-256: `34ced02206d1eae768f12ea7e7e789322f574d64056374a1076d6b00534c5ecf`.
- Schema SHA-256: `0f3e28c1a975045c08fdf44996cfc9e8df8166f72a3d3853a391001d9e65b8ec`.
- Saída SHA-256: `a3ca663b82507912f29d65fa45a4e813a4748a5ff15d318e20b25423cedfe549`.
- Validade: JSON parseado localmente; cinco chaves de topo do template presentes,
  tipos/enum e oito findings com path/linha conferidos. A ferramenta impôs o
  schema de saída; doze hashes de entrada conferidos pelo Auditor.
- Veredito: **FAIL**, oito achados `high`, zero `low`. A saída Fable inválida
  anterior não integrou este parecer. Não há dispatch, SQL, commit, PR ou merge
  liberado.

O arquivo `.json` é o parecer íntegro e prevalece sobre este resumo operacional.
