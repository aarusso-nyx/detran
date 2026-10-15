"""TEST_ONLY synthetic wire/kernel proof. No Docker, target Node, SDK, SQL."""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import unittest

SOURCE=Path(__file__).with_name('run_external_process_once.py')
spec=importlib.util.spec_from_file_location('external_pure',SOURCE)
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
NONCE='a'*64;CID='b'*64

def ready_value():
 return {'kind':'EXTERNAL_PROCESS_READY','protocolVersion':1,'nonce':NONCE,'pid':108,
  'node':{'version':'v24.20.0','platform':'linux','arch':'x64','path':m.NODE,
          'sha256':'sha256:'+m.NODE_SHA,'execArgv':[],
          'uid':999,'euid':999,'gid':999,'egid':999},
  'logicalArgv':[m.NODE,m.SCRIPT_GUEST,NONCE], 'processEnv':dict(m.ENV),
  'embeddedLoaders':dict(m.LOADERS),'scriptSha256':'sha256:'+m.SCRIPT_SHA}

def stat(pid=108,ppid=1,ticks=123,state='S'):
 return (f'{pid} (node with ) embedded) {state} {ppid} '.encode()+b'0 '*17+
         f'{ticks} '.encode()+b'0 '*29+b'0\n')

def helper_authority():
 return {role:{'argv':['/usr/bin/cat',f'/proc/108/{role}'],
               'exeLink':'/usr/bin/cat','exeSha256':'sha256:'+'c'*64}
         for role in m.HELPER_ROLES}

def bracket():
 tuples=[];inventory={}
 for i,role in enumerate(m.HELPER_ROLES):
  helper_pid=201+i;inventory[role]=[1,108,helper_pid]
  tuples.append({'role':role,'cid':CID,'pid':helper_pid,
    'statBefore':stat(pid=helper_pid,ticks=1000+i),
    'statAfter':stat(pid=helper_pid,ticks=1000+i,state='R'),
    'cmdline':b'\0'.join(x.encode() for x in helper_authority()[role]['argv'])+b'\0',
    'environ':b'LANG=C.UTF-8\0LC_ALL=C.UTF-8\0TZ=UTC\0',
    'exeLink':'/usr/bin/cat','exeSha256':'sha256:'+'c'*64})
 return {'cid':CID,'pid':108,'helperTuples':tuples,'inventory':inventory,
         'statBefore':stat(),'statAfter':stat(state='R'),
         'cmdline':b'\0'.join(x.encode() for x in (m.QEMU,m.NODE,m.SCRIPT_GUEST,NONCE))+b'\0',
         'environ':b'LANG=C.UTF-8\0LC_ALL=C.UTF-8\0TZ=UTC\0',
         'exeLink':m.QEMU,'exeSha256':'sha256:'+m.QEMU_SHA,'exeBytes':100,
         'nodeSha256':'sha256:'+m.NODE_SHA}

class ExternalPure(unittest.TestCase):
 def test_stat_and_raw_tuple_hostile(self):
  self.assertEqual(m.parse_stat(stat(),108)['startTicks'],123)
  for bad in (stat(pid=109),stat(ticks=0),stat(ticks=9007199254740992),
              stat(state='Z'),b'108 (node) S 1',
              f'108 (node) S 1 '.encode()+b'0 '*17+b'123\n',
              stat()[:-2]+b'x\n'):
   with self.subTest(bad=bad),self.assertRaises(RuntimeError):m.parse_stat(bad,108)
  self.assertEqual(m.bracket(bracket(),108,NONCE,CID,helper_authority())['ppid'],1)
  for edit in (lambda x:x['helperTuples'][0].update(pid=108),
               lambda x:x['helperTuples'][0].update(exeSha256='sha256:'+'0'*64),
               lambda x:x['inventory']['statBefore'].append(999),
               lambda x:x.update(statAfter=stat(ppid=2)),
               lambda x:x.update(cmdline=b'/usr/local/bin/node\0'),
               lambda x:x.update(environ=b'LANG=C.UTF-8\0LANG=C.UTF-8\0LC_ALL=C.UTF-8\0TZ=UTC\0'),
               lambda x:x.update(exeSha256='sha256:'+'0'*64)):
   with self.subTest(edit=edit.__code__.co_firstlineno):
    r=bracket();edit(r)
    with self.assertRaises(RuntimeError):m.bracket(r,108,NONCE,CID,helper_authority())
  unknown=helper_authority();unknown['statBefore']['argv']=['/usr/bin/unknown']
  with self.assertRaises(RuntimeError):m.bracket(bracket(),108,NONCE,CID,unknown)
 def test_frame_duplicate_and_wrong_runtime(self):
  raw=m.output_frame(ready_value())
  self.assertEqual(m.ready(raw,NONCE,m.SCRIPT_SHA)['pid'],108)
  for mutation in (lambda x:x['node'].update(uid=True),lambda x:x['processEnv'].update(NODE_OPTIONS=''),
                   lambda x:x.update(pid=1),lambda x:x.update(scriptSha256='sha256:'+'0'*64)):
   x=ready_value();mutation(x)
   with self.assertRaises(RuntimeError):m.ready(m.output_frame(x),NONCE,m.SCRIPT_SHA)
  with self.assertRaises(RuntimeError):m.ready(b'{"kind":"x","kind":"x"}\n',NONCE,m.SCRIPT_SHA)
 def test_absolute_deadline_and_phase_order(self):
  for bad_start in (float('inf'),float('nan'),-1,True,1e308,10**1000):
   with self.subTest(start=bad_start),self.assertRaises(RuntimeError):
    m.PureRendezvous(NONCE,CID,m.SCRIPT_SHA,bad_start,helper_authority())
  r=m.PureRendezvous(NONCE,CID,m.SCRIPT_SHA,100.0,helper_authority())
  for bad_now in (-1,float('nan'),float('inf'),True,10**1000):
   with self.subTest(now=bad_now),self.assertRaises(RuntimeError):
    r.accept_ready(m.output_frame(ready_value()),bad_now)
  with self.assertRaises(RuntimeError):r.start(100.1)
  r.accept_ready(m.output_frame(ready_value()),100.1)
  with self.assertRaisesRegex(RuntimeError,'absolute-deadline'):
   r.attest_before(bracket(),100.0,True)
  with self.assertRaises(RuntimeError):r.accept_result(b'{}\n',100.2)
  with self.assertRaises(RuntimeError):r.attest_before(bracket(),100.3,False)
  r.attest_before(bracket(),100.4,True)
  start=r.start(100.5);self.assertIn(b'EXTERNAL_PROCESS_START',start)
  runtime={key:r.ready_value[key] for key in ('node','logicalArgv','processEnv','embeddedLoaders','scriptSha256')}
  result={'kind':'EXTERNAL_PROCESS_RESULT','nonce':NONCE,'pid':108,'startTicks':123,
          'readySha256':m.digest(r.ready_raw),'startFrameSha256':m.digest(start),
          'preAttestationSha256':m.digest(m.output_frame(r.first_attestation)),
          'runtimeFenceSha256':m.digest(m.runtime_fence_raw(r.ready_value)),
          'scope':'PROCESS_ONLY_NO_GRAPH_SDK_SQL'}
  r.accept_result(m.output_frame(result),100.6)
  for key in ('runtimeFenceSha256','preAttestationSha256','startFrameSha256'):
   altered=dict(result);altered[key]='sha256:'+'0'*64
   probe=m.PureRendezvous(NONCE,CID,m.SCRIPT_SHA,100.0,helper_authority())
   probe.accept_ready(m.output_frame(ready_value()),100.1)
   probe.attest_before(bracket(),100.2,True);probe.start(100.3)
   with self.subTest(key=key),self.assertRaises(RuntimeError):
    probe.accept_result(m.output_frame(altered),100.4)
  after=bracket();r.attest_after(after,100.7,True)
  end=r.exit(100.8);self.assertIn(b'EXTERNAL_PROCESS_EXIT',end)
  with self.assertRaises(RuntimeError):r.complete(0,b'warning',100.9,True)
  r.complete(0,b'',100.9,True)
  self.assertEqual(r.phase,'PROCESS_ONLY_PENDING_INSPECTOR_CLOSED')
  deadline=m.PureRendezvous(NONCE,CID,m.SCRIPT_SHA,100.0,helper_authority())
  with self.assertRaisesRegex(RuntimeError,'absolute-deadline'):
   deadline.accept_ready(m.output_frame(ready_value()),1000.0)
 def test_reuse_wrong_result_and_disabled_entry(self):
  r=m.PureRendezvous(NONCE,CID,m.SCRIPT_SHA,0,helper_authority())
  r.accept_ready(m.output_frame(ready_value()),1);r.attest_before(bracket(),2,True);r.start(3)
  bad={'kind':'EXTERNAL_PROCESS_RESULT','nonce':NONCE,'pid':108,'startTicks':124,
       'readySha256':m.digest(r.ready_raw),'startFrameSha256':m.digest(r.start_raw),
       'preAttestationSha256':m.digest(m.output_frame(r.first)),
       'runtimeFenceSha256':'sha256:'+'0'*64,'scope':'PROCESS_ONLY_NO_GRAPH_SDK_SQL'}
  with self.assertRaises(RuntimeError):r.accept_result(m.output_frame(bad),4)
  with self.assertRaisesRegex(RuntimeError,'UNBOUND_KEEPER05'):
   m.run_once()

 def test_closed_attestation_typed_correlated_and_frozen_helper_authority(self):
  raw=m.output_frame(ready_value())
  base=m.bracket(bracket(),108,NONCE,CID,helper_authority())
  value=m.attestation('PRE_START',base,bracket(),raw,ready_value(),helper_authority(),NONCE,CID)
  self.assertEqual(value['pid'],108)
  for key,bad in (('cid','d'*64),('pid',True),('ppid','1'),('startTicks',-1),
                  ('exeSha256','bad'),('cmdlineSha256',True)):
   candidate=copy.deepcopy(base);candidate[key]=bad
   with self.subTest(key=key),self.assertRaises(RuntimeError):
    m.attestation('PRE_START',candidate,bracket(),raw,ready_value(),helper_authority(),NONCE,CID)
  candidate=copy.deepcopy(base);candidate['helperTuples'][0]['startTicks']=True
  with self.assertRaises(RuntimeError):
   m.attestation('PRE_START',candidate,bracket(),raw,ready_value(),helper_authority(),NONCE,CID)
  candidate=copy.deepcopy(base);candidate['ppid']=2
  with self.assertRaises(RuntimeError):
   m.attestation('PRE_START',candidate,bracket(),raw,ready_value(),helper_authority(),NONCE,CID)
  with self.assertRaises(RuntimeError):
   m.attestation('PRE_START',base,bracket(),raw,ready_value(),helper_authority(),'d'*64,CID)
  with self.assertRaises(RuntimeError):
   m.attestation('PRE_START',base,bracket(),raw,{**ready_value(),'pid':True},
                 helper_authority(),NONCE,CID)
  authority=helper_authority()
  r=m.PureRendezvous(NONCE,CID,m.SCRIPT_SHA,0,authority)
  authority['statBefore']['exeSha256']='sha256:'+'0'*64
  r.accept_ready(raw,1)
  r.attest_before(bracket(),2,True)
  r.start(3)
  self.assertEqual(r.first_attestation['helperTuples'][0]['exeSha256'],
                   'sha256:'+'c'*64)

if __name__=='__main__':unittest.main()
