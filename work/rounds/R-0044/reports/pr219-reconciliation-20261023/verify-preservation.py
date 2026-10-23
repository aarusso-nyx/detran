from pathlib import Path
import subprocess,json,hashlib,sys,os
ROOT=Path('/Volumes/Development/runtimes/devai/config/evidence/detran/admin-integration-216-218-219-220-20261023')
SOURCES={218:'d356061630d40292b8ee0a674bc5834e9a6e9fdf',219:'341f06894f1213adaa76a8ef3995e27212b711f1',220:'0ecb694308bccc6fba92149b7d7238888efb2570'}
ROUNDS={218:'R-0043',219:'R-0044',220:'R-0045'}
def git(*args):return subprocess.check_output(['git',*args])
def sha(b):return hashlib.sha256(b).hexdigest()
def blob(ref,path):return git('show',ref+':'+path)
def save(p,b):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True)
 assert not p.exists(),p
 p.write_bytes(b)
def init(n):
 source=SOURCES[n];main=git('rev-parse','origin/main').decode().strip();base=git('merge-base',source,main).decode().strip()
 folder=Path(f'work/rounds/{ROUNDS[n]}/reports/pr{n}-reconciliation-20261023');folder.mkdir(parents=True,exist_ok=True)
 sources=[]
 for name,ref in [('main-integration',main),('original-pr',source),('common-base',base)]:
  b=blob(ref,'record/proofs/chain.json');p=folder/f'{name}-chain.json';save(p,b)
  sources.append(dict(name=name,commit=ref,path=str(p),sha256=sha(b),records=len(json.loads(b)['records'])))
 epochs=[]
 for path in git('ls-tree','-r','--name-only',source,'record/proofs/work').decode().splitlines():
  if ROUNDS[n] not in path:continue
  b=blob(source,path);p=folder/'original-proof-epochs'/Path(path).name.replace('.jsonl','-'+Path(path).parent.name+'.jsonl');save(p,b)
  epochs.append(dict(path=path,archive=str(p),sha256=sha(b),lines=len(b.splitlines())))
 protected={}
 for prefix in ['.devai/config','.devai/pin','law/policy','record/proofs/compliance/closures','docs/meta/decisions']:
  for path in git('ls-tree','-r','--name-only',main,prefix).decode().splitlines():protected[path]=sha(blob(main,path))
 legacy='.devai/state/evidence-chain.json';protected[legacy]=sha(blob(main,legacy))
 meta=dict(schemaVersion='1.0.0',pr=n,round=ROUNDS[n],integration_main=main,original_head=source,sources=sources,original_epochs=epochs,protected_main_files=protected,closed_rounds='All existing terminal closure files remain byte-identical',C6='blocked; native binding configuration remains byte-identical',thresholds='unchanged',scope='Git reconciliation and official proof-anchor recovery only; no new product changes or measurement claims')
 save(folder/'source-histories.json',(json.dumps(meta,indent=2)+'\n').encode())
 print(folder)
def verify(n):
 folder=Path(f'work/rounds/{ROUNDS[n]}/reports/pr{n}-reconciliation-20261023');meta=json.loads((folder/'source-histories.json').read_text());source=meta['original_head'];main=meta['integration_main'];active=json.loads(Path('record/proofs/chain.json').read_bytes());history={}
 for s in meta['sources']:
  b=Path(s['path']).read_bytes();assert b==blob(s['commit'],'record/proofs/chain.json');assert sha(b)==s['sha256'];history[s['name']]=json.loads(b)
 prefix=history['main-integration']['records'];assert active['records'][:len(prefix)]==prefix
 for path,digest in meta['protected_main_files'].items():assert sha(Path(path).read_bytes())==digest,path
 for e in meta['original_epochs']:
  original=blob(source,e['path']);assert Path(e['archive']).read_bytes()==original;assert Path(e['path']).read_bytes().startswith(original),e['path']
 for p in git('ls-tree','-r','--name-only',source,f'work/rounds/{ROUNDS[n]}/reports').decode().splitlines():assert Path(p).read_bytes()==blob(source,p),p
 for prefixpath in ['docs/meta/adr','docs/meta/decisions']:
  for p in git('ls-tree','-r','--name-only',main,prefixpath).decode().splitlines():
   if p.endswith('/README.md'):continue
   assert Path(p).read_bytes()==blob(main,p),p
 for p in git('ls-tree','-r','--name-only',main,'record/proofs/work').decode().splitlines():
  assert Path(p).read_bytes().startswith(blob(main,p)),p
 for p in git('ls-tree','-r','--name-only',main,'work/rounds').decode().splitlines():
  if '/reports/' in p:assert Path(p).read_bytes()==blob(main,p),p
 assert subprocess.run(['git','merge-base','--is-ancestor',main,'HEAD']).returncode==0
 assert subprocess.run(['git','merge-base','--is-ancestor',source,'HEAD']).returncode==0
 manifest=[dict(path=str(p),sha256=sha(p.read_bytes()),bytes=p.stat().st_size) for p in sorted(folder.rglob('*')) if p.is_file() and p.name not in ['preservation-verification.json','evidence-payload.json']]
 result=dict(status='pass',main_prefix_records=len(prefix),original_pr_records=len(history['original-pr']['records']),canonical_records=len(active['records']),legacy_sha256=sha(Path('.devai/state/evidence-chain.json').read_bytes()),source_is_ancestor=True,original_proof_bytes_preserved=True,original_reports_preserved=True,protected_main_files=len(meta['protected_main_files']),C6='blocked',manifest=manifest)
 
 if not (folder/'preservation-verification.json').exists():
  (folder/'preservation-verification.json').write_text(json.dumps(result,indent=2)+'\n')
 print(json.dumps({k:v for k,v in result.items() if k!='manifest'}))
if __name__=='__main__':
 {'init':init,'verify':verify}[sys.argv[1]](int(sys.argv[2]))
