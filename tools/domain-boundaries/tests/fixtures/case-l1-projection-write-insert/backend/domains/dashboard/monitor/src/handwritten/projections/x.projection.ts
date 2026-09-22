export const consumedEvents = ['rait.case.changed'] as const;
export const sql = 'insert into inf.rait_case (id, tenant_id) values ($1, $2)';
