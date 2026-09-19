# Revisão restrita da adenda CTG-0002 A-1 — correções

Papel: Auditor (soft gate), modo `prompt-review`, rodada R-0010. Trabalhe só
em leitura. Leia `reviews/ctg-0002-adenda-a1-review.json` e confira apenas as
correções dos cinco achados na adenda A-1 de `contracts/CTG-0002.md`.

O item 5 e a ordem de retomada agora exigem decisão do Architect sobre token
`DocumentKind`, chave/owner do template, política de assinatura e PDF/A-2b,
distinguindo o relatório preliminar de UC-1.251 do BAT oficial pendente de
DT-061. O item 1 inclui `*.projection.ts` e `verify:domain-boundaries`.
O item 3 atribui DT-029/H.54 corretamente e entrega a reconciliação de
IU-DASH-001 e dashboard-frontends a TASK-0009. O item 2 cita RN-PORTAL-118
sem impor formato de máscara.

Responda somente um objeto JSON válido, compacto, sem Markdown. Primeiro byte
`{`, último `}`. Chaves `mode`=`prompt-review`, `round`=`R-0010`,
`verdict`=`PASS|REVIEW|FAIL`, `findings` como array de objetos
`{severity,item,file,line,claim,fix}`, `notes` como array. `PASS` se nenhum
`high` permanecer; `REVIEW` para correção local; `FAIL` somente por
contradição canônica/ADR/Constituição ou fronteira de escrita.
