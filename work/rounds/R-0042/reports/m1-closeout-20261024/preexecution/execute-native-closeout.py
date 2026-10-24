from pathlib import Path
import subprocess,os,json,hashlib,datetime,yaml,sys
root=Path('/Volumes/Development/.codex/worktrees/completion-roadmap/detran');out=Path(__file__).resolve().parent
assert sys.argv[1:]==['--execute-after-real-postintegration-and-review-pass']
review=json.loads((out/'preexecution-review1.json').read_text());assert review['overall_verdict']=='PASS'
accept=json.loads((out/'actual-postintegration-acceptance.json').read_text())
assert accept['delivery_head522_all_five_required_green'] is True
assert accept['postintegration_ci40060467337_all_jobs_pass'] is True
assert accept['all_light_checks_pass'] is True and accept['all_preexecution_review_conditions_fulfilled'] is True
M='f50b9ce7dd32dff66646fd01e99b0556e4d76bdb'
assert accept['actual_merge']==M
A=accept['preclose_source_commit']
def git(*args):return subprocess.check_output(['git',*args],cwd=root)
assert git('rev-parse','HEAD').decode().strip()==A
subprocess.run(['git','merge-base','--is-ancestor',M,A],cwd=root,check=True)
auth=root/'work/rounds/R-0042/AUTHORIZATION.md'
assert 'status: active' in auth.read_text() and 'GRANTED' in auth.read_text()
assert git('show',A+':work/rounds/R-0042/AUTHORIZATION.md')==auth.read_bytes()
decisions=(root/'work/rounds/R-0042/decisions.md').read_text();assert '## D-6' in decisions
assert 'PROPOSED' not in decisions.split('## D-6',1)[1] and 'adopted' in decisions.split('## D-6',1)[1].lower()
assert '### D-6' in (root/'law/register/DECISIONS.md').read_text()
assert accept['retained_failed_trusted_check']==120772707099 and accept['retained_failed_trusted_run']==40060467323
assert isinstance(accept['successful_postintegration_fallback_check'],int)
assert not (root/'work/rounds/R-0042/close-state.jsonl').exists()
assert not (out/'execution-started.json').exists(),'No automatic restart after any attempt; inspect actual boundary and preserve receipts'
native=out/'native-closeout-attempt-0001';native.mkdir(exist_ok=False)
with (out/'execution-started.json').open('x') as f:json.dump({'started_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'preclose_source_commit':A,'attempt_directory':str(native),'no_automatic_restart':True},f,indent=2)
env=os.environ.copy();env['PATH']='/Volumes/Development/runtimes/nvm/versions/node/v24.20.0/bin:'+env['PATH'];env['NODE_AUTH_TOKEN']=subprocess.check_output(['gh','auth','token'],text=True).strip()
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write_new(p,b):
 with p.open('xb') as f:f.write(b)
def run(label,args):
 for suffix in ['.stdout','.stderr','.execution.json']:assert not (native/(label+suffix)).exists()
 p=subprocess.run(args,cwd=root,env=env,capture_output=True)
 write_new(native/(label+'.stdout'),p.stdout);write_new(native/(label+'.stderr'),p.stderr)
 write_new(native/(label+'.execution.json'),(json.dumps({'argv':args,'exit':p.returncode,'ended_at':datetime.datetime.now(datetime.timezone.utc).isoformat()},indent=2)+'\n').encode())
 print(label+': '+str(p.returncode),flush=True)
 assert p.returncode==0,label+' refused; stop and preserve all receipts, no automatic replay'
 return p.stdout
base=['pnpm','exec','devai'];role=['--as-role','architect','--write','--format','json']
chain0=json.loads((root/'record/proofs/chain.json').read_text());assert len(chain0['records'])==448
bl0=json.loads((root/'.devai/state/backlog/BL-0024.json').read_text());assert bl0['status']=='open'
paths=['.devai/state/sensor-readings','work/rounds/R-0036','work/rounds/R-0037','work/rounds/R-0038','work/rounds/R-0039','.devai/state/evidence-chain.json','.devai/config','.devai/pin','.devai/state/backlog','law/policy','law/register/DECISIONS.md','work/rounds/R-0042/AUTHORIZATION.md','work/rounds/R-0042/decisions.md','docs/meta/decisions','test-tasks.json','package.json','pnpm-lock.yaml','docs/site/package.json','docs/site/package-lock.json','.github/workflows','tools/ci','CONSTITUTION.md','AGENTS.md','CLAUDE.md']
sourcefiles=git('ls-files','-z','--',*paths).decode().strip('\0').split('\0')
before={p:sha(root/p) for p in sourcefiles if p and p!='.devai/state/backlog/BL-0024.json'}
write_new(out/'before-native-closeout-custody.json',(json.dumps({'chain_sha256':sha(root/'record/proofs/chain.json'),'chain_records':448,'files':before,'original_backlog':bl0,'preclose_source_commit':A},indent=2)+'\n').encode())
run('pre-authored-format',['pnpm','exec','prettier','--check','work/rounds/R-0042/AUTHORIZATION.md','work/rounds/R-0042/decisions.md','law/register/DECISIONS.md'])
for label,args in [('pre-law',['pnpm','verify:law-corpus']),('pre-chain-verify',base+['evidence','verify','--scope','chain','--repo-root','.','--show-head','--format','human'])]:run(label,args)
report=root/'work/rounds/R-0042/reports/m1-closeout-20261024'
assert (report/'acceptance-artifacts-manifest.json').is_file()
payload={'kind':'bounded-r0042-measurement-postintegration-acceptance','round':'R-0042','actual_merge':M,'preclose_source_commit':A,'measurement_source':'21427c25fe2e1c7977ca0311156d4c59d8cfea35','native_quality':'26PASS/12REVIEW/5FAIL+2unchangedNA; overallFAIL','completeness':'43applicable measured/zero cell observation gaps; originalseven allsupported','independent_review_sha256':sha(out/'preexecution-review1.json'),'actual_postintegration_acceptance_sha256':sha(out/'actual-postintegration-acceptance.json'),'source_equivalence_sha256':sha(out/'actual-integration-source-equivalence.json'),'retained_acceptance_artifacts_manifest_sha256':sha(report/'acceptance-artifacts-manifest.json'),'successful_postintegration_fallback_check':accept['successful_postintegration_fallback_check'],'retained_failed_trusted_check':120772707099,'retained_failed_trusted_run':40060467323,'historical_limitations':'Same13historicalartifactavailabilityissues; originalX128proofanchors53acknowledgedproofgaps separate. No global availability PASS.','limits':'#211unmerged/S3held/C6nineinactive; BL25/BL20/R20/R41/R44/R45andotherresidualsremainopen. Finalcleancloseoutcandidate stillrequiresfreshsignedRC/exactcommitverification beforeprotectedmerge.'}
inp=out/'acceptance-evidence-input.json';write_new(inp,(json.dumps(payload,indent=2)+'\n').encode())
accepted_receipt=json.loads(run('acceptance-evidence-record',base+['evidence','record','--kind','generic','--round','R-0042','--repo-root','.','--input',str(inp),*role]))['result']['value']
epoch='record/proofs/work/generic/R-0042.jsonl';tail=json.loads((root/epoch).read_text().splitlines()[-1])
assert tail['round_id']=='R-0042' and tail['payload']==payload
assert accepted_receipt['proof']==tail and accepted_receipt['chain']['ok'] is True
accepted_chain=json.loads((root/'record/proofs/chain.json').read_text());accepted_chain_sha=sha(root/'record/proofs/chain.json')
assert len(accepted_chain['records'])==449 and accepted_chain['records'][:448]==chain0['records']
bound=accepted_chain['records'][-1]
assert bound['id']==accepted_receipt['chain']['id'] and bound['action']=='evidence.record.generic' and bound['status']=='completed'
assert bound['context']['git']['head_sha']==A and bound['proof_path']==epoch and bound['proof_sequence']==tail['sequence']
assert bound['proof_sha256']==hashlib.sha256((root/epoch).read_bytes().splitlines()[-1]).hexdigest()
def boundary(label,backlog_expected='open'):
 assert git('rev-parse','HEAD').decode().strip()==A
 current=json.loads((root/'record/proofs/chain.json').read_text())
 assert len(current['records'])==449 and current['records'][:448]==chain0['records']
 assert current==accepted_chain and sha(root/'record/proofs/chain.json')==accepted_chain_sha
 actual_tail=json.loads((root/epoch).read_text().splitlines()[-1])
 assert actual_tail==tail and actual_tail['payload']==payload
 assert all(sha(root/p)==v for p,v in before.items())
 assert sha(report/'acceptance-artifacts-manifest.json')==payload['retained_acceptance_artifacts_manifest_sha256']
 current_backlog=json.loads((root/'.devai/state/backlog/BL-0024.json').read_text())
 assert current_backlog['status']==backlog_expected
 if backlog_expected=='open':assert current_backlog==bl0
 else:assert all(current_backlog.get(k)==v for k,v in bl0.items() if k not in ['status','resolved_at','resolution'])
 write_new(native/(label+'.boundary.json'),(json.dumps({'head':A,'original448prefix_intact':True,'records':449,'actual_generic_terminal':actual_tail['line_hash'],'protected_hash_count':len(before),'backlog_expected':backlog_expected,'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat()},indent=2)+'\n').encode())
boundary('after-generic-acceptance')
draft=json.loads((out/'proposed-closure.json').read_text())
assert len(draft['gates'])==12
assert {k for k,v in draft['gates'].items() if v['status']!='pass'}=={'post-integration-verification','independent-closeout-review'}
draft['gates']['post-integration-verification']={'status':'pass','detail':'Protected#224integration hadfivegreenrequiredchecks at522e61d3. Actualmerge '+M+' equalsaccepted522tree; actualCI40060467337alljobsPASS(stacksmokeoriginalSKIP), including remote backendfallbackcheck '+str(accept['successful_postintegration_fallback_check'])+', plus9lightgatesPASS. TrustedRCrun40060467323/job120772645725/check120772707099 remainFAILmissingexacttree-tag404andsecondarymissing-summary, retained; no globalmain-green/signed/attestedclaim. FinalCsignature mandatorybeforecloseoutPRmerge.'}
draft['gates']['independent-closeout-review']={'status':'pass','detail':'Read-onlycrossfamilyconditionalPASS '+sha(out/'preexecution-review1.json')+'; allpreexecutionconditions fulfilled in actual-postintegration-acceptance.json. Actualposttransitionchecks/finalCsignature remain explicit later obligations; no future outcome accepted.'}
pending=[i for i,item in enumerate(draft['validation_criteria']) if item['verdict']!='pass']
assert pending==[3] and draft['validation_criteria'][3]['criterion']=='Actual protected integration and post-integration standing support bounded measurement acceptance'
assert draft['validation_criteria'][3]['verdict']=='fail' and 'PENDING' in draft['validation_criteria'][3]['evidence']
draft['validation_criteria'][3].update(verdict='pass',evidence='Actual#224merge '+M+'; exactmergedtree/materialequivalence, actualCI40060467337successfuljobs/fallback'+str(accept['successful_postintegration_fallback_check'])+'/9lightgates/review retained. SeparatetrustedRC40060467323/check120772707099FAIL retained; finalCsignature stillmandatory.')
run('acceptance-proof-anchors',['pnpm','verify:proof-anchors'])
draft['gates']['evidence-chain']['detail']+=' OriginalXcapture128anchors; actualpostacceptance proof-anchor output retained as native-closeout-attempt-0001/acceptance-proof-anchors.stdout with no undeclaredgaps/errors.'
draft['evidence']={'proof_epoch':epoch,'terminal_sha256':tail['line_hash']}
draft['notes']='ArchitectD6 accepts only completed originalmeasurement scope. ActualnativequalityFAIL/residuals/historical13limitations and failedattempts preserved. Authentic newgenericacceptance tail binds actualpostintegration/review evidence. RuntimeallocatesPC/seal. Finalcleancloseoutcandidate must stillobtainfreshsignedRC/exactcommitverification/allrequiredgreen/reviewbeforeitsprotectedmerge. M224trustedRCfailure isretained, not waived or describedgreen.'
assert all(g['status']=='pass' for g in draft['gates'].values()) and all(c['verdict']=='pass' for c in draft['validation_criteria'])
assert 'PENDING' not in json.dumps(draft)
closure=root/'work/rounds/R-0042/closure.json';assert not closure.exists();write_new(closure,(json.dumps(draft,indent=2)+'\n').encode())
run('format-closure-input',['pnpm','exec','prettier','--write','work/rounds/R-0042/closure.json'])
write_new(out/'final-closure-input.json',closure.read_bytes())
boundary('before-round-close')
closed=json.loads(run('round-close',base+['round','close','--round','R-0042','--repo-root','.','--input',str(closure),*role]))
write_new(out/'round-close.json',(json.dumps(closed,indent=2)+'\n').encode())
value=closed.get('result',{}).get('value',closed);pc=value['record']['id'];assert value['record']['round_id']=='R-0042'
original=(root/'work/rounds/R-0042/record.md').read_text();record=yaml.safe_load(original.split('---',2)[1]);preserved=dict(record)
record.update(status='closed',closed_by='D-6',phase_closure=pc,merged_as=M)
assert all(record[k]==v for k,v in preserved.items() if k!='status')
declared=out/'closed-round-declaration-input.json';write_new(declared,(json.dumps(record,indent=2)+'\n').encode())
boundary('before-round-plan-declare')
run('round-plan-declare',base+['round','plan','--round','R-0042','--repo-root','.','--declare',str(declared),*role])
boundary('before-derived-index-render')
run('render-rounds-index',['node','tools/devai/render-rounds-index.mjs','--write'])
assert any(pc in l and 'R-0042' in l for l in (root/'record/derived/indexes/rounds.md').read_text().splitlines())
boundary('before-round-seal')
run('round-seal',base+['round','seal','--round','R-0042','--repo-root','.',*role])
boundary('before-backlog-resolve')
run('backlog-resolve',base+['backlog','resolve','BL-0024','--repo-root','.','--resolution','https://github.com/aarusso-nyx/detran/pull/224#merge-'+M+'; R-0042 '+pc+'; complete source21427c25 43measured/zeroobservationgaps, native26P12R5F+2NA overallFAIL; residuals/C6holds retained.',*role])
boundary('after-backlog-resolve','resolved')
bl=json.loads((root/'.devai/state/backlog/BL-0024.json').read_text())
assert bl['status']=='resolved' and all(bl.get(k)==v for k,v in bl0.items() if k not in ['status','resolved_at','resolution'])
chain=json.loads((root/'record/proofs/chain.json').read_text());assert len(chain['records'])==449 and chain['records'][:448]==chain0['records']
assert all(sha(root/p)==v for p,v in before.items())
human=root/'work/rounds/README.md';lines=human.read_text().splitlines();matches=[i for i,l in enumerate(lines) if l.startswith('| R-0042 |')];assert len(matches)==1
oldrow=lines[matches[0]];assert 'aberta' in oldrow and pc not in oldrow
lines[matches[0]]='| R-0042 | Seven measurement gaps measured; native overall FAIL retained; C6 held | fechada | [#224](https://github.com/aarusso-nyx/detran/pull/224) | '+pc+' | Codex |'
human.write_text('\n'.join(lines)+'\n')
run('format-human-round-index',['pnpm','exec','prettier','--write','work/rounds/README.md'])
# Prettier may reflow authored ledgers; it cannot rewrite machine record/proofs.
for name in ['verify:law-corpus','verify:state-index','verify:rounds-index','verify:proof-anchors','verify:task-originals','devai:doctor']:
 run('post-'+name.replace(':','-'),['pnpm',name])
run('post-history',['node','tools/security/verify-historical-compatibility.mjs'])
run('post-schema-census',['node','tools/security/schema-citation-census.mjs'])
run('post-round-status',base+['round','status','--round','R-0042','--repo-root','.','--format','json'])
boundary('after-all-posttransition-checks','resolved')
assert all(sha(root/p)==v for p,v in before.items())
write_new(out/'actual-native-closeout-result.json',(json.dumps({'pc':pc,'round':'R-0042','actual_merge':M,'preclose_source_commit':A,'original448recordprefix_preserved':True,'final449records':True,'protected_source_hashes_preserved':len(before),'backlog_original_body_origin_preserved':True,'human_index_row_updated':True,'all_posttransition_checks_pass':True,'final_signedRC':'NOT_YET_RUN on later cleanpublishedcloseoutcandidate'},indent=2)+'\n').encode())
print('Actual PC '+pc+'; nativecloseout/postchecks executed, finalsourceRC/integration stillpending',flush=True)
