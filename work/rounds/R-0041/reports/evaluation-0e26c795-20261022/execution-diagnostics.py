import pathlib,json,re,datetime
repo=pathlib.Path('/Volumes/Development/.codex/worktrees/scorecard-0e26/detran');root=pathlib.Path(__file__).parent;records=[]
for p in sorted((repo/'.devai/local/rounds/R-0036/coverage-runs').glob('*/test-results.json')):
 x=json.loads(p.read_text()); failures=[]
 for suite in x.get('testResults',[]):
  for a in suite.get('assertionResults',[]):
   if a.get('status')=='failed': failures.append({'file':suite.get('name'),'fullName':a.get('fullName'),'failureMessages':a.get('failureMessages')})
 records.append({'path':str(p.relative_to(repo)),**{k:x.get(k)for k in ['numTotalTestSuites','numPassedTestSuites','numFailedTestSuites','numTotalTests','numPassedTests','numFailedTests','numPendingTests','numTodoTests','success','startTime']},'failed_assertions':failures})
steps=[]
for p in sorted((repo/'.devai/local/rounds/R-0036/tasks').glob('*/*.json')):
 try: x=json.loads(p.read_text())
 except: continue
 stdout=p.with_name(p.stem+'.stdout.log');stderr=p.with_name(p.stem+'.stderr.log');text=(stdout.read_text(errors='replace')if stdout.exists()else '')+'\n'+(stderr.read_text(errors='replace')if stderr.exists()else '');clean=re.sub(r'\x1b\[[0-9;]*m','',text)
 steps.append({'path':str(p.relative_to(repo)),**x,'summary_lines':[line for line in clean.splitlines()if re.search(r'Test Files|Tests\s+\d|Duration\s+\d|Hook timed out|beforeAll|samples|p95|p50',line)][-18:]})
out={'observed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_head':'0e26c795b08374bfdce3e21e520c3945bf97a5d5','full_test_result_populations':records,'original_task_steps':steps,'limits':'Diagnostic summaries only; native readings and original result/log bytes remain authoritative. No inferred cause or synthesized performance/coverage population.'};(root/'execution-diagnostics.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'full_test_result_populations':len(records),'task_steps':len(steps)}))
