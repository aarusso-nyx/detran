# Delivery review — CTG-0004a / ciclo 2 extraordinário

Papel: **Auditor/Reviewer**. Família excepcionalmente autorizada pelo Owner nesta sessão: CODEX.
Revisão somente leitura sobre o candidato exato
`a48868266854205e86a18fac0a052f4e4872c70a` (`tree c0b36c5a849bc38b39a29368a17d32e63241353a`).

## Veredito

**FAIL / escalated** — três achados `critical` e seis `high` impedem evidência, push e PR.

O Reviewer reproduziu 972/972 testes, além dos gates locais previamente verdes, mas confirmou que o
bootstrap/autenticação não tem caminho operacional, o contexto dos guardas congela o estado inicial,
o protocolo de sync diverge do OpenAPI e as integrações normativa/impressão omitem headers
obrigatórios. Páginas, ErrorBoundary/D-05/BOAT, readiness, bodycam/impressão e persistência ainda são
nominais ou não estão ligadas ao grafo de produção; os sensores permanecem insuficientes nesses
pontos.

As correções anteriores de headers no caller, lazy loading, remoção do adapter legado, re-hash
normativo após reinício, i18n por DI e retorno seguro de `ait-done` foram aceitas. O registro canônico
dos nove achados está no JSON homônimo.

TASK-0012 está em `3/3` e TASK-0013 em `2/2`. Conforme o plano vinculante, uma nova sequência
Architect → Inspector RED → Engineer GREEN → gates integrais → REVIEW requer reset extraordinário
explícito do Owner. Até essa autorização, o candidato fica preservado e bloqueado.
