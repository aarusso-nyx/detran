from pathlib import Path
import subprocess,json,os,datetime
root=Path('/Volumes/Development/.codex/worktrees/completion-roadmap/detran');out=Path('/Volumes/Development/.codex/artifacts/detran/m1-delivery-verification-067320f3')
env=os.environ.copy();env['PATH']='/Volumes/Development/runtimes/nvm/versions/node/v24.20.0/bin:'+env['PATH']
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()=='067320f3b6aab61da11d718792b48a7d6336fc7c'
assert not subprocess.check_output(['git','status','--porcelain=v1','--untracked-files=all'],cwd=root,text=True).strip()
commands=[('security-history',['pnpm','security:history:check']),('law-corpus',['pnpm','verify:law-corpus']),('state-index',['pnpm','verify:state-index']),('rounds-index',['pnpm','verify:rounds-index']),('doctor',['pnpm','devai:doctor']),('chain',['pnpm','exec','devai','evidence','verify','--scope','chain','--repo-root','.', '--show-head','--format','human']),('docs-ci',['npm','--prefix','docs/site','ci']),('docs-security',['npm','--prefix','docs/site','run','security:check']),('docs-check',['npm','--prefix','docs/site','run','check'])]
results=[]
for label,argv in commands:
 print('START',label,flush=True);started=datetime.datetime.now(datetime.timezone.utc).isoformat()
 with (out/(label+'.stdout.log')).open('x')as stdout,(out/(label+'.stderr.log')).open('x')as stderr:
  p=subprocess.run(argv,cwd=root,env=env,stdout=stdout,stderr=stderr)
 value={'label':label,'argv':argv,'started':started,'finished':datetime.datetime.now(datetime.timezone.utc).isoformat(),'code':p.returncode}
 (out/(label+'.json')).write_text(json.dumps(value,indent=2)+'\n');results.append(value);print('END',label,p.returncode,flush=True)
(out/'summary.json').write_text(json.dumps({'source':'067320f3b6aab61da11d718792b48a7d6336fc7c','results':results,'final_git_status':subprocess.check_output(['git','status','--porcelain=v1','--untracked-files=all'],cwd=root,text=True)},indent=2)+'\n')
