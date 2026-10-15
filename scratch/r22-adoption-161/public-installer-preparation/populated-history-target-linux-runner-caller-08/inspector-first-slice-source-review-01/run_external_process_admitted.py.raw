"""Disabled exact-buffer entry for prospective external process-only rendezvous."""
import hashlib
import json
from pathlib import Path
import re
import types

ROOT = Path(__file__).resolve().parents[4]
BASE = Path(__file__).resolve().parent
ENTRY = BASE / 'run_external_process_admitted.py'
CALLER = BASE / 'run_external_process_once.py'
PERMIT = BASE / 'ROOT-EXTERNAL-PROCESS-PERMIT-ISSUED.json'
ADMISSION = BASE / 'ROOT-EXTERNAL-PROCESS-ADMISSION-ISSUED.json'
OUT = BASE / 'external-process-admission-entry-01'
HEX = re.compile('[0-9a-f]{64}\\Z')


def demand(ok, code):
    if not ok: raise RuntimeError('EXTERNAL_PROCESS_ENTRY_REFUSED:' + code)


def sha(raw): return hashlib.sha256(raw).hexdigest()

def unique_pairs(pairs):
    result = {}
    for key, value in pairs:
        demand(key not in result, 'duplicate-json-key')
        result[key] = value
    return result


def parse(raw):
    return json.loads(raw.decode('utf-8'), object_pairs_hook=unique_pairs)


def admission_shape(value):
    demand(type(value) is dict and set(value) == {'kind','status','issuer','holder',
        'maxInvocations','consumedInvocations','entry','caller','permit','python','reviewRefs'},
        'closed11')
    demand(value['kind']=='root-one-use-external-process-entry-v1' and
           value['status']=='ISSUED' and value['issuer']=='/root' and
           value['holder']=='/root/engineer_portable_custody' and
           type(value['maxInvocations']) is int and value['maxInvocations']==1 and
           type(value['consumedInvocations']) is int and value['consumedInvocations']==0 and
           type(value['reviewRefs']) is dict and set(value['reviewRefs']) ==
           {'callerArchitect','callerInspector','entryArchitect','entryInspector'},
           'admission-authority')
    return value


def compile_exact_caller(raw, expected_sha):
    demand(type(raw) is bytes and 0 < len(raw) <= 262144 and
           type(expected_sha) is str and HEX.fullmatch(expected_sha) and
           sha(raw) == expected_sha, 'caller-exact-bytes')
    module = types.ModuleType('external_process_caller_exact_buffer')
    module.__file__ = str(CALLER)
    exec(compile(raw, str(CALLER), 'exec'), module.__dict__)
    demand(callable(getattr(module, 'run_once', None)), 'caller-run-once')
    return module


def run_admitted(*_args, **_kwargs):
    # First-slice source has no keeper05 birth/tool hashes, permit or admission.
    raise RuntimeError('EXTERNAL_PROCESS_ENTRY_REFUSED:UNBOUND_KEEPER05_HELPERS_BIRTH_ADMISSION')


if __name__ == '__main__':
    run_admitted()
