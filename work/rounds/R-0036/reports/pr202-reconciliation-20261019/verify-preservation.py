"""Read-only checks for the exact PR #202 reconciliation inputs and preserved history."""
from pathlib import Path
import hashlib,json,subprocess,os
root=Path.cwd();folder=root/'work/rounds/R-0036/reports/pr202-reconciliation-20261019';meta=json.load(open(folder/'source-histories.json'))
def git_bytes(ref,path):return subprocess.check_output(['git','show',ref+':'+path])
def digest(b):return hashlib.sha256(b).hexdigest()
sources={}
for source in meta['sources']:
 path=root/source['archive_path'];b=path.read_bytes();assert digest(b)==source['sha256'],str(path);assert b==git_bytes(source['source_commit'],'record/proofs/chain.json');sources[source['name']]=json.loads(b)
main=sources['main-integration'];scorecard=sources['scorecard'];common=sources['base'];active=json.load(open('record/proofs/chain.json'));assert main['records'][:len(common['records'])]==common['records'];assert scorecard['records'][:len(common['records'])]==common['records'];assert active['records'][:len(main['records'])]==main['records']
union={r['id']:r for r in main['records']}
for r in scorecard['records']:
 if r['id'] in union:assert union[r['id']]==r
 union[r['id']]=r
main_ref=meta['integration_main'];score_ref=next(s['source_commit'] for s in meta['sources'] if s['name']=='scorecard')
for path in subprocess.check_output(['git','ls-tree','-r','--name-only',main_ref,'docs/meta/adr','docs/meta/decisions'],text=True).splitlines():
 if not path.endswith('/README.md'):assert (root/path).read_bytes()==git_bytes(main_ref,path),path
for path in ['COMPLETION-PLAN.md','docs/meta/knowledge-base/session-artifacts/orchestration-handoff.md']:
 assert (root/path).read_bytes()==git_bytes(main_ref,path),path
for old,new,slug in [('0045','0050','whole-source-local-coverage'),('0046','0051','devai-263-measurement-repairs')]:
 new_text=(root/f'docs/meta/adr/ADR-{new}-{slug}.md').read_bytes();original=git_bytes(score_ref,f'docs/meta/adr/ADR-{old}-{slug}.md');assert new_text.split(b'\n---\n\n',1)[1]==original
# Historical reports, records and legacy chain are never rewritten.
assert not subprocess.check_output(['git','diff',score_ref,'--','work/rounds/R-0036/reports',':!work/rounds/R-0036/reports/pr202-reconciliation-20261019'],text=True)
legacy='.devai/state/evidence-chain.json';assert (root/legacy).read_bytes()==git_bytes(main_ref,legacy)==git_bytes(score_ref,legacy)
proof='record/proofs/work/generic/R-0036.jsonl';original_proof=git_bytes(score_ref,proof);assert (root/proof).read_bytes().startswith(original_proof)
# Runtime/main changes stay byte-identical, except the already-present measurement-only delta.
base=next(s['source_commit'] for s in meta['sources'] if s['name']=='base');prefixes=['backend/','apps/','packages/','senatran-mock/'];paths=subprocess.check_output(['git','ls-tree','-r','--name-only',main_ref,*prefixes],text=True).splitlines();measurement=set(subprocess.check_output(['git','diff','--name-only',base,score_ref,'--',*prefixes],text=True).splitlines())
for path in paths:
 ref=score_ref if path in measurement else main_ref
 actual=os.readlink(root/path).encode() if (root/path).is_symlink() else (root/path).read_bytes()
 assert actual==git_bytes(ref,path),path
print(json.dumps({'ok':True,'integration_main':main_ref,'main_records_preserved_in_canonical_prefix':len(main['records']),'scorecard_records_preserved_in_exact_archive':len(scorecard['records']),'original_records_retained_across_both_histories':len(union),'common_prefix_records':len(common['records']),'main_ADRs_and_owner_decisions_unchanged':True,'accepted_renumbered_bodies_exact':True,'frozen_scorecard_reports_unchanged':True,'legacy_chain_unchanged':True,'source_proof_epoch_preserved':True,'no_new_product_fixes':True},indent=2))
