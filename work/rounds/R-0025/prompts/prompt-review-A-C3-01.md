# R-0025 A-C3-01 — prompt-review ciclo 1

Papel Auditor, somente leitura. Reviewer Claude via alias CLI opus, maestro Codex;
não inferir modelo exato. Worktree /Volumes/Development/.codex/worktrees/r0033-portal-preview/detran,
branch codex/r0025-jw01. Nenhuma edição, Git mutável, instalação, servidor, teste ou
verbo de estado/evidência. Resposta somente JSON estrito, sem cercas/preâmbulo;
declarar papel dentro da primeira string de notes.

Leia AGENTS/pin Art6/7/10, orchestraREADME, C0003§4/A-C2-16, R25 AUTHORIZATION/plano
A-C3-01, ADR0041, contracts/JW01-admissibility.md, os quatro prompts TASK0024…27 e
seus JSONs. Confira fontes atuais e diffs em leitura, incluindo mudanças pendentes.
Pré-trabalho4TASKs deve permanecer completed/histórico. Owner autorizou recorte direto
PROTOCOLADO→triage→checklist→admit/reject e PR; não merge/close/rodada integral.

Julgue executabilidade e fronteiras: generatedadmissibilitycreate/update/delete
removidos por source/regeneração antes de handlercanônicoPOST, OpenAPI/clientes sem
colisão; input3critérios/contextserver; quarto calculado e persistido via motor;
IfMatch/ETag/idempotency/upsert/version/evento; rejectlegalBasis semfabricar; guardGET
RLS limitado tenant, OD017 explícita sem inventar individualscope. Histórico
claim→admit incompatível fica fora (OD016). Previewoverride não chamarsuperreal;
substituições M8 estritamente3methods com sensor maisforte, outros unavailable.
Não exigir reestruturação auth/IdP: perfil localnão prova JWT, limitação explícita.
Docker/DB indisponível não PASS. FullR25aceitação preservada, sem ampliar escopo.

PASS se pacote permite execução limitada sem lacuna semântica escondida. REVIEW
se falta decisão técnica/cobertura/arquivo essencial corrigível; FAIL para inventar
valor/permissão/transição, enfraquecer gates, confundir previewcomreal ou violar papel.
Não reabra decisões Owner encerradas. Achados devem citar arquivo/linha atuais.
JSON único: {mode:"prompt-review",round:"R-0025",cycle:1,verdict:"PASS|REVIEW|FAIL",
findings:[{severity:"high|low",file:"relativepath",line:1,claim:"sourceandcriterion",fix:"requiredcorrection"}],
notes:["Papel: Auditor — Artigo 7","identity/readlimits/results"]}. Strings dos enums
na resposta devem ser um valor, não a notação de alternativas do exemplo.
