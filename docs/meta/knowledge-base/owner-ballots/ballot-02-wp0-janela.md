# Cédula 02 — Janela e responsável do WP-0 (OD-020)

Bloqueia: todo código de `apps/*/web` e `@detran/ui`. Decisão de adoção já tomada (G.34, ADR-0013).

Pergunta: quando e quem executa `docs/framework/arch/wp0-stynx-1-3-1-migration.md`?

| Opção           | Consequência                                                                                                                                   |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| A (recomendada) | Engineer executa na próxima semana útil, PR único, antes de qualquer tela; inclui `@stynx-nyx/feature-flags` (ADR-0019) e `engines.node >= 22` |
| B               | adiar até o PR de base do TEAT (E2–E8) — atrasa todos os frontends                                                                             |

Fatos novos (pesquisa 2026-09-13, registrados em §7 do roteiro): Angular 22 muda o padrão de
detecção para `OnPush`, o router passa a herdar parâmetros (`always`), exige TypeScript 6 e
Node 22, remove `ComponentFactoryResolver`.

Premissa atual: A. Custo tardio: só doc (mas bloqueia tudo).

Resposta: **[x] A** — já, PR único; responsável: Engineer. Data: 2026-09-13. Owner (H.41)
