-- 19-ch-encounter-renach-key.sql — pré-checagem da chave de processo RENACH única por tenant
-- (DDL manuscrito, faixa 1x; CODESTYLE §Backend SQL).
-- Fonte: OD-HF-B9-001 = (a), decidida pelo Owner em 2026-09-29 (R-0022 AUTHORIZATION.md Adenda B10):
-- um processo RENACH pertence a um só paciente, logo ch.encounter.renach_process_key é única por
-- tenant. BP-CH-ENCOUNTERS-001 v1.2.1 declara o índice único parcial
-- ux_ch_encounter_renach_process_key (tenant_id, renach_process_key) where renach_process_key is not
-- null, criado por 42-ch-encounters.sql. O gerador desta base não emite pré-checagem de índice único;
-- este bloco roda antes do 42 (ordem lexical de apply.sh) e só detecta: qual vínculo manter é decisão
-- da operação, nunca da DDL (procedimento em backend/database/ddl/README.md, "Duplicatas da chave de
-- processo RENACH"). Idempotente: sem a tabela (banco novo) ou com o índice já presente não varre nada.
DO $renach_key$
DECLARE
  duplicates text;
BEGIN
  IF to_regclass('ch.encounter') IS NOT NULL
     AND to_regclass('ch.ux_ch_encounter_renach_process_key') IS NULL THEN
    SELECT string_agg(
             format('tenant_id=%s renach_process_key=%s atendimentos=%s pacientes=%s',
                    tenant_id, renach_process_key, total, patients),
             '; ' ORDER BY tenant_id, renach_process_key)
      INTO duplicates
      FROM (SELECT tenant_id, renach_process_key, count(*) AS total,
                   count(DISTINCT patient_id) AS patients
              FROM ch.encounter
             WHERE renach_process_key IS NOT NULL
             GROUP BY tenant_id, renach_process_key
            HAVING count(*) > 1) duplicate;
    IF duplicates IS NOT NULL THEN
      RAISE EXCEPTION 'Indice unico ch.ux_ch_encounter_renach_process_key nao pode ser criado: chaves RENACH duplicadas em ch.encounter (renach_process_key is not null): %. Resolva-as pelo procedimento "Duplicatas da chave de processo RENACH" de backend/database/ddl/README.md e reaplique a DDL.', duplicates;
    END IF;
  END IF;
END $renach_key$;

-- O índice anterior ux_ch_encounter_renach_process (tenant_id, patient_id, renach_process_key) fica
-- implicado pelo novo (toda violação dele viola o novo) e saiu do blueprint; sem duplicatas, retira-se
-- dos bancos existentes para não manter dois índices únicos sobre a mesma chave.
DROP INDEX IF EXISTS ch.ux_ch_encounter_renach_process;
