const assert = require('node:assert/strict');
const {createRequire} = require('node:module');
const path = require('node:path');
const root = createRequire(path.resolve('backend/app/package.json'));
const pdf = createRequire(root.resolve('@stynx-nyx/pdf'));
const logging = createRequire(root.resolve('@stynx-nyx/logging'));
const nest = createRequire(root.resolve('@nestjs/platform-express'));
const expressReq = createRequire(nest.resolve('express'));
const pretty = createRequire(logging.resolve('pino-pretty'));
const bodyParser = createRequire(expressReq.resolve('body-parser'));
const handlebars = pdf('handlebars');
assert.equal(handlebars.compile('<p>{{name}}</p>')({name:'<Ada>'}),'<p>&lt;Ada&gt;</p>');
const proxyAddr = expressReq('proxy-addr');
const req = {socket:{remoteAddress:'127.0.0.1'},headers:{'x-forwarded-for':'203.0.113.9'}};
assert.equal(proxyAddr(req,proxyAddr.compile('loopback')),'203.0.113.9');
const original = {nested:{value:42},date:new Date('2026-10-19T00:00:00Z')};
const copied = pretty('fast-copy').copy(original);
assert.deepEqual(copied,original);copied.nested.value=9;assert.equal(original.nested.value,42);
const app = nest('express')();
app.use(nest('express').json());app.use(nest('express').urlencoded({extended:true}));
app.post('/form',(req,res)=>res.json(req.body));
app.post('/upload',nest('multer')({storage:nest('multer').memoryStorage(),limits:{fileSize:1024}}).single('file'),(req,res)=>res.json({field:req.body.label,file:req.file.buffer.toString(),size:req.file.size}));
(async()=>{
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 try {
  const address=server.address(),url='http://127.0.0.1:'+address.port;
  let response=await fetch(url+'/form',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:'person[name]=Ada&flags[0]=a&flags[1]=b'});
  assert.equal(response.status,200);assert.deepEqual(await response.json(),{person:{name:'Ada'},flags:['a','b']});
  const form=new FormData();form.set('label','fixture');form.set('file',new Blob(['hello'],{type:'text/plain'}),'fixture.txt');
  response=await fetch(url+'/upload',{method:'POST',body:form});assert.equal(response.status,200);assert.deepEqual(await response.json(),{field:'fixture',file:'hello',size:5});
  console.log(JSON.stringify({status:'pass',probes:['handlebars escaping','proxy-addr trusted loopback','fast-copy deep copy','Express/body-parser urlencoded parsing','multer bounded multipart memory upload'],versions:{handlebars:pdf('handlebars/package.json').version,multer:nest('multer/package.json').version,proxy_addr:expressReq('proxy-addr/package.json').version,express_qs:expressReq('qs/package.json').version,body_parser_qs:bodyParser('qs/package.json').version,fast_copy:JSON.parse(require('node:fs').readFileSync(path.resolve(path.dirname(pretty.resolve('fast-copy')),'../../package.json'),'utf8')).version}}));
 }finally{await new Promise((r,e)=>server.close(x=>x?e(x):r()));}
})().catch(error=>{console.error(error);process.exitCode=1;});
