# R-0038 — C2

Status: ativa. Objetivo: remover advisories de ferramentas e Angular restantes após C1, com versões mínimas compatíveis, sem relaxar thresholds. C-0004 governa a campanha. Maestro usa ADR0022: revisão de prompts/entrega por outra família, worker Engineer sem git, Inspector fornece validação; maestro commita, registra e integra somente com checks verdes.

## Fronteira

package.json, pnpm-lock.yaml e manifests dos consumidores necessários a C2; nenhum código de produto ou teste enfraquecido. Preservar C1, Angular22 e STYNX1.5.3 salvo incompatibilidade comprovada submetida ao maestro. Sem npm audit fix amplo. Relatórios completos em reports.

## Gates

Frozen install; pin STYNX; auditoria completa e security_scan com thresholds preservados; builds e testes afetados; revisão independente PASS; CI obrigatória verde antes de merge. Não declarar PASS se advisory residual permanecer.

## Bloqueios e retomada

Dependência de provedor ou major incompatível exige plano concreto ao maestro; valores legais não são inventados. Retomar de HEAD exato e conferir worktree antes de commit. R0036 e R0037 são preservadas. C1closurePR207 pendente de integração não pode ser descrito como já encerrado na main.

## Progressão pós-integração — C2

O registro inicial acima foi preservado como histórico da abertura. PR #207 encerrou R-0037; PR #208 integrou C2 em `11eea2d7309a958d14d536ea7ced46124dfeed2e`, árvore idêntica ao candidato. A CI 39339090324 e o verificador exact-candidate concluíram success. A auditoria completa e o reading nativo C2 retidos registram zero vulnerabilidades com thresholds inalterados. Os campos de dependências dos oito manifests e o lock da árvore de fechamento permanecem idênticos a C2; isso não transfere prontidão de toda a main posterior.

A revisão independente de encerramento precede os verbos oficiais. O Architect usa a autorização existente do Owner e o juízo delegado D-2; nenhuma nova resposta humana é simulada. Encerramento, selo e resolução de BL-0013 serão aceitos somente mediante recibos autênticos. R-0036/R-0037, legado, prefixo atual de provas e BL-0014–BL-0023 permanecem preservados. Relatórios em `reports/post-integration/`.
