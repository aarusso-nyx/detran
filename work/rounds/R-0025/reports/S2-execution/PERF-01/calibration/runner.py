import os,pathlib,subprocess,json,datetime,time,hashlib,gzip,sys
BASE=pathlib.Path('/tmp/pr211-calibration');BASE.mkdir(exist_ok=True)
COUNTERS=['risk','legacy','routing','incident']
PLAN=[('profile',0,c) for c in COUNTERS]+[('functional',rep,c) for rep in range(1,6) for c in COUNTERS]
STATUS={'plannedBodyObservations':24,'plan':[{'mode':m,'round':r,'control':c} for m,r,c in PLAN],'epochs':[],'remaining':24}
PATHS=['backend/app/tests/e2e/rait-p402-claim.e2e.spec.ts','backend/app/tests/shared/rait-p402-claim.fixture.ts','backend/app/src/rait-risk.providers.ts','backend/domains/inf/rait-case/src/handwritten/rait-risk.port.ts','backend/domains/inf/rait-case/src/handwritten/rait-claim-context.service.ts','pnpm-lock.yaml']
SOURCE={p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest() for p in PATHS}
STATUS['sourceHashes']=SOURCE;STATUS['head']=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip();STATUS['interpretation']='90/120 provisional experiment only; default30 unchanged/reference exceedance separate; no performancePASS orproductSLO'
def save(): (BASE/'progress.json').write_text(json.dumps(STATUS,indent=2)+'\n')
def host(p):
 with p.open('w') as f:
  for cmd in [['date','-u'],['sysctl','hw.ncpu','hw.memsize','vm.loadavg'],['docker','stats','--no-stream','--format','{{.Name}} CPU={{.CPUPerc}} MEM={{.MemUsage}}','detran-p402-s2-integration-20261019']]:subprocess.run(cmd,stdout=f,stderr=subprocess.STDOUT)
def idle():
 env=os.environ.copy();env['PGPASSWORD']=env['DB_PASSWORD']
 cmd=['psql','-w','-h','127.0.0.1','-p','53343','-U',env['DB_USER'],'-d','detran_r7_ctg1_a2','-X','-A','-t','-v','ON_ERROR_STOP=1','-c',"select current_database(),(select count(*) from pg_stat_activity where datname=current_database() and pid<>pg_backend_pid() and backend_type='client backend')"]
 for i in range(61):
  z=subprocess.run(cmd,env=env,text=True,capture_output=True)
  if z.returncode:raise RuntimeError('OwnedDB idleprobe failed; no credentialoutput')
  line=z.stdout.strip()
  if line=='detran_r7_ctg1_a2|0':return line
  if i==60:raise RuntimeError('OwnedDB notquiescent after60s; no processkill')
  time.sleep(1)
def verify():
 for p,h in SOURCE.items():
  if hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()!=h:raise RuntimeError('Frozen source drift:'+p)
save()
for slot,(mode,rep,control) in enumerate(PLAN,1):
 for attempt in range(1,4):
  verify();directory=BASE/f'{slot:02d}-{mode}-r{rep}-{control}-a{attempt}';directory.mkdir(exist_ok=True)
  record={'slot':slot,'mode':mode,'round':rep,'control':control,'attempt':attempt,'startUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'directory':str(directory),'idleBefore':idle()};host(directory/'host-before.txt')
  with (directory/'prepare.log').open('w') as f:
   prep1=subprocess.run(['bash','backend/database/seed.sh'],stdout=f,stderr=subprocess.STDOUT)
   prep2=subprocess.run(['pnpm','backend:test:prepare-legacy'],stdout=f,stderr=subprocess.STDOUT) if prep1.returncode==0 else prep1
  record['prepareExit']=[prep1.returncode,prep2.returncode]
  if prep1.returncode or prep2.returncode:STATUS['epochs'].append(record);save();raise RuntimeError('Supportedpreparation failed; preserved')
  env=os.environ.copy();env['DETRAN_TEST_TIER']='e2e';env['DETRAN_P402_CALIBRATION_MODE']=mode
  cmd=['pnpm','--filter','@detran/app','exec','vitest','run','tests/e2e/rait-p402-claim.e2e.spec.ts','-t',f'a {control} blocker beyond position50','--reporter=default','--reporter=json','--outputFile='+str(directory/'result.json')]
  record['command']=cmd;record['budgetMs']=120000 if mode=='profile' else 90000;t=time.monotonic()
  with (directory/'raw.log').open('w') as f: result=subprocess.run(cmd,env=env,stdout=f,stderr=subprocess.STDOUT)
  record['runnerExit']=result.returncode;record['runnerWallSeconds']=time.monotonic()-t;record['idleAfter']=idle();host(directory/'host-after.txt');verify()
  raw=(directory/'raw.log').read_text();j=json.loads((directory/'result.json').read_text()) if (directory/'result.json').exists() else {}
  rows=[json.loads(l.split(' ',1)[1]) for l in raw.splitlines() if l.startswith('CALIBRATION_OBSERVATION ')];cal=rows[-1] if rows else None
  record['calibration']=cal;record['nativeCounts']={k:j.get(k) for k in ['numPassedTests','numFailedTests','numPendingTests','numTotalTests']};record['detailedSnapshots']=raw.count('P0_OBSERVATION ');record['lateHTTPCount']=raw.count('CALIBRATION_LATE_HTTP ');record['bodyObserved']=bool(cal and cal['setupCompleted'] and cal['bodyMs'] is not None);record['endUTC']=datetime.datetime.now(datetime.timezone.utc).isoformat()
  if mode=='functional' and cal and (not cal['queryPrototypeOriginal'] or record['detailedSnapshots']):raise RuntimeError('Functionalqueryobservernotdisabled; stop')
  data=(directory/'raw.log').read_bytes();(directory/'raw.log.gz').write_bytes(gzip.compress(data,compresslevel=1,mtime=0));record['rawCustody']={'uncompressedSHA256':hashlib.sha256(data).hexdigest(),'uncompressedBytes':len(data),'gzipSHA256':hashlib.sha256((directory/'raw.log.gz').read_bytes()).hexdigest(),'gzipBytes':(directory/'raw.log.gz').stat().st_size}
  STATUS['epochs'].append(record)
  if record['bodyObserved']:STATUS['remaining']-=1
  save();(directory/'epoch.json').write_text(json.dumps(record,indent=2)+'\n')
  print(json.dumps({'slot':slot,'mode':mode,'round':rep,'control':control,'attempt':attempt,'bodyObserved':record['bodyObserved'],'bodyMs':cal['bodyMs'] if cal else None,'reference30sExceeded':cal['reference30sExceeded'] if cal else None,'exit':result.returncode,'remaining':STATUS['remaining']}),flush=True)
  if record['bodyObserved']:break
  if attempt==3:raise RuntimeError('Threeexplicitsetupattemptswithoutbody; stopforcoordination, no hiddenretry')
STATUS['complete']=True;save();print('CALIBRATION_COMPLETE',flush=True)
