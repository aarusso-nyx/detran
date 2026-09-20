# TASK-0059 — contrato técnico final CTG-0002

Papel Art. 6: Architect, Sol/medium, uma tentativa. Leia integralmente
`AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/architect-blueprint.md`,
CTG-0002, ambos os relatórios de trust/ownership, o plano V2, blueprints
worklist/session/case, adapters documentais, deadline engine, serviços
manuscritos, schemas DDL35/36 e sensores existentes.

Produza `reports/CTG-0002-TECHNICAL-CLOSURE-CONTRACT.md` e acrescente um adendo
numerado ao contrato CTG-0002. Resolva, sem código e sem criar regra de produto:

1. API tipada para preparar/recuperar manifestação server-owned da ata do lote,
   separada da verificação de assinatura.
2. Trust específico de ata de sessão (`SESSION_MINUTES`), capabilities,
   manifesto/hash/recibo, presidente e signatários requeridos.
3. Porta canônica same-transaction para transições do caso, sem SQL cross-domain
   clandestino e sem segunda transação.
4. DI explícita de Clock/deadlines/parâmetros para T-CLAIM, T-VOTO, T-CONV,
   vista e T-R2.
5. Representação verificável CETRAN e signatários múltiplos, voto/ata
   imutáveis e migração aditiva do legado.
6. Ordem exata Architect/Inspector/Engineer e ownership de cada arquivo,
   incluindo como TASK-0008 gera hooks/operations sem expor CRUD.

Use o corpus já vinculante; qualquer ponto realmente sem autoridade deve ser
marcado `OWNER_DECISION_REQUIRED` com alternativas e impacto, nunca escolhido
silenciosamente. Diferencie o que pode ser provado com provider fake do gate
operacional que exige serviço documental configurado. Declare contratos de
erro, transação, idempotência, RLS e auditoria única.

Allowlist: `work/rounds/R-0007/contracts/CTG-0002.md`, o relatório novo e
`tasks/TASK-0059.json`. Proibido código, teste, blueprint, DDL, banco, record ou
irmãos. Valide Prettier, `pnpm contracts:check`, referências/caminhos e
diff-check. Atualize status/contagem/evidência da task.
