export const consumedEvents = ['rait.case.changed'] as const;
export const sql = "update est.crash set status = 'FECHADO' where id = $1";
