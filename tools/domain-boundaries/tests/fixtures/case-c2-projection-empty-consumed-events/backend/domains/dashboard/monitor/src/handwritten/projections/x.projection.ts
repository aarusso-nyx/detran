export const consumedEvents = [] as const;
export const sql =
  'select * from dashboard.alert a join est.crash c on c.id = a.crash_id';
