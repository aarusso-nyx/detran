# Autorização A3.1 do Owner — isolamento prospectivo das TASKs legadas

**Data:** 2026-09-28. **Papel decisor:** Owner. **Rodada:** R-0020.

Após receber a proposta `contracts/CTG-0003-A3.1-none-proposal.md`, SHA-256 `7bde51521e01a6654dbf0da6e67083a802f735313351f268a720050f29c80db5`, o Owner declarou literalmente nesta sessão:

> proposta A3.1 aceita. registre, ajuste os planos e de prossegimento ao trabalho

A aprovação escolhe a alternativa prospectiva da proposta para o conjunto fechado de 54 TASKs históricas com `db_isolation: none`. Na TASK canônica, `database` passa a significar o limite mínimo **se houver futura aquisição de recurso de banco sob a governança atual**; não é atestação de que a execução histórica usou banco dedicado. Os bytes originais, o valor `none`, o caminho e o SHA-256 são preservados conforme A3, com as tags `legacy-db-isolation:none` e `legacy-db-policy:prospective-database` e um relatório antes/depois que separa decisão atual de fato histórico.

O normalizador só pode aplicar a regra à allowlist determinística dos 54 caminhos e hashes originais extraídos do mapa A3, após testes Inspector positivos, negativos e de corrupção do sidecar. Nenhuma outra TASK recebe essa regra por similaridade. `law/schemas/task.schema.json` e `verify:round-tasks` continuam estritos. O resultado não é contado como PASS retroativo de isolamento histórico.

Esta aprovação não resolve os outros campos `source_pending` do mapa A3, não autoriza um novo ID de composição ou executor inventado e não libera `round seal` antes do gate de zero TASK inválida.
