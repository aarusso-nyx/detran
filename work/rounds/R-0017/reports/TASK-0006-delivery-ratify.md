Papel: Engineer  
PC: `PC-2640674bbd29832f` — SHA-256 `2640674bbd29832f7c34835cf2bcafca84dedf71975968457a7173ac002dac19`  
Tarefa: TASK-0006 iteracao corretiva  
Arquivos criados/alterados: nenhum  
Comandos e resultados: `pnpm format:check` — passou; apenas warnings de `NODE_AUTH_TOKEN` ausente no `.npmrc`.  
Ratificacao independente de `ON CONFLICT DO NOTHING`: sim. O gatilho rejeita `UPDATE` de `id`, `tenant_id`, `session_id`, `content`, `generated_at` ou `document_hash`, além de `DELETE` e `TRUNCATE`; `DO NOTHING` preserva a linha sem mascarar atualização.  
SHA-256 dos SQL ratificados: `c465743e86ccdd3eca39b15f4a1a370f66af557f82bde3bf2967fb7128e63f4f`, `e4aa2bc97a461eb5e0e5cb8c9bb3496f2d5afb48e454aa1126ab1e7db9507fe6`  
Estado C-02-01: provado por medicao identificada — adenda registrou 3/3, reaplicacao idempotente, zero FKs orfas e zero referencias legadas. Limitacao: o `host:port` do container nao foi independentemente verificavel.  
Perfil e idempotencia: ratificados. O perfil usa somente a base `fresh`, IDs locais determinísticos e referências a usuários fresh; não introduz história legada.  
Bloqueios: nenhum.