# TASK-0038 — registro normalizado do preparo Clock/seed20

Este registro é posterior ao despacho direto autorizado pelo OWNER, não o
byte stream da mensagem original ao Engineer. Papel Engineer Art. 6,
Terra/High, uma worktree/escritor. Allowlist: novo
`backend/domains/inf/rait-case/src/handwritten/rait-operation-clock.ts` e
`backend/database/seed/20-fixtures-rait.sql`. Proibidos DDL, parâmetros,
testes, gerados, contratos, banco não dedicado, commit/push/merge. Preservar
histórico de 20 casos, sem inventar prova nem requalificar passado. Provar
Clock por typecheck/DI e seed fresh em banco descartável real; STOP se a
correção exigir outra fronteira.

Resultado histórico: Clock isolado criado, typecheck/DI PASS. A tentativa de
seed20 foi retirada depois de prova fresh: 19/20 protocolos antecedem a
vigência do parâmetro e DDL19 exige qualificação na mesma transação. Duas
interações do worker, teto 2/2, STOP; o sucessor autorizado TASK-0039/0040
separou perfis sem alterar seed20. O parecer independente do sucessor PASS
incluiu o mesmo hash Clock. TASK-0038 não é por si entrega C4-OD GREEN.
