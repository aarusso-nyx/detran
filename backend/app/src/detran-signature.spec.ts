import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { expect, it } from 'vitest';

// Source-only signature seam proof. No STYNX SDK import, DB, provider or trust admission.
const root = path.resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const modulePath = 'backend/app/src/detran-signature.ts';
const runtimePath =
  'backend/domains/shared/src/documents/signature-trust-runtime.ts';
const storePath =
  'backend/domains/shared/src/documents/signed-document-store.ts';
function source(p: string) {
  expect(
    existsSync(path.join(root, p)),
    `Required production seam absent: ${p}`,
  ).toBe(true);
  return readFileSync(path.join(root, p), 'utf8');
}
function ast(p: string) {
  return ts.createSourceFile(
    p,
    source(p),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
}
function walk(node: ts.Node, visit: (node: ts.Node) => void) {
  visit(node);
  node.forEachChild((n) => walk(n, visit));
}
function calls(p: string) {
  const f = ast(p),
    result: string[] = [];
  walk(f, (n) => {
    if (ts.isCallExpression(n)) result.push(n.expression.getText(f));
  });
  return result;
}
function imported(p: string) {
  return ast(p)
    .statements.filter(ts.isImportDeclaration)
    .flatMap((n) =>
      n.importClause?.namedBindings &&
      ts.isNamedImports(n.importClause.namedBindings)
        ? n.importClause.namedBindings.elements.map((x) => ({
            name: x.propertyName?.text ?? x.name.text,
            from: (n.moduleSpecifier as ts.StringLiteral).text,
          }))
        : [],
    );
}
it('signature composition calls the genuine public module and verifier factory once', () => {
  const c = calls(modulePath);
  expect(c.filter((x) => x === 'StynxSignatureModule.forRoot')).toHaveLength(1);
  expect(c.filter((x) => x === 'createCmsTrustVerifier')).toHaveLength(1);
  const i = imported(modulePath);
  for (const name of [
    'StynxSignatureModule',
    'SignatureService',
    'SignatureManifestService',
    'SignatureWithdrawalVerifier',
    'createCmsTrustVerifier',
  ])
    expect(i).toContainEqual({ name, from: '@stynx-nyx/signature' });
});
it('global signature composition resolves existing storage without mounting another client', () => {
  const text = source(modulePath);
  expect(text).toMatch(/@Global\s*\(/u);
  expect(calls(modulePath)).not.toContain('StynxStorageModule.forRoot');
  expect(imported(storePath)).toContainEqual({
    name: 'S3Service',
    from: '@stynx-nyx/storage',
  });
});
it('document verifier keeps five optional class-token dependencies in contract order', () => {
  const file = ast(
    'backend/domains/shared/src/documents/document-trust.http-adapter.ts',
  );
  const declaration = file.statements.find(
    (n) =>
      ts.isClassDeclaration(n) && n.name?.text === 'DocumentTrustHttpAdapter',
  ) as ts.ClassDeclaration;
  expect(declaration).toBeDefined();
  const constructor = declaration.members.find(ts.isConstructorDeclaration);
  expect(
    constructor,
    'No-arg-compatible DI constructor is required',
  ).toBeDefined();
  expect(constructor!.parameters).toHaveLength(5);
  const tokens = [
    'SignatureService',
    'SignatureManifestService',
    'SignatureWithdrawalVerifier',
    'SignedDocumentStore',
    'SignatureTrustRuntime',
  ];
  constructor!.parameters.forEach((p, i) => {
    expect(
      p.questionToken || p.initializer,
      'Old positional/no-arg construction stays valid',
    ).toBeTruthy();
    const decorators = (ts.getDecorators(p) ?? []).map((d) =>
      d.expression.getText(file),
    );
    expect(decorators).toContain('Optional()');
    expect(decorators).toContain(`Inject(${tokens[i]})`);
  });
});
it('shared barrel exports the runtime and document store class identities', () => {
  const file = ast('backend/domains/shared/src/documents/index.ts');
  const modules = file.statements
    .filter(ts.isExportDeclaration)
    .map((n) =>
      n.moduleSpecifier && ts.isStringLiteral(n.moduleSpecifier)
        ? n.moduleSpecifier.text
        : '',
    );
  expect(modules).toContain('./signature-trust-runtime.js');
  expect(modules).toContain('./signed-document-store.js');
});
it('AppModule imports the dedicated signature composition instead of a runtime-local factory', () => {
  const imports = ast('backend/app/src/app.module.ts')
    .statements.filter(ts.isImportDeclaration)
    .map((n) => (n.moduleSpecifier as ts.StringLiteral).text);
  expect(imports).toContain('./detran-signature.js');
  expect(calls('backend/app/src/detran-runtime.ts')).not.toContain(
    'createCmsTrustVerifier',
  );
});
it('trust runtime queries the actual policy vocabulary without nonexistent profile columns', () => {
  const file = ast(runtimePath),
    parts: string[] = [];
  walk(file, (n) => {
    if (
      ts.isStringLiteralLike(n) ||
      ts.isTemplateHead(n) ||
      ts.isTemplateMiddle(n) ||
      ts.isTemplateTail(n)
    )
      parts.push(n.text);
  });
  const literals = parts.join('\n');
  for (const column of [
    'id',
    'tenant_id',
    'traffic_agency_id',
    'document_kind',
    'status',
    'revision',
    'valid_from',
    'valid_to',
    'minimum_signature_level',
    'pades_level',
    'tsa_required',
    'require_lta',
    'revocation',
    'at_time',
    'accepted_policies',
    'trust_anchors_pem',
    'source_ref',
    'approved_by',
    'approved_at',
  ])
    expect(literals).toMatch(new RegExp(`\\b${column}\\b`, 'u'));
  expect(literals).not.toMatch(/\b(?:trust_profile_id|qualified_policies)\b/u);
});
it('trust runtime depends on public database/context and has no inverse store dependency', () => {
  const i = imported(runtimePath);
  expect(i).toContainEqual({ name: 'Database', from: '@stynx-nyx/data' });
  expect(i).toContainEqual({ name: 'RequestContext', from: '@stynx-nyx/core' });
  expect(i.some((x) => x.name === 'SignedDocumentStore')).toBe(false);
});
it('document store uses permitted S3 operations and no destructive compensation methods', () => {
  const c = calls(storePath);
  for (const name of [
    'presignUpload',
    'headObject',
    'presignDownloadForTenant',
  ])
    expect(c.some((x) => x.endsWith('.' + name))).toBe(true);
  for (const name of [
    'delete',
    'deleteObject',
    'deleteAllVersions',
    'softRemove',
    'restore',
    'hardRemove',
  ])
    expect(c.some((x) => x.endsWith('.' + name))).toBe(false);
  expect(imported(storePath).some((x) => x.name === 'DocumentsService')).toBe(
    false,
  );
});
it('signature seams import platform capabilities only through public roots', () => {
  for (const p of [modulePath, runtimePath, storePath]) {
    for (const statement of ast(p).statements.filter(ts.isImportDeclaration)) {
      const name = (statement.moduleSpecifier as ts.StringLiteral).text;
      if (name.startsWith('@stynx-nyx/'))
        expect(name).toMatch(/^@stynx-nyx\/(signature|storage|data|core)$/u);
      expect(name).not.toMatch(/(?:pkijs|asn1js|\/dist\/)/u);
    }
  }
});
it('signature composition does not seed fixture trust anchors or module-wide profiles', () => {
  const file = ast(modulePath);
  let checked = 0;
  walk(file, (n) => {
    if (ts.isPropertyAssignment(n))
      expect(n.name.getText(file)).not.toMatch(
        /^['"]?(?:trustProfiles?|consumerOwnedVerifier)['"]?$/u,
      );
    if (
      !ts.isCallExpression(n) ||
      n.expression.getText(file) !== 'StynxSignatureModule.forRoot'
    )
      return;
    expect(n.arguments).toHaveLength(1);
    checked++;
  });
  expect(checked).toBe(1);
  expect(source(modulePath)).not.toMatch(/-----BEGIN CERTIFICATE-----/u);
});
