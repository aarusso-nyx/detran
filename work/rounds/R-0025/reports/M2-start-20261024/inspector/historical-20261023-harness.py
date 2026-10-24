import os, pathlib, subprocess, json, hashlib
root=pathlib.Path('/evidence')
script=pathlib.Path('/input/diagnostics.sh').read_text()
(root/'diagnostics.sh').write_text(script)
base={k:v for k,v in os.environ.items() if k not in ('DETRAN_STACK_STATE_DIR','TMPDIR')}
results=[]
def run(name,args,env,cwd=root):
 p=subprocess.run(args,env=env,cwd=cwd,capture_output=True,text=True)
 results.append({'name':name,'command':args,'exit':p.returncode,'stdout':p.stdout,'stderr':p.stderr})
 return p
assert run('shell syntax',['bash','-n',str(root/'diagnostics.sh')],base).returncode==0
selection=script.split('shopt -s nullglob',1)[0]+'''printf '%s\\n' "$report_dir"\n'''
(root/'selection.sh').write_text(selection)
node="const p=require('node:path');console.log(p.resolve(process.env.DETRAN_STACK_STATE_DIR??p.join(process.env.TMPDIR??'/tmp','detran-stack')));"
for state in (None,'',str(root/'state with spaces')):
 for tmp in (None,'',str(root/'tmp with spaces')):
  env=dict(base)
  if state is not None: env['DETRAN_STACK_STATE_DIR']=state
  if tmp is not None: env['TMPDIR']=tmp
  tag=f'state={state!r}, tmp={tmp!r}'
  got=run('selection '+tag,['bash',str(root/'selection.sh')],env)
  expected=run('node reference '+tag,['node','-e',node],env)
  assert got.returncode==expected.returncode==0
  assert str((root/got.stdout.strip()).resolve())==expected.stdout.strip(),tag
present=root/'present with spaces';present.mkdir(exist_ok=True)
(present/'smoke-report.json').write_text('{"complete":false,"rows":[{"reason":"synthetic_failure"}]}\n')
(present/'smoke-report-probe.txt').write_text('synthetic target\tfailed\tsynthetic_failure\t503\n')
(present/'secret-do-not-print.env').write_text('SANITIZED_SENTINEL_MUST_NOT_PRINT\n')
env={**base,'DETRAN_STACK_STATE_DIR':str(present)}
p=run('present exact reports',['bash',str(root/'diagnostics.sh')],env)
assert p.returncode==0 and 'synthetic_failure' in p.stdout and 'SANITIZED_SENTINEL' not in p.stdout
missing=root/'missing';missing.mkdir(exist_ok=True)
p=run('missing reports',['bash',str(root/'diagnostics.sh')],{**base,'DETRAN_STACK_STATE_DIR':str(missing)})
assert p.returncode==0 and 'No smoke report was produced' in p.stdout
# Simulates independent runner steps under always(); deliberately does not emulate runner internals.
job_steps=[]
for name,args in [('original smoke failure',['bash','-c','exit 1']),('always diagnostics',['bash',str(root/'diagnostics.sh')]),('always cleanup',['bash','-c',"printf 'synthetic cleanup executed\\n'"])]:
 p=run(name,args,env);job_steps.append(p.returncode)
assert job_steps==[1,0,0]
job_exit=1 if any(job_steps) else 0
results.append({'name':'simulated aggregate job','exit':job_exit,'note':'Original nonzero remains failure; diagnostic and cleanup steps executed. Not live GitHub runner validation.'})
summary={'status':'PASS','script_sha256':hashlib.sha256(script.encode()).hexdigest(),'cases':results,'limitations':['No stack start, no production request, no repository edit.','Nullish matrix verifies directory selection only, avoiding access to unrelated /tmp reports.','Runner semantics simulated; actual CI diagnostic publication still requires candidate run.']}
(root/'results.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps({'status':summary['status'],'script_sha256':summary['script_sha256'],'case_count':len(results),'job_step_exits':job_steps,'simulated_job_exit':job_exit}))
