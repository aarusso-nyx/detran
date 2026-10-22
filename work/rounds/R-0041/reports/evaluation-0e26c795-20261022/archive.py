import pathlib,hashlib,json,gzip,shutil,datetime
repo=pathlib.Path('/Volumes/Development/.codex/worktrees/scorecard-0e26/detran');root=pathlib.Path(__file__).parent;dest=repo/'work/rounds/R-0041/reports/evaluation-0e26c795-20261022';dest.mkdir(parents=True,exist_ok=False);sha=lambda b:hashlib.sha256(b).hexdigest()
for p in root.iterdir():
 if p.is_file():shutil.copyfile(p,dest/p.name)
provider=repo/'node_modules/@aarusso-nyx/devai'
for name in ['dist/runtime/index/schemas/sensor-reading.schema.json','dist/runtime/index/schemas/sensor-inputs.schema.json','dist/runtime/index/schemas/scorecard.schema.json','dist/law/policy/sensor-registry.json','dist/law/policy/sense-presets.json']:
 p=provider/name;out=dest/'installed-contract'/name;out.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,out)
notes=provider/'dist/law/policy/sensor-notes'
if notes.is_dir():shutil.copytree(notes,dest/'installed-contract/sensor-notes')
for name in ['.devai/config/sensor-inputs.json','.devai/config/scorecard-na.json','.devai/config/project.json','.devai/config/invariant-producers.json','test-tasks.json']:
 p=repo/name;out=dest/'frozen-inputs'/name;out.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,out)
ledger=json.loads((root/'execution-ledger.json').read_text());d=dest/'canonical-readings';d.mkdir()
for x in ledger:
 p=repo/'.devai/state/sensor-readings'/x['kind']/(x['reading_id']+'.json');shutil.copyfile(p,d/p.name)
local=repo/'.devai/local/rounds/R-0036';manifest=[]
for p in sorted(local.rglob('*')):
 if not p.is_file():continue
 b=p.read_bytes();rel=p.relative_to(local);out=dest/'native-task-artifacts'/str(rel);out=out.with_name(out.name+'.gz');out.parent.mkdir(parents=True,exist_ok=True);compressed=gzip.compress(b,mtime=0);out.write_bytes(compressed);assert gzip.decompress(compressed)==b
 manifest.append({'original_path':str(p.relative_to(repo)),'archive_path':str(out.relative_to(dest)),'encoding':'gzip','original_bytes':len(b),'original_sha256':sha(b),'archive_sha256':sha(compressed)})
(dest/'native-task-artifact-manifest.json').write_text(json.dumps({'note':'New execution logs from original wrapper paths; no closed round record is changed. Reversible gzip copies archived under active R-0041.','files':manifest},indent=2)+'\n')
# Body artifacts produced by the native inventory subsystem are separate from readings.
state=repo/'.devai/state'
for dirname in ['inventory','inventories']:
 p=state/dirname
 if p.is_dir():shutil.copytree(p,dest/'native-inventory-bodies'/dirname)
derived=repo/'record/derived/inventory'
if derived.is_dir():shutil.copytree(derived,dest/'native-inventory-bodies'/'record-derived-inventory')
(dest/'chain-before-assessment-proof.json').write_bytes((repo/'record/proofs/chain.json').read_bytes())
files=[]
for p in sorted(dest.rglob('*')):
 if p.is_file():files.append({'path':str(p.relative_to(repo)),'bytes':p.stat().st_size,'sha256':sha(p.read_bytes())})
m={'schemaVersion':'1.0.0','observed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'native_evaluation_head':'0e26c795b08374bfdce3e21e520c3945bf97a5d5','product_configuration_baseline':'a97e6def6cc4b80d65c5ab0ee9579241f0b33446','scope':'Frozen evaluation payload before generic proof and post-record checks; those later artifacts are outside this immutable manifest subset.','files':files};(dest/'evidence-manifest.json').write_text(json.dumps(m,indent=2)+'\n');summary=json.loads((root/'summary.json').read_text())
proof={'round':'R-0041','scope':'Fresh native scorecard and honest measurement register at the Owner-authorized evidence-only epoch','evaluated_source_commit':summary['native_evaluation_head'],'product_configuration_baseline':summary['product_configuration_baseline'],'provider_version':'2.6.3','fresh_sensor_execution':True,'schema_valid_sensor_readings':55,'distinct_sensor_kinds':55,'native_scorecard_status':'COMPOSED','native_overall':summary['native_overall'],'native_verdict_counts':summary['native_verdict_counts'],'evaluation_disposition_counts':summary['evaluation_disposition_counts'],'full_43_measured_claimed':summary['full_43_measured'],'readiness_promoting':False,'C6_status':'blocked; no withheld review retry, native binding or workload activation','prior_failed_attempt_preserved':True,'historical_chain_prefix_records_preserved':265,'historical_R0041_generic_prefix_lines_preserved':10,'legacy_chain_sha256':'5adb65afca27197d0381bc74efa5377d4415e1cf0058d7d82a68966a83790fec','product_configuration_thresholds_closed_rounds_and_backlog_unchanged':True,'artifacts':[{'path':str((dest/'evidence-manifest.json').relative_to(repo)),'sha256':sha((dest/'evidence-manifest.json').read_bytes())}]};(root/'generic-evidence-input.json').write_text(json.dumps(proof,indent=2)+'\n');(dest/'recording').mkdir();shutil.copyfile(root/'generic-evidence-input.json',dest/'recording/generic-evidence-input.json');print(json.dumps({'capsule':str(dest),'frozen_manifest_files':len(files),'native_artifacts':len(manifest),'proof_input':str(root/'generic-evidence-input.json')}))
