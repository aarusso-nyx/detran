import fs from 'node:fs';import cp from 'node:child_process';import path from 'node:path';
const audit=path.dirname(new URL(import.meta.url).pathname),[label,...argv]=process.argv.slice(2);
if(!/^[a-z0-9_-]+$/i.test(label)||!argv.length)throw Error('Invalid capture');
if(cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()!=='0e26c795b08374bfdce3e21e520c3945bf97a5d5')throw Error('HEAD changed');
const file=path.join(audit,label+'.json');if(fs.existsSync(file))throw Error('Preserve existing capture');
const started_at=new Date().toISOString();console.log('START',label);let stdout='',stderr='',timedOut=false;
const child=cp.spawn(argv[0],argv.slice(1),{env:process.env,detached:true,stdio:['ignore','pipe','pipe']});child.stdout.on('data',x=>stdout+=x);child.stderr.on('data',x=>stderr+=x);let error;child.on('error',x=>error=String(x));const timer=setTimeout(()=>{timedOut=true;try{process.kill(-child.pid,'SIGTERM')}catch{}},2400000);
child.on('close',(exitCode,signal)=>{clearTimeout(timer);fs.writeFileSync(file,JSON.stringify({argv,started_at,finished_at:new Date().toISOString(),exitCode,signal,timedOut,error,stdout,stderr},null,2)+'\n',{flag:'wx'});console.log('END',label,exitCode)});
