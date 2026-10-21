from pathlib import Path
import json, hashlib, subprocess, datetime
root=Path('/Volumes/Development/.codex/worktrees/c5-c8-governance/detran')
ref='b3b66c6df1c8153f1bc5427c3cd14c9e98c4e0ab'
main='c58278cc91f26458e478aa34030075a16e1241aa'
wip='042215df2f2fed82b49c326372fb1af806767e55'
sha=lambda b:hashlib.sha256(b).hexdigest()
def git(*a): return subprocess.check_output(['git',*a],cwd=root)
def paths(r,p): return git('ls-tree','-r','--name-only',r,'--',p).decode().splitlines()
def blob(r,p): return git('show',r+':'+p)
findings=[]; checks=[]
def check(ok,label):
 if not ok: findings.append(label)
 return bool(ok)
old=json.loads(blob(ref,'record/proofs/chain.json')); new=json.loads((root/'record/proofs/chain.json').read_bytes())
check(new['records'][:len(old['records'])]==old['records'],'old chain ordered prefix')
# Before recording this is equal; after recording it must append exactly one authentic official record.
check(len(new['records']) in [len(old['records']),len(old['records'])+1],'bounded chain append count')
proof='record/proofs/work/generic/R-0041.jsonl'; before=blob(ref,proof); after=(root/proof).read_bytes()
check(after.startswith(before),'R41 physical proof prefix')
check(after==before or len(after.splitlines())==len(before.splitlines())+1,'R41 bounded physical append')
protected=json.loads(Path('/Users/aarusso/.config/devai/evidence/detran/c5-c7-c8-partial-delivery/clean-source-checks/protected-before.json').read_bytes())
for p,h in protected.items(): check(sha((root/p).read_bytes())==h,'protected '+p)
comparisons=[]
for i in range(36,40): comparisons.extend((main,p,'closed-round') for p in paths(main,f'work/rounds/R-{i:04d}'))
comparisons.extend((main,p,'backlog') for p in paths(main,'.devai/state/backlog'))
comparisons.extend((ref,p,'prior-proof') for p in paths(ref,'record/proofs') if p not in ['record/proofs/chain.json',proof])
comparisons.extend((wip,p,'original-R41-report') for p in paths(wip,'work/rounds/R-0041/reports'))
comparisons.extend((ref,p,'prior-committed-R41-report') for p in paths(ref,'work/rounds/R-0041/reports'))
comparisons.extend((wip,p,'ADR55-56') for p in paths(wip,'docs/meta/adr') if Path(p).name.startswith(('ADR-0055-','ADR-0056-')))
proc=subprocess.Popen(['git','cat-file','--batch'],cwd=root,stdin=subprocess.PIPE,stdout=subprocess.PIPE)
for r,p,group in comparisons:
 proc.stdin.write((r+':'+p+'\n').encode()); proc.stdin.flush(); head=proc.stdout.readline().decode().split(); assert len(head)==3 and head[1]=='blob'
 b=proc.stdout.read(int(head[2])); assert proc.stdout.read(1)==b'\n'; f=root/p
 current=str(f.readlink()).encode() if f.is_symlink() else f.read_bytes()
 checks.append({'group':group,'path':p,'reference':r,'sha256':sha(b),'same':check(current==b,'historical '+p)})
proc.stdin.close(); assert proc.wait()==0
for i in range(36,40):
 t=(root/f'work/rounds/R-{i:04d}/record.md').read_text(); check('status: "closed"' in t or 'status: closed' in t,'closed R'+str(i))
t=(root/'work/rounds/R-0041/record.md').read_text(); check('status: "active"' in t or 'status: active' in t,'R41 active')
report={'role':'Auditor','observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reference':ref,'currentHEAD':git('rev-parse','HEAD').decode().strip(),'verdict':'PASS' if not findings else 'FAIL','oldChainRecords':len(old['records']),'currentChainRecords':len(new['records']),'chainHead':new['head'],'oldOrderedPrefixPreserved':new['records'][:len(old['records'])]==old['records'],'R41OldProofBytesPreserved':after.startswith(before),'R41PhysicalLines':len(after.splitlines()),'legacySHA256':sha((root/'.devai/state/evidence-chain.json').read_bytes()),'protected':protected,'historicalChecks':checks,'findings':findings,'limitations':['Byte/prefix audit only, not a new native reading or replacement for official verification.','53 historical declared gaps remain explicit; no completeness/readiness promotion.']}
out=Path('/tmp/pr213-ci-forward-preservation-audit.json');out.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='historicalChecks'},indent=2));print('historicalFiles',len(checks))
raise SystemExit(bool(findings))
