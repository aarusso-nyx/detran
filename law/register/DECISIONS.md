# Registro de decisões de rodadas

**Autoridade:** Owner para a declaração; Architect para o fechamento após os gates. Este registro vincula os IDs `D-*` usados nos PCs e nos arquivos de rodada. Correções posteriores são append-only: a decisão original e seu recibo permanecem rastreáveis. O anexo abaixo documenta apenas R-0017; os anexos das outras rodadas permanecem pendentes e nenhuma decisão específica delas é inferida aqui.

### D-1

**Declaração da rodada — Owner.** A autorização específica do Owner para cada rodada fica no seu `AUTHORIZATION.md` e no anexo abaixo. D-1 não amplia o escopo de nenhum prompt ou decisão local.

### D-2

**Fechamento da rodada — Architect.** Para R-0017, o fluxo de merge, CI verde e PASS da outra família vem de `work/rounds/R-0017/prompts/00-maestro.md` §9. A correção desta rodada preserva o PC anterior e declara `supersedes`; seu anexo identifica a cadeia.

## Anexo de R-0017

| Decisão | Ato e âncora                                                                                                                                                                                                                                                                                                                                                           |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-1     | Owner autorizou em 2026-09-26 a ação 4 de C-0002 (`local-stack`) e `work/rounds/R-0017/prompts/00-maestro.md`; âncora `work/rounds/R-0017/AUTHORIZATION.md`. Integrações externas reais estão fora do escopo.                                                                                                                                                          |
| D-2     | Architect fechou após CTGs 0001/0002/0003 (PRs #133/#143/#144), revisão final PASS e cinco checks obrigatórios verdes. PC-0017 conserva quatro falhas históricas das adendas A4–A6. A correção append-only foi autorizada pelo Owner em `work/rounds/R-0017/SEAL-AUTHORIZATION.md`; o PC corretivo declara `supersedes: PC-0017` e não promove esses critérios a PASS. |
