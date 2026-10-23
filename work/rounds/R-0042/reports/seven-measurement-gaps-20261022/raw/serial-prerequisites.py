import os,subprocess,time,json,datetime
from pathlib import Path
root=Path('/Volumes/Development/.codex/worktrees/scorecard-0e26/detran')
out=Path(__file__).resolve().parent
head='cd0c1b09d11291f1140dc7360b7f3724dda42bb7'
def guard():
 if subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()!=head:raise RuntimeError('Frozen candidate moved')
def record(name,value):
 with (out/name).open('x') as f:json.dump(value,f,indent=2);f.write('\n')
started=time.time()
print('Waiting for owned provider gate PID 24520 before serial coverage.',flush=True)
while True:
 try:os.kill(24520,0)
 except ProcessLookupError:break
 if time.time()-started>1800:raise RuntimeError('Provider gate still pending; no additional workload started')
 time.sleep(5)
guard()
record('serial-start.json',{'candidate':head,'started_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'provider_gate_process_ended':True,'sequence':['full unchanged coverage','four official native prerequisite readings with immediate record'],'C6':'held'})
env=dict(os.environ);env['NODE_OPTIONS']='--max-old-space-size=8192'
argv=['pnpm','vitest','run','--config','tests/config/local.coverage.config.ts']
print('START serial full coverage',flush=True)
with (out/'full-coverage-serial.stdout.log').open('x') as so,(out/'full-coverage-serial.stderr.log').open('x') as se:
 p=subprocess.run(argv,cwd=root,env=env,stdout=so,stderr=se)
record('full-coverage-serial-status.json',{'candidate':head,'argv':argv,'exitCode':p.returncode,'finished_at':datetime.datetime.now(datetime.timezone.utc).isoformat()})
print('END serial full coverage',p.returncode,flush=True)
if p.returncode:raise SystemExit(p.returncode)
guard()
sidecar=json.loads((root/'coverage/population.json').read_text())
if sidecar['binding']['commit']!=head or sidecar['binding']['selector']!='full-suite':raise RuntimeError('Coverage not bound to frozen full suite')
print('START four official prerequisite readings',flush=True)
p=subprocess.run(['node',str(out/'native-cd0c1b09/evaluate.mjs')],cwd=root,env=os.environ)
record('native-prerequisites-status.json',{'candidate':head,'exitCode':p.returncode,'finished_at':datetime.datetime.now(datetime.timezone.utc).isoformat()})
raise SystemExit(p.returncode)
