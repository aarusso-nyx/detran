// Os 18 casos obrigatórios de docs/framework/arch/rait-deadline-engine.md §7,
// pela API pública fixada em work/rounds/R-0006/contracts/CTG-0001.md §5 e §5.1.
// Relógio fixo em 2026-09-14 (segunda-feira), fuso America/Manaus
// (rait-test-strategy.md §6); calendário docs/framework/arch/fixtures/calendar-2026.json;
// catálogo = espelho de inf.infraction_timer_ref; portas em memória.
// Erros verificados pelo `code` de rait-error-catalog.md §3.9 e §3.12.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  createDeadlineEngine,
  DeadlineError,
  FixedClock,
  InMemoryCalendar,
  InMemoryDeadlineEvents,
  InMemoryTimerStore,
  StaticTimerCatalog,
} from '../../src/index.js';

const calendar2026 = JSON.parse(
  readFileSync(
    fileURLToPath(
      new URL(
        '../../../../../../docs/framework/arch/fixtures/calendar-2026.json',
        import.meta.url,
      ),
    ),
    'utf8',
  ),
);

// Fixtures canônicas (rait-fixtures.md §1, CTG-0001 §7): tenant `am-fixtures`,
// infrações `…0000d000NNNN`, caso RAIT 08 (`T-DIL` em dias úteis).
const TENANT = '00000000-0000-7000-8000-00000000a001';
const TENANT_TZ = 'America/Manaus';
const TODAY = '2026-09-14';
const infraction = (nnnn: string) => `00000000-0000-7000-8000-0000d000${nnnn}`;
const CASE_08 = '00000000-0000-7000-8000-000010000008';
// `inf.rait_suspension_act` nasce no DDL 39 (fora do CTG-0001) e o contrato §7
// não fixa prefixo de id para atos de suspensão: uuid nulo como marcador
// explícito de pendência, nunca um id canônico inventado.
const SUSPENSION_ACT_ID = '00000000-0000-0000-0000-000000000000';

// Confere `data` do evento contra a porção `data` do esquema JSON, sem ajv —
// mesmo método de events.schema.spec.ts da infração (presença de `required`,
// pertinência a `enum`, ausência de chave fora de `properties`). A emenda do
// §5.2 nota 1 reduz o envelope ao subconjunto que a biblioteca conhece
// (sem `id`/`version`/`actor`/`correlationId`/`aggregate.version`), por isso só
// `data` é conferido, nunca o envelope inteiro.
interface DataSchema {
  required?: string[];
  properties?: Record<string, { enum?: unknown[] }>;
}

function loadDataSchema(
  type: 'inf.timer.rescheduled' | 'inf.timer.expired',
): DataSchema {
  const schema = JSON.parse(
    readFileSync(
      fileURLToPath(
        new URL(
          `../../../../../../docs/framework/schemas/events/${type}.schema.json`,
          import.meta.url,
        ),
      ),
      'utf8',
    ),
  ) as { properties: { data: DataSchema } };
  return schema.properties.data;
}

function dataSchemaProblems(
  schema: DataSchema,
  value: Record<string, unknown>,
): string[] {
  const problems: string[] = [];
  for (const key of schema.required ?? []) {
    if (!(key in value)) problems.push(`data/${key}: obrigatório ausente`);
  }
  for (const key of Object.keys(value)) {
    const child = schema.properties?.[key];
    if (!child) {
      problems.push(`data/${key}: chave fora de properties`);
      continue;
    }
    if (child.enum && !child.enum.includes(value[key] as never)) {
      problems.push(`data/${key}: ${String(value[key])} fora do enum`);
    }
  }
  return problems;
}

function makeEngine(today: string = TODAY) {
  const clock = new FixedClock(today, TENANT_TZ);
  const calendar = new InMemoryCalendar(calendar2026);
  const catalog = new StaticTimerCatalog();
  const store = new InMemoryTimerStore();
  // Emenda CTG-0001 §5.2: `events` é obrigatória em `DeadlineEngineDeps`.
  const events = new InMemoryDeadlineEvents();
  return {
    clock,
    calendar,
    catalog,
    store,
    events,
    engine: createDeadlineEngine({ clock, calendar, catalog, store, events }),
  };
}

// A escada de risco de WF-RAIT-002 §4.1 vive em TimerDefinition.alertLadder
// ('12/18/21/23 meses'); o caso 9 verifica as datas que o motor calcula sobre
// `startedOn`, não a escrita da bandeira (CTG-0001 §5.1 nota do caso 9).
function addMonths(date: string, months: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1 + months, day));
  return shifted.toISOString().slice(0, 10);
}

describe('motor de prazos (@detran/inf-deadlines) — casos §7', () => {
  it('dado T-REM10 com marco 2026-09-14 quando computeDue então raw_due_on e due_on são 2026-09-24 (caso 1)', async () => {
    const { engine } = makeEngine();

    await expect(
      engine.computeDue('T-REM10', '2026-09-14', TENANT),
    ).resolves.toEqual({ rawDueOn: '2026-09-24', dueOn: '2026-09-24' });
  });

  it('dado T-R2 com marco 2026-09-14 quando computeDue então due_on é 2026-10-14 (caso 2)', async () => {
    const { engine } = makeEngine();

    const due = await engine.computeDue('T-R2', '2026-09-14', TENANT);

    expect(due).toEqual({ rawDueOn: '2026-10-14', dueOn: '2026-10-14' });
  });

  it('dado T-R2 com marco 2026-09-10 quando o vencimento cai em sábado então due_on prorroga para 2026-10-13 (caso 3)', async () => {
    const { engine } = makeEngine();

    const due = await engine.computeDue('T-R2', '2026-09-10', TENANT);

    // 2026-10-10 é sábado e 2026-10-12 é feriado nacional (Aparecida).
    expect(due).toEqual({ rawDueOn: '2026-10-10', dueOn: '2026-10-13' });
  });

  it('dado T-DIL em dias úteis com marco 2026-11-13 quando computeDue então due_on é 2026-12-07 (caso 4)', async () => {
    const { engine } = makeEngine();

    const due = await engine.computeDue('T-DIL', '2026-11-13', TENANT);

    expect(due.dueOn).toBe('2026-12-07');
  });

  it('dado T-DEF com data impressa 2026-10-30 e expedição 2026-09-14 quando arm então due_on é a data impressa sem erro (caso 5)', async () => {
    const { engine } = makeEngine();

    const deadline = await engine.arm({
      ownerKind: 'infraction',
      ownerId: infraction('0002'),
      code: 'T-DEF',
      startOn: '2026-09-14',
      startBasis: 'expedição da NA',
      legalBasis: 'Res. 918/2022 art. 4º §2º; CTB art. 281-A; RN-RAIT-101',
      tenantId: TENANT,
      printedDeadline: '2026-10-30',
    });

    expect(deadline.rawDueOn).toBe('2026-10-30');
    expect(deadline.dueOn).toBe('2026-10-30');
  });

  it('dado T-DEF com data impressa 2026-10-01 e expedição 2026-09-14 quando arm então RAIT.INFRACTION_NOTICE_DEADLINE_SHORT 422 (caso 6)', async () => {
    const { engine } = makeEngine();

    // A data impressa é o piso de 30 dias da expedição (RN-RAIT-101/102;
    // CTG-0001 §4). O caso 5 fixa `arm` como a chamada que não erra com
    // 2026-10-30; o caso 6 é o seu par com a data curta.
    const armShortDeadline = engine.arm({
      ownerKind: 'infraction',
      ownerId: infraction('0002'),
      code: 'T-DEF',
      startOn: '2026-09-14',
      startBasis: 'expedição da NA',
      legalBasis: 'Res. 918/2022 art. 4º §2º; CTB art. 281-A; RN-RAIT-101',
      tenantId: TENANT,
      printedDeadline: '2026-10-01',
    });

    await expect(armShortDeadline).rejects.toBeInstanceOf(DeadlineError);
    await expect(armShortDeadline).rejects.toMatchObject({
      code: 'RAIT.INFRACTION_NOTICE_DEADLINE_SHORT',
      status: 422,
    });
  });

  it('dada NA por SNE disponibilizada 2026-09-14 sem leitura quando a varredura alcança T-SNE-CIENCIA então a ciência ficta é 2026-10-14 com efeito marco e T-DEF conta dela (caso 7)', async () => {
    const { engine, store, clock, calendar, catalog, events } = makeEngine();

    const ficta = await engine.arm({
      ownerKind: 'infraction',
      ownerId: infraction('0002'),
      code: 'T-SNE-CIENCIA',
      startOn: '2026-09-14',
      startBasis: 'disponibilização no SNE + envio da mensagem',
      legalBasis: 'CTB art. 282-A §2º; Res. 931/2022 art. 4º §6º',
      tenantId: TENANT,
    });

    expect(ficta.dueOn).toBe('2026-10-14');
    expect(clock.today(TENANT_TZ)).toBe(TODAY);

    // A varredura compara datas (`due_on < hoje`, rait-deadline-engine.md §5):
    // o vencimento da ficta só é observável com o relógio fixo no dia seguinte.
    const sweepEngine = createDeadlineEngine({
      clock: new FixedClock('2026-10-15', TENANT_TZ),
      calendar,
      catalog,
      store,
      events,
    });
    const report = await sweepEngine.sweep(TENANT);

    expect(report.expired).toHaveLength(1);
    expect(report.expired[0]).toMatchObject({
      code: 'T-SNE-CIENCIA',
      dueOn: '2026-10-14',
      effect: 'marco',
    });

    const defesa = await sweepEngine.arm({
      ownerKind: 'infraction',
      ownerId: infraction('0002'),
      code: 'T-DEF',
      startOn: ficta.dueOn,
      startBasis: 'ciência ficta no SNE',
      legalBasis: 'Res. 918/2022 art. 4º §2º; CTB art. 281-A; RN-RAIT-101',
      tenantId: TENANT,
      // piso de 30 dias corridos sobre a ciência (RN-RAIT-101; CTG-0001 §4)
      printedDeadline: '2026-11-13',
    });

    expect(defesa.startedOn).toBe('2026-10-14');
    expect(defesa.dueOn).toBe('2026-11-13');
  });

  it('dada NA por SNE lida em 2026-09-20 quando a leitura é registrada então a ciência é 2026-09-20 e T-SNE-CIENCIA fica satisfeito (caso 8)', async () => {
    const { engine, store } = makeEngine();

    const ficta = await engine.arm({
      ownerKind: 'infraction',
      ownerId: infraction('0005'),
      code: 'T-SNE-CIENCIA',
      startOn: '2026-09-14',
      startBasis: 'disponibilização no SNE + envio da mensagem',
      legalBasis: 'CTB art. 282-A §2º; Res. 931/2022 art. 4º §6º',
      tenantId: TENANT,
    });

    // min(leitura, disponibilização + 30): a leitura precede a ficta.
    expect('2026-09-20' < ficta.dueOn).toBe(true);

    await engine.satisfy(ficta.id, 'leitura registrada em 2026-09-20');

    const satisfied = await store.findById(ficta.id);
    expect(satisfied?.status).toBe('satisfeito');
    expect(satisfied?.satisfiedAt).not.toBeNull();
  });

  it('dado T-JUL-24M recebido pelo julgador em 2026-09-14 quando arm então due_on é 2028-09-14 e a escada cai em 2027-09-14, 2028-03-14, 2028-06-14 e 2028-08-14 (caso 9)', async () => {
    const { engine, catalog } = makeEngine();

    const deadline = await engine.arm({
      ownerKind: 'infraction',
      ownerId: infraction('0007'),
      code: 'T-JUL-24M',
      startOn: '2026-09-14',
      startBasis: 'recebimento do recurso pelo órgão julgador',
      legalBasis: 'CTB arts. 285 §6º, 289, 289-A; RN-RAIT-110…112',
      tenantId: TENANT,
      instance: 'jari',
    });

    expect(deadline.dueOn).toBe('2028-09-14');
    expect(deadline.instance).toBe('jari');

    const ladder = catalog.get('T-JUL-24M').alertLadder ?? '';
    expect(ladder).toContain('12/18/21/23');
    const months = [...ladder.matchAll(/\d+/g)].slice(0, 4).map(Number);
    expect(months).toEqual([12, 18, 21, 23]);
    expect(months.map((month) => addMonths(deadline.startedOn, month))).toEqual(
      ['2027-09-14', '2028-03-14', '2028-06-14', '2028-08-14'],
    );
  });

  it('dado T-DIL armado em 2026-11-13 quando um ato de suspensão de 10 dias o reprograma então due_on soma 10 dias úteis e suspended_by_act_id fica gravado (caso 10)', async () => {
    const { engine } = makeEngine();

    const deadline = await engine.arm({
      ownerKind: 'case',
      ownerId: CASE_08,
      code: 'T-DIL',
      startOn: '2026-11-13',
      startBasis: 'abertura da diligência',
      legalBasis: 'Res. 900/2022 art. 9º p.ú.; RN-RAIT-004',
      tenantId: TENANT,
    });
    expect(deadline.dueOn).toBe('2026-12-07');

    const rescheduled = await engine.reschedule(deadline.id, {
      id: SUSPENSION_ACT_ID,
      days: 10,
      evidenceRef: 'ato de suspensão por força maior (fixture)',
      signedAt: new Date('2026-11-20T12:00:00-04:00'),
    });

    // 25 dias úteis de 2026-11-13 (15 do catálogo + 10 do ato), com 20/11
    // (Consciência Negra) e 08/12 (Manaus) fora da contagem.
    expect(rescheduled.dueOn).toBe('2026-12-22');
    expect(rescheduled.suspendedDays).toBe(10);
    expect(rescheduled.suspendedByActId).toBe(SUSPENSION_ACT_ID);
    // O par (dueOn antigo, dueOn novo) é o `data` de inf.timer.rescheduled
    // (TIMER_REPROGRAMADO); a publicação do envelope não é da API desta rodada.
    expect(rescheduled.dueOn).not.toBe(deadline.dueOn);
  });

  it('dado T-DEC armado quando um ato de suspensão tenta reprogramá-lo então RAIT.SUSPENSION_LEGAL_TIMER 422 (caso 11)', async () => {
    const { engine } = makeEngine();

    const deadline = await engine.arm({
      ownerKind: 'infraction',
      ownerId: infraction('0001'),
      code: 'T-DEC',
      startOn: '2026-09-01',
      startBasis: 'cometimento; 360 dias se defesa tempestiva',
      legalBasis:
        'CTB art. 282 §§6º-7º; Res. 918/2022 art. 9º §§2º-3º; RN-RAIT-114',
      tenantId: TENANT,
    });

    const rescheduling = engine.reschedule(deadline.id, {
      id: SUSPENSION_ACT_ID,
      days: 10,
      evidenceRef: 'ato de suspensão por força maior (fixture)',
      signedAt: new Date('2026-09-10T12:00:00-04:00'),
    });

    await expect(rescheduling).rejects.toBeInstanceOf(DeadlineError);
    await expect(rescheduling).rejects.toMatchObject({
      code: 'RAIT.SUSPENSION_LEGAL_TIMER',
      status: 422,
    });
  });

  it('dado T-NA da infração …0010 vencido em 2026-08-05 quando a varredura roda duas vezes então há uma transição e um TIMER_VENCIDO (caso 12)', async () => {
    const { engine, store, events } = makeEngine();

    const deadline = await engine.arm({
      ownerKind: 'infraction',
      ownerId: infraction('0010'),
      code: 'T-NA',
      startOn: '2026-07-06',
      startBasis:
        'cometimento (não flagrante: conhecimento pelo órgão — contagem pendente)',
      legalBasis: 'Res. 918/2022 art. 4º §1º; CTB art. 281 §1º II',
      tenantId: TENANT,
    });
    expect(deadline.dueOn).toBe('2026-08-05');

    const first = await engine.sweep(TENANT);
    expect(first.expired).toHaveLength(1);
    expect(first.expired[0]).toMatchObject({
      code: 'T-NA',
      ownerKind: 'infraction',
      ownerId: infraction('0010'),
      dueOn: '2026-08-05',
      effect: 'transicao',
    });

    const expiredOnce = await store.findById(deadline.id);
    expect(expiredOnce?.status).toBe('vencido');

    const second = await engine.sweep(TENANT);
    expect(second.expired).toHaveLength(0);

    const expiredTwice = await store.findById(deadline.id);
    expect(expiredTwice?.expiredAt).toEqual(expiredOnce?.expiredAt);

    // Emenda CTG-0001 §5.2: a porta tem exatamente um `inf.timer.expired` para
    // este timer — a segunda varredura não publica de novo (nota 3 do §5.2).
    expect(events.published).toHaveLength(1);
    const [published] = events.published;
    expect(published).toMatchObject({
      type: 'inf.timer.expired',
      domainEvent: 'TIMER_VENCIDO',
      aggregate: { kind: 'clock', id: deadline.id },
    });
    const expiredData = published.data as Record<string, unknown>;
    expect(expiredData).toMatchObject({
      ownerKind: 'infraction',
      ownerId: infraction('0010'),
      timerCode: 'T-NA',
      dueOn: '2026-08-05',
      effect: 'transicao',
    });
    expect(
      dataSchemaProblems(loadDataSchema('inf.timer.expired'), expiredData),
    ).toEqual([]);
  });

  it('dado T-PAR-3A armado em 2026-06-18 quando há movimentação em 2027-01-10 então o relógio reinicia com due_on 2030-01-10 (caso 13)', async () => {
    const { engine } = makeEngine();

    const armed = await engine.arm({
      ownerKind: 'infraction',
      ownerId: infraction('0007'),
      code: 'T-PAR-3A',
      startOn: '2026-06-18',
      startBasis: 'último ato registrado (reinicia a cada movimentação)',
      legalBasis: 'Lei 9.873/1999 art. 1º §1º; RN-RAIT-113',
      tenantId: TENANT,
    });
    expect(armed.dueOn).toBe('2029-06-18');

    const restarted = await engine.arm({
      ownerKind: 'infraction',
      ownerId: infraction('0007'),
      code: 'T-PAR-3A',
      startOn: '2027-01-10',
      startBasis: 'último ato registrado (reinicia a cada movimentação)',
      legalBasis: 'Lei 9.873/1999 art. 1º §1º; RN-RAIT-113',
      tenantId: TENANT,
    });

    expect(restarted.startedOn).toBe('2027-01-10');
    expect(restarted.dueOn).toBe('2030-01-10');
  });

  it('dado T-PRESC-5A armado quando a NP é expedida então não há reinício (OD-305)', async () => {
    const { engine, store } = makeEngine();

    const prescricao = await engine.arm({
      ownerKind: 'infraction',
      ownerId: infraction('0005'),
      code: 'T-PRESC-5A',
      startOn: '2026-03-02',
      startBasis:
        'prática do ato; interrompido só pelas hipóteses do art. 2º da Lei 9.873 (sem auto-reset na NP)',
      legalBasis:
        'Lei 9.873/1999 arts. 1º-2º; Res. 918/2022 art. 36; RN-RAIT-113',
      tenantId: TENANT,
    });

    // A expedição da NP arma T-NP-VENC (CTG-0001 §7.2, infração …0005) e não
    // toca T-PRESC-5A: só as hipóteses do art. 2º da Lei 9.873 interrompem.
    await engine.arm({
      ownerKind: 'infraction',
      ownerId: infraction('0005'),
      code: 'T-NP-VENC',
      startOn: '2026-08-17',
      startBasis:
        'notificação da penalidade (ciência conforme canal; piso 30 dias)',
      legalBasis: 'CTB art. 282 §§4º-5º e 290 II; Res. 918/2022 art. 12 IV',
      tenantId: TENANT,
      printedDeadline: '2026-10-20',
    });

    const afterNotice = await store.findById(prescricao.id);
    expect(afterNotice?.startedOn).toBe('2026-03-02');
    expect(afterNotice?.rawDueOn).toBe(prescricao.rawDueOn);
    expect(afterNotice?.dueOn).toBe(prescricao.dueOn);
    expect(afterNotice?.suspendedDays).toBe(0);
  });

  it('dada peça postada em 2026-10-14 com T-NP-VENC vencendo 2026-10-14 quando timeliness então é tempestiva (caso 15)', async () => {
    const { engine } = makeEngine();

    const deadline = await engine.arm({
      ownerKind: 'infraction',
      ownerId: infraction('0005'),
      code: 'T-NP-VENC',
      startOn: '2026-09-14',
      startBasis:
        'notificação da penalidade (ciência conforme canal; piso 30 dias)',
      legalBasis: 'CTB art. 282 §§4º-5º e 290 II; Res. 918/2022 art. 12 IV',
      tenantId: TENANT,
      // data impressa da NP (override nomeado sobre a fixture …0005)
      printedDeadline: '2026-10-14',
    });
    expect(deadline.dueOn).toBe('2026-10-14');

    const result = await engine.timeliness({
      code: 'T-NP-VENC',
      ownerId: infraction('0005'),
      tenantId: TENANT,
      pieceMarkOn: '2026-10-14',
    });

    expect(result.timely).toBe(true);
    expect(result.dueOn).toBe('2026-10-14');
  });

  it('dada peça protocolada em 2026-10-15 com T-NP-VENC vencendo 2026-10-14 quando timeliness então é intempestiva (caso 16)', async () => {
    const { engine } = makeEngine();

    await engine.arm({
      ownerKind: 'infraction',
      ownerId: infraction('0005'),
      code: 'T-NP-VENC',
      startOn: '2026-09-14',
      startBasis:
        'notificação da penalidade (ciência conforme canal; piso 30 dias)',
      legalBasis: 'CTB art. 282 §§4º-5º e 290 II; Res. 918/2022 art. 12 IV',
      tenantId: TENANT,
      printedDeadline: '2026-10-14',
    });

    const result = await engine.timeliness({
      code: 'T-NP-VENC',
      ownerId: infraction('0005'),
      tenantId: TENANT,
      pieceMarkOn: '2026-10-15',
    });

    expect(result.timely).toBe(false);
    expect(result.dueOn).toBe('2026-10-14');
  });

  it('dado T-DEC de 180 dias sobre o cometimento 2026-06-15 quando a defesa é admitida tempestiva então due_on passa para 360 dias do cometimento (caso 17)', async () => {
    const { engine, clock, calendar, store, catalog, events } = makeEngine();

    const at180 = await engine.computeDue('T-DEC', '2026-06-15', TENANT);
    expect(at180).toEqual({ rawDueOn: '2026-12-12', dueOn: '2026-12-14' });

    // "360 dias se defesa tempestiva" é o próprio catálogo de timers
    // (inf.infraction_timer_ref.start_mark de T-DEC; §3.1 linha 7): mesmo
    // started_on, sem suspensão.
    const extendedCatalog = new StaticTimerCatalog([
      { ...catalog.get('T-DEC'), durationValue: 360 },
    ]);
    const extended = createDeadlineEngine({
      clock,
      calendar,
      catalog: extendedCatalog,
      store,
      events,
    });

    const at360 = await extended.computeDue('T-DEC', '2026-06-15', TENANT);

    expect(at360).toEqual({ rawDueOn: '2027-06-10', dueOn: '2027-06-10' });
    expect(at360.dueOn).not.toBe(at180.dueOn);
  });

  it('dado T-DEC de 180 dias quando a defesa não é conhecida por intempestividade então o prazo permanece em 180 dias (caso 18)', async () => {
    const { engine, store } = makeEngine();

    const deadline = await engine.arm({
      ownerKind: 'infraction',
      ownerId: infraction('0004'),
      code: 'T-DEC',
      startOn: '2026-05-04',
      startBasis: 'cometimento; 360 dias se defesa tempestiva',
      legalBasis:
        'CTB art. 282 §§6º-7º; Res. 918/2022 art. 9º §§2º-3º; RN-RAIT-114',
      tenantId: TENANT,
    });

    // 180 dias de 2026-05-04 (CTG-0001 §7.2, infração …0004).
    expect(deadline.rawDueOn).toBe('2026-10-31');
    expect(deadline.dueOn).toBe('2026-11-03');

    // A defesa não conhecida por intempestividade não estende T-DEC
    // (WF-INF-003 §5 invariante 3): nenhuma recontagem.
    const unchanged = await store.findById(deadline.id);
    expect(unchanged?.rawDueOn).toBe('2026-10-31');
    expect(unchanged?.dueOn).toBe('2026-11-03');
  });

  // Emenda CTG-0001 §5.2 (janela 2, decisão M14): porta de eventos
  // `DeadlineEvents` e verbo `extend` (prorrogação única de T-DIL).
  it('dado T-DIL armado em 2026-11-13 quando um ato de suspensão o reprograma então a porta publica exatamente um inf.timer.rescheduled com reason suspensao válido contra o esquema (caso 19)', async () => {
    const { engine, events } = makeEngine();

    const deadline = await engine.arm({
      ownerKind: 'case',
      ownerId: CASE_08,
      code: 'T-DIL',
      startOn: '2026-11-13',
      startBasis: 'abertura da diligência',
      legalBasis: 'Res. 900/2022 art. 9º p.ú.; RN-RAIT-004',
      tenantId: TENANT,
    });
    expect(deadline.dueOn).toBe('2026-12-07');

    const rescheduled = await engine.reschedule(deadline.id, {
      id: SUSPENSION_ACT_ID,
      days: 10,
      evidenceRef: 'ato de suspensão por força maior (fixture)',
      signedAt: new Date('2026-11-20T12:00:00-04:00'),
    });
    expect(rescheduled.dueOn).toBe('2026-12-22');

    expect(events.published).toHaveLength(1);
    const [published] = events.published;
    expect(published).toMatchObject({
      type: 'inf.timer.rescheduled',
      domainEvent: 'TIMER_REPROGRAMADO',
      aggregate: { kind: 'clock', id: deadline.id },
    });
    const rescheduledData = published.data as Record<string, unknown>;
    expect(rescheduledData).toMatchObject({
      ownerId: CASE_08,
      timerCode: 'T-DIL',
      oldDueOn: '2026-12-07',
      newDueOn: '2026-12-22',
      suspensionActId: SUSPENSION_ACT_ID,
      reason: 'suspensao',
    });
    expect(
      dataSchemaProblems(
        loadDataSchema('inf.timer.rescheduled'),
        rescheduledData,
      ),
    ).toEqual([]);
  });

  it('dado T-DIL armado em 2026-11-13 quando extend então prorroga 15 dias úteis do vencimento, extensionCount vira 1 e a porta publica um inf.timer.rescheduled com reason prorrogacao e suspensionActId nulo (caso 20)', async () => {
    const { engine, events } = makeEngine();

    const deadline = await engine.arm({
      ownerKind: 'case',
      ownerId: CASE_08,
      code: 'T-DIL',
      startOn: '2026-11-13',
      startBasis: 'abertura da diligência',
      legalBasis: 'Res. 900/2022 art. 9º p.ú.; RN-RAIT-004',
      tenantId: TENANT,
    });
    expect(deadline.dueOn).toBe('2026-12-07');

    const extended = await engine.extend(
      deadline.id,
      'prorrogação decidida em despacho da diligência (fixture)',
    );

    // 15 dias úteis de 2026-12-07 (o marco não conta), pulando 08/12 (Manaus)
    // e 25/12 (Natal) e contando 24/12 (ponto facultativo municipal, não é
    // feriado — nota 3 do §5): 30/12 é quarta-feira e dia útil, sem
    // arredondamento (CTG-0001 §5.2, conta verificada contra calendar-2026.json).
    expect(extended.rawDueOn).toBe('2026-12-30');
    expect(extended.dueOn).toBe('2026-12-30');
    expect(extended.extensionCount).toBe(1);
    expect(extended.suspendedDays).toBe(0);
    expect(extended.suspendedByActId).toBeNull();

    expect(events.published).toHaveLength(1);
    const [published] = events.published;
    expect(published).toMatchObject({
      type: 'inf.timer.rescheduled',
      domainEvent: 'TIMER_REPROGRAMADO',
      aggregate: { kind: 'clock', id: deadline.id },
    });
    expect(published.data as Record<string, unknown>).toMatchObject({
      ownerId: CASE_08,
      timerCode: 'T-DIL',
      oldDueOn: '2026-12-07',
      newDueOn: '2026-12-30',
      suspensionActId: null,
      reason: 'prorrogacao',
    });
  });

  it('dado T-DIL já prorrogado uma vez quando extend é chamado de novo então RAIT.INQUIRY_EXTENSION_LIMIT 422 sem gravar nem publicar evento novo (caso 21)', async () => {
    const { engine, events, store } = makeEngine();

    const deadline = await engine.arm({
      ownerKind: 'case',
      ownerId: CASE_08,
      code: 'T-DIL',
      startOn: '2026-11-13',
      startBasis: 'abertura da diligência',
      legalBasis: 'Res. 900/2022 art. 9º p.ú.; RN-RAIT-004',
      tenantId: TENANT,
    });
    await engine.extend(
      deadline.id,
      'prorrogação decidida em despacho da diligência (fixture)',
    );
    expect(events.published).toHaveLength(1);

    const secondExtend = engine.extend(
      deadline.id,
      'segunda tentativa de prorrogação (fixture)',
    );

    await expect(secondExtend).rejects.toBeInstanceOf(DeadlineError);
    await expect(secondExtend).rejects.toMatchObject({
      code: 'RAIT.INQUIRY_EXTENSION_LIMIT',
      status: 422,
      context: {
        ownerId: CASE_08,
        timerCode: 'T-DIL',
        extensionCount: 1,
      },
    });

    // Nenhum evento novo e nenhuma gravação (nota 3 do verbo `extend`, §5.2):
    // dueOn e extensionCount seguem no valor do primeiro extend.
    expect(events.published).toHaveLength(1);
    const stillOnce = await store.findById(deadline.id);
    expect(stillOnce?.dueOn).toBe('2026-12-30');
    expect(stillOnce?.extensionCount).toBe(1);
  });

  it('dado T-DEC armado quando extend é chamado então RAIT.DEADLINE_LEGAL_READONLY 422 sem publicar evento (caso 22)', async () => {
    const { engine, events } = makeEngine();

    const deadline = await engine.arm({
      ownerKind: 'infraction',
      ownerId: infraction('0001'),
      code: 'T-DEC',
      startOn: '2026-09-01',
      startBasis: 'cometimento; 360 dias se defesa tempestiva',
      legalBasis:
        'CTB art. 282 §§6º-7º; Res. 918/2022 art. 9º §§2º-3º; RN-RAIT-114',
      tenantId: TENANT,
    });

    const extending = engine.extend(
      deadline.id,
      'tentativa indevida (fixture)',
    );

    await expect(extending).rejects.toBeInstanceOf(DeadlineError);
    await expect(extending).rejects.toMatchObject({
      code: 'RAIT.DEADLINE_LEGAL_READONLY',
      status: 422,
      context: { timerCode: 'T-DEC' },
    });
    expect(events.published).toHaveLength(0);
  });

  // Emenda CTG-0001 §5.2.9 (M15, delivery-review ciclo 3): retenção do motivo
  // da prorrogação em `Deadline.extensionReason`. Implementação a cargo do
  // Engineer (TASK-0013) — este caso fica vermelho até lá.
  it('dado T-DIL armado em 2026-11-13 quando extend então o motivo fica retido em extensionReason no Deadline devolvido e no relido da store, extensionCount vira 1 e o evento publicado mantém data.reason "prorrogacao" (caso 23)', async () => {
    const { engine, store, events } = makeEngine();

    const deadline = await engine.arm({
      ownerKind: 'case',
      ownerId: CASE_08,
      code: 'T-DIL',
      startOn: '2026-11-13',
      startBasis: 'abertura da diligência',
      legalBasis: 'Res. 900/2022 art. 9º p.ú.; RN-RAIT-004',
      tenantId: TENANT,
    });
    expect(deadline.dueOn).toBe('2026-12-07');

    const beforeExtend = await store.findById(deadline.id);
    expect(
      (beforeExtend as Record<string, unknown> | null)?.extensionReason,
    ).toBeNull();

    const reason = 'diligência complementar ao órgão autuador';
    const extended = await engine.extend(deadline.id, reason);

    expect(extended.extensionReason).toBe(reason);
    expect(extended.extensionCount).toBe(1);

    const afterExtend = await store.findById(extended.id);
    expect(
      (afterExtend as Record<string, unknown> | null)?.extensionReason,
    ).toBe(reason);
    expect(afterExtend?.extensionCount).toBe(1);

    // O motivo livre não aparece no evento (CTG-0001 §5.2.9): `data.reason`
    // segue o token fixo `'prorrogacao'`, nunca o texto do chamador.
    expect(events.published).toHaveLength(1);
    const [published] = events.published;
    const publishedData = published.data as Record<string, unknown>;
    expect(publishedData).toMatchObject({ reason: 'prorrogacao' });
    expect(publishedData.reason).not.toBe(reason);
    expect(JSON.stringify(publishedData)).not.toContain(reason);
  });
});
