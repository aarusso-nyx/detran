# TASK-0061 — blueprint worklist para fechamento CTG-0002

Papel Art. 6: Architect, Sol/medium, uma tentativa. Leia AGENTS, CODESTYLE,
manual Architect, CTG-0002 §§4/8/9/10, plano V2, contrato técnico final,
relatório de ownership, TASK-0060 e blueprint/gerador atuais.

Objetivo: versão aditiva do blueprint worklist que forneça o schema e a
fronteira de geração necessários aos seis comandos, sem implementar runtime.

- adicionar versão otimista real a `rait_schedule` e preservar `rait_batch.version`;
- declarar dependência explícita em `@detran/inf-deadlines` se requerida pelo
  contrato técnico, sem inventar fallback temporal;
- declarar `api.resources[].operations` para TODAS as entidades: apenas
  `list/get` para recursos governados autorizados; `[]` para snapshot e
  manifesto; nenhuma escrita CRUD de escala/lote/filhos/institucional/clock;
- assegurar constraints/índices/imutabilidade/RLS aditivos e idempotentes;
- não ligar hooks de símbolos ainda inexistentes: TASK-0008 fará o wiring após
  Engineer GREEN;
- incrementar versão e regenerar oficialmente DDL, package, módulo, index,
  controllers, OpenAPI e manifesto de gerados. Nunca editar derivado à mão.

Allowlist: blueprint worklist; `tools/blueprints/generate.mjs` apenas se uma
propriedade declarativa já contratada não puder ser gerada; saídas oficiais do
worklist/DDL35/OpenAPI/generated-files; importer worklist em `pnpm-lock.yaml`
somente se dependência mudar; `tasks/TASK-0061.json`. Não toque testes,
handwritten, session/case blueprint, outro DDL, banco/seed, record ou irmãos.

Gates: duas gerações idênticas, blueprints/contracts checks, RLS checker,
typecheck worklist, diff-check e hashes TASK-0060 intactos. Aplique DDL35 duas
vezes em transação no DB dedicado sem `--full`, preserve 20 casos e rode o
sensor SQL TASK-0060. Reporte arquivos fora da allowlist como BLOCKED.
