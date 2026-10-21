import pathlib,json,hashlib,gzip,shutil,collections,statistics,math
src=pathlib.Path('/tmp/pr211-calibration'); dest=pathlib.Path('work/rounds/R-0025/reports/S2-execution/PERF-01/calibration'); dest.mkdir(exist_ok=True)
j=json.loads((src/'progress.json').read_text());assert j['complete'] and j['remaining']==0
summary={'measuredHead':j['head'],'sourceHashes':j['sourceHashes'],'plannedBodyObservations':24,'bodyObservations':24,'extraSetupFailures':1,'profilePass':4,'functionalPass':17,'functionalCensoredFailures':3,'default30sExceedances':24,'epochs':[],'functionalCohorts':{},'profilePartitions':[], 'limitations':['Native PASS under provisional90/120 is assertion completion only, not performance acceptance or product SLO.','All failed/setup epochs retained. No completed-only maximum or p95 tail bound.','Each sample is a fresh normal serial native invocation; setup/cache/host conditions differ. No causal profile-minus-functional subtraction.','Query leaf elapsed includes driver/network/PG/host scheduling, not pure server SQL. Observer wrapper and nested inclusive spans are not added to leaf totals.']}
for e in j['epochs']:
 d=pathlib.Path(e['directory']); out=dest/d.name;out.mkdir(exist_ok=True)
 raw=d/'raw.log';data=raw.read_bytes();assert hashlib.sha256(data).hexdigest()==e['rawCustody']['uncompressedSHA256'];assert gzip.decompress((d/'raw.log.gz').read_bytes())==data
 for n in ['raw.log.gz','epoch.json','host-before.txt','host-after.txt','prepare.log','result.json','readonly-activity.txt']:
  if (d/n).exists():shutil.copy2(d/n,out/n)
 c=e['calibration'];late=[];p0=None
 for line in data.decode().splitlines():
  if line.startswith('CALIBRATION_LATE_HTTP '):late.append(json.loads(line.split(' ',1)[1]))
  if line.startswith('P0_OBSERVATION '):p0=json.loads(line.split(' ',1)[1])
 body=[o for o in (c or {}).get('operations',[]) if o['phase']=='body'];setup=[o for o in (c or {}).get('operations',[]) if o['phase']=='setup']
 result=json.loads((d/'result.json').read_text());active=[a for f in result['testResults'] for a in f['assertionResults'] if a['status']!='pending']; messages=[m for a in active for m in a.get('failureMessages',[])]; timed='Test timed out in 90000ms.' in data.decode()
 row={k:e[k] for k in ['slot','mode','round','control','attempt','startUTC','endUTC','runnerExit','runnerWallSeconds','budgetMs','bodyObserved','nativeCounts','detailedSnapshots','lateHTTPCount','rawCustody']};row.update({'artifactDirectory':out.name,'bodyMs':c['bodyMs'] if c else None,'setupMs':c['setupMs'] if c else None,'setupHTTPCount':len(setup),'bodyHTTP':body,'lateHTTP':late,'queryPrototypeOriginal':c.get('queryPrototypeOriginal') if c else None,'classification':'setup-failure' if not e['bodyObserved'] else 'right-censored-timeout' if timed else 'assertions-pass' if e['runnerExit']==0 else 'assertion-failure','completionIntervalMs':[90000,None] if timed else [c['bodyMs'],c['bodyMs']] if e['bodyObserved'] and e['runnerExit']==0 else None,'nativeSelectedAssertions':active})
 summary['epochs'].append(row)
 if p0:
  qs=[q for q in p0['queries'] if q['phase']=='body'];cats={}
  for q in qs:
   z=cats.setdefault(q['category'],{'count':0,'leafElapsedMs':0,'observerBeforeMs':0,'observerAfterMs':0});z['count']+=1
   for key in ['observerBeforeMs','observerAfterMs']:z[key]+=q.get(key,0)
   z['leafElapsedMs']+=q['elapsedMs']
  byop={}
  for q in qs:
   z=byop.setdefault(q['operation'],{'count':0,'leafElapsedMs':0,'observerBeforeMs':0,'observerAfterMs':0,'categories':collections.Counter()});z['count']+=1;z['leafElapsedMs']+=q['elapsedMs'];z['observerBeforeMs']+=q.get('observerBeforeMs',0);z['observerAfterMs']+=q.get('observerAfterMs',0);z['categories'][q['category']]+=1
  spans=collections.defaultdict(lambda:{'count':0,'inclusiveMs':0,'depths':collections.Counter()})
  for s in p0['spans']:
   z=spans[s['kind']];z['count']+=1;z['inclusiveMs']+=s['inclusiveMs'];z['depths'][s['depth']]+=1
  summary['profilePartitions'].append({'control':e['control'],'bodyQueryCount':len(qs),'bodyExclusiveCategories':cats,'bodyByOperation':byop,'inclusiveSpansAllPhasesNotAdditive':dict(spans),'source':'Full immutable raw P0_OBSERVATION, body-phase filter; operation IDs from same observer only.','leafNotPureSQL':True,'lockCategoryLimitation':'SQL lexical/ancestor classification is observational; server lock wait durations not separately measured.'})
for control in ['risk','legacy','routing','incident']:
 rows=[e for e in summary['epochs'] if e['control']==control and e['mode']=='functional' and e['bodyObserved']];assert len(rows)==5
 lo=sorted(r['completionIntervalMs'][0] for r in rows);hi=sorted(float('inf') if r['completionIntervalMs'][1] is None else r['completionIntervalMs'][1] for r in rows)
 summary['functionalCohorts'][control]={'samples':[{'round':r['round'],'classification':r['classification'],'bodyCutoffOrCompletionMs':r['bodyMs'],'completionIntervalMs':r['completionIntervalMs']} for r in rows],'pass':sum(r['classification']=='assertions-pass' for r in rows),'censored':sum(r['classification']=='right-censored-timeout' for r in rows),'empiricalMedianIntervalMs':[lo[2],None if math.isinf(hi[2]) else hi[2]],'empiricalMaximumIntervalMs':[max(lo),None if math.isinf(max(hi)) else max(hi)],'p95':'NOT_ESTIMATED: five observations and right censoring cannot establish tail bound'}
for n in ['final-idle.txt','final-typecheck.log','final-format.log']:
 if (src/n).exists():shutil.copy2(src/n,dest/n)
shutil.copy2(src/'progress.json',dest/'all-epochs.json');shutil.copy2(pathlib.Path('/tmp/pr211-calibration-progress.log'),dest/'runner-progress.log')
(dest/'final-results.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps({'epochs':len(summary['epochs']),'bodies':24,'cohorts':summary['functionalCohorts'],'profileQueries':[(p['control'],p['bodyQueryCount']) for p in summary['profilePartitions']]}))
