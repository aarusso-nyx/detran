// Validador mínimo local de JSON Schema (subconjunto do draft 2020-12), para
// tools/contracts/tests/schemas.test.mjs (CTG-0005 §7 C-5-23/24/25/26; adenda
// §9.16: "não há ajv na raiz" — este helper substitui `ajv` cobrindo só os
// vocabulários que os schemas de docs/framework/schemas/ realmente usam:
// `type`, `required`, `properties`, `additionalProperties`, `items`, `const`,
// `enum`, `oneOf` e `$ref` local (`#/...`, resolvido dentro do próprio
// documento). `format`, `minLength`/`maxLength`/`minimum`/`maximum`/`pattern`/
// `minItems` são checados quando presentes, mas nenhum vocabulário além
// desses é interpretado (ex.: `patternProperties`, `if`/`then`/`else`,
// `$dynamicRef`, `$ref` remoto).
//
// Nunca usado fora de tools/contracts/tests: é um substituto de teste, não
// uma dependência de produção.

function resolveRef(ref, root) {
  if (!ref.startsWith('#/')) {
    throw new Error(`mini-schema-validate: só $ref local é suportado (${ref})`);
  }
  const segments = ref
    .slice(2)
    .split('/')
    .map((segment) => segment.replace(/~1/gu, '/').replace(/~0/gu, '~'));
  let node = root;
  for (const segment of segments) {
    if (node === null || typeof node !== 'object') {
      throw new Error(`mini-schema-validate: $ref ${ref} não resolve`);
    }
    node = node[segment];
  }
  if (node === undefined) {
    throw new Error(`mini-schema-validate: $ref ${ref} não resolve`);
  }
  return node;
}

function typeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'number')
    return Number.isInteger(value) ? 'integer' : 'number';
  return typeof value;
}

function matchesType(value, type) {
  if (type === 'number') {
    const actual = typeOf(value);
    return actual === 'number' || actual === 'integer';
  }
  return typeOf(value) === type;
}

/**
 * @param {unknown} schema
 * @param {unknown} instance
 * @param {unknown} [root] documento raiz, para resolver `$ref` locais
 * @param {string} [path]
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validate(schema, instance, root = schema, path = '$') {
  const errors = [];

  const check = (nodeSchema, value, at) => {
    if (nodeSchema === true || nodeSchema === undefined) return;
    if (nodeSchema === false) {
      errors.push(`${at}: recusado (schema false)`);
      return;
    }

    if (typeof nodeSchema.$ref === 'string') {
      check(resolveRef(nodeSchema.$ref, root), value, at);
      return;
    }

    if (nodeSchema.const !== undefined) {
      if (JSON.stringify(value) !== JSON.stringify(nodeSchema.const)) {
        errors.push(
          `${at}: esperado const ${JSON.stringify(nodeSchema.const)}, obtido ${JSON.stringify(value)}`,
        );
      }
      return;
    }

    if (nodeSchema.enum !== undefined) {
      const isMember = nodeSchema.enum.some(
        (option) => JSON.stringify(option) === JSON.stringify(value),
      );
      if (!isMember) {
        errors.push(
          `${at}: ${JSON.stringify(value)} não está em enum ${JSON.stringify(nodeSchema.enum)}`,
        );
      }
    }

    if (nodeSchema.type !== undefined) {
      const types = Array.isArray(nodeSchema.type)
        ? nodeSchema.type
        : [nodeSchema.type];
      if (!types.some((type) => matchesType(value, type))) {
        errors.push(
          `${at}: tipo ${typeOf(value)} não está entre ${JSON.stringify(types)}`,
        );
        return;
      }
    }

    if (typeof value === 'string') {
      if (
        nodeSchema.minLength !== undefined &&
        value.length < nodeSchema.minLength
      )
        errors.push(
          `${at}: comprimento ${value.length} < minLength ${nodeSchema.minLength}`,
        );
      if (
        nodeSchema.maxLength !== undefined &&
        value.length > nodeSchema.maxLength
      )
        errors.push(
          `${at}: comprimento ${value.length} > maxLength ${nodeSchema.maxLength}`,
        );
      if (
        nodeSchema.pattern !== undefined &&
        !new RegExp(nodeSchema.pattern, 'u').test(value)
      )
        errors.push(
          `${at}: "${value}" não casa com pattern ${nodeSchema.pattern}`,
        );
    }

    if (typeof value === 'number') {
      if (nodeSchema.minimum !== undefined && value < nodeSchema.minimum)
        errors.push(`${at}: ${value} < minimum ${nodeSchema.minimum}`);
      if (nodeSchema.maximum !== undefined && value > nodeSchema.maximum)
        errors.push(`${at}: ${value} > maximum ${nodeSchema.maximum}`);
    }

    if (Array.isArray(value)) {
      if (
        nodeSchema.minItems !== undefined &&
        value.length < nodeSchema.minItems
      )
        errors.push(
          `${at}: ${value.length} itens < minItems ${nodeSchema.minItems}`,
        );
      if (nodeSchema.items !== undefined) {
        value.forEach((item, index) =>
          check(nodeSchema.items, item, `${at}[${index}]`),
        );
      }
    }

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const properties = nodeSchema.properties ?? {};
      if (Array.isArray(nodeSchema.required)) {
        for (const key of nodeSchema.required) {
          if (!(key in value))
            errors.push(`${at}: propriedade obrigatória "${key}" ausente`);
        }
      }
      for (const [key, propValue] of Object.entries(value)) {
        if (Object.prototype.hasOwnProperty.call(properties, key)) {
          check(properties[key], propValue, `${at}.${key}`);
        } else if (nodeSchema.additionalProperties === false) {
          errors.push(
            `${at}: propriedade "${key}" não declarada (additionalProperties: false)`,
          );
        } else if (
          nodeSchema.additionalProperties &&
          typeof nodeSchema.additionalProperties === 'object'
        ) {
          check(nodeSchema.additionalProperties, propValue, `${at}.${key}`);
        }
      }
    }

    if (Array.isArray(nodeSchema.oneOf)) {
      const results = nodeSchema.oneOf.map((branch) =>
        validate(branch, value, root, at),
      );
      const matches = results.filter((result) => result.valid);
      if (matches.length !== 1) {
        errors.push(
          `${at}: oneOf esperava exatamente 1 ramo válido, obteve ${matches.length} ` +
            `(ramos: ${results.map((result) => `[${result.errors.join('; ')}]`).join(' | ')})`,
        );
      }
    }
  };

  check(schema, instance, path);
  return { valid: errors.length === 0, errors };
}
