# TASK-0005 retry 1 — complete Inspector sensors

Papel constitucional: **Inspector** (Art. 7). Declare `Papel: Inspector`.
Worktree `/Users/aarusso/.codex/worktrees/local-stack/detran`. Nao execute
`git`; nao altere producao, contrato, plan, fixtures ou package.json. Pode
tocar somente `tools/stack/*.test.mjs` e
`backend/domains/inf/rait-case/tests/integration/rait-seed-profiles.integration.spec.ts`.
O runner grava `reports/TASK-0005-retry-1.md`.

Leia o prompt aprovado `prompts/TASK-0005.md`, o contrato CTG-0002,
`reports/TASK-0005.md`, os tres testes que voce criou e
`packages/sefaz-adapter/src/{domain,http-adapter,errors}.ts`. O primeiro
relatorio marcou 40 testes verdes e seis vermelhos, mas os sensores novos
nao cobrem ainda todo C-02-02/05/06. Corrija os pontos abaixo sem enfraquecer
nenhum teste existente e mantenha o vermelho por producao ausente.

1. Em `contract.test.mjs`, nao fixe a porta 43199. Solicite porta 0 ao
   factory e use `http://localhost:<porta real>` e `/mock` no
   `SefazHttpAdapter` via `node --import tsx`. Confirme que
   `address().address` e `127.0.0.1` e a familia e IPv4. A CLI continua
   fixa em 3999 e o teste nao pode colidir com outra stack. Declare a
   interface esperada do
   factory, inclusive como obter address/close.
2. Valide os campos **obrigatorios** de cada um dos seis DTOs em
   `domain.ts`, seus tipos e dados determinísticos de teste. Prove
   `requestId` ecoado em POST com corpo e gerado em GET sem corpo e POST
   sem requestId. O gerado tem marcador `test-`, nao contem segredo e
   segue regra deterministica conferida em chamadas repetidas. O
   caminho de referencia desconhecida deve passar pelo adapter real e
   normalizar `SefazAdapterError`; corpo invalido e 405/Allow podem usar
   `fetch` direto. Fonte textual contendo nomes de rota nao substitui
   comportamento executado.
3. Defina na fixture de `runSmoke({ targets, fetchImpl })` alvos de root,
   proxy, healths e tres CH off. Teste sucesso com as quatro leituras de
   proxy, health backend/SENATRAN/SEFAZ e mensagens fixas dos adapters;
   prove falha em backend parado, HTML, JSON vazio, tenant errado, 401/403,
   proxy ignorado e 503 com mensagem de guard anterior. `fetchImpl` registra
   URL e headers: as quatro leituras `/v1` vao a porta de frontend com
   `Authorization: Bearer local`, nunca direto ao backend; confira tambem
   `/healthz`, `/readyz` e PEC 4204 ausente como `not_built_r0031`.
   Rode `runSmoke` em processo filho com `DETRAN_STACK_STATE_DIR` em
   diretorio temporario criado pelo teste; leia tabela e JSON la e rejeite
   token, `Bearer`, senha ou userinfo nos arquivos. Fixe sinal de falha:
   `report.complete === false` e linha especifica com resultado/motivo
   esperado; CH anterior ao adapter recebe `blocked_before_adapter`.
   Excecao de import/TypeError/harness nunca conta como negativa valida.
   O Engineer TASK-0007 implementa a interface
   de fixture que voce fixar; documente-a no relatorio. Nao simule um 503
   como prova de integracao live: aqui se testa que o smoke **rejeita**
   resposta errada.
4. No spec RAIT, `minutes_id` em `inf.rait_jeton_line` e anulavel. A
   consulta de orfaos so deve contar `minutes_id is not null` sem ata
   correspondente. Preserve as demais FKs e o snapshot de duas execucoes.
5. `pnpm test:stack`, `pnpm format:check` e `node --check` dos testes
   tocados devem executar. Resuma quais novos testes falham apenas por
   producao ausente e quais antigos seguem verdes. Nao marque a tarefa
   completa se qualquer teste falhar por bug de harness ou sintaxe.

Entrega: papel, arquivos, comandos e resultados, sensores antigos
preservados, sensores novos vermelhos, bloqueios reais.
