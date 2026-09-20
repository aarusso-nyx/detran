# C4-OD-V2-1 — falha técnica da revisão Fable 5

Data: 2026-09-16. Modelo solicitado/invocado: `claude-fable-5` pela ponte
`tools/orchestra/bridge.sh claude`, em modo `plan`. Autorização Owner: uma revisão,
45.000/6.000 tokens estimados. A reserva foi registrada em `budget.json` antes
da chamada, com hashes da entrada conferidos.

Resultado: **invalid-output**. A ponte terminou com exit 4: Prettier rejeitou
a saída por JSON inválido (linha 14, posição 118; caractere `p` inesperado após
uma expressão). Não existe arquivo JSON validado nem `.bridge.json` desta revisão;
não há veredito PASS/REVIEW/FAIL a aproveitar. A ponte removeu seu arquivo raw
temporário ao encerrar, conforme trap; este registro preserva somente o
diagnóstico observado na saída do comando, sem reconstruir um parecer.

O fragmento exibido pelo erro menciona que `protocolled_at` permanece mutável
por UPDATE gerado e pode afetar o desempate da ordem; sugere congelar esse marco
e adicionar sensor negativo. Isto é **pista técnica, não finding validado**.
Exige confirmação própria e revisão independente íntegra sobre candidato
atualizado. Não se dispara retry, worker, geração ou banco com esta saída.

Após esta tentativa, inspeção local confirmou que `RaitCaseRepository`
incluía `protocolled_at` em `WRITABLE_FIELDS` e que o UPDATE dinâmico poderia
alterá-lo. A proposta V2 foi corrigida documentalmente para marcar o campo
`writable:false` no blueprint, bloquear mudanças de `protocolled_at`/`id` no
SQL e testar HTTP/repositório/SQL, inclusive legado. Nenhuma dessas correções
foi revisada pelo Fable 5. Os hashes da solicitação usada nesta tentativa
identificam o candidato **anterior** e não servem para um eventual novo envio.
