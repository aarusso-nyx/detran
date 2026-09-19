// R-0014 TASK-0017 (Inspector). CTG-0003c §3.1/CODESTYLE — C-3c-113 (análise estática de todo o
// par 3: nenhum import de `core/guards`, nenhuma leitura de `navigator.onLine`/`localStorage`,
// nenhum `new Date()`/`Date.now()` — `PortalClock` só no store do par 1). Vive em
// `features/notificacoes/` pelo mesmo motivo de `static-analysis.appeal.spec.ts` (par 2): um
// arquivo de fronteira que varre os oito módulos do par e os sete compartilhados novos. `it.todo`
// só com `OD-*` citada (§8 do contrato: OD-P54, OD-P65, OD-P87, OD-P88, OD-P15, OD-P92, OD-P91).
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FORBIDDEN = [
  'new Date(',
  'Date.now',
  '.getTime(',
  '.setDate(',
  'localStorage',
  'navigator.onLine',
];

const PAIR3_MODULES = [
  'notificacoes',
  'documentos',
  'sinistros',
  'exames',
  'atendimento',
  'privacidade',
  'assinatura',
  'catalogo',
];

const PAIR3_SHARED_FILES = [
  'notification-list.component.ts',
  'sne-consent.component.ts',
  'digital-document-card.component.ts',
  'clearance-status.component.ts',
  'own-data-panel.component.ts',
  'manifestation-form.component.ts',
  'evaluation-form.component.ts',
];

async function collect(root: string): Promise<string[]> {
  // A12(h): os 23 módulos do par 3 já existem (TASK-0018) — um `readdir` que falha aqui é um
  // defeito real (diretório de módulo ausente), não mais o "ainda não existe" do §9; deixa
  // propagar em vez de mascarar com uma lista vazia.
  const out: string[] = [];
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(root, entry.name);
    if (entry.isDirectory()) out.push(...(await collect(full)));
    else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts'))
      out.push(full);
  }
  return out;
}

describe('análise estática — par 3 sem cálculo de data, sem storage local, sem core/guards (C-3c-113)', () => {
  it('dado os arquivos de features/{notificacoes,documentos,sinistros,exames,atendimento,privacidade,assinatura,catalogo}/** e shared/* do par 3 então nenhum contém new Date/Date.now/getTime/setDate/localStorage/navigator.onLine nem importa core/guards', async () => {
    const specDir = dirname(fileURLToPath(import.meta.url));
    const featuresRoot = join(specDir, '..');
    const sharedDir = join(specDir, '..', '..', 'shared');

    const featureFiles: string[] = [];
    for (const module of PAIR3_MODULES) {
      featureFiles.push(...(await collect(join(featuresRoot, module))));
    }
    const sharedFiles = PAIR3_SHARED_FILES.map((name) => join(sharedDir, name));

    // A12(h): todos os 23 módulos e os 7 compartilhados do par 3 já existem (TASK-0018) — a
    // varredura deixou de ser opcional; menos de 1 arquivo encontrado é falha explícita, não mais
    // um `continue` silencioso mascarando cobertura vazia.
    expect(featureFiles.length).toBeGreaterThan(0);

    for (const file of [...featureFiles, ...sharedFiles]) {
      // Falha explícita (sem catch): um `readFile` ausente aqui é um defeito real do par 3.
      const text = await readFile(file, 'utf8');
      for (const token of FORBIDDEN) {
        expect(text.includes(token), `${file} contém ${token}`).toBe(false);
      }
      expect(text, `${file} importa core/guards`).not.toMatch(
        /from ['"].*core\/guards/,
      );
    }
  });
});

describe('it.todo pendentes de OD (§8 do contrato; nunca it.skip)', () => {
  it.todo(
    'OD-P54: bateria crítica / autenticação local do DigitalDocumentCard',
  );
  it.todo('OD-P65: escala de EvaluationForm com rádios (números fixos)');
  it.todo('OD-P87: origem real do If-Match de PUT identity/preferences');
  it.todo('OD-P88: chave pública VAPID real para PushService');
  it.todo('OD-P15: parâmetros reais de retorno do gov.br em T-27');
  it.todo('OD-P92: comando/rota real da entrevista devolutiva (T-20)');
  it.todo(
    'OD-P91: formas livres do par 3 quando fixadas (license, vehicles, clearance, crash.summary, heldDataSummary, documentBytes)',
  );
});
