# entregaveis/ — documentos institucionais

Documentos destinados a **público externo** (DETRAN-AM, SENATRAN, parceiros). Diferente de
`_meta/session-artifacts/`, que guarda subprodutos internos de trabalho, tudo aqui é entregável:
foi revisado para sair da organização e deve ser tratado como versão de referência.

Cada documento tem uma **fonte diagramada em HTML** (que gera o PDF e o artifact publicado) e,
quando útil, uma **fonte editável em Markdown**. O `.docx` dos casos de uso é gerado por
[`build-docx.js`](./build-docx.js) (`npm install docx && node build-docx.js`) — editar o script, não
o `.docx`, para manter os quatro formatos coerentes. Para regerar o PDF a partir do HTML:

```bash
{ printf '<!doctype html><html lang="pt-BR"><meta charset="utf-8">\n'; cat <arquivo>.html; printf '\n</html>\n'; } > /tmp/print.html
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --no-pdf-header-footer --virtual-time-budget=20000 --print-to-pdf=<arquivo>.pdf /tmp/print.html
```

## Índice

| Documento                                                                                                                                                                                     | Destinatário                       | Formatos                                                                                                                                                                 | Emitido em |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| **Casos de uso da API SENATRAN** — 46 casos em 6 domínios (RENAINF, RENAEST, RENACH, SNE, CDT, WSDenatran), com natureza da chamada, requisitos de idempotência e base normativa de cada caso | SENATRAN — processo de homologação | [`.docx`](./Casos-de-Uso-API-SENATRAN.docx) · [`.md`](./Casos-de-Uso-API-SENATRAN.md) · [`.pdf`](./Casos-de-Uso-API-SENATRAN.pdf) · [`.html`](./casos-uso-senatran.html) | ago/2026   |
| **Portfólio da Suíte DETRAN** — seis aplicações, integração com as bases nacionais, plataforma, fundamentação normativa e trajetória em fases                                                 | institucional / parceiros          | [`.pdf`](./Portfolio-DETRAN-NYXK.pdf) · [`.html`](./portfolio-detran.html)                                                                                               | ago/2026   |

## Convenções

- **Números citados são verificados** contra o estado real dos repositórios e da base de
  conhecimento na data de emissão — nunca estimados. Ao atualizar um documento, reconferir.
- **Nada de norma inventada**: toda citação normativa remete a um instrumento catalogado em
  [`refs/`](../legal/index.md), com o original preservado.
- Ao revisar um documento, **atualize a data de emissão** no rodapé e no índice acima.
- Os artifacts publicados a partir destes arquivos mantêm URL fixa: republicar o mesmo caminho
  atualiza a página existente, em vez de criar outra.
