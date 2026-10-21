from pathlib import Path
import hashlib,json,datetime,difflib,re,sys,stat
root=Path(sys.argv[1]);cap=Path(sys.argv[2]);preview=cap/'generated-preview';sha=lambda b:hashlib.sha256(b).hexdigest()
canonical=json.loads((cap/'canonical-source-delta.json').read_text());before=json.loads((cap/'existing-generated-byte-manifest.json').read_text());static=json.loads(Path('/Users/aarusso/.config/devai/evidence/detran/pr213-backend-kernel-ht1q4foz/static-provenance-roster.json').read_text());headers=set(static['potentialHeaderOnlyPaths']);packages=set(static['generatedManifestOrderOnlyPaths']);expected={row['path']:row for row in before};paths=json.loads((preview/'tools/blueprints/generated-files.json').read_text());issues=[];changed=[];alloutputs=[];diff=[];counts={'headerOnly':0,'packageOrderOnly':0,'unchanged':0}
if paths!=json.loads((root/'tools/blueprints/generated-files.json').read_text()):issues.append('Generated file index differs')
actualFiles={str(p.relative_to(preview)) for p in preview.rglob('*') if p.is_file()};expectedFiles=set(expected)|{'tools/blueprints/generated-files.json'}
if actualFiles!=expectedFiles:issues.append({'unexpected':sorted(actualFiles-expectedFiles),'missing':sorted(expectedFiles-actualFiles)})
for path in sorted(expectedFiles):
 a=(root/path).read_bytes();b=(preview/path).read_bytes();row={'path':path,'sourceSHA256':sha(a),'previewSHA256':sha(b),'sourceBytes':len(a),'previewBytes':len(b)}
 if path in expected and sha(a)!=expected[path]['sha256']:issues.append({'concurrentSourceChange':path})
 if a==b:row['classification']='unchanged';counts['unchanged']+=1
 elif path in headers:
  ah,_,ab=a.partition(b'\n');bh,_,bb=b.partition(b'\n');pat=rb'^(//|--) Generated from (BP-[A-Z0-9-]+) v([^ ]+) sha256:([0-9a-f]{64})$';am=re.fullmatch(pat,ah);bm=re.fullmatch(pat,bh)
  if not am or not bm or am.groups()[:3]!=bm.groups()[:3] or ab!=bb:issues.append({'nonHeaderDelta':path})
  else:
   source=next(x for x in canonical['files'] if Path(x['path']).stem==am.group(2).decode())
   if am.group(4).decode()!=source['beforeSHA256'] or bm.group(4).decode()!=source['afterSHA256']:issues.append({'headerSHAMismatch':path})
  row['classification']='headerOnly';counts['headerOnly']+=1;changed.append(row)
 elif path in packages:
  ad=json.loads(a);bd=json.loads(b)
  if ad!=bd or ad['devDependencies'].get('vite')!='7.3.6':issues.append({'manifestSemanticDelta':path})
  def eraseDeps(raw):
   text=raw.decode();start=text.index('{',text.index('"devDependencies"'));_,end=json.JSONDecoder().raw_decode(text,start);return text[:start]+'<SAME-SEMANTIC-DEVDEPENDENCIES>'+text[end:]
  if eraseDeps(a)!=eraseDeps(b):issues.append({'manifestOutsideDevDependenciesDelta':path})
  row['classification']='packageOrderOnly';row['beforeKeys']=list(ad['devDependencies']);row['afterKeys']=list(bd['devDependencies']);counts['packageOrderOnly']+=1;changed.append(row)
 else:row['classification']='unexpectedDelta';issues.append({'unexpectedDelta':path})
 alloutputs.append(row)
 if a!=b:diff.extend(difflib.unified_diff(a.decode().splitlines(True),b.decode().splitlines(True),fromfile='a/'+path,tofile='b/'+path))
if counts['headerOnly']!=230 or counts['packageOrderOnly']!=5:issues.append({'unexpectedDeltaCounts':counts})
if sha((root/'tools/blueprints/generate.mjs').read_bytes())!=canonical['generatorSHA256']:issues.append('Generator source changed')
for source in canonical['files']:
 if sha((root/source['path']).read_bytes())!=source['afterSHA256']:issues.append({'canonicalSourceChanged':source['path']})
report={'kind':'unchanged-official-blueprint-external-preview-comparison','observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PASS' if not issues else 'FAIL','sourceApplicationPerformed':False,'registryWritesPerformed':False,'generatedOutputPopulation':len(alloutputs),'counts':counts,'changedPaths':changed,'issues':issues,'generatorSHA256':canonical['generatorSHA256'],'generatedIndexByteExact':(root/'tools/blueprints/generated-files.json').read_bytes()==(preview/'tools/blueprints/generated-files.json').read_bytes(),'allUnchangedBodiesCompared':True,'limitations':['Engineer comparison, not independent preview approval; source application still blocked pending parent and independent review.','No product tests, dependency installation, DB, native generation or scorecard reading executed.']}
(cap/'all-preview-output-manifest.json').write_text(json.dumps(alloutputs,indent=2)+'\n');(cap/'preview-comparison.json').write_text(json.dumps(report,indent=2)+'\n');(cap/'preview.diff').write_text(''.join(diff));print(json.dumps({k:v for k,v in report.items() if k not in ['changedPaths']},indent=2));sys.exit(0 if not issues else 1)
