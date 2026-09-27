Papel: Architect
Tarefa: TASK-0008 — correção após delivery-review, escalada Sol/high
Arquivos alterados: 26 `product/journeys/JNY-*.json`, `product/use-cases/{pec,boat,rait}.json`, `product/README.md`, `product/specification.md`.
Comandos/resultados: `devai check --only journeys` PASS (40/40, zero erros); `pnpm format:check` PASS; auditoria local da fonte PASS para 40 jornadas, 294 passos alinhados, 110 casos e 532 passos de fluxo principal, com IDs, títulos, proveniência e contagens equivalentes.
Critérios: PASS — 49 passos restaurados, incluindo ressalvas da distribuição imparcial das clínicas, prazo psicológico de dois dias úteis e validade reduzida, ressalva de vigência normativa, lacunas BOAT e restituição. Nenhum passo terminou como cabeçalho ou citação aberta. Autoridade explícita do Owner restaurada no índice e alinhada à especificação. Papéis equivalentes normalizados e presidente incluído em UC-RAIT-026, conforme fonte.

Auditoria por JNY (quantidade de passos da fonte; após seta, passos alterados):

```text
001  8 → 1,2,4,5,7       002  9 → 1,6,7
003  6 → 5,6             004  6 → 5
005  8 → 4,7             006  7 → —
007  7 → 4               008 10 → 1,2,3,4,5,6,7
009  8 → —               010  8 → 1
011  7 → 3,5             012  8 → 3,6
013  7 → 4               014  7 → 5
015  6 → 3               016  5 → 1,2,3
017 10 → 1               018  8 → —
019 11 → 5               020  9 → 6
021  8 → 3,5             022  9 → 3
023  7 → 3               024  7 → —
025  7 → —               026  7 → 2
027  6 → —               028  6 → —
029  7 → —               030  8 → 1,2,4,7,8
031  6 → 3               032  7 → 4
033  7 → 2               034  7 → —
035  7 → —               036  7 → —
037  6 → —               038  7 → —
039  6 → 2               040  7 → —
```

Fora do escopo: nenhum arquivo fora de `product/**`; nenhum Git.
OD: OD-R19-004 continua pendente e foi preservada como lacuna; nenhuma nova OD.
Bloqueios: nenhum.
