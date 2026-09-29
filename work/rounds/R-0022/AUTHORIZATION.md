# R-0022 — autorização do Owner

status: active

GRANTED — representação para o runtime DEVAI 1.5.6 da autorização expressa do Owner registrada
abaixo. Estes marcadores não ampliam o escopo do `plan.md` nem alteram as adendas A1, A-C2-11,
A-C2-12 e A-C2-13.

Papel: Architect (registro no bootstrap pelo maestro). Fonte: prompt de abertura do Owner,
colado na sessão do maestro Opus 5.5 (Claude Code) em **2026-09-29** (America/Sao_Paulo):
"O Owner autoriza a abertura desta rodada com este prompt em 2026-09-29. Registre essa autorização
em `work/rounds/R-0022/AUTHORIZATION.md` no bootstrap."

## Escopo autorizado

- Abrir e executar R-0022 `stynx-sse-tenancy` inteira, conforme `work/rounds/R-0022/plan.md` e
  `work/rounds/R-0022/prompts/00-maestro.md` de `origin/main`, com §Execução OD-C2-005 (branch
  única `orchestra/stynx-sse-tenancy`, ondas paralelas, um PR no fim) e §Adendas A1 (migrações
  integrais de assinatura, outbox e offline-sync recebidas de R-0021) e A-C2-11.
- **Adenda A-C2-13 (Owner, 2026-09-29), que prevalece:** STYNX 1.5.0 final publicado (S-1.5
  encerrada, STYNX #308/#309); R-0021 fechada (PC-0019); pin = maior 1.5.x final publicada no
  bootstrap, exata, pela fonte única `tools/stynx-version.json` (1.5.2 adotada se sair antes da
  onda do pin); conformidade §7 da especificação conferida contra a versão fixada, MUST ausente →
  checkpoint do CTG consumidor (OD-R22-02); R-0020 parada não bloqueia esta rodada; CI,
  `.devai/config` e `record/` são locks partilhados por merge; nunca editar arquivos de PR aberto
  da R-0020; publicar cedo, sem PR (`git push`), a onda do pin e a do SSE Angular.
- Fim da rodada (C-0002 §12): CI local completo; uma delivery-review do diff inteiro; um PR, com
  merge só com CI verde, PASS do reviewer e pin 1.5.x final; publicação (evidência,
  `audit observe`, `round close`, `round seal`) pelo PR de publicação da A-C2-12.

## Limites que permanecem

- Nenhuma escrita, release ou execução no repositório STYNX; nenhuma integração externa real.
- Critérios de aceitação imutáveis; nenhuma dispensa em tenancy/RLS/SSE; nenhum `--force`;
  nenhuma edição de arquivo gerado.
- Reviewer da outra família (`codex`, Sol 6 = `gpt-6-sol`), nível grande, pela ponte
  `tools/orchestra/bridge.sh`; workers da família do maestro (`claude-opus-5-5`,
  `claude-sonnet-5`).
- Bancos descartáveis exclusivos desta rodada; nunca bancos de outra frente.

## Adenda B1 — prompt-review ciclo 1 FAIL tratado como corrigível (Owner, 2026-09-29)

Pergunta do maestro, depois de `reviews/prompt-review-1.json` (Sol 6, FAIL, 17 achados `high`):
tratar o FAIL como corrigível, aplicar as 17 correções e submeter o ciclo 2 restrito a elas, com no
máximo 2 ciclos. Resposta literal do Owner: **"Sim, aplique as 17 correções e submeto o ciclo 2,
restrito a elas, com no máximo 2 ciclos?"** — lida como autorização. Não dispensa PASS: workers só
com PASS; FAIL ou REVIEW no último ciclo → parada e novo relato ao Owner.

## Adenda B2/B3 — hotfix e decisões de ODs (Owner, 2026-09-29)

- **B2:** "Corrija em PR próprio contra main." → PR #159 (hotfix fora da rodada).
- **B3, respostas literais do Owner:** "Item 2. SSE - Aprovo as duas recomendações para OD-R22-04 3
  OD-R22-05." · "15. Ok" · "16. autorizo uma transferência DETRAN idempotente como exceção explícita
  à A1." · "outras: adote as recomendações." A leitura do maestro: "outras" abrange todas as ODs
  OD-R22-01…36 com recomendação apresentada (incluindo OD-R22-02 (a) e OD-R22-13 (a), divergente do
  contrato); ODs sem recomendação continuam pendentes. Transcrição em
  `docs/meta/knowledge-base/open-decisions-rait.md` §C-0002 "R-0022 — decisões do Owner".
- A exceção de OD-R22-16 é única e nominal: não autoriza outro contorno local nem muda a regra de
  consumo de OD-R22-02 para os demais itens.
