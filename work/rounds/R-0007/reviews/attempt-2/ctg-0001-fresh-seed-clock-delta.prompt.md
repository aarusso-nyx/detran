# CTG-0001 — revisão independente do delta preparatório fresh-seed/Clock

Papel: Auditor independente Fable 5, somente leitura. Candidato fechado no
worktree `/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`. Não execute
comandos, não modifique arquivos ou banco. Revise apenas estes cinco arquivos,
confirmando seus SHA-256 antes de julgar:

| Arquivo | SHA-256 |
|---|---|
| `backend/database/seed.sh` | `74eefecdbdadb11004a30300b210e27926637222569d7ce27cccad01077e245e` |
| `backend/database/seed/21-fixtures-rait-fresh.sql` | `0d8cf18b210d9d05ebfeb3e0504b3fb513845f17a480e46720acc91cf79e94e2` |
| `backend/domains/inf/rait-case/tests/integration/rait-case-runtime.integration.spec.ts` | `d0cc0a3bf20f99558dd0fe3664e283f9d46aa7742e6f32bda3c1c2c448485a28` |
| `backend/domains/inf/rait-case/tests/integration/rait-seed-profiles.integration.spec.ts` | `8c6b746b0075ac101dbcf9fc6c53d35f90b45265a0d6d0063257725c6b05c8a3` |
| `backend/domains/inf/rait-case/src/handwritten/rait-operation-clock.ts` | `054eee003655a8ac809c483b4d59bf750418f05dbe97b044d78902e2e840ec21` |

Leia somente os trechos necessários de `backend/database/seed/20-fixtures-rait.sql`,
`backend/database/seed/05-parameters.sql`,
`backend/database/ddl/19-rait-priority-enforce.sql`,
`docs/meta/adr/ADR-0024-rait-legal-priority-owner-policy.md` e
`docs/meta/adr/ADR-0025-rait-operation-clock-composition.md` para verificar as
invariantes. Não abra outros relatórios ou a campanha inteira.

Perguntas de julgamento:

1. A separação fresh/default versus legacy-upgrade preserva os 20 casos
   históricos sem reapurar `null`, inventar provas ou alterar datas/IDs, e o
   gate legado falha antes de escrever quando falta baseline?
2. O perfil fresh executa em uma conexão/transação, com ordem de dependências
   correta, DDL19 ativo e qualificação `none` pelo secretário exatamente no
   protocolo; reaplicação não requalifica nem duplica? Há risco de commit
   parcial, perfil implícito indevido ou overwrite silencioso de configuração?
3. O sensor novo exerce o runner integral em banco scratch dedicado, confere
   cardinalidade/idempotência/recusa sem falso PASS, não destrói banco alheio e
   não mascara falha de ambiente? O antigo sensor de primeiro INSERT foi
   efetivamente removido sem perder os dois casos runtime?
4. O Clock isolado é coerente com a porta oficial, falha sem instante/fuso
   válido e mantém um snapshot por operação? Não confunda typecheck/DI com
   wiring completo: `RaitDeadlineEngineFactory` ainda é tarefa posterior.

Fatos de execução declarados para cotejo, não para assumir como prova sua:
Engineer e Inspector obtiveram fresh 2x em banco scratch: 1 case, 1 assessment
revision=1/outcome=none, 0 bases, `assessed_at=protocolled_at`, 20 legados
ausentes; `legacy-upgrade` recusou 0/20 antes de escrita. Sensor filtrado 1/1
PASS, typecheck/Prettier PASS; scratch removido. Nenhum resultado de
TASK-0020 6/6 ou TASK-0021 é alegado.

Retorne APENAS objeto estruturado pelo JSON Schema fornecido, com cinco chaves
`mode`, `round`, `verdict`, `findings`, `notes`; `mode="prompt-review"`,
`round="R-0007"`. Cada finding deve trazer severidade high/low, item 1–13,
arquivo existente, linha one-based, claim concreto e fix viável. PASS não pode
conter high. Hash divergente, referência inexistente ou saída fora do schema
invalidam a revisão. Distinga low não estrutural de impedimento de despacho;
não declare CTG concluído, SQL aplicado em produção ou autorização de merge.
