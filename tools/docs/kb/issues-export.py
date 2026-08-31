#!/usr/bin/env python3
"""Turns `docs/meta/knowledge-base/open-issues.md` into `gh issue create` commands.

The register is the source of truth; this only reads it. Nothing is created here —
it prints commands so the intended repo, labels and milestone can be reviewed first.

    python3 tools/docs/kb/issues-export.py --repo aarusso-nyx/detran            # everything
    python3 tools/docs/kb/issues-export.py --repo aarusso-nyx/detran --p P0 P1  # by priority
    python3 tools/docs/kb/issues-export.py --repo aarusso-nyx/detran --type blocker owner-decision
    python3 tools/docs/kb/issues-export.py --repo aarusso-nyx/detran --scope boat
"""
import argparse, pathlib, re, shlex, sys

REGISTER = pathlib.Path(__file__).resolve().parents[3] / 'docs' / 'meta' / 'knowledge-base' / 'open-issues.md'
ROW = re.compile(r'^\|\s*(DT-\d+)\s*\|(.+)$')


def rows():
    section = None
    for line in REGISTER.read_text(encoding='utf-8').splitlines():
        if line.startswith('## '):
            section = line[3:].strip()
        m = ROW.match(line)
        if not m:
            continue
        cells = [c.strip() for c in m.group(2).split('|')]
        # title | type | scope | priority | [blocks/target]  (trailing empty cell from the pipe)
        if len(cells) < 4:
            continue
        yield {
            'id': m.group(1),
            'title': cells[0],
            'type': cells[1],
            'scope': cells[2],
            'priority': cells[3],
            'note': cells[4] if len(cells) > 4 and cells[4] else '',
            'section': section,
        }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--repo', required=True)
    ap.add_argument('--type', nargs='*', default=None)
    ap.add_argument('--p', nargs='*', default=None)
    ap.add_argument('--scope', nargs='*', default=None)
    ap.add_argument('--milestone', default=None)
    args = ap.parse_args()

    n = 0
    for r in rows():
        if args.type and r['type'] not in args.type:
            continue
        if args.p and r['priority'] not in args.p:
            continue
        if args.scope and not any(s in r['scope'] for s in args.scope):
            continue
        # strip markdown emphasis and KB cross-reference brackets from the title
        title = re.sub(r'\*\*|\*|`', '', r['title'])
        title = re.sub(r'\[([A-Z][A-Z0-9-]*-\d+)\]', r'\1', title)
        body = [f"Registrado em `docs/meta/knowledge-base/open-issues.md` como **{r['id']}** (seção: {r['section']}).", '']
        if r['note']:
            body.append(f"**Bloqueia / destinatário:** {r['note']}")
            body.append('')
        body.append(f"- tipo: `{r['type']}`")
        body.append(f"- escopo: `{r['scope']}`")
        body.append(f"- prioridade: `{r['priority']}`")
        body.append('')
        body.append('Fonte completa e contexto: `detran` → `docs/meta/knowledge-base/open-issues.md`.')

        labels = [r['type'], r['priority']]
        labels += [s.strip() for s in r['scope'].split(',') if s.strip() and s.strip() != '—']
        cmd = ['gh', 'issue', 'create', '--repo', args.repo,
               '--title', f"{r['id']}: {title}",
               '--body', '\n'.join(body),
               '--label', ','.join(sorted(set(labels)))]
        if args.milestone:
            cmd += ['--milestone', args.milestone]
        print(' '.join(shlex.quote(c) for c in cmd))
        n += 1
    print(f'\n# {n} issue(s). Labels used must exist in the repo — create them first with gh label create.',
          file=sys.stderr)
    return 0


if __name__ == '__main__':
    sys.exit(main())
