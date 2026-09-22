// Plugin ESLint local `rait` (contrato CTG-0002c §6; plan.md M12): duas regras que provam
// invariantes do app no lint, com os seletores esquery e as mensagens fixas do contrato.
// Nenhuma tem `fix` — a correção é humana, porque cada violação é uma decisão de arquitetura
// ([RN-RAIT-005]: prazo, tempestividade e ordem de fila são do servidor; A1/M5: chave i18n de
// token só por composição em `core/i18n-token-key.ts`). Os objetos de regra são exportados
// nomeadamente para o `RuleTester` dos specs de `src/app/lint/`.

/** Sufixos de caminho isentos da regra de prazos (OD-R12-032 ratificada no contrato §6.1). */
const DEFAULT_ALLOW_FILES = ['src/app/data/clock.ts'];

const TOKEN_NAMESPACE_KEY =
  /^rait\.(caseState|sessionState|infractionState|infractionSubstate|riskFlag|memberStatus|orgState|closureMotive|timer)\./;

function normalisePath(value) {
  return value.replace(/\\/g, '/');
}

/** @type {import('eslint').Rule.RuleModule} */
export const noClientDeadlineMath = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Proíbe cálculo de prazo no cliente: relógio, aritmética de data e escrita em campo de prazo (RN-RAIT-005).',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowFiles: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      dateNow:
        'Date.now() é proibido fora de src/app/data/clock.ts: injete RaitClock (RN-RAIT-005).',
      newDate:
        'new Date() sem argumento é proibido: a data de referência vem do servidor ou de RaitClock (RN-RAIT-005).',
      dateArithmetic:
        'Aritmética sobre Date/getTime() é cálculo de prazo no cliente: proibido (RN-RAIT-005); o servidor calcula.',
      dateFnsCall:
        'Chamada a {{name}} é cálculo de prazo no cliente: proibido (RN-RAIT-005).',
      deadlineWrite:
        'Atribuição a {{name}} é proibida: prazos e dias restantes são somente leitura no cliente (RN-RAIT-005).',
    },
  },
  create(context) {
    const options = context.options[0] ?? {};
    const allowFiles = options.allowFiles ?? DEFAULT_ALLOW_FILES;
    const filename = normalisePath(context.filename ?? '');
    if (
      allowFiles.some((allowed) => filename.endsWith(normalisePath(allowed)))
    ) {
      return {};
    }

    return {
      'CallExpression[callee.type="MemberExpression"][callee.object.type="Identifier"][callee.object.name="Date"][callee.property.name="now"]'(
        node,
      ) {
        context.report({ node, messageId: 'dateNow' });
      },
      'NewExpression[callee.type="Identifier"][callee.name="Date"][arguments.length=0]'(
        node,
      ) {
        context.report({ node, messageId: 'newDate' });
      },
      [[
        'BinaryExpression[operator=/^[+-]$/]:has(> CallExpression[callee.type="MemberExpression"][callee.property.name="getTime"])',
        'BinaryExpression[operator=/^[+-]$/]:has(> NewExpression[callee.type="Identifier"][callee.name="Date"])',
        'BinaryExpression[operator=/^[+-]$/]:has(> CallExpression[callee.type="MemberExpression"][callee.object.name="Date"])',
      ].join(', ')](node) {
        context.report({ node, messageId: 'dateArithmetic' });
      },
      [[
        'CallExpression[callee.type="Identifier"][callee.name=/^(add|sub|differenceIn)(Days|BusinessDays|CalendarDays|Hours)$/]',
        'CallExpression[callee.type="MemberExpression"][callee.property.name=/^(add|sub|differenceIn)(Days|BusinessDays|CalendarDays|Hours)$/]',
      ].join(', ')](node) {
        const name =
          node.callee.type === 'Identifier'
            ? node.callee.name
            : node.callee.property.name;
        context.report({ node, messageId: 'dateFnsCall', data: { name } });
      },
      'AssignmentExpression[left.type="MemberExpression"][left.computed=false][left.property.name=/^(due_on|dueOn|ceiling_on|ceilingOn|deadline|days_remaining|daysRemaining)$/]'(
        node,
      ) {
        context.report({
          node,
          messageId: 'deadlineWrite',
          data: { name: node.left.property.name },
        });
      },
    };
  },
};

/** @type {import('eslint').Rule.RuleModule} */
export const noStaticTokenI18nKey = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Proíbe literal estático de chave i18n dos nove namespaces de token: use tokenKey(namespace, token) (A1; verify:parameter-catalogue).',
    },
    schema: [],
    messages: {
      staticTokenKey:
        "Chave i18n de token '{{value}}' como literal estático: use tokenKey('<ns>', token) (A1; verify:parameter-catalogue).",
    },
  },
  create(context) {
    return {
      [`Literal[value=${TOKEN_NAMESPACE_KEY.toString()}]`](node) {
        context.report({
          node,
          messageId: 'staticTokenKey',
          data: { value: String(node.value) },
        });
      },
      [`TemplateLiteral[quasis.0.value.cooked=${TOKEN_NAMESPACE_KEY.toString()}]`](
        node,
      ) {
        context.report({
          node,
          messageId: 'staticTokenKey',
          data: { value: String(node.quasis[0].value.cooked) },
        });
      },
    };
  },
};

export default {
  meta: { name: 'rait', version: '0.1.0' },
  rules: {
    'no-client-deadline-math': noClientDeadlineMath,
    'no-static-token-i18n-key': noStaticTokenI18nKey,
  },
};
