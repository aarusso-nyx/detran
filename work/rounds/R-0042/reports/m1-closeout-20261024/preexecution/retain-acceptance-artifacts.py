from pathlib import Path
import hashlib,json,shutil,datetime
root=Path('/Volumes/Development/.codex/worktrees/completion-roadmap/detran')
out=Path('/Volumes/Development/.codex/artifacts/detran/m1-r0042-closeout-20261024')
audit=Path('/Volumes/Development/.codex/artifacts/detran/campaign-m1-audit-20261023')
deliveryreview=Path('/Volumes/Development/.codex/artifacts/detran/m1-delivery-final-review-20261024')
report=root/'work/rounds/R-0042/reports/m1-closeout-20261024'
accept=json.loads((out/'postintegration-evidence-standing.json').read_text())
assert accept['postintegration_ci40060467337_all_jobs_pass'] is True
assert accept['all_light_checks_pass'] is True
report.mkdir(parents=True,exist_ok=False)
files=[]
def copy(p,target):
 target.parent.mkdir(parents=True,exist_ok=True)
 with target.open('xb') as f:f.write(p.read_bytes())
 h=hashlib.sha256(p.read_bytes()).hexdigest();assert hashlib.sha256(target.read_bytes()).hexdigest()==h
 files.append({'path':str(target.relative_to(report)),'origin':str(p),'sha256':h,'bytes':p.stat().st_size})
for p in sorted(out.iterdir()):
 if p.is_file() and p.suffix in ['.json','.py','.txt','.log','.md']:copy(p,report/'preexecution'/p.name)
for p in sorted((out/'light-postintegration').iterdir()):
 if p.is_file():copy(p,report/'light-postintegration'/p.name)
for p in sorted(deliveryreview.iterdir()):
 if p.is_file() and not '.raw.' in p.name and not '.formatted.' in p.name:copy(p,report/'delivery-review-522e61d3'/p.name)
for p in sorted(audit.glob('R0042-native-closeout-helper-review*.json')):copy(p,report/'independent-helper-review'/p.name)
for name in ['R0042-future-closeout-support.md','r0042-closeout-prerequisites-not-executed.json']:copy(audit/name,report/'independent-helper-review'/name)
for rel in ['work/rounds/R-0042/AUTHORIZATION.md','work/rounds/R-0042/decisions.md','law/register/DECISIONS.md']:copy(root/rel,report/'authored-prerequisites'/rel)
manifest={'captured_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'Actual preexecution acceptance artifacts; no PC/result predicted','actual_merge':accept['actual_merge'],'preclose_source_commit':accept['preclose_source_commit'],'measurement_source':'21427c25fe2e1c7977ca0311156d4c59d8cfea35','files':files,'limits':'Historical13artifactavailabilitylimitations and nativequalityFAIL preserved; failedtrustedRC40060467323/check120772707099 retained. FinalcleancloseoutcandidateRC notyetexecuted.'}
(report/'acceptance-artifacts-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'copied':len(files),'manifest_sha256':hashlib.sha256((report/'acceptance-artifacts-manifest.json').read_bytes()).hexdigest()}))
