import fs from 'node:fs';import cp from 'node:child_process';import path from 'node:path';
const root='/Volumes/Development/.codex/worktrees/scorecard-0e26/detran',dest=path.dirname(new URL(import.meta.url).pathname);
for(const script of ['law:test','devai:test','verify:proof-anchors']){
 const label='validation-'+script.replaceAll(':','-'),argv=['pnpm',script],started_at=new Date().toISOString();
 const result=cp.spawnSync(argv[0],argv.slice(1),{cwd:root,env:process.env,encoding:'utf8',maxBuffer:32*1024*1024});
 fs.writeFileSync(path.join(dest,label+'.json'),JSON.stringify({argv,started_at,finished_at:new Date().toISOString(),exitCode:result.status,signal:result.signal,stdout:result.stdout,stderr:result.stderr,error:result.error?String(result.error):null},null,2)+'\n',{flag:'wx'});console.log(script,result.status);
}
