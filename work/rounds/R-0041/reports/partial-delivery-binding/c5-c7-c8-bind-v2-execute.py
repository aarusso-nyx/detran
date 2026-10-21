from pathlib import Path
import hashlib,json,subprocess,datetime,os,shutil
root=Path('/Volumes/Development/.codex/worktrees/c5-c8-governance/detran');archive=Path('/Users/aarusso/.config/devai/evidence/detran/c5-c7-c8-partial-delivery/bind-v2');archive.mkdir(exist_ok=False)
sha=lambda b:hashlib.sha256(b).hexdigest()
assert json.load(open('/tmp/c5-c7-c8-empty-bindings-task-v2-review.json'))['verdict']=='PASS'
source=root/'law/policy/adopter-policy.json';before=source.read_bytes();assert sha(before)=='e254309906645af158af5c5904112ec4a0834682912fba32c17ab2e887dab9b9'
assert sha((root/'tools/devai/tests/ci-isolation.test.mjs').read_bytes())=='038fe1abf8ff757bf52fe5df1dfc152e5fff5bff69a51326edf64c9d0f58a73f'
old=json.loads(before);assert old['policy_version']=='1.5.0' and 'invariant_producers' not in old
(archive/'source-before.json').write_bytes(before)
config={str(p.relative_to(root)):sha(p.read_bytes()) for p in sorted((root/'.devai/config').rglob('*')) if p.is_file() and not p.is_symlink()}
for name in config:
 p=archive/'compiled-before'/Path(name).relative_to('.devai/config');p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes((root/name).read_bytes())
protected={}
tracked=subprocess.check_output(['git','ls-files','-z'],cwd=root).decode().split('\0')
for name in tracked:
 if not name:continue
 if name.startswith(('record/proofs/','.devai/state/','law/invariants/')) or name in ['test-tasks.json','package.json','pnpm-lock.yaml','.github/workflows/ci.yml','law/policy/scorecard-sensor-inputs.json','.devai/config/thresholds.json','.devai/config/scorecard-na.json','.devai/config/sensor-inputs.json','tools/devai/tests/ci-isolation.test.mjs']:
  p=root/name
  if p.is_file():protected[name]=sha(p.read_bytes())
(archive/'before-manifest.json').write_text(json.dumps({'sourceSHA256':sha(before),'compiled':config,'protected':protected},indent=2)+'\n')
(archive/'git-status-before.txt').write_bytes(subprocess.check_output(['git','status','--porcelain'],cwd=root))
for p in list(Path('/tmp').glob('c5-c7-c8-empty-bindings-task-v2*'))+[Path('/tmp/c5-c7-c8-empty-bindings-inspector-red.json')]:
 if p.is_file():shutil.copyfile(p,archive/p.name)
redroot=Path(json.load(open('/tmp/c5-c7-c8-empty-bindings-inspector-red.json'))['captureRoot']);shutil.copytree(redroot,archive/'inspector-red-raw')
needle=b'  "policy_version": "1.5.0",\n';assert before.count(needle)==1
insert=b'  "invariant_producers": {\n    "schemaVersion": "1.0.0",\n    "bindings": []\n  },\n'
after=before.replace(needle,needle+insert);new=json.loads(after);assert new.pop('invariant_producers')=={'schemaVersion':'1.0.0','bindings':[]} and new==old
source.write_bytes(after);(archive/'source-after.json').write_bytes(after)
env=os.environ.copy();env['PATH']='/tmp/detran-c5-c8-merge-native-bin:/Users/aarusso/.nvm/versions/node/v24.15.0/bin:'+env['PATH'];env['NODE_AUTH_TOKEN']=subprocess.check_output(['gh','auth','token'],text=True).strip()
commands=[('bind-plan',['pnpm','exec','devai','init','bind','--target','.','--adopter-policy','law/policy/adopter-policy.json','--as-role','architect','--format','json']),('bind-write',['pnpm','exec','devai','init','bind','--target','.','--adopter-policy','law/policy/adopter-policy.json','--as-role','architect','--write','--format','json'])]
for name,argv in commands:
 started=datetime.datetime.now(datetime.timezone.utc).isoformat()
 with (archive/(name+'.stdout')).open('wb') as out,(archive/(name+'.stderr')).open('wb') as err:r=subprocess.run(argv,cwd=root,env=env,stdout=out,stderr=err)
 (archive/(name+'-execution.json')).write_text(json.dumps({'argv':argv,'exitCode':r.returncode,'startedAt':started,'endedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()},indent=2)+'\n');print(name,r.returncode,flush=True)
 if r.returncode:raise SystemExit(r.returncode)
current={str(p.relative_to(root)):sha(p.read_bytes()) for p in sorted((root/'.devai/config').rglob('*')) if p.is_file() and not p.is_symlink()}
changed={n:{'before':config.get(n),'after':current.get(n)} for n in set(config)|set(current) if config.get(n)!=current.get(n)}
(archive/'compiled-write-set.json').write_text(json.dumps(changed,indent=2)+'\n')
allowed={'.devai/config/'+x+'.json' for x in ['project','domains','thresholds','scorecard-na','glob-guards','sensor-inputs','invariant-producers','adopter-policy-binding','authority-policy']};assert set(changed)<=allowed,changed
for n,h in protected.items():assert sha((root/n).read_bytes())==h,n
receipt=json.loads((root/'.devai/config/adopter-policy-binding.json').read_bytes());assert receipt['policy_version']=='1.5.0' and receipt['policy_id']==old['policy_id'] and receipt['source_path']=='law/policy/adopter-policy.json' and receipt['source_digest_sha256']==sha(after)
for n,h in receipt['materialized'].items():assert sha((root/n).read_bytes())==h,n
assert json.loads((root/'.devai/config/invariant-producers.json').read_bytes())=={'schemaVersion':'1.0.0','bindings':[]}
for n in changed:
 p=archive/'compiled-after'/Path(n).relative_to('.devai/config');p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes((root/n).read_bytes())
report={'sourceOnlyEmptyFieldAdded':True,'sourceSHA256':sha(after),'receipt':receipt,'allMaterializedHashesVerified':True,'allProtectedHashesVerified':len(protected),'changed':changed,'genuineREDPreserved':True,'noNativeReadinessClaim':True}
(archive/'bind-verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2));Path('/tmp/c5-c7-c8-bind-v2-archive-path.txt').write_text(str(archive)+'\n')
