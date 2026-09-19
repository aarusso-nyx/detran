// R-0014 TASK-0008 (Inspector, iteração 2 — B5 de reports/TASK-0009.md). jsdom não implementa
// `DataTransfer` (verificado: `typeof DataTransfer === 'undefined'` no ambiente de teste), então
// `new DataTransfer()` usado para simular a seleção de arquivo em
// `<input type="file">` falha. `createFileList` monta um objeto mínimo satisfazendo a interface
// `FileList` (indexável, `length`, `item()`, iterável) sem depender de `DataTransfer` — usado
// via `Object.defineProperty(input, 'files', { value: createFileList([...]) })` (jsdom não
// permite atribuição direta a `HTMLInputElement.files`).
export function createFileList(files: readonly File[]): FileList {
  const list = files as unknown as FileList & {
    item(index: number): File | null;
  };
  Object.defineProperty(list, 'item', {
    value: (index: number) => files[index] ?? null,
    enumerable: false,
  });
  return list;
}
