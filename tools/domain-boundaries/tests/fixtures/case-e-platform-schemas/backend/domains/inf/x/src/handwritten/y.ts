export const readSql = 'select * from ops.parameter where key = $1';
export const writeSql = 'insert into integration.outbox (payload) values ($1)';
