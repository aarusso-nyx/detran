# Autorização do Owner — adenda A3.6 de R-0020

**Data:** 2026-09-28. **Papel decisor:** Owner. **Escopo:** CTG-0003 e selo final de R-0020.

Após a apresentação da proposta `contracts/CTG-0003-A3.6-round-status.md` e de duas revisões cruzadas `PASS` por Claude Code Opus 5.5, o Owner respondeu nesta sessão:

> proposta aceita. prossiga ate o fechamento d round

O aceite específico abrange a proposta SHA-256 `993dd973ace52c7acb99166f4c5e20dd1ac7a387f4944b88e626096732180438`: substituir o checkpoint operacional de `round status -> closed` pela verificação cumulativa A3.6 dos 17 selos históricos e, depois, da própria R-0020. O comando literal do DEVAI 1.5.6 permanece **não cumprido** (`TASK_ROUND_INACTIVE`, issue upstream #175) e será `n/a` com essa explicação no fechamento, nunca `PASS`. O critério A3.6 recebe veredito separado após medição.

O Owner aceita expressamente as **32 repetições idempotentes** (16 no clone e 16 na worktree) como prova substituta do estado atual dos selos históricos, pois a saída individual dos comandos originais não foi retida. As repetições não serão descritas como recibos originais. Para o selo final de R-0020, o recibo original deverá ser retido.

A autorização não dispensa a repetição da prova no HEAD commitado, os índices e gates, a revisão de entrega com `PASS`, o PR próprio do CTG-0003, CI verde, nem as decisões A1 do CTG-0004. Preserva-se o pin e a cadeia de evidência.
