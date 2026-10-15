# R-0022 — ordem de instalação e grants S/C04

Architect/F1, 2026-10-13. Refinamento técnico CTG0006 Adenda A/C, lane S/D
ativa8aabcf5a. Não altera freeze/gates, defaults normativos ou aprovação Owner.
Root escreve06/31 após F3 RED; Engineer D compõe somente fixed inventory/runner.
Sem SQL/SDK execução por F1, sem nova lease S derivada deste documento.

## Ordem fixa

Ordem lexical de06 é insuficiente: auth helper11 e normative30 ainda faltariam,
e storage.objects só recebe normal FORCE RLS em20. Fixed runner deve executar
ordinary admitted inventory com auth11/normative30, normal20 RLS, depois manual
06 signature evidence/manifest, depois31 floor/policy guards, e finalmente narrow
privilege revokes/assertions.06/31 ficam explicitamente deferidos nessa ordem,
sem SQL/path selector ou psql caller injection. Original bytes das DDLs mantidos.

Antes de06, storage.objects precisa existir e ser ENABLE+FORCE RLS por normal20;
guard real recusa se não.06 não corrige esse requisito, não altera ownership/
policies de outra coleção.31 depende de signature_policy gerada30 e cuida dos
guards/índice revision NULLS NOT DISTINCT/floor já decididos. Final revokes após
qualquer broad generated grant impedem reabrir privilégio no mesmo apply/repeat.
Node main transaction mantém esse plano atômico e pre/post verifiers separados.

## C04 — proibir self-approval também por SQL

F1 blueprint BP-INF-NORMATIVE freezece4605cd torna status,revision,approved_by,
approved_at writable:false; DTO/repository gerados devem refletir exatamente.
Revoke de coluna sozinho não vence um GRANT INSERT/UPDATE de tabela. Final31/
fixed final section revoga table-wide INSERT/UPDATE de role_app_backend e concede
ambos apenas nestas colunas reais:

```text
traffic_agency_id, document_kind, required_signers_json, pades_level,
tsa_required, pdfa_required, govbr_level, valid_from, valid_to,
minimum_signature_level, require_lta, revocation, at_time,
accepted_policies, trust_anchors_pem, source_ref
```

UPDATE(updated_at) é adicional necessário: generated repository atribui esse
campo explicitamente. Não conceder INSERT(updated_at), nem named id/tenant_id/
created_at; defaults/kernel tenant trigger continuam executando sem caller
escolher identidade/instante. Não alterar status defaultactive/revision default1.
SELECT e DELETE atuais ficam; guard de OLD.statusactive impede UPDATE/DELETE
active. Sem approved_at real, uma row defaultactive continua inutilizável ao
Runtime. Owner administrativo pode inserir revisão aprovada real, não endpoint
de aprovação inventado nem seed de valores de confiança.

Fechar grants herdados/PUBLIC/default/reachable SET roles que devolvam table-wide
INSERT/UPDATE ou protected-column permission. Não reivindicar enforcement só
porque acl direto de role_app_backend parece correto. Mesma membership closure
e RLS request path de políticas existentes permanecem; nenhum owner request.

## F3 / evidência

Antes da composição runner pertinente: source witness de ordem fixa20→06→31,
06guard não removido, quatro DTO/repository fields proibidos, explicit allowlist
sem protected columns e final revokes depois de broad grants. Unit/source não
prova privilégio PG. Em normal owned schema/lease S futura, app real consegue
INSERT de campos permitidos com defaults/tenant automático e UPDATE(updated_at)
em draft legítima, mas SQL direto/CRUD cannot status/revision/approval overwrite;
active guard continua imutável; inherited table-wide bypass é negativo real.
Policy/floor fixtures TEST_ONLY não aprovam trust de produção. Original F3 RED
e missing provider/floor/C03/C02/profile-free readiness permanecem separados.
