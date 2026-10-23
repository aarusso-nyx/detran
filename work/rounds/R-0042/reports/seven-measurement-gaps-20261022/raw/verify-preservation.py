import json,hashlib,os,subprocess
from pathlib import Path
root=Path('/Volumes/Development/.codex/worktrees/scorecard-0e26/detran')
out=Path(__file__).resolve().parent
before=json.loads((out/'preservation-before.json').read_text())
allowed={'DESIGN-DECISIONS.md','docs/meta/adr/README.md','tests/config/coverage-support.mjs','tests/config/local.coverage.config.ts','tests/coverage-support.test.mjs','work/rounds/README.md'}
def digest(p):
 return hashlib.sha256(os.readlink(p).encode() if p.is_symlink() else p.read_bytes()).hexdigest()
changed=[]
for name,wanted in before['files'].items():
 p=root/name
 if not p.exists() and not p.is_symlink(): changed.append({'path':name,'missing':True})
 elif digest(p)!=wanted:changed.append({'path':name,'before':wanted,'after':digest(p)})
chain=json.loads((root/'record/proofs/chain.json').read_text())
old=before['chain']['records']
# The original generic file location is discovered by exact byte prefix, not inferred.
prefix=before['generic_prefix']
generic=[str(p.relative_to(root)) for p in (root/'record/proofs/work').rglob('*') if p.is_file() and p.read_bytes().startswith(prefix.encode())]
violations=[x for x in changed if x['path'] not in allowed and x['path']!='record/proofs/chain.json']
result={'baseline':before['baseline'],'current_head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'tracked_baseline_files_checked':len(before['files']),'changed_baseline_files':changed,'unexpected_changes':violations,'chain_prefix_records':len(old),'chain_prefix_preserved':chain['records'][:len(old)]==old,'chain_records_now':len(chain['records']),'generic_prefix_matches':generic,'legacy_sha256':digest(root/'.devai/state/evidence-chain.json'),'original_seven_descriptors_sha256':digest(root/'test-tasks.json'),'native_producer_projection_sha256':digest(root/'.devai/config/invariant-producers.json'),'C6':'blocked; no native activation','closed_rounds':'baseline files compared without exclusions'}
result['pass']=not violations and result['chain_prefix_preserved'] and len(generic)==1 and result['legacy_sha256']=='5adb65afca27197d0381bc74efa5377d4415e1cf0058d7d82a68966a83790fec' and result['original_seven_descriptors_sha256']=='752c6105900f752bae1b276f8b0282f501f139777615e5704ba733595ed5fbad' and result['native_producer_projection_sha256']=='32c058fdc22a517bb47ea2b504bd9164c22c099217320fe997af37276dae5e55'
(out/'preservation-current.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k!='changed_baseline_files'},indent=2))
if not result['pass']:raise SystemExit(1)
