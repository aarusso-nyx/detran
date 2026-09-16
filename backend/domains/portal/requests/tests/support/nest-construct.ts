// Constrói um provider `@Injectable()` manuscrito do Portal fora do Nest,
// resolvendo os parâmetros do construtor pelos metadados que o próprio
// decorador emite (`design:paramtypes`, `self:paramtypes` para `@Inject(token)`
// e `optional:paramtypes`) — os specs `unit` não dependem da ORDEM em que o
// Engineer declara as dependências (R-0009 CTG-0002 §14 fixa os símbolos, não
// as assinaturas). Cada dependência é resolvida pelo NOME da classe ou pela
// `description` do `Symbol` do token; ausência lança com a lista do que o
// spec precisa oferecer.
//
// `Reflect.getMetadata` chega pelo `reflect-metadata` que `@nestjs/common`
// carrega ao ser importado (os módulos sob teste o importam); este arquivo
// não importa nada do Nest.

type Constructor<T> = new (...args: never[]) => T;

interface ReflectWithMetadata {
  getMetadata?(key: string, target: object): unknown;
}

function metadata(key: string, target: object): unknown {
  const reflect = (globalThis as { Reflect?: ReflectWithMetadata }).Reflect;
  return reflect?.getMetadata?.(key, target);
}

function tokenName(token: unknown): string {
  if (typeof token === 'function') return token.name;
  if (typeof token === 'symbol') return token.description ?? token.toString();
  return String(token);
}

/** Nomes (classe ou `Symbol.description`) das dependências do construtor. */
export function constructorDependencies(target: object): Array<{
  index: number;
  name: string;
  optional: boolean;
}> {
  const paramTypes =
    (metadata('design:paramtypes', target) as unknown[] | undefined) ?? [];
  const selfTypes =
    (metadata('self:paramtypes', target) as
      Array<{ index: number; param: unknown }> | undefined) ?? [];
  const optional =
    (metadata('optional:paramtypes', target) as number[] | undefined) ?? [];
  const count = Math.max(
    paramTypes.length,
    ...selfTypes.map((entry) => entry.index + 1),
  );
  const dependencies: Array<{
    index: number;
    name: string;
    optional: boolean;
  }> = [];
  for (let index = 0; index < count; index += 1) {
    const explicit = selfTypes.find((entry) => entry.index === index);
    const token = explicit ? explicit.param : paramTypes[index];
    dependencies.push({
      index,
      name: tokenName(token),
      optional: optional.includes(index),
    });
  }
  return dependencies;
}

/**
 * `new Target(...deps)` com `providers[nome]` por parâmetro. Um provider pode
 * ser oferecido sob vários nomes (ex.: a mesma fake sob `PortalIdentityService`
 * e `PORTAL_IDENTITY`). Parâmetros `@Optional()` ausentes recebem `undefined`.
 */
export function constructInjectable<T>(
  Target: Constructor<T>,
  providers: Record<string, unknown>,
  label = Target.name,
): T {
  const dependencies = constructorDependencies(Target);
  const args = dependencies.map((dependency) => {
    if (dependency.name in providers) return providers[dependency.name];
    if (dependency.optional) return undefined;
    throw new Error(
      `${label}: o construtor pede '${dependency.name}' (posição ${dependency.index}); ` +
        `o spec oferece [${Object.keys(providers).join(', ')}]. ` +
        'Dependências lidas dos metadados: ' +
        dependencies.map((entry) => entry.name).join(', '),
    );
  });
  return new Target(...(args as never[]));
}
