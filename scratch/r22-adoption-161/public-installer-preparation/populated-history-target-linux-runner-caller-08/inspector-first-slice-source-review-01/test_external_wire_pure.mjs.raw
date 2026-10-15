// TEST_ONLY host Node import of pure validators; never invokes main or target Node.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pid, ticks, nonce, parseInputFrame, readyRuntime, frame, runtimeFenceRaw } from './verify_external_live_process.mjs';
const NONCE = 'a'.repeat(64);
const SCRIPT = '/repo/scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-resolution-03/verify_external_live_process.mjs';
const LOADERS = {
 'internal/modules/cjs/loader': 'sha256:a3e3ee095d409597bf224522411607aa7d2f4747cf42b5329179bf3b4b5528ed',
 'internal/modules/customization_hooks': 'sha256:02cf07c29fd2c4701ccc19395d5d0b11968aee34a9aefb37b5684f7248c457f7',
 'internal/modules/helpers': 'sha256:3d6d6d7c7257610dcee83c76f29d6314ba56af5560faf50650a025fd9a56bbb3',
};
const view = () => ({ argv: ['/usr/local/bin/node', SCRIPT, NONCE], execArgv: [],
 env: { LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8', TZ: 'UTC' }, platform: 'linux', arch: 'x64',
 version: 'v24.20.0', execPath: '/usr/local/bin/node', uid:999,euid:999,gid:999,egid:999,ownPid:108 });
const start = () => ({kind:'EXTERNAL_PROCESS_START',nonce:NONCE,pid:108,startTicks:123,
 readySha256:'sha256:'+'1'.repeat(64),attestationSha256:'sha256:'+'2'.repeat(64)});
const refuses = (fn, code) => assert.throws(fn, e => e.message === 'EXTERNAL_PROCESS_REFUSED:'+code);

test('strict PID/tick/nonce bounds', () => {
 assert.equal(pid(108),108);assert.equal(ticks(123),123);assert.equal(nonce(NONCE),NONCE);
 for(const bad of [true,1,0,4294967296,Number.MAX_SAFE_INTEGER+1]) refuses(()=>pid(bad),'pid');
 for(const bad of [true,0,Number.MAX_SAFE_INTEGER+1]) refuses(()=>ticks(bad),'start-ticks');
 refuses(()=>nonce('bad'),'nonce');
});
test('builtin runtime READY validates exact logical argv/env/loaders and scope', () => {
 const ok=readyRuntime(view(),Buffer.from('test-only'),LOADERS);
 assert.equal(ok.kind,'EXTERNAL_PROCESS_READY');assert.equal(ok.pid,108);
 assert.equal(frame(ok,65536).at(-1),10);
 for(const mutation of [v=>v.argv.push('extra'),v=>v.execArgv.push('--bad'),v=>v.env.NODE_OPTIONS='',
   v=>v.ownPid=1,v=>v.uid=0]) { const v=view(); mutation(v); assert.throws(()=>readyRuntime(v,Buffer.from('x'),LOADERS)); }
 assert.throws(()=>readyRuntime(view(),Buffer.from('x'),{...LOADERS,extra:'x'}));
});
test('runtime fence is the finite ordered five-field compact UTF-8 object', () => {
 const ready=readyRuntime(view(),Buffer.from('test-only'),LOADERS);
 const raw=runtimeFenceRaw(ready);
 assert.deepEqual(Object.keys(JSON.parse(raw.toString('utf8'))),
  ['node','logicalArgv','processEnv','embeddedLoaders','scriptSha256']);
 assert.equal(raw.includes(10),false);
 refuses(()=>runtimeFenceRaw({...ready,alien:true}),'fence-ready-shape');
});
test('closed canonical START refuses duplicate, second frame, oversize, wrong nonce', () => {
 const raw=frame(start(),16384);assert.equal(parseInputFrame(raw,'EXTERNAL_PROCESS_START',NONCE,108).startTicks,123);
 refuses(()=>parseInputFrame(Buffer.from('{"kind":"EXTERNAL_PROCESS_START","kind":"EXTERNAL_PROCESS_START"}\n'),
   'EXTERNAL_PROCESS_START',NONCE,108),'input-canonical-or-duplicate');
 refuses(()=>parseInputFrame(Buffer.concat([raw,raw]),'EXTERNAL_PROCESS_START',NONCE,108),'input-frame-bound');
 refuses(()=>parseInputFrame(raw,'EXTERNAL_PROCESS_START','b'.repeat(64),108),'input-shape-identity');
 refuses(()=>parseInputFrame(Buffer.from('{}'), 'EXTERNAL_PROCESS_START',NONCE,108),'input-frame-bound');
});
test('EXIT cannot be mistaken for START; wrong ticks refuse', () => {
 const exit={kind:'EXTERNAL_PROCESS_EXIT',nonce:NONCE,pid:108,startTicks:123,
 resultSha256:'sha256:'+'3'.repeat(64),attestationSha256:'sha256:'+'4'.repeat(64)};
 refuses(()=>parseInputFrame(frame(exit,16384),'EXTERNAL_PROCESS_START',NONCE,108),'input-shape-identity');
 refuses(()=>parseInputFrame(frame(exit,16384),'EXTERNAL_PROCESS_EXIT',NONCE,108,124),'input-ticks');
});
