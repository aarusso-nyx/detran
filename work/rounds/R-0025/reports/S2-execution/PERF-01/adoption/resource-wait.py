import pathlib,subprocess,json,datetime,time,sys
p=pathlib.Path('/tmp/pr211-adoption-validation/resource-wait');p.mkdir(exist_ok=True);quiet=0
for i in range(1,22):
 r=[]
 for l in subprocess.check_output(['ps','-axo','pid=,pcpu=,args='],text=True).splitlines():
  a=l.split(None,2)
  if len(a)<3:continue
  kind=next((k for x,k in [('vitest','Vitest'),('tsc --','TypeScript'),('devai','DEVAI'),('vite build','build'),('run-backend-kernel','backend kernel')] if x in a[2]),None)
  if kind and 'python3 -' not in a[2] and '/bin/zsh -lc' not in a[2]:r.append({'pid':int(a[0]),'cpu':float(a[1].replace(',','.')),'kind':kind})
 j={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'host':subprocess.check_output(['sysctl','hw.ncpu','hw.memsize','vm.loadavg'],text=True),'knownJobs':r,'limitation':'Known job markers only; no exclusive CPU guarantee; no numerical load gate.'};(p/f'{i:02d}.json').write_text(json.dumps(j,indent=2)+'\n');print(json.dumps({'sample':i,'knownJobs':r,'utc':j['utc']}),flush=True)
 quiet=quiet+1 if not r else 0
 if quiet>=2:(p/'quiet.json').write_text(json.dumps({'samples':[i-1,i],'meaning':'Two successive30s-spaced preflights show no competingknownheavyjob; OSshared and hostmetrics retained.'},indent=2)+'\n');sys.exit(0)
 if i<21:time.sleep(30)
sys.exit(3)
