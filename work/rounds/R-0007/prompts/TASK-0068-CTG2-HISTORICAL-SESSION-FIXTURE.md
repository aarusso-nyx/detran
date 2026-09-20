# TASK-0068 — alinhar fixture histórico de sessão ao baseline CTG-0002

Papel Art. 6: Engineer tooling, Terra/high, uma tentativa. O runner provou que
o baseline misturava DDL36 atual (atas imutáveis) com o seed v1.1.0 (que ainda
atualiza `published_at`), impedindo a própria construção do estado histórico.

Congelar no fixture v1.1.0 os bytes exatos do DDL36 v1.1.0 ainda presentes no
HEAD/origin-main de entrada, registrar seu SHA-256 e fazer
`sourceForDdl('36-inf-rait-session.sql')` selecioná-lo. O upgrade subsequente
continua usando o DDL36 atual via `apply.sh`, portanto a imutabilidade final
permanece obrigatória. Não editar seed histórico, produto, blueprint, DDL atual
ou reduzir triggers.

Allowlist: fixture DDL36 novo, `SHA256SUMS`,
`prepare-rait-priority-v1-baseline.mjs`, o seed RAIT atual exclusivamente para
mover `published_at` do UPDATE pós-insert para o próprio INSERT, este prompt e
`tasks/TASK-0068.json`. Aceite: bytes do fixture têm hash
`cf012a4f87fd22d56415c90f34b593839c4291d5a2f8eb0960dd9aceabd567d5`;
inventário fechado passa; baseline prepara; upgrade atual instala
imutabilidade; restauração obrigatória permanece. A observação integral volta
ao Inspector em TASK-0069.
