from pathlib import Path
import subprocess,json,sys,hashlib,datetime,re
root=Path('/Volumes/Development/.codex/worktrees/completion-roadmap/detran')
out=Path('/Volumes/Development/.codex/artifacts/detran/m1-r0042-closeout-20261024')
out.mkdir(exist_ok=True)
assert len(sys.argv)==2 and re.fullmatch('[0-9a-f]{40}',sys.argv[1])
merged=sys.argv[1];X='21427c25fe2e1c7977ca0311156d4c59d8cfea35';Y='522e61d39d4a5fb063d29b9d5c58d6543e2a197c'
def git(*a):return subprocess.check_output(['git',*a],cwd=root)
for sha in [X,Y,'74b9eec83cd10d981f5ec5923c0f82ad7b2c13b5','d8def62fefb0df0fa0480909a9082b8812cd3721']:
 subprocess.run(['git','merge-base','--is-ancestor',sha,merged],cwd=root,check=True)
assert git('rev-parse',merged+'^{tree}')==git('rev-parse',Y+'^{tree}')
changes=git('diff','--name-only',X,merged).decode().splitlines()
allowed=lambda p:p=='COMPLETION-PLAN.md' or p=='record/proofs/chain.json' or p.startswith('.devai/state/sensor-readings/') or p.startswith('work/rounds/R-0042/reports/evaluation-21427c25/')
assert all(allowed(p) for p in changes)
oldchain=json.loads(git('show',X+':record/proofs/chain.json'))
chain=json.loads(git('show',merged+':record/proofs/chain.json'))
assert len(oldchain['records'])==393 and len(chain['records'])==448 and chain['records'][:393]==oldchain['records']
oldfiles=git('ls-tree','-r','--name-only',X,'--','.devai/state/sensor-readings/').decode().splitlines()
assert len(oldfiles)==268
for p in oldfiles:assert git('rev-parse',X+':'+p)==git('rev-parse',merged+':'+p)
packet=json.loads(git('show',merged+':work/rounds/R-0042/reports/evaluation-21427c25/FINAL-EXACT-PATH-HANDOFF.json'))
for row in packet['canonical_files']:assert hashlib.sha256(git('show',merged+':'+row['path'])).hexdigest()==row['sha256']
assert len(packet['canonical_files'])==55
result={'observed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actual_merge':merged,'delivery_source':Y,'measurement_source':X,'integrated_tree':git('rev-parse',merged+'^{tree}').decode().strip(),'checks':{'all_authentic_source_ancestors':True,'actual_merge_tree_equals_reviewed_delivery_tree':True,'only_report_plan_official_chain_and_reading_changes_since_measurement':True,'all_268_baseline_canonical_git_blobs_unchanged':True,'393_record_prefix_unchanged_448_final':True,'all55_new_committed_artifact_hashes_match':True},'measurement_source_not_restamped':True,'changed_paths_since_X':changes,'limitations':['Same13preexistinghistoricalartifactavailabilitylimitations','Native128anchors/53acknowledgedproofgapsareseparate','No postintegrationCI outcome or final signedRC inferred','Fullmeasurement remains native26PASS12REVIEW5FAIL+2NA overallFAIL']}
(out/'actual-integration-source-equivalence.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k!='changed_paths_since_X'}))
