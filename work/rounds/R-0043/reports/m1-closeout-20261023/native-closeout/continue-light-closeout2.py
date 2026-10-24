from pathlib import Path
import subprocess, os, json, hashlib, sys, yaml, datetime
root=Path('/Volumes/Development/.codex/worktrees/completion-roadmap/detran')
out=Path(__file__).resolve().parent
assert sys.argv[1:]==['--execute-reviewed-light-metadata']
review=json.loads((out/'review3-light-metadata.json').read_text())
assert review['overall_verdict']=='PASS' and review['light_metadata_allowed'] is True
assert not (out/'round-close.json').exists(), 'No automatic repeat after PC allocation'
env=os.environ.copy();env['NODE_AUTH_TOKEN']=subprocess.check_output(['gh','auth','token'],text=True).strip();env['PATH']='/Volumes/Development/runtimes/nvm/versions/node/v24.20.0/bin:'+env['PATH']
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def run(label,args):
 p=subprocess.run(args,cwd=root,env=env,capture_output=True)
 (out/(label+'.stdout')).write_bytes(p.stdout);(out/(label+'.stderr')).write_bytes(p.stderr)
 (out/(label+'.execution.json')).write_text(json.dumps({'argv':args,'exit':p.returncode,'ended_at':datetime.datetime.now(datetime.timezone.utc).isoformat()},indent=2)+'\n')
 print(label+': exit '+str(p.returncode),flush=True)
 assert p.returncode==0, label+' failed; retained output, no dependent transition'
 return p.stdout
base=['pnpm','exec','devai']
closed=json.loads(run('round-close2',base+['round','close','--as-role','architect','--write','--format','json','--round','R-0043','--repo-root','.','--input',str(root/'work/rounds/R-0043/closure.json')]))
(out/'round-close.json').write_text(json.dumps(closed,indent=2)+'\n')
pc=closed['record']['id']; assert closed['record']['round_id']=='R-0043'
original=(root/'work/rounds/R-0043/record.md').read_text(); record=yaml.safe_load(original.split('---',2)[1]); before=dict(record)
record.update(status='closed',closed_by='D-3',phase_closure=pc,merged_as='67a3b3da0afcd7d3298090c8ec0ab38412648d2e')
assert all(record[k]==v for k,v in before.items() if k!='status')
declared=out/'closed-round-declaration-input.json'; declared.write_text(json.dumps(record,indent=2)+'\n')
run('round-plan-declare',base+['round','plan','--as-role','architect','--write','--format','json','--round','R-0043','--repo-root','.','--declare',str(declared)])
run('render-rounds-index',['node','tools/devai/render-rounds-index.mjs','--write'])
ledger=(root/'record/derived/indexes/rounds.md').read_text();assert any(pc in l and 'R-0043' in l for l in ledger.splitlines()), 'Actual terminal PC row missing'
run('round-seal',base+['round','seal','--as-role','architect','--write','--format','json','--round','R-0043','--repo-root','.'])
run('backlog-resolve',base+['backlog','resolve','--as-role','architect','--write','--format','json','BL-0016','--repo-root','.','--resolution','https://github.com/aarusso-nyx/detran/pull/218#merge-67a3b3da0afcd7d3298090c8ec0ab38412648d2e; R-0043 '+pc+'; actual descendant 067320f3 complete mock 119/14/113 PASS'])
for name in ['verify:law-corpus','verify:rounds-index','verify:state-index','verify:proof-anchors']:
 run(name.replace(':','-'),['pnpm',name])
run('post-evidence-verify',base+['evidence','verify','--scope','chain','--repo-root','.','--show-head','--format','human'])
print(json.dumps({'status':'completed','pc':pc,'heavy_execution':False}),flush=True)
