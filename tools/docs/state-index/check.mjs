#!/usr/bin/env node
// R-0018 TASK-0003 (Engineer, Art. 6). CTG-0001 §6, §7: gate `verify:state-index`. Node ESM sem
// dependências. Ver CTG-0001 para a especificação completa (regra de classificação §2, mapa de
// renumeração §3, interface de CLI §6.2, leitura dos índices §6.5, critérios C-01-01…C-01-27).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

class UsageError extends Error {}

// ---------------------------------------------------------------------------
// classifyStatus (CTG-0001 §2.2)
// ---------------------------------------------------------------------------

function firstStatusLine(text) {
  const lines = text.split('\n').map((l) => l.replace(/\r$/, ''));
  const idx = lines.findIndex((l) => l.trim() === '## Status');
  if (idx === -1) return null;
  for (let i = idx + 1; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t !== '') return { raw: t };
  }
  return null;
}

function stripBoldPrefix(s) {
  if (s.startsWith('**')) {
    const close = s.indexOf('**', 2);
    if (close !== -1) return s.slice(2, close) + s.slice(close + 2);
    return s.slice(2);
  }
  return s;
}

function mapKeyword(word) {
  if (word === 'Accepted' || word === 'Aceita') return 'Accepted';
  if (word === 'Proposed' || word === 'Proposta') return 'Proposed';
  return 'Superseded';
}

const KEYWORD_RE =
  /^(Accepted|Aceita|Proposed|Proposta|Superseded|Substituída)(?=$|[\s.,;:(])/;
const RENUMBERED_RE = /^Renumerada para \[ADR-\d{4}\]\(/;
const STUB_LINE_RE = /^Renumerada para \[(ADR-\d{4})\]\(([^)\s]+)\)\.$/;

export function classifyStatus(text, relPath, exceptions = {}) {
  let matched = null;
  const status = firstStatusLine(text);
  if (status) {
    const first = stripBoldPrefix(status.raw);
    if (RENUMBERED_RE.test(first)) {
      matched = 'Renumbered';
    } else {
      const m = KEYWORD_RE.exec(first);
      if (m) matched = mapKeyword(m[1]);
    }
  } else {
    const lines = text.split('\n');
    for (const line of lines) {
      const m = /^- Status:\s*(\S+)/.exec(line.trim());
      if (m) {
        const val = m[1].replace(/[.,;:!?]+$/, '');
        const mk =
          /^(Accepted|Aceita|Proposed|Proposta|Superseded|Substituída)$/.exec(
            val,
          );
        if (mk) matched = mapKeyword(mk[1]);
        break;
      }
    }
  }
  if (matched) return matched;
  if (Object.prototype.hasOwnProperty.call(exceptions, relPath)) {
    return exceptions[relPath];
  }
  return null;
}

function parseStubLine(text) {
  const status = firstStatusLine(text);
  if (!status) return null;
  const first = stripBoldPrefix(status.raw);
  const m = STUB_LINE_RE.exec(first);
  if (!m) return null;
  return { newId: m[1], linkTarget: m[2] };
}

function headingLinesBeyondAllowed(text) {
  const lines = text.split('\n');
  const violations = [];
  for (let i = 1; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t === '## Status') continue;
    if (t.startsWith('#')) violations.push(i);
  }
  return violations;
}

// ---------------------------------------------------------------------------
// Markdown table parsing (CTG-0001 §6.5)
// ---------------------------------------------------------------------------

function splitRow(raw) {
  const trimmed = raw.trim();
  const inner = trimmed.replace(/^\|/, '').replace(/\|$/, '');
  return inner.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));
}

function isSeparatorRow(cells) {
  return cells.length > 0 && cells.every((c) => /^:?-+:?$/.test(c.trim()));
}

function splitBlocks(lines) {
  const blocks = [];
  let cur = [];
  let curStart = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '') {
      if (cur.length) {
        blocks.push({ start: curStart, lines: cur });
        cur = [];
      }
    } else {
      if (cur.length === 0) curStart = i;
      cur.push(lines[i]);
    }
  }
  if (cur.length) blocks.push({ start: curStart, lines: cur });
  return blocks;
}

// Tabelas = blocos de linhas que começam com `|`. Um bloco "órfão" (só linhas de dados, sem
// cabeçalho+separador próprios) que aparece logo após um bloco de tabela válida (separados só por
// linhas em branco) é tratado como continuação da mesma tabela — algumas fixtures inserem linhas
// novas separadas por uma linha em branco do cabeçalho da tabela original.
function extractTables(text) {
  const lines = text.split('\n');
  const blocks = splitBlocks(lines);
  const tables = [];
  let pendingTable = null;
  for (const block of blocks) {
    const allPipe = block.lines.every((l) => l.trim().startsWith('|'));
    if (!allPipe) {
      pendingTable = null;
      continue;
    }
    const header = splitRow(block.lines[0]);
    const isHeaderBlock =
      block.lines.length >= 2 && isSeparatorRow(splitRow(block.lines[1]));
    if (isHeaderBlock) {
      const dataRows = [];
      for (let k = 2; k < block.lines.length; k++) {
        dataRows.push({
          line: block.start + k + 1,
          cells: splitRow(block.lines[k]),
        });
      }
      pendingTable = { header, headerLine: block.start + 1, dataRows };
      tables.push(pendingTable);
    } else if (pendingTable) {
      for (let k = 0; k < block.lines.length; k++) {
        pendingTable.dataRows.push({
          line: block.start + k + 1,
          cells: splitRow(block.lines[k]),
        });
      }
    } else {
      pendingTable = null;
    }
  }
  return tables;
}

function sameHeader(a, b) {
  return a.length === b.length && a.every((c, idx) => c === b[idx]);
}

function findTables(text, header) {
  return extractTables(text).filter((t) => sameHeader(t.header, header));
}

function allRows(tables) {
  return tables.flatMap((t) => t.dataRows);
}

function extractFirstLink(cell) {
  const m = /\[([^\]]*)\]\(([^)]+)\)/.exec(cell);
  if (!m) return null;
  return { text: m[1], target: m[2].split('#')[0] };
}

function resolveLink(indexRelPath, target) {
  return path.posix.normalize(
    path.posix.join(path.posix.dirname(indexRelPath), target),
  );
}

function citesFile(cell, indexRelPath, targetRelPath) {
  const link = extractFirstLink(cell);
  if (link) {
    const resolved = resolveLink(indexRelPath, link.target);
    if (resolved === targetRelPath) return true;
    // Tolerância para citações da série `law/adr` cujo link relativo sobe menos níveis do que o
    // necessário a partir do diretório do índice (a citação ainda é inequívoca por caminho): aceita
    // quando o alvo, com os prefixos `../`/`./` removidos, bate literalmente com o arquivo citado.
    const stripped = link.target.replace(/^(\.\.\/|\.\/)+/, '');
    if (stripped === targetRelPath) return true;
  }
  const tickRe = /`([^`]+)`/g;
  let m;
  while ((m = tickRe.exec(cell))) {
    if (m[1] === targetRelPath) return true;
  }
  return false;
}

// CTG-0001 §6.5: uma célula cita um arquivo por link Markdown ou, para `law/adr` (que não é
// publicado no site), por caminho entre crases. Usado onde o gate precisa não só saber que a
// célula cita o arquivo (`citesFile`), mas também extrair o id exibido e o caminho resolvido —
// verificações de id exibido (C-01-09), duplicação (C-01-10) e status (C-01-15/16) precisam
// reconhecer as duas formas, não só o link.
function extractCitation(cell, indexRelPath) {
  const link = extractFirstLink(cell);
  if (link) {
    return {
      displayText: link.text,
      resolved: resolveLink(indexRelPath, link.target),
    };
  }
  const tickMatch = /`([^`]+)`/.exec(cell);
  if (!tickMatch) return null;
  const resolved = tickMatch[1].trim();
  const before = cell.slice(0, tickMatch.index);
  const idMatch = /(LAW-ADR-\d{4}|ADR-\d{4})/.exec(before);
  const displayText = idMatch ? idMatch[1] : before.trim();
  return { displayText, resolved };
}

// ---------------------------------------------------------------------------
// checkStateIndex (CTG-0001 §6.6)
// ---------------------------------------------------------------------------

const NAME_RE = /^ADR-(\d{4})-[a-z0-9][a-z0-9-]*\.md$/;
const VALID_STATUSES = ['Accepted', 'Proposed', 'Superseded'];

function readMdFiles(root, dirRel) {
  const dirAbs = path.join(root, dirRel);
  if (!fs.existsSync(dirAbs)) return [];
  return fs
    .readdirSync(dirAbs)
    .filter((name) => name.endsWith('.md') && name !== 'README.md')
    .map((name) => {
      const relPath = `${dirRel}${name}`;
      const text = fs.readFileSync(path.join(dirAbs, name), 'utf8');
      return {
        relPath,
        dirRel: dirRel.replace(/\/$/, ''),
        fileName: name,
        text,
      };
    });
}

function idFromFileName(name) {
  const m = /^ADR-(\d{4})-/.exec(name);
  return m ? m[1] : null;
}

export function checkStateIndex({ root, config }) {
  const findings = [];
  const exceptions = config.statusExceptions ?? {};

  if (!fs.existsSync(path.join(root, 'docs/meta/adr'))) {
    throw new UsageError('docs/meta/adr/ ausente');
  }
  if (!fs.existsSync(path.join(root, 'work/rounds/README.md'))) {
    throw new UsageError('work/rounds/README.md ausente');
  }
  if (!fs.existsSync(path.join(root, 'package.json'))) {
    throw new UsageError('package.json ausente');
  }

  const rawDocsFiles = readMdFiles(root, 'docs/meta/adr/');
  const rawLawFiles = readMdFiles(root, 'law/adr/');
  const allAdrFiles = [...rawDocsFiles, ...rawLawFiles];
  const filesByRelPath = new Map(allAdrFiles.map((f) => [f.relPath, f]));

  for (const f of allAdrFiles) {
    f.class0 = classifyStatus(f.text, f.relPath, {});
    f.classFinal = classifyStatus(f.text, f.relPath, exceptions);
    f.id = idFromFileName(f.fileName);
    if (f.classFinal === null) {
      findings.push({
        id: 'C-01-13',
        file: f.relPath,
        message:
          'status não classificável (sem palavra-chave, sem "- Status:", sem exceção)',
      });
    }
    if (
      f.class0 !== null &&
      Object.prototype.hasOwnProperty.call(exceptions, f.relPath)
    ) {
      findings.push({
        id: 'C-01-14',
        file: f.relPath,
        message: 'exceção obsoleta: arquivo classificável pelos passos 2-3',
      });
    }
  }
  for (const exRelPath of Object.keys(exceptions)) {
    if (!filesByRelPath.has(exRelPath)) {
      findings.push({
        id: 'C-01-14',
        file: exRelPath,
        message: 'exceção obsoleta: arquivo inexistente',
      });
    }
  }

  // ---- (a) filenames, duplicates, stubs -----------------------------------

  const namedDocsAdrFiles = [];
  for (const f of rawDocsFiles) {
    if (!NAME_RE.test(f.fileName)) {
      findings.push({
        id: 'C-01-06',
        file: f.relPath,
        message: 'nome de arquivo fora de ^ADR-\\d{4}-[a-z0-9][a-z0-9-]*\\.md$',
      });
      continue;
    }
    namedDocsAdrFiles.push(f);
  }

  const idGroups = new Map();
  for (const f of namedDocsAdrFiles) {
    if (!idGroups.has(f.id)) idGroups.set(f.id, []);
    idGroups.get(f.id).push(f);
  }
  for (const [id, files] of idGroups) {
    if (files.length < 2) continue;
    const nonStubs = files.filter((f) => f.classFinal !== 'Renumbered');
    if (nonStubs.length !== 1) {
      const rep = [...files].map((f) => f.relPath).sort()[0];
      findings.push({
        id: 'C-01-01',
        file: rep,
        message: `número ADR-${id} com ${files.length} arquivo(s), ${nonStubs.length} não-stub`,
      });
    }
  }

  function validateStub(file) {
    const stubLine = parseStubLine(file.text);
    if (!stubLine) return { valid: false, reason: 'formato inválido' };
    const { newId, linkTarget } = stubLine;
    const resolvedTarget = resolveLink(file.relPath, linkTarget);
    const targetFile = filesByRelPath.get(resolvedTarget);
    if (!targetFile) {
      return {
        valid: false,
        reason: 'alvo ausente',
        targetRelPath: resolvedTarget,
      };
    }
    if (!resolvedTarget.startsWith('docs/meta/adr/')) {
      return {
        valid: false,
        reason: 'alvo fora de docs/meta/adr',
        targetRelPath: resolvedTarget,
      };
    }
    const targetName = path.posix.basename(resolvedTarget);
    if (!targetName.startsWith(`${newId}-`) && targetName !== `${newId}.md`) {
      return {
        valid: false,
        reason: 'alvo com id diferente do declarado',
        targetRelPath: resolvedTarget,
      };
    }
    const inLawAdr = file.dirRel === 'law/adr';
    if (!inLawAdr && file.id && newId === `ADR-${file.id}`) {
      return {
        valid: false,
        reason: 'id capturado igual ao próprio número, fora de law/adr',
        targetRelPath: resolvedTarget,
      };
    }
    const targetClass = classifyStatus(targetFile.text, targetFile.relPath, {});
    if (targetClass === 'Renumbered') {
      return {
        valid: false,
        reason: 'alvo é redirecionamento',
        targetRelPath: resolvedTarget,
      };
    }
    return { valid: true, newId, targetRelPath: resolvedTarget };
  }

  const validStubs = [];
  const lawValidStubs = [];
  for (const f of allAdrFiles) {
    if (f.classFinal !== 'Renumbered') continue;
    const result = validateStub(f);
    if (!result.valid) {
      findings.push({
        id: 'C-01-02',
        file: f.relPath,
        message: `stub inválido: ${result.reason}`,
      });
    }
    const headingViolations = headingLinesBeyondAllowed(f.text);
    if (headingViolations.length) {
      findings.push({
        id: 'C-01-03',
        file: f.relPath,
        message: 'stub com conteúdo normativo além do H1 e de "## Status"',
      });
    }
    if (result.valid) {
      const target = filesByRelPath.get(result.targetRelPath);
      const lines = target.text.split('\n');
      const expectedPrefix = `> **Proveniência.** Renumerada de \`${f.relPath}\``;
      if (!(lines[2] && lines[2].startsWith(expectedPrefix))) {
        findings.push({
          id: 'C-01-04',
          file: result.targetRelPath,
          message: 'arquivo novo sem nota de proveniência na 3ª linha',
        });
      }
      if (f.dirRel === 'docs/meta/adr') {
        validStubs.push({
          stubRelPath: f.relPath,
          targetRelPath: result.targetRelPath,
        });
      } else if (f.dirRel === 'law/adr') {
        lawValidStubs.push({
          stubRelPath: f.relPath,
          targetRelPath: result.targetRelPath,
        });
      }
    }
  }

  // ---- §Aliases (C-01-05) ---------------------------------------------------

  const adrReadmeRel = 'docs/meta/adr/README.md';
  const adrReadmeText = fs.existsSync(path.join(root, adrReadmeRel))
    ? fs.readFileSync(path.join(root, adrReadmeRel), 'utf8')
    : '';
  const aliasTables = findTables(adrReadmeText, [
    'Número antigo',
    'Redirecionamento',
    'Número novo',
    'Arquivo novo',
  ]);
  const aliasRows = allRows(aliasTables);

  // Id esperado numa célula de §Aliases (col. 1 = número antigo, col. 3 = número novo): `ADR-nnnn`,
  // ou `LAW-ADR-nnnn` para um stub de `law/adr` (§3.4, linha "Linha adicional só na opção (a)").
  function expectedAliasId(file) {
    return file.dirRel === 'law/adr' ? `LAW-ADR-${file.id}` : `ADR-${file.id}`;
  }

  // Valida todas as linhas de §Aliases que citam (col. 2) o stub: exatamente uma linha por stub
  // (§3.4); em cada linha, col. 1 = id do stub, col. 3 = id do alvo e col. 4 cita o alvo do stub.
  function checkAliasRowsForStub(stubRelPath, targetRelPath, findingId) {
    const rows = aliasRows.filter((r) =>
      citesFile(r.cells[1] ?? '', adrReadmeRel, stubRelPath),
    );
    if (rows.length === 0) {
      findings.push({
        id: findingId,
        file: adrReadmeRel,
        message: `§Aliases sem linha para ${stubRelPath}`,
      });
      return;
    }
    if (rows.length > 1) {
      findings.push({
        id: findingId,
        file: adrReadmeRel,
        line: rows[1].line,
        message: `§Aliases com ${rows.length} linhas para ${stubRelPath} (exige exatamente uma; linhas ${rows.map((r) => r.line).join(', ')})`,
      });
    }
    const expectedCol1 = expectedAliasId(filesByRelPath.get(stubRelPath));
    const expectedCol3 = expectedAliasId(filesByRelPath.get(targetRelPath));
    for (const row of rows) {
      const col1 = (row.cells[0] ?? '').trim();
      const col3 = (row.cells[2] ?? '').trim();
      if (col1 !== expectedCol1) {
        findings.push({
          id: findingId,
          file: adrReadmeRel,
          line: row.line,
          message: `§Aliases coluna "Número antigo" (${col1}) diverge do stub (${expectedCol1})`,
        });
      }
      if (col3 !== expectedCol3) {
        findings.push({
          id: findingId,
          file: adrReadmeRel,
          line: row.line,
          message: `§Aliases coluna "Número novo" (${col3}) diverge do alvo (${expectedCol3})`,
        });
      }
      if (!citesFile(row.cells[3] ?? '', adrReadmeRel, targetRelPath)) {
        findings.push({
          id: findingId,
          file: adrReadmeRel,
          line: row.line,
          message: `§Aliases com alvo divergente para ${stubRelPath}`,
        });
      }
    }
  }

  for (const stub of validStubs) {
    checkAliasRowsForStub(stub.stubRelPath, stub.targetRelPath, 'C-01-05');
  }

  // Linha de §Aliases que não corresponde (col. 2) a nenhum stub válido conhecido (de
  // `docs/meta/adr` ou de `law/adr`) é obsoleta ou inválida.
  const allValidStubsForAliases = [...validStubs, ...lawValidStubs];
  for (const row of aliasRows) {
    const matchesValidStub = allValidStubsForAliases.some((s) =>
      citesFile(row.cells[1] ?? '', adrReadmeRel, s.stubRelPath),
    );
    if (!matchesValidStub) {
      findings.push({
        id: 'C-01-05',
        file: adrReadmeRel,
        line: row.line,
        message: 'linha de §Aliases sem stub válido correspondente',
      });
    }
  }

  // ---- (b) presença nos índices --------------------------------------------

  const designDecisionsRel = 'DESIGN-DECISIONS.md';
  const designDecisionsText = fs.existsSync(path.join(root, designDecisionsRel))
    ? fs.readFileSync(path.join(root, designDecisionsRel), 'utf8')
    : '';
  const designIndexTables = findTables(designDecisionsText, [
    'ADR',
    'Decisão',
    'Status',
    'Vigência',
  ]);
  const designIndexRows = allRows(designIndexTables);

  const adrReadmeIndexTables = findTables(adrReadmeText, [
    'ADR',
    'Título',
    'Status',
    'Vigência',
  ]);
  const adrReadmeIndexRows = allRows(adrReadmeIndexTables);

  // CTG-0001 §6.5: uma linha da série `law/adr` é reconhecida pela citação entre crases da
  // primeira célula, não pelo cabeçalho da tabela onde o parser de blocos a colocou (o próprio
  // `docs/meta/adr/README.md` real tem uma tabela "Série `law/adr`" com o mesmo cabeçalho
  // ADR|Título|Status|Vigência da tabela principal, capturada por `findTables`/`sameHeader`; mas
  // uma linha isolada — sem cabeçalho+separador próprios no mesmo bloco — pode acabar dentro do
  // bloco da tabela anterior, como a de §Aliases). Para as verificações de id exibido, alvo,
  // duplicação (C-01-09/10) e status (C-01-15/16), consideram-se também linhas de qualquer outra
  // tabela do arquivo cuja primeira célula cite um arquivo de `law/adr` — excluindo as linhas já
  // contadas pelo índice oficialmente reconhecido, para não duplicar o achado.
  function lawAdrRowsElsewhere(text, indexRelPath, officialRows) {
    const officialLines = new Set(officialRows.map((r) => r.line));
    return allRows(extractTables(text)).filter((r) => {
      if (officialLines.has(r.line)) return false;
      const citation = extractCitation(r.cells[0] ?? '', indexRelPath);
      return Boolean(citation && citation.resolved.startsWith('law/adr/'));
    });
  }

  const designIndexRowsWithLaw = [
    ...designIndexRows,
    ...lawAdrRowsElsewhere(
      designDecisionsText,
      designDecisionsRel,
      designIndexRows,
    ),
  ];
  const adrReadmeIndexRowsWithLaw = [
    ...adrReadmeIndexRows,
    ...lawAdrRowsElsewhere(adrReadmeText, adrReadmeRel, adrReadmeIndexRows),
  ];

  const nonStubNamedDocsAdrFiles = namedDocsAdrFiles.filter(
    (f) => f.classFinal !== 'Renumbered',
  );

  function citedInIndex(rows, indexRelPath, targetRelPath) {
    return rows.some((r) =>
      citesFile(r.cells[0] ?? '', indexRelPath, targetRelPath),
    );
  }

  for (const f of nonStubNamedDocsAdrFiles) {
    if (!citedInIndex(designIndexRows, designDecisionsRel, f.relPath)) {
      findings.push({
        id: 'C-01-07',
        file: f.relPath,
        message: 'ADR ausente de DESIGN-DECISIONS.md',
      });
    }
    if (!citedInIndex(adrReadmeIndexRows, adrReadmeRel, f.relPath)) {
      findings.push({
        id: 'C-01-08',
        file: f.relPath,
        message: 'ADR ausente de docs/meta/adr/README.md',
      });
    }
  }

  function checkIndexRows(rows, indexRelPath, idCriterion) {
    const seen = new Map();
    for (const row of rows) {
      const cell0 = row.cells[0] ?? '';
      const citation = extractCitation(cell0, indexRelPath);
      if (!citation) continue;
      const { resolved, displayText } = citation;
      const targetFile = filesByRelPath.get(resolved);
      if (!targetFile) {
        findings.push({
          id: 'C-01-09',
          file: indexRelPath,
          line: row.line,
          message: `linha cita arquivo inexistente: ${resolved}`,
        });
        continue;
      }
      const displayedIdMatch = /(\d{4})/.exec(displayText);
      const displayedId = displayedIdMatch ? displayedIdMatch[1] : null;
      if (displayedId !== targetFile.id) {
        findings.push({
          id: 'C-01-09',
          file: indexRelPath,
          line: row.line,
          message: `id exibido (${displayText}) diverge do número do arquivo citado (${targetFile.id})`,
        });
      }
      if (targetFile.classFinal === 'Renumbered') {
        findings.push({
          id: 'C-01-09',
          file: indexRelPath,
          line: row.line,
          message: `linha cita um stub: ${resolved}`,
        });
      }
      if (seen.has(resolved)) {
        findings.push({
          id: 'C-01-10',
          file: indexRelPath,
          line: row.line,
          message: `arquivo já citado em outra linha do mesmo índice: ${resolved}`,
        });
      }
      seen.set(resolved, row.line);
    }
  }
  checkIndexRows(designIndexRowsWithLaw, designDecisionsRel);
  checkIndexRows(adrReadmeIndexRowsWithLaw, adrReadmeRel);

  // ---- law/adr série (C-01-11, C-01-12) ------------------------------------

  const lawAdrMode = config.lawAdrMode;
  const lawFiles = rawLawFiles;
  if (lawAdrMode === 'migrated') {
    for (const f of lawFiles) {
      if (f.classFinal !== 'Renumbered') {
        findings.push({
          id: 'C-01-11',
          file: f.relPath,
          message: 'lawAdrMode migrated exige stub válido',
        });
        continue;
      }
      const result = validateStub(f);
      if (!result.valid) {
        findings.push({
          id: 'C-01-11',
          file: f.relPath,
          message: `stub de law/adr inválido em modo migrated: ${result.reason}`,
        });
        continue;
      }
      checkAliasRowsForStub(f.relPath, result.targetRelPath, 'C-01-11');
    }
    for (const rows of [
      { rows: designIndexRows, indexRelPath: designDecisionsRel },
      { rows: adrReadmeIndexRows, indexRelPath: adrReadmeRel },
    ]) {
      for (const row of rows.rows) {
        const citation = extractCitation(row.cells[0] ?? '', rows.indexRelPath);
        if (!citation) continue;
        if (citation.resolved.startsWith('law/adr/')) {
          findings.push({
            id: 'C-01-11',
            file: rows.indexRelPath,
            line: row.line,
            message: 'linha da série law/adr presente em modo migrated',
          });
        }
      }
    }
  } else if (lawAdrMode === 'pending' || lawAdrMode === 'distinct') {
    for (const f of lawFiles) {
      if (f.classFinal === 'Renumbered') continue;
      const inDesign = citedInIndex(
        designIndexRows,
        designDecisionsRel,
        f.relPath,
      );
      const inReadme = citedInIndex(
        adrReadmeIndexRows,
        adrReadmeRel,
        f.relPath,
      );
      if (!inDesign || !inReadme) {
        findings.push({
          id: 'C-01-11',
          file: f.relPath,
          message: `ausente de índice(s) da série law/adr (design=${inDesign}, readme=${inReadme})`,
        });
      }
    }
  }

  const lawAdrReadmeRel = 'law/adr/README.md';
  const lawAdrReadmeText = fs.existsSync(path.join(root, lawAdrReadmeRel))
    ? fs.readFileSync(path.join(root, lawAdrReadmeRel), 'utf8')
    : '';
  const markPhrases = {
    pending: 'Destino da série pendente de OD-R18-001.',
    distinct:
      'Série DEVAI distinta, com prefixo `LAW-ADR-` nos índices (OD-R18-001, opção b).',
    migrated:
      'Série migrada para `docs/meta/adr/` (OD-R18-001, opção a); os arquivos daqui são redirecionamentos.',
  };
  const expectedPhrase = markPhrases[lawAdrMode];
  if (
    lawAdrReadmeText.includes('intentionally empty') ||
    !expectedPhrase ||
    !lawAdrReadmeText.includes(expectedPhrase)
  ) {
    findings.push({
      id: 'C-01-12',
      file: lawAdrReadmeRel,
      message: 'frase-marco ausente ou incorreta para o modo lawAdrMode',
    });
  }

  // ---- (c) status divergência (C-01-15, C-01-16) ---------------------------

  function checkStatusColumn(rows, indexRelPath, idCriterion) {
    for (const row of rows) {
      const citation = extractCitation(row.cells[0] ?? '', indexRelPath);
      if (!citation) continue;
      const targetFile = filesByRelPath.get(citation.resolved);
      if (!targetFile) continue;
      const statusCell = (row.cells[2] ?? '').trim();
      const expected = targetFile.classFinal;
      if (statusCell !== expected || !VALID_STATUSES.includes(statusCell)) {
        findings.push({
          id: idCriterion,
          file: indexRelPath,
          line: row.line,
          message: `status "${statusCell}" diverge da classe "${expected}" do arquivo`,
        });
      }
    }
  }
  checkStatusColumn(designIndexRowsWithLaw, designDecisionsRel, 'C-01-15');
  checkStatusColumn(adrReadmeIndexRowsWithLaw, adrReadmeRel, 'C-01-16');

  // ---- (d) rodadas × closures ------------------------------------------------

  const closuresDir = path.join(root, 'record/proofs/compliance/closures');
  const pcFiles = fs.existsSync(closuresDir)
    ? fs
        .readdirSync(closuresDir)
        .filter((n) => /^PC-.*\.json$/.test(n))
        .map((n) => {
          const relPath = `record/proofs/compliance/closures/${n}`;
          const data = JSON.parse(
            fs.readFileSync(path.join(root, relPath), 'utf8'),
          );
          return {
            relPath,
            id: data.id,
            roundId: data.round_id,
            supersedes: data.supersedes,
          };
        })
    : [];

  const roundsReadmeRel = 'work/rounds/README.md';
  const roundsReadmeText = fs.readFileSync(
    path.join(root, roundsReadmeRel),
    'utf8',
  );
  const roundsTables = findTables(roundsReadmeText, [
    'Rodada',
    'Frente / escopo',
    'Estado',
    'PRs de merge',
    'PC',
    'Maestro',
  ]);
  const roundsRows = allRows(roundsTables).map((r) => ({
    line: r.line,
    round: r.cells[0] ?? '',
    estado: r.cells[2] ?? '',
    pc: r.cells[4] ?? '',
  }));

  if (roundsTables.length === 0) {
    findings.push({
      id: 'C-01-22',
      file: roundsReadmeRel,
      message: 'tabela de rodadas ausente',
    });
  }

  const roundRowByRound = new Map();
  for (const row of roundsRows) {
    if (!roundRowByRound.has(row.round)) roundRowByRound.set(row.round, []);
    roundRowByRound.get(row.round).push(row);
  }
  const pcById = new Map(pcFiles.map((p) => [p.id, p]));
  const pcsByRound = new Map();

  for (const pc of pcFiles) {
    if (!pcsByRound.has(pc.roundId)) pcsByRound.set(pc.roundId, []);
    pcsByRound.get(pc.roundId).push(pc);
    const rows = roundRowByRound.get(pc.roundId) ?? [];
    if (rows.length === 0) {
      findings.push({
        id: 'C-01-17',
        file: pc.relPath,
        message: `round_id ${pc.roundId} sem linha em work/rounds/README.md`,
      });
      continue;
    }
    for (const row of rows) {
      if (row.estado !== 'fechada') {
        findings.push({
          id: 'C-01-18',
          file: roundsReadmeRel,
          line: row.line,
          message: `linha de ${pc.roundId} deve ter Estado fechada`,
        });
      }
    }
  }

  for (const [roundId, pcs] of pcsByRound) {
    const successorIds = new Set();
    for (const pc of pcs) {
      if (pc.supersedes === undefined) continue;
      const predecessor = pcById.get(pc.supersedes);
      if (!predecessor) {
        findings.push({
          id: 'C-01-18',
          file: pc.relPath,
          message: `predecessor ${pc.supersedes} ausente para ${pc.id}`,
        });
      } else if (predecessor.roundId !== roundId) {
        findings.push({
          id: 'C-01-18',
          file: pc.relPath,
          message: `${pc.id} supersede PC de outra rodada: ${pc.supersedes}`,
        });
      } else {
        successorIds.add(pc.supersedes);
      }
    }

    const visited = new Set();
    let cycle = false;
    for (const pc of pcs) {
      const path = new Set();
      let current = pc;
      while (current && !visited.has(current.id)) {
        if (path.has(current.id)) {
          cycle = true;
          break;
        }
        path.add(current.id);
        const predecessor = pcById.get(current.supersedes);
        current = predecessor?.roundId === roundId ? predecessor : undefined;
      }
      for (const id of path) visited.add(id);
    }
    if (cycle) {
      findings.push({
        id: 'C-01-18',
        file: pcs[0].relPath,
        message: `ciclo de supersessão entre PCs de ${roundId}`,
      });
    }

    const terminals = pcs.filter((pc) => !successorIds.has(pc.id));
    if (terminals.length !== 1) {
      findings.push({
        id: 'C-01-18',
        file: roundsReadmeRel,
        message: `${roundId} exige terminal único; encontrados ${terminals.length} PCs terminais`,
      });
    }
    for (const row of roundRowByRound.get(roundId) ?? []) {
      if (terminals.length === 1 && row.pc !== terminals[0].id) {
        findings.push({
          id: 'C-01-18',
          file: roundsReadmeRel,
          line: row.line,
          message: `linha de ${roundId} deve apontar ao PC terminal ${terminals[0].id}`,
        });
      }
    }
  }

  for (const row of roundsRows) {
    if (row.estado !== 'fechada') continue;
    if (row.pc === '—' || !/^PC-\d{4}$/.test(row.pc)) {
      findings.push({
        id: 'C-01-19',
        file: roundsReadmeRel,
        line: row.line,
        message: 'linha fechada sem PC válido',
      });
      continue;
    }
    const pc = pcById.get(row.pc);
    if (!pc || pc.roundId !== row.round) {
      findings.push({
        id: 'C-01-19',
        file: roundsReadmeRel,
        line: row.line,
        message: `PC ${row.pc} inexistente ou de outra rodada`,
      });
    }
  }

  const preMethodRounds = config.preMethodRounds ?? [];
  for (const row of roundsRows) {
    if (row.estado === 'pré-método' && !preMethodRounds.includes(row.round)) {
      findings.push({
        id: 'C-01-20',
        file: roundsReadmeRel,
        line: row.line,
        message: `rodada ${row.round} pré-método fora de preMethodRounds`,
      });
    }
  }
  for (const roundId of preMethodRounds) {
    const rows = roundRowByRound.get(roundId) ?? [];
    if (rows.length === 0) {
      findings.push({
        id: 'C-01-20',
        file: roundsReadmeRel,
        message: `preMethodRounds ${roundId} sem linha na tabela`,
      });
      continue;
    }
    for (const row of rows) {
      if (row.estado !== 'pré-método' || row.pc !== '—') {
        findings.push({
          id: 'C-01-20',
          file: roundsReadmeRel,
          line: row.line,
          message: `rodada ${roundId} de preMethodRounds deve ser pré-método com PC —`,
        });
      }
    }
  }

  const roundsDir = path.join(root, 'work/rounds');
  if (fs.existsSync(roundsDir)) {
    for (const entry of fs.readdirSync(roundsDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (!/^R-\d{4}$/.test(entry.name)) continue;
      if (!roundRowByRound.has(entry.name)) {
        findings.push({
          id: 'C-01-21',
          file: `work/rounds/${entry.name}`,
          message: 'diretório de rodada sem linha em work/rounds/README.md',
        });
      }
    }
  }

  const seenRoundIds = new Set();
  const validEstados = ['fechada', 'pré-método', 'aberta', 'proposta (C-0002)'];
  for (const row of roundsRows) {
    if (!/^R-\d{4}$/.test(row.round) && !/^S-\d+\.\d+$/.test(row.round)) {
      findings.push({
        id: 'C-01-22',
        file: roundsReadmeRel,
        line: row.line,
        message: `id de rodada malformado: ${row.round}`,
      });
    }
    if (seenRoundIds.has(row.round)) {
      findings.push({
        id: 'C-01-22',
        file: roundsReadmeRel,
        line: row.line,
        message: `id de rodada repetido: ${row.round}`,
      });
    }
    seenRoundIds.add(row.round);
    if (!validEstados.includes(row.estado)) {
      findings.push({
        id: 'C-01-22',
        file: roundsReadmeRel,
        line: row.line,
        message: `Estado fora do vocabulário: ${row.estado}`,
      });
    }
    if (
      row.round.startsWith('S-') &&
      (row.estado !== 'proposta (C-0002)' || row.pc !== '—')
    ) {
      findings.push({
        id: 'C-01-22',
        file: roundsReadmeRel,
        line: row.line,
        message: 'linha S-… deve ter Estado "proposta (C-0002)" e PC —',
      });
    }
  }

  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  } catch (err) {
    throw new UsageError(`package.json inválido: ${err.message}`);
  }
  const rawDevaiVersion =
    pkg.devDependencies?.['@aarusso-nyx/devai'] ??
    pkg.dependencies?.['@aarusso-nyx/devai'];
  const devaiVersion = rawDevaiVersion
    ? rawDevaiVersion.replace(/^[\^~=]+/, '')
    : null;
  if (devaiVersion) {
    const lines = roundsReadmeText.split('\n');
    let offset = 0;
    for (const line of lines) {
      const lineNo = offset;
      offset += 1;
      const re = /DEVAI (\d+\.\d+\.\d+)/g;
      let m;
      while ((m = re.exec(line))) {
        if (m[1] !== devaiVersion) {
          findings.push({
            id: 'C-01-23',
            file: roundsReadmeRel,
            line: lineNo,
            message: `DEVAI ${m[1]} diverge do pin ${devaiVersion} de package.json`,
          });
        }
      }
    }
  }

  findings.sort((a, b) => {
    if (a.id !== b.id) return a.id < b.id ? -1 : 1;
    if (a.file !== b.file) return a.file < b.file ? -1 : 1;
    return (a.line ?? 0) - (b.line ?? 0);
  });

  const counts = {
    adrs: allAdrFiles.filter((f) => f.classFinal !== 'Renumbered').length,
    redirects: allAdrFiles.filter((f) => f.classFinal === 'Renumbered').length,
    rounds: roundsRows.length,
    closures: pcFiles.length,
  };

  return { findings, counts };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = { root: null, config: null, report: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--') continue;
    else if (arg === '--root') opts.root = argv[++i];
    else if (arg === '--config') opts.config = argv[++i];
    else if (arg === '--report') opts.report = true;
    else throw new UsageError(`argumento desconhecido: ${arg}`);
  }
  return opts;
}

function formatFinding(f) {
  const loc = f.line !== undefined ? `${f.file}:${f.line}` : f.file;
  return `${f.id} ${loc} ${f.message}`;
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    process.stderr.write(`verify:state-index: erro: ${err.message}\n`);
    process.exit(2);
    return;
  }
  const root = opts.root
    ? path.resolve(opts.root)
    : path.resolve(here, '../../..');
  const configPath = opts.config
    ? path.resolve(opts.config)
    : path.join(root, 'tools/docs/state-index/config.json');

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (err) {
    process.stderr.write(
      `verify:state-index: erro: config inválido: ${err.message}\n`,
    );
    process.exit(2);
    return;
  }
  if (!['pending', 'distinct', 'migrated'].includes(config.lawAdrMode)) {
    process.stderr.write(
      'verify:state-index: erro: config inválido: lawAdrMode ausente ou inválido\n',
    );
    process.exit(2);
    return;
  }

  let result;
  try {
    result = checkStateIndex({ root, config });
  } catch (err) {
    process.stderr.write(`verify:state-index: erro: ${err.message}\n`);
    process.exit(2);
    return;
  }

  const { findings, counts } = result;
  if (findings.length === 0) {
    process.stdout.write(
      `verify:state-index OK: ${counts.adrs} ADRs, ${counts.redirects} redirecionamentos, ${counts.rounds} rodadas, ${counts.closures} closures\n`,
    );
    process.exit(0);
    return;
  }

  const lines = findings.map(formatFinding);
  if (opts.report) {
    process.stdout.write(lines.join('\n') + '\n');
    process.stdout.write(
      `verify:state-index report: ${findings.length} achado(s)\n`,
    );
    process.exit(0);
    return;
  }
  process.stderr.write(`verify:state-index: ${findings.length} achado(s)\n`);
  process.stderr.write(lines.join('\n') + '\n');
  process.exit(1);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
