-- Ajustes de fixture do Portal pedidos por work/rounds/R-0009/contracts/CTG-0002.md §12
-- (MOD-seed-70, TASK-0006 — Inspector). O prompt de TASK-0006 veda tocar seeds existentes e
-- autoriza só este arquivo; por ordem lexicográfica ele roda DEPOIS de 70-fixtures-portal.sql
-- (mesmo mecanismo de backend/database/seed.sh) e produz o estado que o §12 descreve.
-- Idempotente (seed.sh 2×). Tenant canônico 00000000-0000-7000-8000-00000000a001.
--
-- 1. `portal.protocol_seq` (DDL 19; sequência compartilhada por portal.protocol.number e
--    portal.manifestation.protocol — A2(c)): os 14 protocolos literais do seed 70
--    (AM-FIXTURES-2026-0000001 … 000000e) não avançam a sequência; sem o setval o primeiro
--    submit real no tenant canônico colidiria (§3.3 tolera com retry, mas o seed deve ser
--    coerente). `greatest` mantém valores maiores já consumidos por execuções anteriores.
select set_config('app.role', 'owner', false);
select set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', false);

select setval(
  'portal.protocol_seq',
  greatest((select last_value from portal.protocol_seq), 14),
  true
);

-- 2. `effects_ack` da adesão …70e00001 alinhado a SNE_EFFECTS (CTG-0002 §2.4/§6.2:
--    ciencia_ficta, canal_exclusivo, desconto_60, cancelamento — UC-PORTAL-007 AC-2). O seed 70
--    gravou as chaves antigas (ciencia_ficta_30_dias, canal_eletronico,
--    validade_pos_cancelamento); [DIVERGE-CTG-0001] aceito em A4(c).
update portal.sne_enrollment
   set effects_ack = '{"ciencia_ficta":true,"canal_exclusivo":true,"desconto_60":true,"cancelamento":true}'::jsonb
 where id = '00000000-0000-7000-8000-000070e00001'
   and tenant_id = '00000000-0000-7000-8000-00000000a001';
