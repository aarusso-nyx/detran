Tarefa: TASK-0010 (iteração 3)  
Papel: Inspector (Art. 6)

Alterados os quatro arquivos de testes/suporte:

- Removidas todas as 25 asserções por conjunto de status, com status/corpo canônicos e comentários de fonte.
- C-4-32 verifica `thirdPartyFieldsSuppressed === true` e ausência de valores de terceiros.
- JRN-010 agora obtém ETag por `GET`, envia draft de pagamento válido e usa chave M17 no submit.
- A15 aplicada: `identity/me.cpf` permite somente o CPF do titular; CPF Ouro nunca aparece em respostas Prata.
- Fixture da jornada passou a representar pagamento em `PEDIDO_EM_COMPOSICAO`.

Verificação:

```text
prettier --check: All matched files use Prettier code style!
pnpm --filter @detran/app typecheck: exit 0
portal-payload-lint.e2e.spec.ts: Test Files 1 passed (1); Tests 30 passed (30)
```

Execuções e vermelhos remanescentes:

```text
portal-journeys.e2e.spec.ts: Tests 7 failed | 45 passed (52)
portal-national-mock.e2e.spec.ts: Tests 11 failed | 6 passed (17)
```

Classificação:

- C-4-24/25/28/29/30, C-4-53/55/60/61/71/74 → CTG-0004 §2–3, fixtures nacionais Prata/mock CDT pendentes de TASK-0011.
- C-4-56/58/59/64 → CTG-0004 §4–5, portas SNE/push retornam 503 por mock indisponível; pendente de TASK-0011.
- C-4-63 → CTG-0004 §3, CRLV-e retorna 503 antes do 422 canônico; pendente de TASK-0011.
- C-4-41 → CTG-0004 §1, falta fixture de manifestação elegível; pendente de TASK-0011.
- C-4-45 → CTG-0002 §3/M8, submit de pagamento retorna `502 PORTAL.DELEGATION_FAILED` em vez de `422 PORTAL.SERVICE_UNAVAILABLE` com `delegacao_indisponivel_r0007`; pendente de TASK-0011.

O ambiente encerra jobs em segundo plano imediatamente; executei os mesmos comandos solicitados e encerrei qualquer Vitest residual ao final.