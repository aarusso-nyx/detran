# R-0038 — C2

Status: ativa. Objetivo: remover advisories de ferramentas e Angular restantes após C1, com versões mínimas compatíveis, sem relaxar thresholds. C-0004 governa a campanha. Maestro usa ADR0022: revisão de prompts/entrega por outra família, worker Engineer sem git, Inspector fornece validação; maestro commita, registra e integra somente com checks verdes.

## Fronteira

package.json, pnpm-lock.yaml e manifests dos consumidores necessários a C2; nenhum código de produto ou teste enfraquecido. Preservar C1, Angular22 e STYNX1.5.3 salvo incompatibilidade comprovada submetida ao maestro. Sem npm audit fix amplo. Relatórios completos em reports.

## Gates

Frozen install; pin STYNX; auditoria completa e security_scan com thresholds preservados; builds e testes afetados; revisão independente PASS; CI obrigatória verde antes de merge. Não declarar PASS se advisory residual permanecer.

## Bloqueios e retomada

Dependência de provedor ou major incompatível exige plano concreto ao maestro; valores legais não são inventados. Retomar de HEAD exato e conferir worktree antes de commit. R0036 e R0037 são preservadas. C1closurePR207 pendente de integração não pode ser descrito como já encerrado na main.
