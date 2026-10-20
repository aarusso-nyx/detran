import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = realpathSync(fileURLToPath(new URL('../../../', import.meta.url)));
const packageSegment = /^[A-Za-z0-9_][A-Za-z0-9_.-]*$/;

function refuse(code, detail) {
  throw new Error(`${code}: ${detail}`);
}

function configFor(parts) {
  if (parts[0] !== 'backend') return null;
  if (parts[1] === 'app' && parts[2] === 'src') {
    return ['backend', 'app', 'tsconfig.json'];
  }
  if (parts[1] !== 'domains') return null;
  if (parts[2] === 'shared' && parts[3] === 'src') {
    return ['backend', 'domains', 'shared', 'tsconfig.json'];
  }
  if (
    packageSegment.test(parts[2] ?? '') &&
    packageSegment.test(parts[3] ?? '') &&
    parts[4] === 'src'
  ) {
    return [...parts.slice(0, 4), 'tsconfig.json'];
  }
  return null;
}

function selectedSource(id) {
  if (typeof id !== 'string' || !path.isAbsolute(id)) return null;
  const lexical = id.split(/[?#]/, 1)[0];
  const segments = lexical.split(path.sep);
  for (let index = 0; index < segments.length; index++) {
    if (segments[index] !== 'backend') continue;
    const parts = segments.slice(index);
    const config = configFor(parts);
    if (config === null) continue;
    const lexicalRoot = segments.slice(0, index).join(path.sep) || path.sep;
    let physicalRoot;
    try {
      physicalRoot = realpathSync(lexicalRoot);
    } catch {
      continue;
    }
    if (physicalRoot !== root) continue;
    if (
      id !== lexical ||
      id !== id.normalize('NFC') ||
      id.includes('\\') ||
      parts.some((part) => part === '' || part === '.' || part === '..')
    ) {
      refuse('NEST_METADATA_SOURCE_ID_REFUSED', id);
    }
    if (
      !lexical.endsWith('.ts') ||
      lexical.endsWith('.d.ts') ||
      /\.(?:test|spec)\.ts$/.test(lexical) ||
      parts.some((part) =>
        ['node_modules', 'test', 'tests', '__tests__'].includes(part),
      )
    ) {
      return null;
    }
    return { parts, config };
  }
  return null;
}

function regularInternalFile(parts) {
  let current = root;
  for (let index = 0; index < parts.length; index++) {
    current = path.join(current, parts[index]);
    let stat;
    try {
      stat = lstatSync(current);
    } catch {
      refuse('NEST_METADATA_PATH_REFUSED', current);
    }
    if (
      stat.isSymbolicLink() ||
      (index === parts.length - 1 ? !stat.isFile() : !stat.isDirectory())
    ) {
      refuse('NEST_METADATA_PATH_REFUSED', current);
    }
  }
  return current;
}

function errors(diagnostics, label) {
  const failures = diagnostics.filter(
    (item) => item.category === ts.DiagnosticCategory.Error,
  );
  if (failures.length > 0) {
    refuse(
      'NEST_METADATA_TYPESCRIPT_REFUSED',
      `${label}: ${failures.map((item) => `${item.code} ${ts.flattenDiagnosticMessageText(item.messageText, ' ')}`).join('; ')}`,
    );
  }
}

function hasDecorators(node) {
  if (ts.canHaveDecorators(node) && (ts.getDecorators(node)?.length ?? 0) > 0)
    return true;
  return ts.forEachChild(node, hasDecorators) === true;
}

export function createNestMetadataPlugin() {
  const configs = new Map();
  function compilerOptions(parts) {
    const filename = regularInternalFile(parts);
    const bytes = readFileSync(filename, 'utf8');
    const digest = createHash('sha256').update(bytes).digest('hex');
    const cached = configs.get(filename);
    if (cached?.digest === digest) return cached.options;
    const parsed = ts.readConfigFile(filename, (requested) => {
      if (requested !== filename)
        refuse('NEST_METADATA_CONFIG_REFUSED', requested);
      return bytes;
    });
    errors(parsed.error === undefined ? [] : [parsed.error], filename);
    if (
      parsed.config === null ||
      typeof parsed.config !== 'object' ||
      Array.isArray(parsed.config) ||
      Object.hasOwn(parsed.config, 'extends') ||
      Object.hasOwn(parsed.config, 'references')
    ) {
      refuse('NEST_METADATA_CONFIG_REFUSED', filename);
    }
    const converted = ts.convertCompilerOptionsFromJson(
      parsed.config.compilerOptions ?? {},
      path.dirname(filename),
      filename,
    );
    errors(converted.errors, filename);
    if (
      converted.options.experimentalDecorators !== true ||
      converted.options.emitDecoratorMetadata !== true
    ) {
      refuse('NEST_METADATA_FLAGS_REQUIRED', filename);
    }
    const options = {
      ...converted.options,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      noEmit: false,
      declaration: false,
      declarationMap: false,
      sourceMap: true,
      inlineSources: true,
    };
    configs.set(filename, { digest, options });
    return options;
  }
  return {
    name: 'detran-ordinary-nest-metadata',
    enforce: 'pre',
    transform(code, id) {
      const selected = selectedSource(id);
      if (selected === null) return null;
      const filename = regularInternalFile(selected.parts);
      const source = ts.createSourceFile(
        filename,
        code,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );
      errors(source.parseDiagnostics ?? [], filename);
      if (!hasDecorators(source)) return null;
      const result = ts.transpileModule(code, {
        fileName: filename,
        compilerOptions: compilerOptions(selected.config),
        reportDiagnostics: true,
      });
      errors(result.diagnostics ?? [], filename);
      if (result.sourceMapText === undefined)
        refuse('NEST_METADATA_SOURCEMAP_REQUIRED', filename);
      return { code: result.outputText, map: JSON.parse(result.sourceMapText) };
    },
  };
}
