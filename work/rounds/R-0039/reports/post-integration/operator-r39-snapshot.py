import pathlib,json,subprocess,hashlib,os,gzip,shutil,datetime
r=pathlib.Path('/Volumes/Development/.codex/worktrees/r0039-close-c3-c4/detran');d=r/'work/rounds/R-0039/reports/post-integration';d.mkdir(exist_ok=True)
h=lambda data:hashlib.sha256(data).hexdigest()
actualmain=json.loads(subprocess.check_output(['gh','api','repos/aarusso-nyx/detran/branches/main']))['commit']['sha'];head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=r).decode().strip();assert head==actualmain=='207642f2d82634922a93fe5e26fdcc387ad7b530'
ci=json.loads(pathlib.Path('/Users/aarusso/.config/devai/evidence/detran/r0038-c2-closure-pc0024/integration/post-main/main-ci-final.json').read_text());assert ci['status']=='completed' and ci['conclusion']=='success' and ci['headSha']==head
allow={'law/register/DECISIONS.md','record/derived/indexes/rounds.md','record/proofs/chain.json','record/proofs/work/generic/R-0039.jsonl','work/rounds/README.md','work/rounds/R-0039/AUTHORIZATION.md','work/rounds/R-0039/plan.md','work/rounds/R-0039/record.md'}
paths=subprocess.check_output(['git','ls-files','-z'],cwd=r).decode().split('\0');protected={}
for name in paths:
 if not name or name in allow:continue
 p=r/name
 if p.is_symlink():data=os.readlink(p).encode();kind='symlink'
 else:data=p.read_bytes();kind='file'
 protected[name]={'sha256':h(data),'type':kind}
chainbytes=(r/'record/proofs/chain.json').read_bytes();chain=json.loads(chainbytes);assert len(chain['records'])>=164;expected=json.loads(subprocess.check_output(['git','show','207642f2:record/proofs/chain.json'],cwd=r));assert chain['records'][:164]==expected['records']
old_epoch=(r/'record/proofs/work/generic/R-0039.jsonl').read_bytes();backlogs={p.name:h(p.read_bytes()) for p in (r/'.devai/state/backlog').glob('BL-*.json')};assert json.loads((r/'.devai/state/backlog/BL-0020.json').read_text())['status']=='open'
b={'base':head,'tree':subprocess.check_output(['git','rev-parse','HEAD^{tree}'],cwd=r).decode().strip(),'chain':chain,'chain_raw_sha256':h(chainbytes),'epoch_original':old_epoch.decode(),'epoch_original_sha256':h(old_epoch),'protected':protected,'backlogs':backlogs,'append_only':{name:(r/name).read_text() for name in ['law/register/DECISIONS.md','work/rounds/R-0039/AUTHORIZATION.md','work/rounds/R-0039/plan.md']},'readme_before':(r/'work/rounds/README.md').read_text(),'old_pc_files':[p.name for p in (r/'record/proofs/compliance/closures').glob('PC-*.json')]}
pathlib.Path('/tmp/r0039-closure-before.json').write_text(json.dumps(b,indent=2)+'\n');(d/'fresh-protected-baseline.json.gz').write_bytes(gzip.compress(json.dumps({k:v for k,v in b.items() if k not in ['chain','append_only','readme_before','epoch_original']},indent=2).encode(),mtime=0));(d/'canonical-chain-before.json.gz').write_bytes(gzip.compress(chainbytes,mtime=0));(d/'r0039-epoch-before.jsonl').write_bytes(old_epoch)
for p in pathlib.Path('/tmp').glob('r0039-postintegration-close-packet-v*'):
 if p.is_file():shutil.copy2(p,d/p.name)
for p in pathlib.Path('/tmp').glob('r0039-closure-task-review*'):
 if p.is_file():shutil.copy2(p,d/p.name)
post=pathlib.Path('/Users/aarusso/.config/devai/evidence/detran/r0038-c2-closure-pc0024/integration/post-main')
for name in ['main-ci-final.json','required-five-final.json','postintegration-final.json','trusted-verifier.json','trusted-verifier-disposition.json','exact-tree-attestation-tag.stdout']:
 shutil.copy2(post/name,d/('post210-'+name))
for name in ['AUTHORIZATION.md','record.md','plan.md']:shutil.copy2(r/'work/rounds/R-0039'/name,d/('before-'+name))
print(json.dumps({'base':head,'chain_prefix_actual':len(chain['records']),'protected_paths':len(protected),'epoch_lines':len(old_epoch.splitlines()),'actualmainCI':ci['conclusion'],'backlogs_preserved_count':len(backlogs),'BL20':'open','packets_archived':len(list(d.iterdir()))}))
