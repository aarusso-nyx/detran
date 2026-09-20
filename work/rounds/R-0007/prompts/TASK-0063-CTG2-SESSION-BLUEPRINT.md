# TASK-0063 — blueprint session para fechamento CTG-0002

Papel Art. 6: Architect, Sol/medium, uma tentativa. Leia AGENTS, CODESTYLE,
manual Architect, CTG-0002 §§5/8/10, contrato técnico §§3–9, ADR-0027,
TASK-0047/0049, blueprints worklist 1.3 e session 1.1, DDL35/36 e gerador.

Modele aditivamente, sem runtime/hook:

- identidade institucional CETRAN verificável no membro worklist e snapshot de
  bloco/titularidade/mandato/ato/vigência na composição/attendance session;
- versão otimista dos agregados session, agenda item e minutes necessária aos
  comandos;
- `rait_session_minutes_snapshot`, `rait_session_minutes_manifest`,
  `rait_minutes_required_signer`, `rait_minutes_signature_receipt` tenant-first,
  constraints/hashes/FKs/índices e imutabilidade UPDATE/DELETE/TRUNCATE;
- voto append-only/imutável; ata original imutável após manifestação/assinatura;
- dependências explícitas em case, worklist e deadlines;
- operations explícitas: apenas list/get para session/agenda/attendance/votes/
  minutes; `[]` para oral-arguments e quatro entidades internas. Nenhum CRUD de
  escrita; nenhuma rota interna;
- legado single-signature permanece legível e não é promovido a trust.

Incremente versões necessárias e regenere oficialmente. Não ligue
controllers/providers manuscritos ainda; TASK-0008 fará hooks após Engineers.

Allowlist: blueprints worklist/session; gerador somente para propriedades
declarativas contratadas; saídas oficiais worklist/session, DDL35/36, dois
OpenAPIs, generated-files; importers desses dois pacotes no lockfile somente se
dependências mudarem; `tasks/TASK-0063.json`. Proibido testes, handwritten,
outros blueprints/DDL, banco/seed, record ou irmãos. Não editar gerados à mão.

Gates: duas gerações idênticas, checks blueprint/contract/RLS, typechecks dos
dois pacotes, hashes TASK-0047/0049 intactos. Aplicar DDL35 e DDL36 em ordem,
duas vezes e transacionalmente, no DB dedicado sem `--full`; preservar 20
casos; executar sensores SQL session das duas tarefas. Stop em diff fora da
allowlist, migração destrutiva ou schema incapaz de satisfazer o contrato.
