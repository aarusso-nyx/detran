// R-0012 TASK-0011 (Inspector). Regra local `rait/no-client-deadline-math` (contrato CTG-0002c
// §6.1; [RN-RAIT-005]; plan M12; OD-R12-032) — `apps/rait/web/eslint/local-rules.js` ainda não
// existe (TASK-0012): a importação falha com "Cannot find module" (estado esperado, contrato
// §1). Critérios C-2C-86…91 e a parte estática de C-2C-97 (§8).
//
// `RuleTester` do ESLint fora do mocha: os ganchos vêm dos globais do vitest pelos estáticos
// `RuleTester.describe`/`RuleTester.it` (`node_modules/eslint/lib/rule-tester/rule-tester.js`);
// `languageOptions.parser` = parser do `typescript-eslint`. As strings de `code` abaixo são o
// OBJETO TESTADO (fonte sintética analisada pela regra), nunca código do app.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import { noClientDeadlineMath } from '../../../eslint/local-rules.js';

const lintDir = dirname(fileURLToPath(import.meta.url)); // .../src/app/lint
const appRoot = join(lintDir, '..', '..', '..'); // .../apps/rait/web
const CLOCK_PATH = join(appRoot, 'src', 'app', 'data', 'clock.ts');
const READ_STORE_PATH = join(
  appRoot,
  'src',
  'app',
  'data',
  'facades',
  'read-store.ts',
);
const ESLINT_CONFIG_PATH = join(appRoot, 'eslint.config.js');

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    ecmaVersion: 2023,
    sourceType: 'module',
  },
});

// C-2C-86: `Date.now()` proibido; arquivo allow-listado não é avaliado.
ruleTester.run(
  'rait/no-client-deadline-math — dateNow (C-2C-86)',
  noClientDeadlineMath,
  {
    valid: [
      {
        name: 'dado Date.now() em src/app/data/clock.ts quando lint então 0 erros (allow-list)',
        code: 'const a = Date.now();',
        filename: 'src/app/data/clock.ts',
      },
    ],
    invalid: [
      {
        name: 'dado "const a = Date.now();" quando lint então 1 erro dateNow',
        code: 'const a = Date.now();',
        filename: 'src/app/features/painel/painel.page.ts',
        errors: [{ messageId: 'dateNow' }],
      },
    ],
  },
);

// C-2C-87: `new Date()` sem argumento proibido; com argumento, permitido.
ruleTester.run(
  'rait/no-client-deadline-math — newDate (C-2C-87)',
  noClientDeadlineMath,
  {
    valid: [
      {
        name: 'dado "const d = new Date(ms);" quando lint então 0 erros (com argumento)',
        code: 'const d = new Date(ms);',
        filename: 'src/app/shared/x.component.ts',
      },
    ],
    invalid: [
      {
        name: 'dado "const d = new Date();" quando lint então 1 erro newDate',
        code: 'const d = new Date();',
        filename: 'src/app/shared/x.component.ts',
        errors: [{ messageId: 'newDate' }],
      },
    ],
  },
);

// C-2C-88: aritmética sobre Date/getTime().
ruleTester.run(
  'rait/no-client-deadline-math — dateArithmetic (C-2C-88)',
  noClientDeadlineMath,
  {
    valid: [
      {
        name: 'dado "clock.now() - cachedAt" quando lint então 0 erros (RaitClock não é Date)',
        code: 'const ttl = clock.now() - cachedAt;',
        filename: 'src/app/data/facades/read-store.ts',
      },
      {
        name: 'dado "a.getTime() === b.getTime()" quando lint então 0 erros (comparação, não aritmética)',
        code: 'const same = a.getTime() === b.getTime();',
        filename: 'src/app/shared/x.component.ts',
      },
    ],
    invalid: [
      {
        name: 'dado "x.getTime() - y" quando lint então 1 erro dateArithmetic',
        code: 'const delta = x.getTime() - y;',
        filename: 'src/app/shared/x.component.ts',
        errors: [{ messageId: 'dateArithmetic' }],
      },
      {
        name: 'dado "new Date(a) - new Date(b)" quando lint então 1 erro dateArithmetic',
        code: 'const delta = new Date(a) - new Date(b);',
        filename: 'src/app/shared/x.component.ts',
        errors: [{ messageId: 'dateArithmetic' }],
      },
      {
        name: 'dado "Date.parse(a) + 1000" quando lint então 1 erro dateArithmetic',
        code: 'const at = Date.parse(a) + 1000;',
        filename: 'src/app/shared/x.component.ts',
        errors: [{ messageId: 'dateArithmetic' }],
      },
    ],
  },
);

// C-2C-89: chamadas de biblioteca de datas.
ruleTester.run(
  'rait/no-client-deadline-math — dateFnsCall (C-2C-89)',
  noClientDeadlineMath,
  {
    valid: [
      {
        name: 'dado "addItems(list, 5)" quando lint então 0 erros (nome fora do padrão)',
        code: 'const l = addItems(list, 5);',
        filename: 'src/app/shared/x.component.ts',
      },
    ],
    invalid: [
      {
        name: 'dado "addDays(d, 5)" quando lint então 1 erro dateFnsCall com data.name',
        code: 'const due = addDays(d, 5);',
        filename: 'src/app/shared/x.component.ts',
        errors: [{ messageId: 'dateFnsCall', data: { name: 'addDays' } }],
      },
      {
        name: 'dado "subBusinessDays(d, 1)" quando lint então 1 erro dateFnsCall com data.name',
        code: 'const due = subBusinessDays(d, 1);',
        filename: 'src/app/shared/x.component.ts',
        errors: [
          { messageId: 'dateFnsCall', data: { name: 'subBusinessDays' } },
        ],
      },
      {
        name: 'dado "differenceInCalendarDays(a, b)" quando lint então 1 erro dateFnsCall com data.name',
        code: 'const days = differenceInCalendarDays(a, b);',
        filename: 'src/app/shared/x.component.ts',
        errors: [
          {
            messageId: 'dateFnsCall',
            data: { name: 'differenceInCalendarDays' },
          },
        ],
      },
      {
        name: 'dado "dateFns.addHours(d, 1)" quando lint então 1 erro dateFnsCall com data.name',
        code: 'const at = dateFns.addHours(d, 1);',
        filename: 'src/app/shared/x.component.ts',
        errors: [{ messageId: 'dateFnsCall', data: { name: 'addHours' } }],
      },
    ],
  },
);

// C-2C-90: escrita em campo de prazo (só `AssignmentExpression` não computada).
ruleTester.run(
  'rait/no-client-deadline-math — deadlineWrite (C-2C-90)',
  noClientDeadlineMath,
  {
    valid: [
      {
        name: 'dado "const o = { dueOn: x }" quando lint então 0 erros (propriedade de objeto literal)',
        code: 'const o = { dueOn: x };',
        filename: 'src/app/shared/x.component.ts',
      },
      {
        name: 'dado "class A { readonly dueOn = input(); }" quando lint então 0 erros (declaração de propriedade)',
        code: 'class A { readonly dueOn = input<string>(); }',
        filename: 'src/app/shared/x.component.ts',
      },
      {
        name: 'dado \'row["dueOn"] = x\' quando lint então 0 erros (acesso computado)',
        code: 'row["dueOn"] = x;',
        filename: 'src/app/shared/x.component.ts',
      },
    ],
    invalid: [
      {
        name: 'dado "row.dueOn = x" quando lint então 1 erro deadlineWrite',
        code: 'row.dueOn = x;',
        filename: 'src/app/shared/x.component.ts',
        errors: [{ messageId: 'deadlineWrite', data: { name: 'dueOn' } }],
      },
      {
        name: 'dado "clock.ceiling_on = y" quando lint então 1 erro deadlineWrite',
        code: 'clock.ceiling_on = y;',
        filename: 'src/app/shared/x.component.ts',
        errors: [{ messageId: 'deadlineWrite', data: { name: 'ceiling_on' } }],
      },
      {
        name: 'dado "item.daysRemaining += 1" quando lint então 1 erro deadlineWrite',
        code: 'item.daysRemaining += 1;',
        filename: 'src/app/shared/x.component.ts',
        errors: [
          { messageId: 'deadlineWrite', data: { name: 'daysRemaining' } },
        ],
      },
    ],
  },
);

// C-2C-91: o código real do app passa (clock.ts é allow-list; read-store.ts usa RaitClock).
ruleTester.run(
  'rait/no-client-deadline-math — código real do app (C-2C-91)',
  noClientDeadlineMath,
  {
    valid: [
      {
        name: 'dado o código-fonte real de src/app/data/clock.ts quando lint então 0 erros',
        code: readFileSync(CLOCK_PATH, 'utf8'),
        filename: 'src/app/data/clock.ts',
      },
      {
        name: 'dado o código-fonte real de src/app/data/facades/read-store.ts quando lint então 0 erros',
        code: readFileSync(READ_STORE_PATH, 'utf8'),
        filename: 'src/app/data/facades/read-store.ts',
      },
    ],
    invalid: [],
  },
);

describe('eslint.config.js — regras locais ligadas (C-2C-97, parte estática)', () => {
  it('dado o texto de eslint.config.js então cita as duas regras locais do plugin rait', () => {
    // C-2C-97 — o resultado de `pnpm lint` fica no relatório de entrega (Engineer entrega verde)
    const text = readFileSync(ESLINT_CONFIG_PATH, 'utf8');
    expect(text).toContain('rait/no-client-deadline-math');
    expect(text).toContain('rait/no-static-token-i18n-key');
    expect(text).toContain('./eslint/local-rules.js');
  });
});
