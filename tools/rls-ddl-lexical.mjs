// Local DDL coverage inventory, not a general PostgreSQL parser. Quoted bodies,
// strings and comments cannot manufacture executable helper calls or tables.
function tokenize(sql, name) {
  const tokens = [];
  const fail = (message) => {
    throw new Error(`${name}: ${message}`);
  };
  let offset = 0;
  let stringEnd = 0;
  while (offset < sql.length) {
    if (/\s/u.test(sql[offset])) {
      offset++;
      continue;
    }
    if (sql.startsWith('--', offset)) {
      const end = sql.slice(offset + 2).search(/[\r\n]/u);
      offset = end < 0 ? sql.length : offset + 2 + end + 1;
      continue;
    }
    if (sql.startsWith('/*', offset)) {
      let depth = 1;
      offset += 2;
      while (offset < sql.length && depth > 0) {
        if (sql.startsWith('/*', offset)) {
          depth++;
          offset += 2;
        } else if (sql.startsWith('*/', offset)) {
          depth--;
          offset += 2;
        } else offset++;
      }
      if (depth > 0) fail('unterminated block comment');
      continue;
    }
    if (/^[uU]&['"]/u.test(sql.slice(offset)))
      fail('Unicode-escaped SQL requires explicit classification');
    const escapedPrefix = /[eE]/u.test(sql[offset]) && sql[offset + 1] === "'";
    const previous = tokens.at(-1);
    const continuation =
      sql[offset] === "'" &&
      previous?.kind === 'string' &&
      /[\r\n]/u.test(sql.slice(stringEnd, offset));
    const escaped = escapedPrefix || (continuation && !previous.plain);
    if (sql[offset] === "'" || sql[offset] === '"' || escaped) {
      if (escapedPrefix) offset++;
      const quote = sql[offset++];
      let value = '';
      let closed = false;
      while (offset < sql.length) {
        const char = sql[offset++];
        if (char === quote) {
          if (sql[offset] === quote) {
            value += quote;
            offset++;
          } else {
            closed = true;
            break;
          }
        } else if (escaped && char === '\\') {
          // Escape-string bodies are opaque, including their escaped quotes.
          if (offset < sql.length) value += char + sql[offset++];
        } else value += char;
      }
      if (!closed)
        fail(quote === '"' ? 'unterminated identifier' : 'unterminated string');
      if (continuation) {
        // A newline-separated continuation inherits an E-string's escapes.
        previous.value += value;
      } else {
        tokens.push({
          kind: quote === '"' ? 'identifier' : 'string',
          value,
          plain: !escaped,
        });
      }
      stringEnd = offset;
      continue;
    }
    if (sql[offset] === '$') {
      const delimiter = sql
        .slice(offset)
        .match(
          /^\$(?:[A-Za-z_\u0080-\uffff][A-Za-z0-9_\u0080-\uffff]*)?\$/u,
        )?.[0];
      if (delimiter) {
        const end = sql.indexOf(delimiter, offset + delimiter.length);
        if (end < 0) fail('unterminated dollar-quoted body');
        tokens.push({ kind: 'body', value: '' });
        offset = end + delimiter.length;
        continue;
      }
    }
    const word = sql
      .slice(offset)
      .match(/^[A-Za-z_\u0080-\uffff][A-Za-z0-9_$\u0080-\uffff]*/u)?.[0];
    if (word) {
      if (/[^\x00-\x7f]/u.test(word))
        fail('non-ASCII unquoted identifier requires explicit classification');
      tokens.push({ kind: 'word', value: word.toLowerCase() });
      offset += word.length;
    } else tokens.push({ kind: 'symbol', value: sql[offset++] });
  }
  return tokens;
}

const isWord = (token, value) =>
  token?.kind === 'word' && token.value === value;
const isSymbol = (token, value) =>
  token?.kind === 'symbol' && token.value === value;
const isIdentifier = (token) =>
  token?.kind === 'word' || token?.kind === 'identifier';
const identifier = (value) =>
  /^[a-z_][a-z0-9_$]*$/u.test(value)
    ? value
    : `"${value.replaceAll('"', '""')}"`;
const identity = (schema, table) =>
  `${identifier(schema)}.${identifier(table)}`;

function inventoryStatement(statement, tenantTables, coveredTables, name) {
  if (
    isWord(statement[0], 'copy') &&
    statement.some(
      (token, index) =>
        isWord(token, 'from') && isWord(statement[index + 1], 'stdin'),
    )
  )
    throw new Error(
      `${name}: COPY FROM STDIN requires explicit classification`,
    );

  // Only a top-level SELECT consisting of this call establishes coverage.
  // A SELECT of text, a stored function/DO body, a false branch or a function
  // declaration must never be mistaken for an executed invocation.
  if (
    statement.length === 9 &&
    isWord(statement[0], 'select') &&
    isIdentifier(statement[1]) &&
    statement[1].value === 'auth' &&
    isSymbol(statement[2], '.') &&
    isIdentifier(statement[3]) &&
    statement[3].value === 'create_rls_policy' &&
    isSymbol(statement[4], '(') &&
    statement[5].kind === 'string' &&
    statement[5].plain &&
    isSymbol(statement[6], ',') &&
    statement[7].kind === 'string' &&
    statement[7].plain &&
    isSymbol(statement[8], ')')
  ) {
    coveredTables.add(identity(statement[5].value, statement[7].value));
  }

  if (!isWord(statement[0], 'create')) return;
  let position = 1;
  if (
    isWord(statement[position], 'or') &&
    isWord(statement[position + 1], 'replace')
  )
    position += 2;
  if (
    ['function', 'procedure'].includes(statement[position]?.value) &&
    statement.some(
      (token, index) =>
        isWord(token, 'begin') && isWord(statement[index + 1], 'atomic'),
    )
  )
    throw new Error(
      `${name}: SQL-standard routine body requires classification`,
    );

  if (['temporary', 'temp', 'unlogged'].includes(statement[position]?.value))
    position++;
  if (!isWord(statement[position++], 'table')) return;
  if (isWord(statement[position], 'if')) {
    if (
      !isWord(statement[position + 1], 'not') ||
      !isWord(statement[position + 2], 'exists')
    )
      throw new Error(`${name}: unsupported CREATE TABLE condition`);
    position += 3;
  }
  const first = statement[position++];
  if (!isIdentifier(first))
    throw new Error(`${name}: missing CREATE TABLE identity`);
  let schema;
  let table = first.value;
  if (isSymbol(statement[position], '.')) {
    schema = first.value;
    const second = statement[++position];
    if (!isIdentifier(second))
      throw new Error(`${name}: missing CREATE TABLE name`);
    table = second.value;
    position++;
  }
  if (!isSymbol(statement[position], '(')) return;
  let depth = 1;
  let columnStart = true;
  let tenant = false;
  for (position++; position < statement.length && depth > 0; position++) {
    const token = statement[position];
    if (depth === 1 && columnStart && isIdentifier(token)) {
      tenant ||= token.value === 'tenant_id';
      columnStart = false;
    }
    if (token.kind !== 'symbol') continue;
    if (token.value === '(') depth++;
    else if (token.value === ')') depth--;
    else if (token.value === ',' && depth === 1) columnStart = true;
  }
  if (depth !== 0)
    throw new Error(`${name}: unterminated CREATE TABLE columns`);
  if (tenant) {
    if (schema === undefined)
      throw new Error(`${name}: tenant table requires an explicit schema`);
    tenantTables.add(identity(schema, table));
  }
}

/** Pure local-source inventory; callers provide the existing named exemptions. */
export function analyzeRlsCoverage(sources, exemptions = []) {
  const tenantTables = new Set();
  const coveredTables = new Set();
  for (const { name, sql } of sources) {
    let statement = [];
    let parentheses = 0;
    for (const token of tokenize(sql, name)) {
      if (isSymbol(token, '(')) parentheses++;
      else if (isSymbol(token, ')')) {
        if (--parentheses < 0)
          throw new Error(`${name}: unmatched closing parenthesis`);
      }
      // Rules may store several semicolon-separated actions in parentheses.
      // They are one statement, not top-level executed SELECTs.
      if (isSymbol(token, ';') && parentheses === 0) {
        inventoryStatement(statement, tenantTables, coveredTables, name);
        statement = [];
      } else statement.push(token);
    }
    if (parentheses !== 0) throw new Error(`${name}: unterminated parentheses`);
    if (statement.length > 0)
      inventoryStatement(statement, tenantTables, coveredTables, name);
  }
  const exempt = new Set(exemptions);
  return {
    tenantTables: [...tenantTables].sort(),
    coveredTables: [...coveredTables].sort(),
    exemptTables: [...tenantTables].filter((table) => exempt.has(table)).sort(),
    missingTables: [...tenantTables]
      .filter((table) => !coveredTables.has(table) && !exempt.has(table))
      .sort(),
  };
}
