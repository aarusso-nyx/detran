from pathlib import Path
import json,hashlib,subprocess,datetime,sys
r=Path('/Volumes/Development/.codex/worktrees/c5-c8-governance/detran');ref='0cfb3a9439cfff2114d3de067e7192ddd101069a';h=lambda b:hashlib.sha256(b).hexdigest();g=lambda*a:subprocess.check_output(['git',*a],cwd=r)
allowed={'backend/app/vitest.config.ts','backend/domains/portal/requests/vitest.config.ts','tools/security/invariants/portal.config.mjs','tools/devai/tests/backend-app-metadata-config.test.mjs','tools/devai/tests/ci-isolation.test.mjs','tools/devai/tests/portal-metadata-config.test.mjs'}
chain='record/proofs/chain.json';proof='record/proofs/work/generic/R-0041.jsonl';dynamic={chain,proof};entries=[x for x in g('ls-tree','-rz','--full-tree',ref).split(b'\0')if x];checks=[];fail=[]
proc=subprocess.Popen(['git','cat-file','--batch'],cwd=r,stdin=subprocess.PIPE,stdout=subprocess.PIPE)
for e in entries:
 meta,name=e.split(b'\t',1);mode,kind,oid=meta.split();n=name.decode()
 if n in allowed or n in dynamic:continue
 assert kind==b'blob';proc.stdin.write(oid+b'\n');proc.stdin.flush();hdr=proc.stdout.readline().split();raw=proc.stdout.read(int(hdr[2]));assert proc.stdout.read(1)==b'\n';p=r/n;cur=str(p.readlink()).encode()if p.is_symlink()else p.read_bytes();same=raw==cur;checks.append({'path':n,'sha256':h(raw),'same':same})
 if not same:fail.append(n)
proc.stdin.close();assert proc.wait()==0
old=json.loads(g('show',ref+':'+chain));new=json.loads((r/chain).read_bytes());a=g('show',ref+':'+proof);b=(r/proof).read_bytes();prefix=new['records'][:len(old['records'])]==old['records']and len(new['records'])in[len(old['records']),len(old['records'])+1];proofok=b.startswith(a)and len(b.splitlines())in[len(a.splitlines()),len(a.splitlines())+1]
expected=json.load(open('/tmp/pr213-cache-locality-final-delivery.json'))['sourceHashes'];deltas={n:{'sha256':h((r/n).read_bytes()),'expected':expected[n]}for n in allowed};sourceok=all(v['sha256']==v['expected']for v in deltas.values());ok=not fail and prefix and proofok and sourceok
out={'role':'Auditor','observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'baseline':ref,'HEAD':g('rev-parse','HEAD').decode().strip(),'tree':g('rev-parse','HEAD^{tree}').decode().strip(),'verdict':'PASS'if ok else'FAIL','unchangedBaselineFiles':len(checks),'comparisons':checks,'mismatches':fail,'authorizedSixSourcePaths':deltas,'oldChainRecords':len(old['records']),'currentChainRecords':len(new['records']),'orderedFullChainPrefixPreserved':prefix,'chainHead':new['head'],'oldPhysicalR41PrefixPreserved':proofok,'priorR41PhysicalLines':len(a.splitlines()),'currentR41PhysicalLines':len(b.splitlines()),'legacySHA256':h((r/'.devai/state/evidence-chain.json').read_bytes()),'limitations':['Byte/prefix audit, not native reading or futureCI/readiness promotion.','All baseline scorecard reports/rounds/ADRs/decisions/backlogs and both histories included; only explicitly bounded authentic chain/proof append can differ.']}
p=Path(sys.argv[1]);assert not p.exists();p.write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({k:v for k,v in out.items()if k!='comparisons'},indent=2));raise SystemExit(not ok)
