# Revisão suplementar do MESMO candidato

Retome a sessão Fable 5 `f77ff1dc-0b02-4018-930a-3bde72aa9818`.
O parecer anterior foi REVIEW com zero high/três low porque faltaram três
leituras; não o reclassifique retroativamente. Os cinco SHA-256 do prompt
`ctg-0001-fresh-seed-clock-delta.prompt.md` permanecem idênticos. Há uma
execução adicional do perfil `legacy-upgrade` no banco dedicado descartável
`detran_r7_ctg1_a2`: exit 0, nove arquivos na ordem fechada e mensagem de
commit; trate como evidência declarada, não substituto de leitura.

Faça somente estas três leituras faltantes:

1. `docs/meta/adr/ADR-0024-rait-legal-priority-owner-policy.md`, em especial a
   emenda de comprovação definitiva no protocolo; coteje `none` e proibição
   de revisão histórica com a fixture fresh.
2. `backend/database/ddl/34-inf-rait-case.sql`: confira o default de
   `inf.rait_pool.active`.
3. Procure nos specs RAIT remanescentes, sobretudo
   `rait-priority-upgrade.integration.spec.ts`, se ainda há sensor que alega
   provar a seed fresh inteira executando só o primeiro INSERT. Não confunda
   parsing de DDL ou fixture legada com esse erro específico.

Depois julgue novamente o MESMO candidato sem alterar os findings low, salvo
se a nova leitura demonstrar mudança necessária. PASS somente se não houver
bloqueio material; REVIEW se houver lacuna concreta remanescente; FAIL se
contradição estrutural. Retorne apenas as cinco chaves do JSON Schema nativo
`mode/round/verdict/findings/notes`, referências reais e linhas one-based.
Não leia a campanha inteira, não execute banco, não edite.
