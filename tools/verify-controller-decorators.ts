import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const scanRoots = [
  path.join(root, 'backend', 'app', 'src'),
  path.join(root, 'backend', 'domains'),
];
const routeDecorators = new Set([
  'All',
  'Delete',
  'Get',
  'Head',
  'Options',
  'Patch',
  'Post',
  'Put',
]);
const mutatingDecorators = new Set(['Delete', 'Patch', 'Post', 'Put']);

function filesBelow(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return filesBelow(target);
    return entry.isFile() &&
      entry.name.endsWith('.controller.ts') &&
      !entry.name.includes('.spec.')
      ? [target]
      : [];
  });
}

function decorators(node: ts.Node): readonly ts.Decorator[] {
  return ts.canHaveDecorators(node) ? (ts.getDecorators(node) ?? []) : [];
}

function decoratorName(decorator: ts.Decorator): string | undefined {
  const expression = decorator.expression;
  const callee = ts.isCallExpression(expression)
    ? expression.expression
    : expression;
  if (ts.isIdentifier(callee)) return callee.text;
  return ts.isPropertyAccessExpression(callee) ? callee.name.text : undefined;
}

function has(items: readonly ts.Decorator[], name: string): boolean {
  return items.some((item) => decoratorName(item) === name);
}

function validAudit(items: readonly ts.Decorator[]): boolean {
  const audit = items.find((item) => decoratorName(item) === 'Audit');
  if (!audit || !ts.isCallExpression(audit.expression)) return false;
  const argument = audit.expression.arguments[0];
  if (!argument || !ts.isObjectLiteralExpression(argument)) return false;
  const keys = new Set(
    argument.properties.flatMap((property) => {
      if (!ts.isPropertyAssignment(property)) return [];
      const name = property.name;
      return ts.isIdentifier(name) || ts.isStringLiteral(name)
        ? [name.text]
        : [];
    }),
  );
  return keys.has('action') && keys.has('entity');
}

const failures: string[] = [];
let handlers = 0;
for (const file of scanRoots.flatMap(filesBelow).sort()) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  source.forEachChild((node) => {
    if (!ts.isClassDeclaration(node) || !has(decorators(node), 'Controller'))
      return;
    const classDecorators = decorators(node);
    const classPublic = has(classDecorators, 'Public');
    const classResource = has(classDecorators, 'Resource');
    for (const member of node.members) {
      if (!ts.isMethodDeclaration(member)) continue;
      const methodDecorators = decorators(member);
      const route = methodDecorators
        .map(decoratorName)
        .find((name) => name && routeDecorators.has(name));
      if (!route) continue;
      handlers += 1;
      const methodName = member.name.getText(source);
      const line =
        source.getLineAndCharacterOfPosition(member.name.getStart(source))
          .line + 1;
      const location = `${path.relative(root, file)}:${line} ${node.name?.text ?? '<anonymous>'}.${methodName}`;
      const isPublic = classPublic || has(methodDecorators, 'Public');
      if (!isPublic && !(classResource || has(methodDecorators, 'Resource'))) {
        failures.push(
          `${location}: protected route lacks @Resource('domain:resource')`,
        );
      }
      if (!isPublic && !has(methodDecorators, 'Action')) {
        failures.push(
          `${location}: protected route lacks method-level @Action(...)`,
        );
      }
      if (mutatingDecorators.has(route) && !validAudit(methodDecorators)) {
        failures.push(
          `${location}: mutating @${route} route lacks @Audit({ action, entity })`,
        );
      }
    }
  });
}

if (failures.length > 0) {
  console.error('Controller decorator violations:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(
    `verify-controller-decorators: OK (${handlers} handlers scanned)`,
  );
}
