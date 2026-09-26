# ADR-0035: Política de numeração de ADRs

## Status

Proposta pelo Architect na rodada R-0018 (CTG-0001); a aceitação é do Owner (OD-R18-004). As
renumerações que ela registra executam a Meta 1 do plano de R-0018, autorizado pelo Owner.

## Contexto

Em 2026-09-26, `docs/meta/adr/` tinha três números usados por dois arquivos cada (0006, 0024 e
0028), porque rodadas paralelas escolheram o "próximo número" em branches diferentes. Os índices
`DESIGN-DECISIONS.md` e `docs/meta/adr/README.md` divergiam do diretório (ADRs ausentes, entradas
duplicadas, status diferente do arquivo) e `law/adr/` mantinha uma segunda série com outro
ADR-0001. Havia um precedente de correção: as ADRs de infrações foram renumeradas 0014…0021 no
merge de 2026-09-13, antes de entrarem em `main`. Faltava a regra para números que já entraram.

## Decisão

1. **Ids nunca são reutilizados.** Um número que entrou em `main` pertence para sempre ao arquivo
   que o conserva ou ao seu redirecionamento; não volta a ser livre nem se o arquivo sair.
2. **Duplicata.** Quando dois arquivos de `docs/meta/adr/` têm o mesmo número, conserva-o o que
   entrou primeiro na história first-parent de `main`
   (`git log --first-parent --diff-filter=A -- <arquivo>`). O outro recebe o próximo número livre
   (maior número de `docs/meta/adr/`, contando redirecionamentos, mais um). Várias duplicatas são
   renumeradas em ordem crescente do número duplicado.
3. **Redirecionamento.** O arquivo antigo vira stub: o título original, `## Status` com
   "Renumerada para `[ADR-nnnn](<arquivo novo>)`." e uma nota de política, sem conteúdo normativo.
   O arquivo novo começa com uma nota de proveniência e segue com o original byte a byte. ADR
   aceita não se emenda.
4. **Aliases.** Todo redirecionamento aparece em `docs/meta/adr/README.md` §Aliases (número
   antigo, redirecionamento, número novo, arquivo novo).
5. **Referências vivas por script verificável.** `pnpm adr:renumber` (dry-run por padrão;
   `--write` aplica) move, cria o stub e reescreve citações só na lista fechada de caminhos de
   `tools/docs/adr/renumber.config.json`, desambiguando pelo slug: citação com o slug do arquivo
   renumerado é reescrita; citação sem slug é listada para revisão manual e nunca substituída às
   cegas; citação do número que fica não muda. Identificadores persistidos que contêm um número de
   ADR (por exemplo `policyCode` `ADR-0024-2026-09-16`) são dados, não citações.
6. **Históricos nunca são reescritos.** `work/rounds/R-0001…R-0016/**`, `record/**`,
   `.devai/state/**` e `docs/reference/**` resolvem pelo redirecionamento e por §Aliases, assim
   como caminhos fora do lock de quem renumera (código, DDL, seed, blueprints, gerados, corpus).
7. **Classificação normalizada.** Cada ADR tem uma classe (Accepted, Proposed, Superseded,
   Renumbered) lida do próprio arquivo: palavra-chave na primeira linha de `## Status`, ou a linha
   `- Status:`, ou uma exceção declarada em `tools/docs/state-index/config.json` para ADRs cujo
   status é prosa. Os índices mostram essa classe.
8. **Gate.** `pnpm verify:state-index`, dentro de `pnpm check`, falha em duplicata sem
   redirecionamento válido, ADR ausente de um índice ou índice citando ADR inexistente, status de
   índice diferente da classe do arquivo, e divergência entre closures `PC-*.json` e
   `work/rounds/README.md`.
9. **Número de ADR nova.** Quem cria uma ADR confere `ls docs/meta/adr` imediatamente antes do PR.
   Se outra ADR com o mesmo número entrar antes, a regra 2 se aplica à que entrar depois.

## Consequências

- ADR-0006 (`ops-field-operations-port`) passa a ADR-0036, ADR-0024
  (`rait-legal-priority-owner-policy`) a ADR-0037 e ADR-0028
  (`provisionamento-operacional-offline`) a ADR-0038; os arquivos antigos continuam resolvendo
  pelo redirecionamento.
- A série `law/adr/` segue OD-R18-001.
- Citações sem slug fora do lock continuam ambíguas como já eram; §Aliases as resolve.
- Uma nova divergência entre diretório, índices e estado das rodadas quebra `pnpm check`.
