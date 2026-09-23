// R-0012 TASK-0011 (Inspector). Regra local `rait/no-static-token-i18n-key` (contrato CTG-0002c
// §6.2; plan A1/M5; `verify.mjs --check-usage`) — `apps/rait/web/eslint/local-rules.js` ainda
// não existe (TASK-0012): a importação falha com "Cannot find module" (estado esperado,
// contrato §1). Critérios C-2C-92…96 (§8).
//
// Os nove namespaces vêm de `core/i18n-token-key.ts` (`RAIT_TOKEN_NAMESPACES`), nunca de lista
// paralela; as chaves de token aparecem apenas DENTRO das strings `code` dos casos do
// `RuleTester` — são o OBJETO TESTADO (fonte sintética analisada pela regra), montadas por
// composição, e por isso nenhum literal deste arquivo começa por `rait.<namespace>.`.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import { noStaticTokenI18nKey } from '../../../eslint/local-rules.js';
import { RAIT_TOKEN_NAMESPACES } from '../core/i18n-token-key';

const lintDir = dirname(fileURLToPath(import.meta.url)); // .../src/app/lint
const appRoot = join(lintDir, '..', '..', '..'); // .../apps/rait/web
const TOKEN_KEY_PATH = join(appRoot, 'src', 'app', 'core', 'i18n-token-key.ts');
const BADGE_PATH = join(
  appRoot,
  'src',
  'app',
  'shared',
  'case-state-badge.component.ts',
);

const ROOT = 'rait';
const FILENAME = 'src/app/shared/x.component.ts';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    ecmaVersion: 2023,
    sourceType: 'module',
  },
});

/** `rait.<ns>.X` montado por composição (o literal completo só existe dentro do `code`). */
function staticKey(namespace: string, token: string): string {
  return `${ROOT}.${namespace}.${token}`;
}

// C-2C-92: um caso por namespace (literal estático) + o caso do ponto final.
ruleTester.run(
  'rait/no-static-token-i18n-key — literal estático (C-2C-92)',
  noStaticTokenI18nKey,
  {
    valid: [],
    invalid: [
      ...RAIT_TOKEN_NAMESPACES.map((namespace) => ({
        name: `dado o namespace ${namespace} com chave estática quando lint então 1 erro staticTokenKey com data.value`,
        code: `const k = '${staticKey(namespace, 'X')}';`,
        filename: FILENAME,
        errors: [
          {
            messageId: 'staticTokenKey',
            data: { value: staticKey(namespace, 'X') },
          },
        ],
      })),
      {
        name: 'dado o namespace riskFlag com ponto final e sem token quando lint então 1 erro staticTokenKey',
        code: `const k = '${staticKey('riskFlag', '')}';`,
        filename: FILENAME,
        errors: [{ messageId: 'staticTokenKey' }],
      },
    ],
  },
);

// C-2C-93: template literal cujo primeiro quasi é o namespace.
ruleTester.run(
  'rait/no-static-token-i18n-key — template com namespace no primeiro quasi (C-2C-93)',
  noStaticTokenI18nKey,
  {
    valid: [],
    invalid: [
      {
        name: 'dado um template `rait.<ns>.${t}` quando lint então 1 erro staticTokenKey',
        code: `const k = \`${staticKey('sessionState', '')}\${t}\`;`,
        filename: FILENAME,
        errors: [{ messageId: 'staticTokenKey' }],
      },
    ],
  },
);

// C-2C-94/95: composição e namespaces allowlistados continuam permitidos.
ruleTester.run(
  'rait/no-static-token-i18n-key — composição e namespaces allowlistados (C-2C-94, C-2C-95)',
  noStaticTokenI18nKey,
  {
    valid: [
      {
        name: 'dado tokenKey("caseState", s) quando lint então 0 erros (composição) [negativo]',
        code: "const k = tokenKey('caseState', s);",
        filename: FILENAME,
      },
      {
        name: 'dado `${ROOT}.${ns}.${token}` quando lint então 0 erros (primeiro quasi vazio) [negativo]',
        code: 'const k = `${ROOT}.${ns}.${token}`;',
        filename: FILENAME,
      },
      {
        name: 'dado concatenação com o literal "rait." quando lint então 0 erros [negativo]',
        code: "const k = 'rait.' + ns + '.' + token;",
        filename: FILENAME,
      },
      {
        name: 'dado um template cujo primeiro quasi começa por aspa quando lint então 0 erros [negativo]',
        code: "const k = `'rait.${namespace}.`;",
        filename: FILENAME,
      },
      {
        name: 'dado "rait.caseState" (duas partes, sem ponto final) quando lint então 0 erros [negativo]',
        code: "const k = 'rait.caseState';",
        filename: FILENAME,
      },
      {
        name: 'dado "rait.common.dueOn" quando lint então 0 erros (namespace allowlistado)',
        code: "const k = 'rait.common.dueOn';",
        filename: FILENAME,
      },
      {
        name: 'dado "rait.forms.pauta.items" quando lint então 0 erros (namespace allowlistado)',
        code: "const k = 'rait.forms.pauta.items';",
        filename: FILENAME,
      },
      {
        name: 'dado "rait.errors.case_state_invalid" quando lint então 0 erros (namespace allowlistado)',
        code: "const k = 'rait.errors.case_state_invalid';",
        filename: FILENAME,
      },
    ],
    invalid: [],
  },
);

// C-2C-96: o código real do app passa.
ruleTester.run(
  'rait/no-static-token-i18n-key — código real do app (C-2C-96)',
  noStaticTokenI18nKey,
  {
    valid: [
      {
        name: 'dado o código-fonte real de src/app/core/i18n-token-key.ts quando lint então 0 erros',
        code: readFileSync(TOKEN_KEY_PATH, 'utf8'),
        filename: 'src/app/core/i18n-token-key.ts',
      },
      {
        name: 'dado o código-fonte real de src/app/shared/case-state-badge.component.ts quando lint então 0 erros',
        code: readFileSync(BADGE_PATH, 'utf8'),
        filename: 'src/app/shared/case-state-badge.component.ts',
      },
    ],
    invalid: [],
  },
);
