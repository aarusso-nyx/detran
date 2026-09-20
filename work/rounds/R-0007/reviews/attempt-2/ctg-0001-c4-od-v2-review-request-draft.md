# Prompt-review independente autorizado — C4-OD V2, ciclo 1

**AUTORIZADA, AINDA NÃO ENVIADA NESTE REGISTRO.** O Owner autorizou exatamente
uma revisão independente C4-OD-V2-1 com Fable 5 e reserva estimada
45.000/6.000, registrada no budget antes da chamada. Esta autorização não
cria veredito nem bridge record. Verifique os hashes antes de invocar a ponte;
não reutilize o retry técnico de delta-review já esgotado.

Você é Fable 5, reviewer independente da família oposta à do maestro, papel Auditor,
somente leitura, na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`.
Responda somente JSON válido no esquema do
`docs/meta/agents/orchestra/reviewer-prompt.template.md`, com `mode` =
`prompt-review`, `round` = `R-0007`, `attempt` = `2` e ciclo distinto
`CTG-0001-C4-OD-V2-1`. Nenhum worker pode ser despachado por esta minuta.

Leia `AGENTS.md`, `CODESTYLE.md`, a rubrica 1–13 do template, as decisões
ADR-0024/0025 e OD-016, e as entradas congeladas abaixo. C4-OD V2 é proposta
de revisão, não implementação. C4-1/C4-2/C4-3 e os dois outputs inválidos de
delta-review são história; C4-3 PASS não cobre V2. TASK-0023 1/1 não é
renomeada nem reiniciada.

Avalie exaustivamente, com arquivo/linha e achado `high` quando aplicável:

1. aderência às decisões do Owner: PCD = 80+, idade no ato de qualificação,
   PCD com anexo validado, `none` no protocolo, `null` legado inelegível,
   proibição atual de requalificar com capacidade futura auditável;
2. POST existente convertido de `create` gerado a `protocol` sem segunda rota,
   sem caso novo persistido sem qualificação, sem novo grant e sem bypass por
   CRUD/repository/SQL; compatibilidade e sensores do intake;
3. modelo de bases/provas e parâmetro tipado, sem exigir upload etário novo,
   sem transformar placeholder ou dados legados em prova, com versões estáveis;
4. função SQL/role writer, RLS/FORCE, grants após DDL20, triggers e testes
   negativos; distinguir autenticação de ator na aplicação da verificação de
   membership no SQL, sem alegar que o banco autentica o usuário;
5. upgrade idempotente pre-DDL/pós-grants/verify, schema fresco versus upgrade,
   preservação de dados, backup/restore, falha fechada e ausência de `--full`
   como prova de migração;
6. seis providers de Clock, snapshot único e fuso tenant; inventário RLS 90/17,
   gerados 85 caminhos nominais, separação Architect–Inspector–Engineer,
   sensores antes do GREEN, limites/budget e gates integrais;
7. drift declarado entre catálogo de parâmetros transcrito e saídas ainda não
   regeneradas: verificar se geração/parser/testes estão corretamente alocados,
   sem tratar o drift atual como entrega executável.

Um `PASS` julga somente prontidão da decomposição para solicitar autorização e
executar a etapa seguinte. Não autoriza SQL, banco, TASK-0023 iteração 2,
Inspector/Engineer, commit, PR ou merge. `REVIEW`/`FAIL` mantém bloqueio. JSON
inválido não é veredito e exige nova decisão de limite conforme governança.

## Entradas e SHA-256 congelados em 2026-09-16

| Arquivo                                                        | SHA-256                                                            |
| -------------------------------------------------------------- | ------------------------------------------------------------------ |
| `work/rounds/R-0007/plan.md`                                   | `c9377f55b1526ce00ba9366a3dcd7a7e4d656cedcb67717813da0ff2946ed49e` |
| `work/rounds/R-0007/budget.json`                               | `823fc21abe230a0784d5de9c36865534a8f455ce261e5f9190a9bc348bcad780` |
| `work/rounds/R-0007/contracts/CTG-0001-C4-OD.md`               | `9a15af99818f3ed67cc1000b91fc24fefdd9c790b6dfc8eb30faec2ff3e5768a` |
| `work/rounds/R-0007/contracts/CTG-0001-C4.md`                  | `04d0b5f7a61c882a5595043216876a5cb387d72a4dd2a30f7d830b306b5d589a` |
| `work/rounds/R-0007/reports/CTG-0001-C4-OD-PLAN.md`            | `93ca5d9dfe029f6f6d967a8258cdd8c2cd526a77e2f6bd29b1e699984143a05b` |
| `work/rounds/R-0007/reports/CTG-0001-C4-BINDINGS.md`           | `42494d0ddba6c9ce9e4b38e9a29bbfa3388c1b15fc8939295cbc2065c6c68fa7` |
| `work/rounds/R-0007/prompts/C4-OD-V2-PROPOSED.md`              | `3d45c3cdb58c4734dab6b2bd469999cec0ec3243c9d8335ea2a90c9ce1672421` |
| `docs/framework/product/domains/inf/rait/rules/RN-RAIT-141.md` | `dcc911d70141fbab38e8d3178727542fa616c3d15d4b1cedfbad2b0e1e285194` |
| `docs/framework/arch/parameter-catalogue.md`                   | `744b46722d02f6d958c18864e1411f0dbf0e7cb544876354c0d5bada2e79690b` |
| `docs/meta/adr/ADR-0024-rait-legal-priority-owner-policy.md`   | `718128591c5ff7448e3e2a8a6d77cde3d010577cf9a8f63dc7d2f8f2e0ffd81c` |
| `docs/meta/adr/ADR-0025-rait-operation-clock-composition.md`   | `136f7fc6cc4536bdb3924befdded423f192d3ef8c2631bc4f805a408c5538e1e` |
| `docs/meta/knowledge-base/open-decisions-rait.md`              | `9112066a9104dfb1c19f251860c5d23ec60829a3773c3d68f5d6fcdb02841cdb` |

Se uma entrada mudar, esta minuta e seus hashes deixam de representar o mesmo
candidato. Não se atribui hash a paths gerados futuros ainda inexistentes; seu
inventário determinístico deve ser expandido/congelado antes do respectivo
dispatch, não falsificado nesta revisão documental.
