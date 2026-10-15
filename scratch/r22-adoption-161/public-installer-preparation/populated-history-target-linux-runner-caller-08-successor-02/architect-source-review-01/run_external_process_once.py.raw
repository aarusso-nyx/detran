"""Disabled first-slice external live-PID rendezvous caller; pure proof and wire validators.

No helper executable identities or keeper05 birth exist. run_once/direct entry refuse.
No Docker, Node, SDK, package graph, SQL or filesystem mutation occurs here.
"""
from __future__ import annotations
import hashlib
import json
import math
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[4]
BASE = Path(__file__).resolve().parent
SCRIPT = ROOT / 'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-resolution-03/verify_external_live_process.mjs'
SCRIPT_GUEST = '/repo/scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-resolution-03/verify_external_live_process.mjs'
SCRIPT_SHA = 'e865aba70609dd010525c0f4bf7329cee680d6904b78f36d3dcd4fa61a77f9a1'
NODE = '/usr/local/bin/node'
NODE_SHA = '89af8424dd53e560b1933f87ba650d8bf57c83ca5a04600eefb31f416aabbae7'
QEMU = '/usr/bin/qemu-x86_64'
QEMU_SHA = '937686079f6a4ea5cf38c4bf488c2966811e7e0858d6cbe3d77deeddb55297f4'
IMAGE = 'sha256:88dfc24521607f7695d0eb0ee6f908dacb84b8e6cd31ee67a37a09aeedf513e8'
RUNNER = 'detran-r22-161-target-resolver-keeper05'
LEAF = ROOT / 'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-creation-07/empty-image-pgdata'
PERMIT = BASE / 'ROOT-EXTERNAL-PROCESS-PERMIT-ISSUED.json'
OUT = BASE / 'actual-one-use-external-process'
DESIGN = ROOT / 'scratch/r22-adoption-161/public-installer-preparation/populated-history-external-process-rendezvous-design-01/ARCHITECT-EXTERNAL-LIVE-PID-RENDEZVOUS-PLAN.NOT_ADMISSION.md'
DESIGN_SHA = '5dcca56caf8ad0e9f61da30c0085173e33316e84bd59fb72940186da8a80e5d8'
HEX = re.compile('[0-9a-f]{64}\\Z')
DIGEST = re.compile('sha256:[0-9a-f]{64}\\Z')
LOADERS = {
 'internal/modules/cjs/loader': 'sha256:a3e3ee095d409597bf224522411607aa7d2f4747cf42b5329179bf3b4b5528ed',
 'internal/modules/customization_hooks': 'sha256:02cf07c29fd2c4701ccc19395d5d0b11968aee34a9aefb37b5684f7248c457f7',
 'internal/modules/helpers': 'sha256:3d6d6d7c7257610dcee83c76f29d6314ba56af5560faf50650a025fd9a56bbb3',
}
ENV = {'LANG': 'C.UTF-8', 'LC_ALL': 'C.UTF-8', 'TZ': 'UTC'}
HELPER_ROLES = ('statBefore', 'cmdline', 'environ', 'exeLink', 'exeHash', 'statAfter')
FENCE_FIELDS = ('node', 'logicalArgv', 'processEnv', 'embeddedLoaders', 'scriptSha256')


def demand(ok, code):
    if not ok: raise RuntimeError('EXTERNAL_RENDEZVOUS_REFUSED:' + code)


def sha(raw): return hashlib.sha256(raw).hexdigest()
def digest(raw): return 'sha256:' + sha(raw)
def number(value, lower, upper, code):
    demand(type(value) is int and lower <= value <= upper, code)
    return value

def finite_nonnegative_time(value):
    if type(value) not in (int, float) or value < 0:
        return False
    try:
        return math.isfinite(value)
    except OverflowError:
        return False

def pairs_unique(pairs):
    out = {}
    for key, value in pairs:
        demand(key not in out, 'duplicate-json-key')
        out[key] = value
    return out


def parse_frame(raw, bound, keys, kind):
    demand(type(raw) is bytes and 1 < len(raw) <= bound and raw.endswith(b'\n') and
           raw.count(b'\n') == 1, 'frame-bound')
    try:
        body = raw[:-1].decode('utf-8')
        obj = json.loads(body, object_pairs_hook=pairs_unique)
    except (UnicodeError, ValueError) as error:
        raise RuntimeError('EXTERNAL_RENDEZVOUS_REFUSED:frame-json') from error
    demand(type(obj) is dict and set(obj) == set(keys) and obj.get('kind') == kind and
           json.dumps(obj, separators=(',', ':'), ensure_ascii=False).encode() == raw[:-1],
           'frame-canonical-shape')
    return obj


def ready(raw, expected_nonce, script_sha):
    value = parse_frame(raw, 65536, ('kind','protocolVersion','nonce','pid','node','logicalArgv',
        'processEnv','embeddedLoaders','scriptSha256'), 'EXTERNAL_PROCESS_READY')
    demand(type(expected_nonce) is str and HEX.fullmatch(expected_nonce) and
           value['nonce'] == expected_nonce and type(value['protocolVersion']) is int and
           value['protocolVersion'] == 1, 'ready-version-nonce')
    number(value['pid'], 2, 2147483647, 'ready-pid')
    node = value['node']
    demand(type(node) is dict and set(node) == {'version','platform','arch','path','sha256',
        'execArgv','uid','euid','gid','egid'} and node['version'] == 'v24.20.0' and
        node['platform'] == 'linux' and node['arch'] == 'x64' and node['path'] == NODE and
        node['sha256'] == 'sha256:' + NODE_SHA and node['execArgv'] == [] and
        all(type(node[key]) is int and node[key] == 999 for key in ('uid','euid','gid','egid')),
        'ready-node')
    demand(value['logicalArgv'] == [NODE, SCRIPT_GUEST, expected_nonce] and
           value['processEnv'] == ENV and value['embeddedLoaders'] == LOADERS and
           value['scriptSha256'] == 'sha256:' + script_sha,
           'ready-runtime-source')
    return value


def parse_stat(raw, pid):
    demand(type(raw) is bytes and 0 < len(raw) <= 1048576 and b'\0' not in raw and
           raw.endswith(b'\n') and raw.count(b'\n') == 1,
           'stat-raw-bound')
    try: text = raw.decode('utf-8')
    except UnicodeError as error: raise RuntimeError('EXTERNAL_RENDEZVOUS_REFUSED:stat-utf8') from error
    end = text.rfind(') ')
    demand(end > 2 and text.startswith(str(pid) + ' ('), 'stat-comm-pid')
    fields = text[end + 2:-1].split(' ')
    # The independently observed target PID1 emits 50 post-comm fields.
    # Fewer would permit an otherwise plausible truncated startTicks record.
    demand(len(fields) == 50 and all(fields) and re.fullmatch('[A-Za-z]',fields[0]) and
           fields[0] not in ('Z','X','x') and re.fullmatch('(0|[1-9][0-9]*)',fields[1]) and
           all(re.fullmatch('-?(0|[1-9][0-9]*)', field) for field in fields[1:]) and
           re.fullmatch('[1-9][0-9]*',fields[19]), 'stat-fields')
    ppid = int(fields[1]); ticks = int(fields[19])
    number(pid, 2, 2147483647, 'stat-pid-range')
    number(ppid, 0, 2147483647, 'stat-ppid-range')
    number(ticks, 1, 9007199254740991, 'stat-ticks-range')
    return {'pid': pid, 'ppid': ppid, 'startTicks': ticks, 'state': fields[0],
            'rawSha256': digest(raw), 'bytes': len(raw)}


def parse_nul(raw, limit, code):
    demand(type(raw) is bytes and 0 < len(raw) <= limit and raw.endswith(b'\0'), code+'-bound')
    records = raw[:-1].split(b'\0')
    demand(all(records), code+'-empty')
    return records


def parse_env(raw):
    values = {}
    for record in parse_nul(raw, 1048576, 'env'):
        demand(b'=' in record, 'env-malformed')
        key, value = record.split(b'=', 1)
        demand(key in (b'LANG',b'LC_ALL',b'TZ') and key not in values, 'env-key-duplicate')
        values[key] = value
    demand(values == {b'LANG':b'C.UTF-8',b'LC_ALL':b'C.UTF-8',b'TZ':b'UTC'}, 'env-exact')
    return {'sha256': digest(raw), 'bytes':len(raw)}


def runtime_fence_raw(ready_value):
    """The five READY fields, in this order, compact UTF-8 JSON without LF."""
    demand(type(ready_value) is dict and all(key in ready_value for key in FENCE_FIELDS),
           'fence-fields')
    return json.dumps({key: ready_value[key] for key in FENCE_FIELDS},
                      separators=(',', ':'), ensure_ascii=False).encode('utf-8')


def helper_proof(tuples, inventory, authority, candidate_pid, cid):
    """Pure schema; live authority bytes must be pinned before any caller activation."""
    demand(type(authority) is dict and set(authority) == set(HELPER_ROLES) and
           type(tuples) is list and len(tuples) == len(HELPER_ROLES) and
           type(inventory) is dict and set(inventory) == set(HELPER_ROLES),
           'helper-authority-shape')
    observed = []
    for role, item in zip(HELPER_ROLES, tuples):
        expected = authority[role]
        demand(type(expected) is dict and set(expected) == {'argv', 'exeLink', 'exeSha256'} and
               type(expected['argv']) is list and len(expected['argv']) > 0 and
               all(type(x) is str and x.startswith('/') for x in expected['argv']) and
               type(expected['exeLink']) is str and expected['exeLink'].startswith('/') and
               type(expected['exeSha256']) is str and DIGEST.fullmatch(expected['exeSha256']),
               'helper-unbound-authority')
        demand(type(item) is dict and set(item) == {'role', 'cid', 'pid', 'statBefore',
               'statAfter', 'cmdline', 'environ', 'exeLink', 'exeSha256'},
               'helper-tuple-shape')
        helper_pid = number(item['pid'], 2, 2147483647, 'helper-pid')
        demand(item['role'] == role and item['cid'] == cid and helper_pid != candidate_pid,
               'helper-identity')
        before = parse_stat(item['statBefore'], helper_pid)
        after = parse_stat(item['statAfter'], helper_pid)
        demand((before['ppid'], before['startTicks']) == (after['ppid'], after['startTicks']) and
               parse_nul(item['cmdline'], 1048576, 'helper-cmdline') ==
               [x.encode('utf-8') for x in expected['argv']] and
               item['exeLink'] == expected['exeLink'] and
               item['exeSha256'] == expected['exeSha256'], 'helper-tuple-drift')
        parse_env(item['environ'])
        members = inventory[role]
        demand(type(members) is list and len(members) <= 4096 and
               all(type(x) is int and 1 <= x <= 2147483647 for x in members) and
               members == sorted(set(members)) and
               members == sorted([1, candidate_pid, helper_pid]),
               'helper-inventory')
        observed.append({'role': role, 'pid': helper_pid, 'ppid': before['ppid'],
                         'startTicks': before['startTicks'],
                         'statBeforeSha256': before['rawSha256'],
                         'statAfterSha256': after['rawSha256'],
                         'cmdlineSha256': digest(item['cmdline']),
                         'environSha256': digest(item['environ']),
                         'exeSha256': item['exeSha256']})
    demand(len({item['pid'] for item in observed}) == len(HELPER_ROLES), 'helper-pid-reuse')
    return observed


def bracket(record, pid, nonce, cid, helper_authority):
    demand(type(record) is dict and set(record) == {'cid','pid','helperTuples','inventory',
           'statBefore','statAfter','cmdline','environ','exeLink','exeSha256','exeBytes',
           'nodeSha256'}, 'bracket-shape')
    demand(record['cid'] == cid and type(cid) is str and HEX.fullmatch(cid) and
           type(record['pid']) is int and record['pid'] == pid and
           type(nonce) is str and HEX.fullmatch(nonce), 'bracket-subject')
    helpers = helper_proof(record['helperTuples'], record['inventory'], helper_authority,
                           pid, cid)
    before, after = parse_stat(record['statBefore'], pid), parse_stat(record['statAfter'], pid)
    demand((before['pid'],before['ppid'],before['startTicks']) ==
           (after['pid'],after['ppid'],after['startTicks']), 'bracket-reused-pid')
    cmd = parse_nul(record['cmdline'],1048576,'cmdline')
    demand(cmd == [QEMU.encode(),NODE.encode(),SCRIPT_GUEST.encode(),nonce.encode()],
           'kernel-argv')
    env = parse_env(record['environ'])
    demand(record['exeLink'] == QEMU and record['exeSha256'] == 'sha256:' + QEMU_SHA and
           type(record['exeBytes']) is int and 0 < record['exeBytes'] <= 33554432 and
           record['nodeSha256'] == 'sha256:' + NODE_SHA, 'kernel-exe-node')
    return {'cid':cid,'pid':pid,'ppid':before['ppid'],'startTicks':before['startTicks'],
            'cmdlineSha256':digest(record['cmdline']),'environSha256':env['sha256'],
            'exeLink':QEMU,'exeSha256':'sha256:'+QEMU_SHA,
            'statBeforeSha256':before['rawSha256'],'statAfterSha256':after['rawSha256'],
            'helperTuples': helpers}


def same_tuple(first, second):
    keys = ('cid','pid','ppid','startTicks','cmdlineSha256','environSha256','exeLink','exeSha256')
    demand(all(first[key] == second[key] for key in keys), 'second-bracket-drift')


def attestation(phase, proof, kernel_record, ready_raw, ready_value,
                helper_authority, nonce_value, cid):
    """Closed, ordered pre/post record. SHA covers output_frame(record), including LF."""
    demand(type(phase) is str and phase in ('PRE_START', 'POST_RESULT') and
           type(nonce_value) is str and HEX.fullmatch(nonce_value) and
           type(cid) is str and HEX.fullmatch(cid) and type(proof) is dict and
           set(proof) == {'cid','pid','ppid','startTicks','cmdlineSha256',
                          'environSha256','exeLink','exeSha256','statBeforeSha256',
                          'statAfterSha256','helperTuples'} and
           type(ready_raw) is bytes and type(ready_value) is dict and
           type(helper_authority) is dict and set(helper_authority) == set(HELPER_ROLES),
           'attestation-input')
    parsed_ready = ready(ready_raw, nonce_value, SCRIPT_SHA)
    validated_proof = bracket(kernel_record, parsed_ready['pid'], nonce_value,
                              cid, helper_authority)
    demand(output_frame(ready_value) == ready_raw and ready_value == parsed_ready and
           output_frame(proof) == output_frame(validated_proof) and
           proof['cid'] == cid and type(proof['pid']) is int and
           proof['pid'] == parsed_ready['pid'] and
           type(proof['ppid']) is int and 0 <= proof['ppid'] <= 2147483647 and
           type(proof['startTicks']) is int and 1 <= proof['startTicks'] <= 9007199254740991 and
           proof['exeLink'] == QEMU and proof['exeSha256'] == 'sha256:' + QEMU_SHA and
           all(type(proof[key]) is str and DIGEST.fullmatch(proof[key])
               for key in ('cmdlineSha256','environSha256','statBeforeSha256',
                           'statAfterSha256')), 'attestation-identity')
    summaries = proof['helperTuples']
    demand(type(summaries) is list and len(summaries) == len(HELPER_ROLES),
           'attestation-helper-count')
    seen = set()
    for role, summary in zip(HELPER_ROLES, summaries):
        expected = helper_authority[role]
        demand(type(expected) is dict and set(expected) == {'argv','exeLink','exeSha256'} and
               type(expected['argv']) is list and len(expected['argv']) > 0 and
               all(type(x) is str and x.startswith('/') for x in expected['argv']) and
               type(expected['exeLink']) is str and expected['exeLink'].startswith('/') and
               type(expected['exeSha256']) is str and DIGEST.fullmatch(expected['exeSha256']) and
               type(summary) is dict and set(summary) == {'role','pid','ppid','startTicks',
                    'statBeforeSha256','statAfterSha256','cmdlineSha256','environSha256',
                    'exeSha256'}, 'attestation-helper-shape')
        helper_pid = number(summary['pid'], 2, 2147483647, 'attestation-helper-pid')
        demand(summary['role'] == role and helper_pid != proof['pid'] and
               helper_pid not in seen and type(summary['ppid']) is int and
               0 <= summary['ppid'] <= 2147483647 and
               type(summary['startTicks']) is int and
               1 <= summary['startTicks'] <= 9007199254740991 and
               summary['exeSha256'] == expected['exeSha256'] and
               all(type(summary[key]) is str and DIGEST.fullmatch(summary[key])
                   for key in ('statBeforeSha256','statAfterSha256',
                               'cmdlineSha256','environSha256')),
               'attestation-helper-identity')
        seen.add(helper_pid)
    return {'kind':'EXTERNAL_PROCESS_ATTESTATION', 'phase':phase,
            'cid':proof['cid'], 'pid':proof['pid'], 'ppid':proof['ppid'],
            'startTicks':proof['startTicks'], 'nonce':nonce_value,
            'readySha256':digest(ready_raw),
            'scriptSha256':ready_value['scriptSha256'],
            'nodeSha256':ready_value['node']['sha256'],
            'cmdlineSha256':proof['cmdlineSha256'],
            'environSha256':proof['environSha256'],
            'exeLink':proof['exeLink'], 'exeSha256':proof['exeSha256'],
            'statBeforeSha256':proof['statBeforeSha256'],
            'statAfterSha256':proof['statAfterSha256'],
            'helperAuthoritySha256':digest(json.dumps(helper_authority, separators=(',', ':'),
                                               ensure_ascii=False).encode()),
            'helperTuples':proof['helperTuples']}


def output_frame(value):
    return (json.dumps(value, separators=(',', ':'), ensure_ascii=False) + '\n').encode()


class PureRendezvous:
    """Control-plane state machine. Caller must durably retain receipts before advancing."""
    def __init__(self, nonce_value, cid, script_sha, started_monotonic, helper_authority):
        demand(type(nonce_value) is str and HEX.fullmatch(nonce_value) and
               type(cid) is str and HEX.fullmatch(cid) and type(script_sha) is str and
               script_sha == SCRIPT_SHA and HEX.fullmatch(script_sha), 'constructor-identity')
        demand(finite_nonnegative_time(started_monotonic) and
               finite_nonnegative_time(started_monotonic + 900) and
               started_monotonic + 900 > started_monotonic,
               'start-monotonic')
        demand(type(helper_authority) is dict and set(helper_authority) == set(HELPER_ROLES),
               'constructor-helper-authority')
        self.nonce,self.cid,self.script_sha = nonce_value,cid,script_sha
        # Canonical private bytes prevent caller mutation between the two proofs.
        self._helper_authority_raw = json.dumps(helper_authority, separators=(',', ':'),
                                                ensure_ascii=False).encode('utf-8')
        self.deadline = started_monotonic + 900
        self.origin = started_monotonic
        self.last_now = started_monotonic
        self.phase='READY';self.ready_raw=None;self.ready_value=None
        self.first=None;self.result_raw=None;self.second=None
    def _helper_authority(self):
        return json.loads(self._helper_authority_raw)
    def check(self, now):
        demand(finite_nonnegative_time(now) and
               self.origin <= now and self.last_now <= now and now < self.deadline,
               'absolute-deadline')
        self.last_now = now
    def accept_ready(self, raw, now):
        self.check(now);demand(self.phase=='READY','phase-ready')
        self.ready_value=ready(raw,self.nonce,self.script_sha);self.ready_raw=raw;self.phase='PROVE_BEFORE'
    def attest_before(self, record, now, durable):
        self.check(now);demand(self.phase=='PROVE_BEFORE' and durable is True,'before-durable-phase')
        self.first=bracket(record,self.ready_value['pid'],self.nonce,self.cid,
                           self._helper_authority())
        self.first_attestation=attestation('PRE_START',self.first,record,self.ready_raw,
                              self.ready_value,self._helper_authority(),self.nonce,self.cid)
        self.phase='SEND_START'
    def start(self, now):
        self.check(now);demand(self.phase=='SEND_START','phase-start')
        raw=output_frame({'kind':'EXTERNAL_PROCESS_START','nonce':self.nonce,
            'pid':self.ready_value['pid'],'startTicks':self.first['startTicks'],
            'readySha256':digest(self.ready_raw),
            'attestationSha256':digest(output_frame(self.first_attestation))})
        demand(len(raw)<=16384,'start-bound');self.start_raw=raw;self.phase='RESULT';return raw
    def accept_result(self, raw, now):
        self.check(now);demand(self.phase=='RESULT','phase-result')
        value=parse_frame(raw,65536,('kind','nonce','pid','startTicks','readySha256',
            'startFrameSha256','preAttestationSha256','runtimeFenceSha256','scope'),
            'EXTERNAL_PROCESS_RESULT')
        demand(value['nonce']==self.nonce and type(value['pid']) is int and
               value['pid']==self.ready_value['pid'] and type(value['startTicks']) is int and
               value['startTicks']==self.first['startTicks'] and
               value['readySha256']==digest(self.ready_raw) and
               value['startFrameSha256']==digest(self.start_raw) and
               value['preAttestationSha256']==digest(output_frame(self.first_attestation)) and
               value['runtimeFenceSha256'] == digest(runtime_fence_raw(self.ready_value)) and
               value['scope']=='PROCESS_ONLY_NO_GRAPH_SDK_SQL','result-correlation')
        self.result_raw=raw;self.phase='PROVE_AFTER'
    def attest_after(self, record, now, durable):
        self.check(now);demand(self.phase=='PROVE_AFTER' and durable is True,'after-durable-phase')
        self.second=bracket(record,self.ready_value['pid'],self.nonce,self.cid,
                            self._helper_authority())
        same_tuple(self.first,self.second);self.phase='SEND_EXIT'
        self.second_attestation=attestation('POST_RESULT',self.second,record,self.ready_raw,
                               self.ready_value,self._helper_authority(),self.nonce,self.cid)
    def exit(self, now):
        self.check(now);demand(self.phase=='SEND_EXIT','phase-exit')
        raw=output_frame({'kind':'EXTERNAL_PROCESS_EXIT','nonce':self.nonce,
            'pid':self.ready_value['pid'],'startTicks':self.first['startTicks'],
            'resultSha256':digest(self.result_raw),
            'attestationSha256':digest(output_frame(self.second_attestation))})
        demand(len(raw)<=16384,'exit-bound');self.phase='AWAIT_EOF_EXIT';return raw
    def complete(self, exit_code, stderr, now, stopped):
        self.check(now)
        demand(self.phase=='AWAIT_EOF_EXIT' and type(exit_code) is int and exit_code==0 and
               stderr==b'' and stopped is True,'terminal-proof')
        self.phase='PROCESS_ONLY_PENDING_INSPECTOR_CLOSED'


def run_once(*_args, **_kwargs):
    raise RuntimeError('EXTERNAL_RENDEZVOUS_REFUSED:UNBOUND_KEEPER05_HELPERS_BIRTH_PERMIT')

if __name__ == '__main__':
    run_once()
