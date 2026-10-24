from pathlib import Path
import subprocess,os,json,hashlib,datetime,yaml,sys
root=Path('/Volumes/Development/.codex/worktrees/completion-roadmap/detran');out=Path(__file__).resolve().parent
assert sys.argv[1:]==['--execute-after-real-postintegration-and-review-pass']
review=json.loads((out/'preexecution-review1.json').read_text());assert review['overall_verdict']=='PASS'
accept=json.loads((out/'actual-postintegration-acceptance.json').read_text());assert accept['all_required_green'] is True and accept['all_light_checks_pass'] is True and accept['all_review_execution_conditions_fulfilled'] is True and accept['actual_merge']=='f50b9ce7dd32dff66646fd01e99b0556e4d76bdb'
assert not (out/'round-close.json').exists(),'Never repeat PC allocation automatically'
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()==accept['actual_merge']
auth=root/'work/rounds/R-0042/AUTHORIZATION.md';assert 'status: active' in auth.read_text() and 'GRANTED' in auth.read_text()
assert '## D-6' in (root/'work/rounds/R-0042/decisions.md').read_text()
assert '### D-6' in (root/'law/register/DECISIONS.md').read_text()
env=os.environ.copy();env['PATH']='/Volumes/Development/runtimes/nvm/versions/node/v24.20.0/bin:'+env['PATH'];env['NODE_AUTH_TOKEN']=subprocess.check_output(['gh','auth','token'],text=True).strip()
native=out/'native-closeout';native.mkdir(exist_ok=True)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def run(label,args):
 p=subprocess.run(args,cwd=root,env=env,capture_output=True)
 (native/(label+'.stdout')).write_bytes(p.stdout);(native/(label+'.stderr')).write_bytes(p.stderr)
 (native/(label+'.execution.json')).write_text(json.dumps({'argv':args,'exit':p.returncode,'ended_at':datetime.datetime.now(datetime.timezone.utc).isoformat()},indent=2)+'\n')
 print(label+': '+str(p.returncode),flush=True)
 assert p.returncode==0,label+' refused; dependent actions stopped, preserve output'
 return p.stdout
base=['pnpm','exec','devai'];role=['--as-role','architect','--write','--format','json']
chain0=json.loads((root/'record/proofs/chain.json').read_text());assert len(chain0['records'])==448
bl0=json.loads((root/'.devai/state/backlog/BL-0024.json').read_text());assert bl0['status']=='open'
sourcefiles=subprocess.check_output(['git','ls-files','-z','.devai/state/sensor-readings','work/rounds/R-0036','work/rounds/R-0037','work/rounds/R-0038','work/rounds/R-0039','.devai/state/evidence-chain.json','.devai/config'],cwd=root).decode().strip('\0').split('\0')
before={p:sha(root/p) for p in sourcefiles if p}
(out/'before-native-closeout-custody.json').write_text(json.dumps({'chain_sha256':sha(root/'record/proofs/chain.json'),'chain_records':448,'files':before,'original_backlog':bl0},indent=2)+'\n')
run('pre-chain-verify',base+['evidence','verify','--scope','chain','--repo-root','.','--show-head','--format','human'])
payload={'kind':'bounded-r0042-measurement-postintegration-acceptance','round':'R-0042','actual_merge':accept['actual_merge'],'measurement_source':'21427c25fe2e1c7977ca0311156d4c59d8cfea35','native_quality':'26PASS/12REVIEW/5FAIL+2unchangedNA; overallFAIL','completeness':'43applicable measured/zero cell observation gaps; originalseven allsupported','independent_review_sha256':sha(out/'preexecution-review1.json'),'actual_postintegration_acceptance_sha256':sha(out/'actual-postintegration-acceptance.json'),'source_equivalence_sha256':sha(out/'actual-integration-source-equivalence.json'),'audit_manifest_sha256':'929f46d47570726f6f0bde77f58750136e90e12b3536869a9903052383ecf4c5','historical_limitations':'Same13historicalartifactavailabilityissues;128proofanchors53acknowledgedproofgaps separate. No global availability PASS.','limits':'#211unmerged/S3held/C6nineinactive; BL25/BL20/R20/R41/R44/R45andotherresidualsremainopen. Finalcleancloseoutcandidate stillrequiresfreshsignedRC/exactcommitverification beforeprotectedmerge.'}
inp=out/'acceptance-evidence-input.json';inp.write_text(json.dumps(payload,indent=2)+'\n')
run('acceptance-evidence-record',base+['evidence','record','--kind','generic','--round','R-0042','--repo-root','.','--input',str(inp),*role])
epoch='record/proofs/work/generic/R-0042.jsonl'
tail=json.loads((root/epoch).read_text().splitlines()[-1]);assert tail['round_id']=='R-0042' and tail['payload']==payload
draft=json.loads((out/'proposed-closure.json').read_text())
draft['gates']['post-integration-verification']={'status':'pass','detail':'Actual #224merge '+accept['actual_merge']+' equals accepted522tree; CI40060467337allrequired/fullremotechecks passed and lightpolicy/law/state/round/proof/schema checks passed. Separate pre-existing missing-tree-tag localRCworkflow40060467323FAIL retained; laterfinalCsignature mandatorybeforecloseoutPRmerge, no claimthismergeissigned.'}
draft['gates']['independent-closeout-review']={'status':'pass','detail':'Read-only crossfamilyconditionalPASS '+sha(out/'preexecution-review1.json')+'; allsource/executionconditions fulfilled in actual-postintegration-acceptance.json. No futureRCresult accepted.'}
for item in draft['validation_criteria']:
 if item['verdict']=='fail':item.update(verdict='pass',evidence='Actual #224merge '+accept['actual_merge']+'; exactmergedtree/materialequivalence and actual CI40060467337/lightgates/review retained.')
run('acceptance-proof-anchors',['pnpm','verify:proof-anchors'])
draft['gates']['evidence-chain']['detail']+=' Original X capture had128anchors; actual post-acceptance proof-anchor verification is retained in native-closeout/acceptance-proof-anchors.stdout with zero undeclared gaps/errors.'
draft['evidence']={'proof_epoch':epoch,'terminal_sha256':tail['line_hash']}
draft['notes']='Architect D-6 accepts only completed originalmeasurement scope. ActualnativequalityFAIL/residuals/historical13limitations and failedattempts preserved. Authentic newgenericacceptance tail binds actualpostintegration/review evidence. RuntimeallocatesPC/seal. Finalcleancloseoutcandidate must stillobtainfreshsignedRC/exactcommitverification/allrequiredgreen/reviewbeforeitsprotectedmerge; no currentfutureRC assertion.'
closure=root/'work/rounds/R-0042/closure.json';closure.write_text(json.dumps(draft,indent=2)+'\n')
closed=json.loads(run('round-close',base+['round','close','--round','R-0042','--repo-root','.','--input',str(closure),*role]))
(out/'round-close.json').write_text(json.dumps(closed,indent=2)+'\n')
value=closed.get('result',{}).get('value',closed);pc=value['record']['id'];assert value['record']['round_id']=='R-0042'
original=(root/'work/rounds/R-0042/record.md').read_text();record=yaml.safe_load(original.split('---',2)[1]);preserved=dict(record)
record.update(status='closed',closed_by='D-6',phase_closure=pc,merged_as=accept['actual_merge'])
assert all(record[k]==v for k,v in preserved.items() if k!='status')
declared=out/'closed-round-declaration-input.json';declared.write_text(json.dumps(record,indent=2)+'\n')
run('round-plan-declare',base+['round','plan','--round','R-0042','--repo-root','.','--declare',str(declared),*role])
run('render-rounds-index',['node','tools/devai/render-rounds-index.mjs','--write'])
assert any(pc in l and 'R-0042' in l for l in (root/'record/derived/indexes/rounds.md').read_text().splitlines())
run('round-seal',base+['round','seal','--round','R-0042','--repo-root','.',*role])
run('backlog-resolve',base+['backlog','resolve','BL-0024','--repo-root','.','--resolution','https://github.com/aarusso-nyx/detran/pull/224#merge-'+accept['actual_merge']+'; R-0042 '+pc+'; complete source21427c25 43measured/zeroobservationgaps, native26P12R5F+2NA overallFAIL; residuals/C6holds retained.',*role])
bl=json.loads((root/'.devai/state/backlog/BL-0024.json').read_text())
assert bl['status']=='resolved' and all(bl.get(k)==v for k,v in bl0.items() if k not in ['status','resolved_at','resolution'])
chain=json.loads((root/'record/proofs/chain.json').read_text());assert len(chain['records'])==449 and chain['records'][:448]==chain0['records']
assert all(sha(root/p)==v for p,v in before.items())
(out/'actual-native-closeout-result.json').write_text(json.dumps({'pc':pc,'round':'R-0042','actual_merge':accept['actual_merge'],'original448recordprefix_preserved':True,'final449records':True,'protected_source_hashes_preserved':len(before),'backlog_original_body_origin_preserved':True,'final_signedRC':'PENDING on later cleanpublishedcloseoutcandidate'},indent=2)+'\n')
print('Actual PC '+pc+'; native closeout executed, final publication/RC/integration stillpending',flush=True)
