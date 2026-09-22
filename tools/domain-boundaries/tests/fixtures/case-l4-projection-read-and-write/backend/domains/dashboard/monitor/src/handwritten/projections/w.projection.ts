export const consumedEvents = ['rait.case.changed'] as const;
export const readSql = 'select * from inf.rait_case where tenant_id = $1';
export const writeSql = 'insert into inf.notification_log (id) values ($1)';
