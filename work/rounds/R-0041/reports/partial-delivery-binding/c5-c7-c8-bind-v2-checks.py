from pathlib import Path
import json,os,subprocess,datetime,hashlib
r=Path('/Volumes/Development/.codex/worktrees/c5-c8-governance/detran');p=Path('/Users/aarusso/.config/devai/evidence/detran/c5-c7-c8-partial-delivery/bind-v2');env=os.environ.copy();env['PATH']='/tmp/detran-c5-c8-merge-native-bin:/Users/aarusso/.nvm/versions/node/v24.15.0/bin:'+env['PATH'];env['NODE_AUTH_TOKEN']=subprocess.check_output(['gh','auth','token'],text=True).strip()
s='node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/'
checks=[('inspector-green',['node','--test','tools/devai/tests/ci-isolation.test.mjs']),('policy-schema',['pnpm','exec','devai','check','--only','schema','--schema',s+'adopter-policy.schema.json','--instance','law/policy/adopter-policy.json','--repo-root','.']),('projection-schema',['pnpm','exec','devai','check','--only','schema','--schema',s+'invariant-producers.schema.json','--instance','.devai/config/invariant-producers.json','--repo-root','.']),('law-corpus',['pnpm','verify:law-corpus']),('law-tests',['pnpm','law:test']),('format',['pnpm','exec','prettier','--check','law/policy/adopter-policy.json','.devai/config/invariant-producers.json','.devai/config/adopter-policy-binding.json','tools/devai/tests/ci-isolation.test.mjs']),('doctor',['pnpm','devai:doctor'])]
summary=[]
for name,argv in checks:
 start=datetime.datetime.now(datetime.timezone.utc).isoformat()
 with (p/(name+'.stdout')).open('wb') as out,(p/(name+'.stderr')).open('wb') as err:v=subprocess.run(argv,cwd=r,env=env,stdout=out,stderr=err)
 x={'name':name,'argv':argv,'startedAt':start,'endedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':v.returncode};summary.append(x);(p/(name+'-execution.json')).write_text(json.dumps(x,indent=2)+'\n');(p/'checks-summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(name,v.returncode,flush=True)
# Re-verify protections and exact owned source/test at finish; do not change records.
b=json.loads((p/'before-manifest.json').read_text());sha=lambda x:hashlib.sha256(x).hexdigest()
for n,h in b['protected'].items():assert sha((r/n).read_bytes())==h,n
assert sha((r/'law/policy/adopter-policy.json').read_bytes())==json.loads((p/'bind-verification.json').read_text())['sourceSHA256']
(p/'checks-final-protection.json').write_text(json.dumps({'allProtectedHashesVerified':len(b['protected']),'sourceUnchangedDuringChecks':True,'allChecksPassed':all(x['exitCode']==0 for x in summary)},indent=2)+'\n')
print('checks_final',all(x['exitCode']==0 for x in summary),flush=True)
