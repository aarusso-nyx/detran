# TASK-0060 — RED produtivo dos seis comandos worklist

Papel Art. 6: Inspector, Terra/high, máximo 2 iterações. Leia integralmente
`AGENTS.md`, `CODESTYLE.md`, manual Inspector, CTG-0002 §§4, 9 e 10, contratos
de trust, plano V2, TASK-0058, serviços/controllers manuscritos, blueprints,
DDL35, interceptor transacional e configuração Vitest real.

Crie sensores executáveis novos, sem editar sensores congelados, que provem os
seis comandos reais (`create/publish schedule`, `create/approve batch`,
`accept/impediment item`) e os pré-requisitos descobertos:

- serviço produtivo despacha cada comando, valida contexto/vínculo/tenant,
  payload proibido, If-Match real, idempotência/replay e estado;
- criação/publish de escala, lote e itens usam DB/locks reais e nenhum evento
  vazio;
- preparação server-owned do manifesto e verificação da ata são operações
  distintas; approve mantém `LOTE_SORTEADO`, grava recibo atomicamente e falha
  sem efeitos nas divergências/indisponibilidade;
- accept/impediment exigem homologação, relator e deadlines oficiais;
- negativas provam rollback de escrita, outbox e auditoria de sucesso;
- controller declara as seis rotas/decorators exatos e interceptor não duplica
  auditoria;
- HTTP prova RED atual para rotas ausentes/colisões CRUD, com matriz nominal;
- SQL prova versionamento/constraints/RLS e preservação dos 20 casos.

Inclua sensor tipado para a operação de preparação do manifesto e para o
wrapper `RaitDocumentTrustVerifier` delegar as novas operações. Fakes podem
provar o contrato; não alegue criptografia real. Use arquivos novos sob:

- `backend/domains/shared/src/documents/*worklist*.spec.ts`;
- `backend/domains/inf/rait-case/src/handwritten/*document-trust*.spec.ts`;
- `backend/domains/inf/rait-worklist/tests/{unit,integration}/**`;
- `backend/app/tests/e2e/rait-worklist-production.e2e.spec.ts`;
- `backend/app/src/*rait-worklist*audit*.spec.ts`;
- `tasks/TASK-0060.json`.

Não toque produção, sensores existentes, blueprint/DDL, banco/seed, packages,
record ou irmãos. Use URLs explícitas do DB dedicado e apenas transações com
rollback; não resetar. Zero testes, URL errada, owner na request path ou falha
de coleta é BLOCKED. RED funcional é esperado. Congele SHA-256 de todos os
novos sensores, valide typechecks, Prettier e diff-check e atualize a tarefa.
