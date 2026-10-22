import pathlib,subprocess,os,time,json,datetime,hashlib,gzip
B=pathlib.Path('/tmp/pr211-adoption-validation');B.mkdir(exist_ok=True)
paths=['backend/app/tests/e2e/rait-p402-claim.e2e.spec.ts','backend/app/tests/shared/rait-p402-claim.fixture.ts','backend/app/src/rait-risk.providers.ts','backend/domains/inf/rait-case/src/handwritten/rait-risk.port.ts','backend/domains/inf/rait-case/src/handwritten/rait-claim-context.service.ts','pnpm-lock.yaml']
sha=lambda p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
s={'head':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'sourceHashes':{p:sha(p) for p in paths},'envModePresent':'DETRAN_P402_CALIBRATION_MODE' in os.environ,'stages':[],'scope':'Approved adoption validation;30s reference remains separate; no performance/SLO/readiness claim'}
s=json.loads((B/'progress.json').read_text())
assert not s['envModePresent']
def save(): (B/'progress.json').write_text(json.dumps(s,indent=2)+'\n')
def idle():
 e=os.environ.copy();e['PGPASSWORD']=e['DB_PASSWORD'];r=subprocess.run(['psql','-w','-h','127.0.0.1','-p','53343','-U',e['DB_USER'],'-d','detran_r7_ctg1_a2','-X','-A','-t','-v','ON_ERROR_STOP=1','-c',"select current_database(),(select count(*) from pg_stat_activity where datname=current_database() and pid<>pg_backend_pid() and backend_type='client backend')"],env=e,capture_output=True,text=True);assert r.returncode==0,'idle probe failed';return r.stdout.strip()
def host(p):
 with p.open('w') as f:
  for a in [['date','-u'],['sysctl','hw.ncpu','hw.memsize','vm.loadavg'],['top','-l','2','-s','1','-n','0'],['docker','stats','--no-stream','--format','{{.Name}} CPU={{.CPUPerc}} MEM={{.MemUsage}}','detran-p402-s2-integration-20261019']]:subprocess.run(a,stdout=f,stderr=subprocess.STDOUT)
 # Only categorical job metadata retained; no unrelated args or private paths.
 r=[]
 for l in subprocess.check_output(['ps','-axo','pid=,pcpu=,args='],text=True).splitlines():
  a=l.split(None,2)
  if len(a)<3:continue
  kind=next((k for x,k in [('vitest','Vitest'),('tsc --','TypeScript'),('devai','DEVAI'),('vite build','build'),('run-backend-kernel','backend kernel')] if x in a[2]),None)
  if kind and 'python3 -' not in a[2] and '/bin/zsh -lc' not in a[2]:r.append({'pid':int(a[0]),'cpu':float(a[1].replace(',','.')),'kind':kind})
 p.with_suffix('.jobs.json').write_text(json.dumps(r,indent=2)+'\n');return r
stages=[('native-four',['pnpm','--filter','@detran/app','exec','vitest','run','tests/e2e/rait-p402-claim.e2e.spec.ts','-t','blocker beyond position50','--reporter=default','--reporter=json']),('claim126',['pnpm','--filter','@detran/app','exec','vitest','run','tests/e2e/rait-p402-claim.e2e.spec.ts','--reporter=default','--reporter=json']),('scope-jw01',['pnpm','--filter','@detran/app','exec','vitest','run','tests/e2e/rait-p402-scope.e2e.spec.ts','tests/e2e/rait-jw01-admissibility.e2e.spec.ts','--reporter=default','--reporter=json']),('canonical-kernel',['bash','tools/ci/run-backend-kernel.sh'])]
save()
for name,cmd in stages[2:]:
 for p,h in s['sourceHashes'].items():assert sha(p)==h,'SOURCE DRIFT'
 d=B/name;d.mkdir(exist_ok=True);r={'name':name,'startedUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'dbBefore':idle()};assert r['dbBefore']=='detran_r7_ctg1_a2|0','not quiescent'
 jobs=host(d/'host-before.txt');r['knownHeavyJobsBefore']=jobs
 if jobs:r['classification']='resource-blocked competing known jobs';s['stages'].append(r);save();raise SystemExit(3)
 if name!='canonical-kernel':
  with (d/'prepare.log').open('w') as f:
   z=subprocess.run(['bash','backend/database/seed.sh'],stdout=f,stderr=subprocess.STDOUT)
   if z.returncode==0:z=subprocess.run(['pnpm','backend:test:prepare-legacy'],stdout=f,stderr=subprocess.STDOUT)
  r['prepareExit']=z.returncode
  if z.returncode:r['classification']='preparation-failed';s['stages'].append(r);save();raise SystemExit(z.returncode)
  cmd=cmd+['--outputFile='+str(d/'result.json')]
 r['command']=cmd;s['running']=name;save();print('START '+name,flush=True)
 e=os.environ.copy()
 if name=='canonical-kernel':e.pop('DETRAN_TEST_TIER',None)
 else:e['DETRAN_TEST_TIER']='e2e'
 e.pop('DETRAN_P402_CALIBRATION_MODE',None);e.pop('STYNX_RATE_LIMIT_DEFAULT',None)
 r['explicitTier']=e.get('DETRAN_TEST_TIER','ABSENT')
 t=time.monotonic()
 with (d/'raw.log').open('w') as f:z=subprocess.run(cmd,stdout=f,stderr=subprocess.STDOUT,env=e)
 r.update({'exit':z.returncode,'wallSeconds':time.monotonic()-t,'finishedUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'dbAfter':idle()});host(d/'host-after.txt')
 raw=(d/'raw.log').read_bytes();gz=gzip.compress(raw,compresslevel=1,mtime=0);(d/'raw.log.gz').write_bytes(gz);r['rawCustody']={'SHA256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw),'gzipSHA256':hashlib.sha256(gz).hexdigest(),'gzipBytes':len(gz)}
 if (d/'result.json').exists():
  j=json.loads((d/'result.json').read_text());r['counts']={k:j.get(k) for k in ['numPassedTests','numFailedTests','numPendingTests','numTotalTests']}
  r['calibration']=[json.loads(l.split(' ',1)[1]) for l in raw.decode().splitlines() if l.startswith('CALIBRATION_OBSERVATION ')]
 r['sourceHashesAfter']={p:sha(p) for p in paths};assert r['sourceHashesAfter']==s['sourceHashes'];s['stages'].append(r);s.pop('running',None);save();(d/'stage.json').write_text(json.dumps(r,indent=2)+'\n');print('END '+name+' '+str(z.returncode),flush=True)
 if z.returncode:s['stoppedAtFailure']=name;save();raise SystemExit(z.returncode)
s['complete']=True;save()
