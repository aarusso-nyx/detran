declare global {
  interface ImportMeta {
    glob<T>(pattern: string): Record<string, () => Promise<T>>;
  }
}

export async function loadMobileRuntime(
  modulePath: string,
): Promise<Record<string, unknown>> {
  const modules = import.meta.glob<Record<string, unknown>>('../app/**/*.ts');
  const loader = modules[`../app/${modulePath}.ts`];
  if (!loader) {
    throw new Error(`módulo de produção ausente: ${modulePath}`);
  }
  return loader();
}
