// caseAccessGuard (spec §3 "o caso pertence ao pool/unidade do usuário, ou o papel é transversal";
// RN-RAIT-143). O endpoint de verificação de acesso ao caso não existe: a guarda devolve `true`
// até R-0007 CTG-0004 — todo(R-0007 CTG-0004): ligar ao endpoint de acesso ao caso (OD-R12-005).
// Nenhum cliente HTTP nem tabela local decide acesso aqui (o servidor decide, ADR-0002/0005).
import type { CanActivateFn } from '@angular/router';

export const caseAccessGuard: CanActivateFn = () => true;
