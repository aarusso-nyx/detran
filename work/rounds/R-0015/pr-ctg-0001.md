## Papel (Constituição Art. 6)

Engineer, integrando entregas separadas de Architect, Inspector e Engineer do CTG-0001.

## Pacote de trabalho e fontes

R-0015 CTG-0001, WP-B4/WP-B5 de `boat-build-pack.md`. Fontes: JRN-BOAT-001…005,
UC-BOAT-001/003/012, RN-BOAT-001…004, RN-BOAT-101…132, `IU-BOAT-001`, matriz mobile TEAT,
`boat-frontends.md`, `boat-error-catalog.md` e H.42/OD-P46.

## O que muda

- adiciona 12 fichas mobile e 5 web BOAT, no mesmo commit que eleva o manifesto KB de 756 para
  773 artefatos;
- publica a semente i18n pt-BR com 114 chaves: 101 textos de fonte e 13 lacunas explícitas
  `source_pending:OD-R15-004`;
- permite os cinco namespaces `boat.*` apenas na allowlist i18n, mantendo parâmetros BOAT em
  `est.*`, com parser/verifier fail-closed e gerados regenerados;
- codifica as 149 transições canônicas de `sinistros` na ordem da matriz e mantém as 2 transições
  aditivas de S-12 em bloco separado;
- inclui os gates do Inspector no `pnpm check`: 7/7 transições/i18n e 8/8 cenários de allowlist.

## Verificação executada

- [x] `pnpm install --frozen-lockfile`
- [x] `pnpm check` no candidato pós-merge `fda0f653` — exit 0
- [x] `pnpm test:boat-transitions` — 7/7
- [x] `pnpm parameters:test` — 51/51
- [x] `pnpm verify:parameter-catalogue` — 90 entradas, 18 flags, 62 namespaces, 0 erros
- [x] KB — 773 artefatos, 446 tokens; publicação 201 arquivos
- [x] frontend existente: portal 1314, dashboard 2042, RAIT 4434 testes; builds verdes
- [x] `pnpm exec devai evidence record …` — R-0015 generic sequence 1; chain head
      `98a55808e1d5b4bb38d63466719d91022b8bb51919918d7dd70bb157b53eff72`
- [x] nenhum arquivo gerado editado à mão; os três gerados foram atualizados por
      `pnpm parameters:generate`
- [x] delivery-review Claude Opus: REVIEW → ciclo 2 restrito PASS, sem findings

## Questões abertas tocadas

- OD-R15-001 encerrada pela fonte canônica: W-01 = `crashes-list`.
- OD-R15-002: papéis de W-01 continuam proposta.
- OD-R15-003: `screenId` de W-05 continua proposta.
- OD-R15-004: 13 textos pt-BR ainda sem autoridade permanecem marcadores, não traduções.

## Fora do escopo / deixado explicitamente

CTG-0002 não foi iniciado: depende de R-0013 CTG-0004 em `main`. Nenhum arquivo de `apps/teat/*`,
nenhum sibling e nenhuma integração direta com SENATRAN foram alterados.

Session: Codex maestro R-0015
