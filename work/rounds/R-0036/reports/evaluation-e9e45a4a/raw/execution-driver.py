from pathlib import Path
import subprocess,os,json,sys
commit='e9e45a4a6cbed5cfd394c716c79a55b1aca386b8'
base=Path('.devai/local/rounds/R-0036/audit/published-263-e9e45a4a')
env=dict(os.environ,DETRAN_SCORECARD_SESSION='published-263-e9e45a4a',NODE_AUTH_TOKEN=subprocess.check_output(['gh','auth','token'],text=True).strip())
inspect_js="""import fs from 'node:fs';import {parseCommandDocument,unwrapCommandDocument} from './tools/devai/scorecard-output.mjs';const d=unwrapCommandDocument(parseCommandDocument(JSON.parse(fs.readFileSync(process.argv[1]))));console.log(JSON.stringify(d));"""
def guard():
 assert subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()==commit,'Frozen HEAD moved'
def run(args,extra=None):
 guard();print('BEGIN',args[0:3],flush=True)
 result=subprocess.run(['node','tools/devai/scorecard-evaluation.mjs',*args],env=dict(env,**(extra or {})))
 assert result.returncode==0,('Collection helper failed',args)
def value(label):
 return json.loads(subprocess.check_output(['node','--input-type=module','-e',inspect_js,str(base/(label+'.json'))],text=True))
def summary(label):
 d=value(label);readings=[json.loads(x['stdout']) for x in d.get('results',[]) if x.get('stdout')]
 assert readings,('No native reading',label)
 print('NATIVE',label,[(r['sensor']['kind'],r['status'],r.get('metrics',{}).get('tests_passed'),r.get('metrics',{}).get('tests_failed')) for r in readings],flush=True)
 return readings
run(['sensor','build','engineer','sensor-build'])
run(['sensor','inventory_regeneration','architect','sensor-inventory_regeneration'])
run(['sensor','migration_check','engineer','sensor-migration_check']);summary('sensor-migration_check')
inputs=json.loads(Path('law/policy/scorecard-sensor-inputs.json').read_text())['inputs']['test_coverage_depth']
run(['capture','prerequisite-coverage','pnpm','exec','devai','sense','run','test_coverage_depth','--repo-root','.','--input',json.dumps(inputs),'--format','json'],{'NODE_OPTIONS':'--max-old-space-size=8192'})
r=summary('prerequisite-coverage')[0];m=r.get('metrics',{});standard=json.loads(Path('coverage/coverage-summary.json').read_text())['total']['lines']
assert m.get('lines_total')==standard['total'] and m.get('lines_covered')==standard['covered'],'Exact native line population mismatch'
assert json.loads(Path('coverage/population.json').read_text())['binding']['commit']==commit
print('EXACT_LINE_COVERAGE',m,flush=True)
for kind in ['unit_test','integration_test','e2e_test']:
 run(['sensor',kind,'inspector','sensor-'+kind]);summary('sensor-'+kind)
run(['record','prerequisite-coverage','sensor-build','sensor-migration_check','sensor-unit_test','sensor-integration_test','sensor-e2e_test','sensor-inventory_regeneration'])
run(['enumerate-first'])
run(['record-first'])
run(['enumerate-second'])
policy=json.loads(Path('node_modules/@aarusso-nyx/devai/dist/law/policy/sense-presets.json').read_text())
run(['record',*['second-'+k for k in policy['selection_effect_rule']['sweep_second_pass'].split(',')]])
run(['capture','evaluated-scorecard','pnpm','exec','devai','audit','scorecard','--repo-root','.','--at',commit,'--format','json'])
s=value('evaluated-scorecard');print('SCORECARD',s.get('overall'),{v:sum(c['verdict']==v for c in s.get('cells',[])) for v in ['PASS','REVIEW','FAIL','UNKNOWN','N/A']},flush=True)
