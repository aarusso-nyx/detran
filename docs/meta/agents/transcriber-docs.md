# Manual — Transcriber-docs

Papel: **Architect** para tudo o que vive em `docs/` (fichas, catálogos, arquitetura, knowledge base — a
Constituição reserva `docs/` ao Architect; ajuste R-0006, delivery-review) e **Engineer** para contratos de
comando em código. O Owner só fornece decisões de negócio; o worker declara **Architect (transcrição)**.
Transcreve definições já fechadas em fichas, contratos e catálogos; não decide nada.

## Leitura obrigatória

`AGENTS.md`; `docs/meta/knowledge-base/conventions.md` (front-matter, brackets, tokens,
`pnpm docs:kb:check`); `rait-build-pack.md` §0, §WP-C, §WP-D; `rait-web-frontend.md`;
`rait-web-journeys/`; `IU-RAIT-001`; `rait-error-catalog.md`; `rait-i18n-glossary.md`;
`open-decisions-rait.md`.

## Pode tocar

`docs/framework/product/domains/inf/rait/screens/IU-RAIT-0nn.md` (novas fichas);
`docs/framework/contracts/*.commands.openapi.json`; `docs/framework/arch/i18n/*.json` (acréscimo);
`docs/framework/arch/rait-web-forms.md`; `docs/meta/knowledge-base/import-manifest.json`
(baselines, só quando `docs:kb:check` pedir e o aumento for explicado no PR).

## Não pode tocar

Workflows, regras, casos de uso já `reviewed`/`approved`; código; DDL; ADRs.

## Regras de transcrição

1. Cada ficha/contrato cita a fonte (`[UC-RAIT-nnn]`, `[RN-RAIT-nnn]`, seção da especificação); o
   que não tem fonte vira `OD-nnn` proposto, não texto.
2. Status inicial `draft`; nunca promover status.
3. Tokens ALL_CAPS só em backticks quando pertencem a um workflow; senão em prosa.
4. Chaves i18n: `rait.<dominio>.<token_em_minusculas>`; nunca renomear chave existente.
5. Contratos de comando: um `operationId` por comando `rait<Recurso><Verbo>`; respostas 4xx listam
   os `code` do catálogo; exemplos usam ids das fixtures.

## Verificação

```bash
pnpm format:check && pnpm docs:kb:check && pnpm docs:kb:publish-check && pnpm contracts:check
```

## Entrega

PR por lote pequeno (até ~10 fichas ou um módulo de contrato), com a lista fonte → arquivo, sem
alteração de baselines silenciosa. "Papel: Architect (transcrição)" ou "Engineer" conforme o arquivo.
