# R-0022 — restauração determinística de três edges do lock

Architect/F1, 2026-10-13. Disposition técnica da lane P ativa8aab; não altera
blueprints/package payloads ou autoriza upgrades alheios. Root Engineer executa.

Inputs imutáveis em scratch/r22-adoption-161/pin-preparation:
lock-before-pin.yaml SHA29b8718151d9a92c3e717a36dbdd54404c4a0f19eae437873def2853de2176bc;
lock-first-resolution.yaml SHAc4ba70c2381296193c4b2446345d7a469e2b680a6362af0ef0705d10ecace3fa;
lock-delta-verification.json SHAb60fa1e1c15a2476a4a5e704d3da54d1fc40e51bf8ca125d5b703837cc30e0a5.
Targeted resolver544d5f38 produziu343 unrelated deltas e é **rejeitado**, retido
como evidência, nunca instalado. Não repetir speculative resolver para isso.

F1 leu os dois YAML por parser real e conferiu exatamente três scalars divergentes
fora STYNX; todos os targets originais permanecem no primeiro lock. Leu os exact
parent package.json instalados: login3.972.77 e token-providers3.1116.0 requerem
nested-clients ^3.997.44, satisfazendo3.997.44; coverage-v8@4.1.11 requer peer
vitest4.1.11, satisfeito pelo contexto original ainda existente. Nenhum package
version precisa mudar para conservar essas referências.

**Aprovado:** restaurar o primeiro c4ba, usar YAML Document API setIn somente:

| Snapshot                                    | Dependency scalar       | Valor a restaurar da original29b871                                                                                                |
| ------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| @aws-sdk/credential-provider-login@3.972.77 | @aws-sdk/nested-clients | 3.997.44                                                                                                                           |
| @aws-sdk/token-providers@3.1116.0           | @aws-sdk/nested-clients | 3.997.44                                                                                                                           |
| @vitest/coverage-v8@4.1.11(vitest@4.1.11)   | vitest                  | O scalar peer-context integral original: Vitest4.1.11/Vite8.1.5/Sass1.101.0, byte exato de29b871, não reconstruído por abreviação. |

Antes de setIn, comparar input hashes e cada scalar atual aos after values do
report b60f; path arrays explícitas, sem split ambíguo por package slash ou regex
global. Restaurar valores diretamente da original. Depois comparar estruturas
YAML completas: nenhuma diferença contra c4ba além desses três scalars e nenhuma
diferença non-STYNX contra original29b871. Não mexer importer/specifier/override/
resolution/SRI/URLs/peer snapshots ou criar versão. Reter script/sourcehash e
raw before/after/diff/manifest do repair; formatter não deve esconder outro delta.

Todos27 STYNX versions1.6.1/SRI/tarURLs continuam iguais à publicação protegida.
Rodar frozen-lockfile --ignore-scripts install, conferir hash lock estável e
installed closure/bytes; falha fecha gate, não repetir unfrozen resolver nem
permitir os343 deltas. Esse frozen install é a prova operacional ainda pendente,
não foi executado por F1. Nova SDK execução espera runtime admission já definida.

Trata-se de restauração limitada de graph refs gerados para conservar resolução
original válida; não é handedit de generated blueprint outputs ou política de
ignorar drift. Guards/verificações da lane P permanecem integrais.8aab/6cda não
são emendados, provider/trust/DB/prod não são afetados por esta disposition.
