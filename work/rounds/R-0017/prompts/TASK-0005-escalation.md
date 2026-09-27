# TASK-0005 escalation — correct faulty Inspector assertions

Papel constitucional: **Inspector** (Art. 7). Declare `Papel: Inspector`.
Worktree `/Users/aarusso/.codex/worktrees/local-stack/detran`. Nao execute
`git` nem instale pacotes. Toque somente `tools/stack/contract.test.mjs`;
o runner grava `reports/TASK-0005-escalation.md`.

Leia o contrato `contracts/CTG-0002.md`, o prompt original TASK-0005, os
relatorios `TASK-0005.md` e `TASK-0005-retry-1.md`, e os adapters CH em
`backend/domains/ch/{clinical-reports,biometrics,clinical-network}/src/`.
Os testes novos ficam vermelhos por producao ausente, mas nao podem exigir
comportamento incorreto. Corrija somente:

1. `smokeFixture.ch[].message` usa textos inventados. Troque pelos tres
   literais do ramo **off/not-configured**: `Clinical PAdES signing service
is not configured; trust readiness is unavailable`, `Biometric
verification provider and processor contract are not configured` e
   `Professional council verification service is not configured` (espaco
   simples em qualquer quebra de linha acima). O HTTP real de Nest tem
   `{ statusCode: 503, message: '<literal>', error: 'Service Unavailable' }`;
   use essa forma no mock e compare `body.message` no smoke. O smoke so
   aceita status 503 com a mensagem do respectivo adapter; 503 com mensagem de guard
   diferente recebe `blocked_before_adapter` e `complete:false`.
2. O teste de requestId gerado compara POST sem ID com `refund` que recebeu
   ID explicito. Isso nao e regra do contrato. Compare duas chamadas
   identicas sem requestId entre si e preserve separadamente o eco do ID
   explicito. Mantenha marcador de teste, DTOs e `localhost`→IPv4.
3. A suite smoke possui dois happy paths com formatos incompatíveis de
   `targets` (array antigo e objeto novo). Preserve toda verificacao que
   importa no teste completo, inclusive um GET a cada
   `frontends[].rootUrl + '/'` em 4200–4203, nenhuma chamada a PEC 4204
   enquanto `not_built_r0031`, e bearer local nas quatro leituras proxy.
   Remova a duplicacao, de modo que o Engineer
   implemente **uma** interface `runSmoke({ targets, fetchImpl })`.
4. Cada cenario negativo deve injetar o erro no endpoint correto e exigir
   no `report` `complete:false` mais a linha/alvo e motivo especificos,
   nao apenas procurar uma palavra em `JSON.stringify(report)`. Backend
   parado falha em `/healthz` ou `/readyz`; HTML, vazio, tenant errado e
   401/403 falham numa leitura `/v1` de frontend. O teste de sucesso
   registra URLs e prova que nenhuma leitura `/v1` usa porta backend
   direta, cobrindo proxy sem um cenario indistinguivel do sucesso.
   Para CH, cubra 403 e 503 com mensagem errada na mesma forma top-level
   como `blocked_before_adapter`. Em backend parado, `fetchImpl` rejeita
   em `/healthz` ou `/readyz` com `TypeError('fetch failed')`; o smoke
   converte isso em linha `backend_unreachable`. TypeError de import ou
   defeito do harness filho nao conta como negativa.
5. Mantenha porta efemera do mock, state dir temporario, nenhum segredo,
   CH health/proxy/PEC e demais sensores. `pnpm test:stack` deve mostrar
   verdes os sensores independentes de producao nova; vermelhos apenas os
   que aguardam mock SEFAZ, `smoke.mjs`, perfil `fresh-local-stack` ou
   health SEFAZ de TASK-0006/0007, listados nominalmente. Rode
   `node --check` e `pnpm format:check`.

Reporte cada comando, testes verdes/vermelhos e o formato de `targets` e
`report.rows` escolhido para TASK-0007. Nao edite producao para passar.
