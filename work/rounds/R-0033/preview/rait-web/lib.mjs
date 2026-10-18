// R-0033 TASK-0005 (Inspector) — biblioteca comum dos scripts de captura/axe/smoke/check do
// roteiro JW-01 do `rait-web`. Sem efeito colateral ao ser importada: só definições.
// Fontes: `work/rounds/R-0033/inventory-rait-web.md` §5.1 (URLs e estados),
// `docs/framework/arch/frontend-preview-mode.md` (parâmetros `pv_estado`/`pv_papel`, marca).
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const HERE = fileURLToPath(new URL('.', import.meta.url));
export const REPO_ROOT = resolve(HERE, '../../../../../');
export const WEB_DIR = join(REPO_ROOT, 'apps/rait/web');
export const DIST_PREVIEW = join(WEB_DIR, 'dist/preview');
export const DEFAULT_OUT = join(HERE, 'captures');

/** Marca da prévia (contrato: `[data-detran-preview-mark="DETRAN_PREVIEW_MARK"]`). */
export const PREVIEW_MARK_SELECTOR =
  '[data-detran-preview-mark="DETRAN_PREVIEW_MARK"]';

/** Estados capturados (C-04); `loading` é coberto por specs, não por captura. */
export const CAPTURE_STATES = ['loaded', 'empty', 'error', 'forbidden'];

/** Larguras × alturas (C-04): 360, 768, 1280. */
export const VIEWPORTS = [
  [360, 800],
  [768, 1024],
  [1280, 800],
];

/** Largura usada pelo axe (C-05). */
export const AXE_WIDTH = 1280;

const ANALYST = 'rait-analyst';
const SECRETARY = 'rait-secretary';
const CASE_06 = '00000000-0000-7000-8000-000010000006';
const CASE_07 = '00000000-0000-7000-8000-000010000007';
const CASE_08 = '00000000-0000-7000-8000-000010000008';
const CASE_09 = '00000000-0000-7000-8000-000010000009';

/**
 * Roteiro da JW-01 (passos 1–8) mais a prova negativa dos antigos passos 9–10
 * (OD-C3-007 a). `passo` é o prefixo do nome do arquivo; `path` não leva query (a query é
 * montada por `previewUrl`). `expectScreen` = a tela deve renderizar (não `/sem-permissao`);
 * `negative: true` = a tela alvo é `/sem-permissao` (prova negativa, só estado `loaded`).
 */
export const ROTEIRO = [
  {
    passo: '01',
    slug: 'painel',
    tela: 'T-01',
    ficha: 'IU-RAIT-002',
    path: '/painel',
    papel: ANALYST,
    estados: CAPTURE_STATES,
  },
  {
    passo: '02',
    slug: 'fila-defesa',
    tela: 'T-02',
    ficha: 'IU-RAIT-004',
    path: '/fila/defesa',
    papel: ANALYST,
    estados: CAPTURE_STATES,
  },
  {
    passo: '03-04',
    slug: 'casos-triagem',
    tela: 'T-03',
    ficha: 'IU-RAIT-008',
    path: `/casos/${CASE_06}/triagem`,
    papel: ANALYST,
    estados: CAPTURE_STATES,
  },
  {
    passo: '05',
    slug: 'casos-dossie',
    tela: 'T-04',
    ficha: 'IU-RAIT-009',
    path: `/casos/${CASE_07}/dossie`,
    papel: ANALYST,
    estados: CAPTURE_STATES,
  },
  {
    passo: '06',
    slug: 'casos-diligencias',
    tela: 'T-05',
    ficha: 'IU-RAIT-010',
    path: `/casos/${CASE_08}/diligencias`,
    papel: ANALYST,
    estados: CAPTURE_STATES,
  },
  {
    passo: '07',
    slug: 'painel-retomar',
    tela: 'T-06',
    ficha: 'IU-RAIT-003',
    path: '/painel/retomar',
    papel: ANALYST,
    estados: CAPTURE_STATES,
  },
  {
    passo: '08',
    slug: 'casos-minuta',
    tela: 'T-07',
    ficha: 'IU-RAIT-011',
    path: `/casos/${CASE_07}/minuta`,
    papel: ANALYST,
    estados: CAPTURE_STATES,
  },
  {
    // Antigos passos 9–10 (fora da JW-01, OD-C3-007 a): a rota de decisão é negada ao analista
    // pelo `roleGuard` e termina em `/sem-permissao?de=…`; 1 captura por largura.
    passo: '09-10',
    slug: 'sem-permissao',
    tela: null,
    ficha: null,
    path: `/casos/${CASE_09}/decisao`,
    papel: ANALYST,
    estados: ['loaded'],
    negative: true,
  },
];

/**
 * Provas negativas por papel (seção "papéis" do roteiro): sem captura PNG; o script confere
 * que a URL final começa por `/sem-permissao` (guardas ativas).
 */
export const NEGATIVAS_PAPEL = [
  { papel: SECRETARY, path: '/fila/defesa' },
  { papel: SECRETARY, path: `/casos/${CASE_07}/minuta` },
];

/** URL relativa de prévia (query `pv_papel` e `pv_estado`). */
export function previewUrl(path, papel, estado) {
  const query = new URLSearchParams({ pv_papel: papel, pv_estado: estado });
  return `${path}?${query.toString()}`;
}

/** Nome determinístico: `<passo>-<slug-da-rota>-<estado>-<largura>.png`. */
export function captureName(entry, estado, width) {
  return `${entry.passo}-${entry.slug}-${estado}-${width}.png`;
}

/** Lista plana de capturas esperadas (tela × estado × largura). */
export function expectedCaptures() {
  const out = [];
  for (const entry of ROTEIRO) {
    for (const estado of entry.estados) {
      for (const [width, height] of VIEWPORTS) {
        out.push({
          entry,
          estado,
          width,
          height,
          url: previewUrl(entry.path, entry.papel, estado),
          file: captureName(entry, estado, width),
        });
      }
    }
  }
  return out;
}

export function expectedCaptureCount() {
  return expectedCaptures().length;
}

const webRequire = () => createRequire(join(WEB_DIR, 'package.json'));

/** Caminho resolvido de `playwright-core` pela árvore de `apps/rait/web` (sem download). */
export function resolvePlaywright() {
  return webRequire().resolve('playwright-core');
}

export function playwrightVersion() {
  return webRequire()('playwright-core/package.json').version;
}

/** Caminho de `axe.min.js` do `axe-core` instalado em `apps/rait/web`. */
export function resolveAxePath() {
  const main = webRequire().resolve('axe-core');
  return join(main.slice(0, main.lastIndexOf(sep)), 'axe.min.js');
}

/** Carrega `chromium` do Playwright instalado (Google Chrome via `channel: 'chrome'`). */
export async function loadChromium() {
  const mod = await import(pathToFileURL(resolvePlaywright()).href);
  return mod.chromium ?? mod.default?.chromium;
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

/**
 * Servidor estático mínimo sobre `dir`, porta efêmera, fallback SPA para `index.html` (só para
 * caminhos sem extensão). Sem proxy e sem rota `/v1`: `/v1/**` responde 404 (a prévia nunca
 * chama `/v1`). Devolve `{ baseUrl, close() }`.
 */
export function startStaticServer(dir) {
  const root = resolve(dir);
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      res.writeHead(400).end();
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405).end();
      return;
    }
    if (pathname === '/v1' || pathname.startsWith('/v1/')) {
      res.writeHead(404).end();
      return;
    }
    let file = normalize(join(root, pathname));
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403).end();
      return;
    }
    if (existsSync(file) && statSync(file).isDirectory()) {
      file = join(file, 'index.html');
    }
    if (!existsSync(file)) {
      if (extname(pathname) !== '') {
        res.writeHead(404).end();
        return;
      }
      file = join(root, 'index.html');
    }
    res.writeHead(200, {
      'content-type': MIME[extname(file)] ?? 'application/octet-stream',
      'cache-control': 'no-store',
    });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    createReadStream(file).pipe(res);
  });
  return new Promise((resolvePromise, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolvePromise({
        baseUrl: `http://127.0.0.1:${port}`,
        close: () =>
          new Promise((done) => {
            server.closeAllConnections?.();
            server.close(() => done());
          }),
      });
    });
  });
}

/**
 * Bootstrap comum de capture/axe: usa `PREVIEW_BASE_URL` ou sobe o servidor estático sobre
 * `dist/preview`. Devolve `{ baseUrl, close }`; lança com mensagem clara se faltar o build.
 */
export async function acquireBaseUrl() {
  const given = process.env.PREVIEW_BASE_URL;
  if (given) {
    return { baseUrl: given.replace(/\/+$/, ''), close: async () => {} };
  }
  if (!existsSync(join(DIST_PREVIEW, 'index.html'))) {
    throw new Error(
      `${DIST_PREVIEW}/index.html não existe: execute \`pnpm --filter @detran/rait-web exec ng build --configuration preview\` antes (ou defina PREVIEW_BASE_URL).`,
    );
  }
  return startStaticServer(DIST_PREVIEW);
}

/**
 * Abre a URL de prévia, espera a marca e a tela. Devolve o caminho final. Espera a marca
 * `[data-detran-preview-mark]` e então `[data-screen]` (quando a página o expõe) ou o cabeçalho
 * da página (`h1`) / `[role=alert]` / `[role=status]`; `/sem-permissao` não tem `data-screen`.
 */
export async function openPreview(page, baseUrl, relativeUrl) {
  await page.goto(`${baseUrl}${relativeUrl}`, { waitUntil: 'load' });
  await page.waitForSelector(PREVIEW_MARK_SELECTOR, { timeout: 30000 });
  await page.waitForSelector(
    '[data-screen], h1, [role="alert"], [role="status"]',
    { timeout: 30000 },
  );
  await page.waitForLoadState('networkidle').catch(() => {});
  return new URL(page.url()).pathname;
}

/** Ouvintes de violação de contrato: requisição a `/v1/` e `console.error`. */
export function watchViolations(page, sink) {
  page.on('request', (request) => {
    if (request.url().includes('/v1/')) {
      sink.push(`requisição a /v1/: ${request.method()} ${request.url()}`);
    }
  });
  page.on('console', (message) => {
    if (message.type() === 'error') {
      sink.push(`console.error: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => {
    sink.push(`pageerror: ${error.message}`);
  });
}
