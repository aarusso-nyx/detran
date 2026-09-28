# CTG-0002 — triagem do stack smoke remoto

Papel: Architect. Candidato publicado: `2bc62e7a30270ac5c312656906e0465766811f2a` (PR #151). A reprodução usou `git archive` desse HEAD, Node 24.18.1, pnpm 9.15, instalação congelada, builds UI/boat e stack Postgres/serviços em Docker-in-Docker exclusivo `detran-r21-dind`. `stack:db-reset`, `stack:start` e `stack:health` passaram; `pnpm stack:smoke` terminou com exit 0 e 42/42 linhas `passed`, sem linhas `failed`. Não foi alterado teste ou código para isso.

Provas locais: `ctg0002-stack-smoke-summary.json` SHA-256 `c66ec752f1d12d5c8d8012b702ccf070d0c2818a2357d96162d7bb5b994b9645`; `ctg0002-stack-smoke.log` SHA-256 `483ea19310cc7db79f7f749cdbce499ed037c4c0e9eaf4f90da17e7165ad74cf`; relatório bruto privado `/tmp/r21-stack-smoke-raw.json` SHA-256 `756c517ecfd1474c1182c976f9b441fcbc47e504e92119b49a48b016353c4f33` (não publicar por conter dados de sessão). O log contém warnings de `${NODE_AUTH_TOKEN}` não resolvido na configuração `.npmrc`; a instalação congelada ocorreu antes do smoke com o token e o comando de smoke não acessa o registry. O exit code real é 0.

`workflow_dispatch` remoto do [candidato](https://github.com/aarusso-nyx/detran/actions/runs/36379619536) e de [`main` na versão anterior 1.3.1](https://github.com/aarusso-nyx/detran/actions/runs/36380030490) falhou na etapa `stack-smoke` depois de health verde. Classificação: `sensor-error/reference-gap` no runner remoto, reproduzida na referência; o smoke exato em ambiente isolado passou. O job `stack-smoke` do PR comum é `SKIPPED` por desenho do workflow e não é check obrigatório. `backend-kernel`, `foundation`, `verified-local-rc` e os demais checks requeridos pertencem ao PR comum; não são substituídos por este ensaio. A divergência remota permanece registrada para triagem posterior, sem afirmar que o workflow manual passou.

Trecho do job remoto do candidato (job `108792483206`, log SHA-256 `155f3c63603a8e653e775c32b43136d02fb03ed4850f53223c70965b926383d7`):

```text
04:57:34 > detran@0.0.1 stack:smoke
04:57:34 > node tools/stack/smoke.mjs
04:58:10 ELIFECYCLE Command failed with exit code 1.
04:58:10 Process completed with exit code 1.
```

Trecho do job remoto de `main` 1.3.1 (job `108793701832`, log SHA-256 `c4cff29a25aeaf3f3b5150ece12fa68d618def36f12e4fc835c8c3f133c389cd`):

```text
05:03:48 > detran@0.0.1 stack:smoke
05:03:48 > node tools/stack/smoke.mjs
05:04:23 ELIFECYCLE Command failed with exit code 1.
05:04:23 Process completed with exit code 1.
```

O script remoto grava os resultados em arquivo e não imprimiu a linha/target que falhou; o log disponível não permite identificar o caso. Seguimento: registrar esta divergência no `docs/meta/knowledge-base/backlog.md` durante TASK-0014 como pendência do sensor CI de stack smoke para R-0022, com os dois job IDs acima e a reprodução isolada 42/42; a equipe de CI deverá reter/publicar o sumário de linhas do workflow para determinar o target antes de corrigir qualquer teste.
