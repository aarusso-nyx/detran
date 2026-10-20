import pathlib,json,subprocess,hashlib,os,datetime
R=pathlib.Path('/Volumes/Development/.codex/worktrees/r0039-close-c3-c4/detran');D=R/'work/rounds/R-0039/reports/post-integration';B=json.loads(pathlib.Path('/tmp/r0039-closure-before.json').read_text());N=len(B['chain']['records'])
def guard(tag):
 chain=json.loads((R/'record/proofs/chain.json').read_text());assert chain['records'][:N]==B['chain']['records'],'oldchain prefix'
 for path,entry in B['protected'].items():
  p=R/path;raw=os.readlink(p).encode() if entry['type']=='symlink' else p.read_bytes();assert hashlib.sha256(raw).hexdigest()==entry['sha256'],path
 for path,before in B['append_only'].items():assert (R/path).read_text().startswith(before),path
 assert (R/'record/proofs/work/generic/R-0039.jsonl').read_bytes().startswith(B['epoch_original'].encode())
 for name,h in B['backlogs'].items():assert hashlib.sha256((R/'.devai/state/backlog'/name).read_bytes()).hexdigest()==h,name
 out={'status':'pass','actual_prior_prefix':N,'current_chain_records':len(chain['records']),'protected_paths':len(B['protected']),'all_backlogs_unchanged':True,'old_R0039_epoch_bytes_prefix':True,'R0036_R0037_R0038_and_legacy':'byte-exact preserved'}
 (D/f'preservation-{tag}.json').write_text(json.dumps(out,indent=2)+'\n');return out

def run(name,args):
 env=os.environ.copy();env['PATH']='/Users/aarusso/.nvm/versions/node/v24.15.0/bin:'+env['PATH'];env['NODE_AUTH_TOKEN']=subprocess.check_output(['gh','auth','token']).decode().strip()
 x=subprocess.run(args,cwd=R,env=env,capture_output=True);(D/f'{name}.stdout').write_bytes(x.stdout);(D/f'{name}.stderr').write_bytes(x.stderr);(D/f'{name}.command.json').write_text(json.dumps({'argv':args,'exit_code':x.returncode},indent=2)+'\n');print(name,x.returncode,flush=True)
 if x.returncode:raise RuntimeError(name+' failed; retained stdout/stderr')
 return x
if __name__=='__main__':
 run('preflight-canonical-chain',['pnpm','exec','devai','evidence','verify','--scope','chain','--repo-root','.','--show-head','--format','human'])
 run('preflight-R0038-status',['pnpm','exec','devai','round','status','--round','R-0038','--repo-root','.','--format','json'])
 run('preflight-R0039-status',['pnpm','exec','devai','round','status','--round','R-0039','--repo-root','.','--format','json'])
 print(guard('before-D2'))
