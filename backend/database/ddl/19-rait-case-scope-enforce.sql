-- ADR-0047 / approved P4-02-S1: post-table tenant and semantic scope integrity.
-- Request paths remain invoker-security under tenant RLS; no grants or provisioning.
do $$ begin
 if to_regclass('inf.ux_inf_rait_pool_non_defense_instance_unit') is null then
  raise exception 'Qualified non-defense pool index must exist before legacy index removal';
 end if;
 if exists(select from pg_constraint where conindid=to_regclass('inf.ux_inf_rait_pool_instance_unit')) then
  raise exception 'Legacy pool index is constraint-owned; explicit migration required';
 end if;
end $$;
drop index if exists inf.ux_inf_rait_pool_instance_unit;

do $$ begin
 if not exists(select from pg_constraint where conrelid='inf.rait_pool'::regclass and conname='fk_inf_rait_scope_pool_unit_tenant') then
  alter table inf.rait_pool add constraint fk_inf_rait_scope_pool_unit_tenant foreign key(tenant_id,unit_id) references inf.rait_unit(tenant_id,id);
 end if;
 if not exists(select from pg_constraint where conrelid='inf.rait_case'::regclass and conname='fk_inf_rait_scope_case_unit_tenant') then
  alter table inf.rait_case add constraint fk_inf_rait_scope_case_unit_tenant foreign key(tenant_id,unit_id) references inf.rait_unit(tenant_id,id);
 end if;
 if not exists(select from pg_constraint where conrelid='inf.rait_case_read_scope'::regclass and conname='fk_inf_rait_read_scope_unit') then
  alter table inf.rait_case_read_scope add constraint fk_inf_rait_read_scope_unit foreign key(tenant_id,unit_id) references inf.rait_unit(tenant_id,id);
 end if;
 if not exists(select from pg_constraint where conrelid='inf.rait_case_read_scope'::regclass and conname='fk_inf_rait_read_scope_pool') then
  alter table inf.rait_case_read_scope add constraint fk_inf_rait_read_scope_pool foreign key(tenant_id,pool_id) references inf.rait_pool(tenant_id,id);
 end if;
 if not exists(select from pg_constraint where conrelid='inf.rait_case_pool_scope'::regclass and conname='fk_inf_rait_case_pool_pool') then
  alter table inf.rait_case_pool_scope add constraint fk_inf_rait_case_pool_pool foreign key(tenant_id,pool_id) references inf.rait_pool(tenant_id,id);
 end if;
end $$;

create or replace function inf.rait_case_pool_scope_validate() returns trigger
language plpgsql security invoker set search_path=pg_catalog,inf as $$
declare c record; p record;
begin
 if new.active then
  select tenant_id,unit_id,instance into c from inf.rait_case where tenant_id=new.tenant_id and id=new.case_id for share;
  select tenant_id,unit_id,instance into p from inf.rait_pool where tenant_id=new.tenant_id and id=new.pool_id for share;
  if c.tenant_id is null or p.tenant_id is null then return new; end if;
  if c.unit_id is distinct from p.unit_id or c.instance is distinct from p.instance then
   raise exception 'Inconsistent case pool scope' using errcode='23514';
  end if;
 end if;
 return new;
end $$;
drop trigger if exists tr_rait_case_pool_scope_validate on inf.rait_case_pool_scope;
create trigger tr_rait_case_pool_scope_validate before insert or update on inf.rait_case_pool_scope for each row execute function inf.rait_case_pool_scope_validate();

create or replace function inf.rait_scope_parent_validate() returns trigger
language plpgsql security invoker set search_path=pg_catalog,inf as $$
begin
 if new.tenant_id is distinct from old.tenant_id or new.unit_id is distinct from old.unit_id or new.instance is distinct from old.instance then
  if tg_table_name='rait_case' then
   if exists(select from inf.rait_case_pool_scope s join inf.rait_pool p on p.tenant_id=s.tenant_id and p.id=s.pool_id where s.case_id=old.id and s.tenant_id=old.tenant_id and s.active and (p.tenant_id is distinct from new.tenant_id or p.unit_id is distinct from new.unit_id or p.instance is distinct from new.instance)) then
    raise exception 'Active case pool scope conflicts with parent change' using errcode='23514';
   end if;
  else
   if exists(select from inf.rait_case_pool_scope s join inf.rait_case c on c.tenant_id=s.tenant_id and c.id=s.case_id where s.pool_id=old.id and s.tenant_id=old.tenant_id and s.active and (c.tenant_id is distinct from new.tenant_id or c.unit_id is distinct from new.unit_id or c.instance is distinct from new.instance)) then
    raise exception 'Active case pool scope conflicts with parent change' using errcode='23514';
   end if;
  end if;
 end if;
 return new;
end $$;
drop trigger if exists tr_rait_case_scope_parent on inf.rait_case;
create trigger tr_rait_case_scope_parent before update of tenant_id,unit_id,instance on inf.rait_case for each row execute function inf.rait_scope_parent_validate();
drop trigger if exists tr_rait_pool_scope_parent on inf.rait_pool;
create trigger tr_rait_pool_scope_parent before update of tenant_id,unit_id,instance on inf.rait_pool for each row execute function inf.rait_scope_parent_validate();

do $$ begin
 if not exists(select from pg_trigger where tgrelid='inf.rait_case_pool_scope'::regclass and tgname='tr_rait_case_pool_scope_validate') or
    not exists(select from pg_trigger where tgrelid='inf.rait_case'::regclass and tgname='tr_rait_case_scope_parent') or
    not exists(select from pg_trigger where tgrelid='inf.rait_pool'::regclass and tgname='tr_rait_pool_scope_parent') then
  raise exception 'Scope integrity triggers absent';
 end if;
 if exists(select from pg_class where oid in ('inf.rait_case_read_scope'::regclass,'inf.rait_case_pool_scope'::regclass) and (not relrowsecurity or not relforcerowsecurity)) then
  raise exception 'Scope tables require forced tenant RLS';
 end if;
end $$;
