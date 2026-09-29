# Autorização do Owner para decisões do CTG-0003

**Data:** 2026-09-28. **Papel decisor:** Owner.

Após receber a proposta de correção governada da R-0018 e as perguntas sobre
OD-R20-001/002, o Owner respondeu literalmente nesta sessão:

> Sim, autorizo todas as ações para a correta finalização.

No contexto imediato dessas três propostas, a resposta autoriza:

1. A correção específica descrita em
   `work/rounds/R-0020/contracts/CTG-0003-R18-proposal.md`, SHA-256
   `0aec312aa98b8d3d1b9effbca770192752a6c238046a49d412dcb86748d20ef1`:
   preservar PC-0015 e seu `fail`, emitir novo PC append-only com
   `supersedes: PC-0015`, marcar o critério literal substituído como `n/a`
   somente no novo PC, e registrar C-02-21 como `pass` somente se sua medição
   no candidato sair 0. O ensaio em clone, o review, os gates e o CI continuam
   obrigatórios.
2. **OD-R20-001 = A:** registrar D-1/D-2 em anexos por rodada no registro
   canônico, preservando os PCs históricos.
3. **OD-R20-002 = B:** gerar localmente o índice de rodadas de forma
   determinística a partir dos closures, em commit segregado com recibo do
   Owner e issue upstream ao DEVAI.

Esta autorização não fixa valores ainda não propostos para A1, OD-R20-004 ou
OD-R20-006, nem substitui os recibos históricos específicos do CTG-0005.
