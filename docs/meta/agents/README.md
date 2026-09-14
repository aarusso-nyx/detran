# Manuais operacionais dos agentes (RAIT e ciclo da infração)

Um manual por perfil de agente da orquestra descrita em
`docs/framework/arch/rait-build-pack.md`. Cada manual diz **o que ler antes**, **o que pode e não
pode tocar**, **como verificar** e **como entregar**. Os manuais não criam governança nova: aplicam
`AGENTS.md` (Constituição DEVAI, Art. 6 papéis) ao trabalho do RAIT. As definições curtas em
`.claude/agents/*.md` apenas apontam para cá e fixam o modelo sugerido.

| Perfil              | Papel Art. 6            | Modelo sugerido | Pacotes de trabalho             | Manual                                             |
| ------------------- | ----------------------- | --------------- | ------------------------------- | -------------------------------------------------- |
| Architect-blueprint | Architect               | Opus / Terra    | WP-A, revisão de guardas WP-B   | [architect-blueprint.md](./architect-blueprint.md) |
| Engineer-backend    | Engineer                | Opus            | WP-B, WP-0 (parte backend)      | [engineer-backend.md](./engineer-backend.md)       |
| Engineer-frontend   | Engineer                | Opus / Sonnet   | WP-F, WP-E (schemas), WP-0 (UI) | [engineer-frontend.md](./engineer-frontend.md)     |
| Inspector-tests     | Inspector               | Sonnet / Opus   | testes de todos os WPs          | [inspector-tests.md](./inspector-tests.md)         |
| Transcriber-docs    | Owner (delegado) / Eng. | Sonnet          | WP-C, WP-D, i18n, fichas        | [transcriber-docs.md](./transcriber-docs.md)       |

## Orquestras de execução

A execução do backlog por orquestras dedicadas (maestro grande, reviewer da outra família,
workers da mesma família), com ondas, rodadas DEVAI e templates de prompt, está em
[orchestra/README.md](./orchestra/README.md) (ADR-0022).

## Regras comuns a todos os perfis

1. **Declare o papel** na primeira linha da sua resposta ou do PR ("Papel: Engineer").
2. **Leia nesta ordem** antes de tocar em qualquer arquivo: `AGENTS.md`, `CODESTYLE.md`, o manual
   do seu perfil, o pacote de trabalho no build pack, e só então os artefatos citados pelo pacote.
3. **Nunca invente valor**: prazo, papel, estado, código de erro, rótulo ou parâmetro que não esteja
   em um documento canônico é uma pergunta em `docs/meta/knowledge-base/open-decisions-rait.md`,
   não uma constante no código. Use "pendente de fonte".
4. **Uma mudança, um PR**, com `pnpm check` verde, testes do tier exigido, `pnpm exec devai
evidence record`, sem tokens, com a mensagem de commit no formato de `CODESTYLE.md`.
5. **Código gerado não se edita** (ADR-0007). Comportamento vai em `src/handwritten/`.
6. **Fronteira nacional**: nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
7. **Vocabulário**: tokens de estado, timer, papel e erro vêm dos catálogos; a UI só traduz rótulo
   (`docs/framework/arch/rait-i18n-glossary.md`).
8. **Dados de teste**: use as fixtures canônicas (`backend/database/seed/`,
   `docs/framework/arch/rait-fixtures.md`); não crie personas nem tenants próprios.
9. **Quando travar**: pare, escreva a pergunta com o ID `OD-nnn` (ou proponha um novo) e entregue
   tudo o que não depende dela.
10. **Relatório final** do agente: o que mudou (arquivos), o que foi verificado (comandos e saída),
    o que ficou fora e por quê, e quais `OD-nnn` tocou.
