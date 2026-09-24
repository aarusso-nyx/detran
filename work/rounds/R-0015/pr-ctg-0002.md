## Papel (Constituição Art. 6)

Engineer, integrando entregas separadas de Architect, Inspector e Engineers do CTG-0002.

## Pacote de trabalho e fontes

R-0015 CTG-0002, WP-B4/WP-B5 de `boat-build-pack.md`, sobre os contratos TEAT já integrados por
R-0013. Fontes: fichas IU-BOAT-S-01…S-12 e IU-BOAT-W-01…W-05, matriz mobile TEAT,
`boat-frontends.md`, `teat-mobile-contract.md`, `teat-web-contract.md`, H.42 e decisões A3…A5.

## O que muda

- entrega `@detran/boat-mobile` com 12 páginas, schemas/gates fail-closed, guarda de vítima,
  compartilhados, croqui e seis portas nativas injetáveis;
- integra 12 boundaries BOAT no shell mobile do TEAT, preservando os 58 módulos habilitados e D-05
  desligado, com catálogo i18n carregado pela fundação existente;
- integra cinco páginas `sinistros` no TEAT web com rotas, papéis e ações declarativas, título BOAT
  renderizado, SSE negado em `source_pending` e zero HTTP;
- prova DOM real, orientação, vocabulário e axe nas superfícies mobile/web, além das matrizes dos nove
  papéis e dos 15 payloads de gate;
- incorpora as Emendas 2 e 3 somente nos dois specs residuais do Inspector, após prompt-reviews
  restritos PASS.

## Verificação executada

- [x] `pnpm check` no candidato pós-integração de `origin/main` — exit 0
- [x] `@detran/boat-mobile` — 15/15
- [x] TEAT mobile focal — 190/190 em cinco specs
- [x] TEAT web — 611/611 em quatro specs
- [x] `git diff --check`
- [x] delivery-review Claude Opus: ciclo 1 FAIL (16 achados) → correções por papel → ciclo 2 PASS,
      sem findings
- [x] DEVAI evidence generic sequence 2; cadeia válida, head
      `2a2395af083d1ffe4a9926b7f613878276ec4e3de46ba7e332a9c105337da724`

## Limites de autoridade preservados

- OD-R15-002 foi encerrada pela transcrição autorizada dos quatro papéis de W-01.
- OD-R15-003, OD-R15-004, OD-R15-005 e OD-R15-006 continuam explícitas.
- As portas nativas têm tokens, métodos e doubles executáveis; não se inventou qual tela consome
  hardware sem fonte.
- Papéis e `actionAllowedRoles` são declaração de frontend; o backend continua autoritativo.
- Nenhum acesso real a hardware, IdP, RENAEST/SNE/gov.br, rede produtiva, release ou deploy faz parte
  deste CTG.

Session: Codex maestro R-0015
