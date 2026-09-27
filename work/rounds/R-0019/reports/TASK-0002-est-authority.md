# TASK-0002 — correção de fonte EST

**Papel:** Architect (transcriber-docs). A revisão de entrega observou que
o cabeçalho de ciclo de vida do APP-BOAT não fundamentava sozinho o contrato
persistente e a transação tenant de INV-EST-001. O contrato Architect passou
a citar APP-BOAT §Modelo de dados e ADR-0002 §Decision. A transcrição
restrita atualizou somente `law/invariants/INV-EST-001.json` e a entrada
correspondente em `law/trace.json`, preservando o statement.

Prettier write/check **PASS**; `devai check --only invariants` **PASS** (9
arquivos) e `devai check --only trace` **PASS** (9 invariantes). Nenhum comando
Git foi executado.
