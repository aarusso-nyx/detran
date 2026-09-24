# Delivery review — CTG-0004a / ciclo 7 final

## Veredito

**FAIL** — um `high` residual.

Digest `fb479698…5bd9d1`, `29/29 PASS` e diff-check confirmados. F004/F006/F008/F009 foram
aceitos. F001 mantém recuperação 503 correta, mas removeu o vínculo operacional obrigatório entre
tenant STYNX e `bootstrap.context.tenantId`, permitindo snapshot antigo de outro tenant.

Correção mínima: preservar identidade autenticada para `/device-blocked`, mas negar/inutilizar
tenant/bootstrap/provisioning operacionais quando houver mismatch.
