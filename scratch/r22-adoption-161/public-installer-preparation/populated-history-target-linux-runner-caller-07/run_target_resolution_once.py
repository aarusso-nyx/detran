"""Disabled, one-use target-Linux resolver caller. No database or SDK access.

Activation requires fresh independent source reviews and a Root-issued, exact-hash
permit. The direct entry stays disabled; run_once is the reviewable future seam.
"""
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import signal
import stat
import subprocess
import time

ROOT = Path(__file__).resolve().parents[4]
BASE = Path(__file__).resolve().parent
PERMIT = BASE / 'ROOT-TARGET-LINUX-RESOLUTION-PERMIT-ISSUED.json'
OUT = BASE / 'actual-one-use-run'
DOCKER = Path('/opt/homebrew/Cellar/docker/29.7.2/bin/docker')
DOCKER_SHA = 'adb33a6b552536d8219b2d8c32f3c44def98058e76e97c8031498471c8dfdac8'
IMAGE = 'sha256:88dfc24521607f7695d0eb0ee6f908dacb84b8e6cd31ee67a37a09aeedf513e8'
NODE_SHA = '89af8424dd53e560b1933f87ba650d8bf57c83ca5a04600eefb31f416aabbae7'
QEMU_SHA = '937686079f6a4ea5cf38c4bf488c2966811e7e0858d6cbe3d77deeddb55297f4'
QEMU_LINK = '/usr/bin/qemu-x86_64'
SCRIPT = '/repo/scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-caller-01/resolve_target_linux02.READ_ONLY.mjs'
RESOLVER = ROOT / SCRIPT.removeprefix('/repo/')
RESOLVER_SHA = 'e0101275d9ed329d1e9ded40f10864a64688d75fb5d304cf5cb3567723b7aecb'
PROOF = ROOT / 'tools/stynx-storage/fixtures/toolchain/node-linux-x64-proof.json'
PROOF_SHA = '850f9028501f925da8c50057091e3259125c574691673a9097fa170a024f1ea8'
PACKET = ROOT / 'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-resolution-01/SOURCE-ONLY-BOUND-INPUTS.json'
PACKET_SHA = 'a1fa3717b7a0abf872ad2f1fb409599b1c5fd12f5bbf528b06a27967ebc46da9'
HOST_ENV = {'DOCKER_HOST': 'unix:///var/run/docker.sock', 'LANG': 'C', 'LC_ALL': 'C', 'TZ': 'UTC'}
INNER_ENV = ['LANG=C.UTF-8', 'LC_ALL=C.UTF-8', 'TZ=UTC']
HEX = re.compile(r'[0-9a-f]{64}\Z')
POLL_SECONDS = 0.25
IMAGE_DATA = ROOT / 'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-creation-03/empty-image-pgdata'
CREATOR_SOURCE = ROOT / 'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-creation-05/create_inert_runner_once.py'
CREATOR_SOURCE_SHA = 'b44968796f3feb5e264c3b33a917941a69f393428b470b89f53b09247d66e087'
PREDECESSOR_ARCHITECT_HELD = ROOT / 'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-creation-03/architect-source-review-01/ARCHITECT-CREATOR03-CALLER05-COMBINED-HELD-REVIEW.json'
PREDECESSOR_ARCHITECT_HELD_SHA = 'e944c096fb6bcba677a093d4e9dbdbfaa87d3aac6659d5bec93f56a3c889fcab'
PREDECESSOR_INSPECTOR_HELD = ROOT / 'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-creation-03/inspector-source-review-01/INSPECTOR-CREATOR03-CALLER05-EXACT-SOURCE-HELD-REVIEW.json'
PREDECESSOR_INSPECTOR_HELD_SHA = '2e85fb7f8618226eab4367b762fdea0768abb250881a692004bd793f43e1c33b'
TYPED_CONTROL_ADDENDUM = ROOT / 'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-creation-03/architect-source-review-01/ARCHITECT-CALLER05-TYPED-CONTROL-HELD-ADDENDUM.json'
TYPED_CONTROL_ADDENDUM_SHA = 'ebd6eb28aa5f06fb8c9f7fec84b7f8dbc8adde205f461ebfd5f5dd2b9df383cb'
DIRECTORY_AMENDMENT = ROOT / 'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-creation-design-01/ARCHITECT-EXCLUSIVE-DIRECTORY-RUNNER-AMENDMENT.md'
DIRECTORY_AMENDMENT_SHA = '1e4c8eca5f083963dff40299be70938c59ce00373f3648102204691d5592dd0d'
DIRECTORY_INSPECTOR_REVIEW = ROOT / 'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-creation-design-01/inspector-directory-amendment-review-01/INSPECTOR-EXCLUSIVE-DIRECTORY-AMENDMENT-REVIEW.json'
DIRECTORY_INSPECTOR_REVIEW_SHA = 'a0b1ff62114b4930d533f1116b6b7cd708e430d20bee260177a39d1a66f08543'
LABELS = {'detran.owner': 'target-linux-resolver-keeper03', 'detran.gate': 'four-root-resolution'}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def demand(ok, reason):
    if not ok:
        raise RuntimeError('TARGET_RESOLUTION_REFUSED:' + reason)


def utc():
    return dt.datetime.now(dt.timezone.utc).isoformat()


def regular(path):
    return path.is_file() and not path.is_symlink() and path.resolve() == path


def fsync_dir(path):
    fd = os.open(path, os.O_RDONLY | getattr(os, 'O_DIRECTORY', 0))
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def put(path, data):
    raw = data if isinstance(data, bytes) else (json.dumps(data, sort_keys=True, indent=2) + '\n').encode()
    with path.open('xb') as stream:
        stream.write(raw)
        stream.flush()
        os.fsync(stream.fileno())
    fsync_dir(path.parent)
    return {'path': str(path.relative_to(ROOT)), 'bytes': len(raw), 'sha256': 'sha256:' + digest(raw)}


def command(out, label, args, *, timeout=120, interrupted=None, cleanup=False):
    argv = [str(DOCKER), *args]
    put(out / (label + '.argv.json'), argv)
    started_utc, start = utc(), time.monotonic()
    stdout = stderr = b''
    status = {'exitCode': None, 'timedOut': False, 'interrupted': False,
              'spawnError': None}
    process = None
    def preserve_partial(error):
        nonlocal stdout, stderr
        stdout = error.stdout or stdout
        stderr = error.stderr or stderr

    def reap_after_failure():
        nonlocal stdout, stderr
        if process is None:
            return
        try:
            if process.poll() is None:
                process.kill()
        except Exception as error:
            status['cleanupError'] = repr(error)
        try:
            stdout, stderr = process.communicate(timeout=5)
            status['exitCode'] = process.returncode
        except subprocess.TimeoutExpired as error:
            preserve_partial(error)
            status['cleanupError'] = 'process-still-running-after-kill'
        except Exception as error:
            status['cleanupError'] = repr(error)

    try:
        if interrupted is not None and interrupted['requested'] and not cleanup:
            status['interrupted'] = True
        else:
            process = subprocess.Popen(argv, stdout=subprocess.PIPE,
                                       stderr=subprocess.PIPE, env=HOST_ENV)
            status['spawned'] = True
            deadline = start + timeout
            while True:
                if interrupted is not None and interrupted['requested'] and not cleanup:
                    status['interrupted'] = True
                    break
                if time.monotonic() >= deadline:
                    status['timedOut'] = True
                    break
                try:
                    stdout, stderr = process.communicate(timeout=min(POLL_SECONDS,
                                                       max(0.001, deadline - time.monotonic())))
                    status['exitCode'] = process.returncode
                    break
                except subprocess.TimeoutExpired as error:
                    preserve_partial(error)
            if status['interrupted'] or status['timedOut']:
                try:
                    process.terminate()
                except ProcessLookupError:
                    pass
                try:
                    stdout, stderr = process.communicate(timeout=5)
                except subprocess.TimeoutExpired as error:
                    preserve_partial(error)
                    process.kill()
                    try:
                        stdout, stderr = process.communicate(timeout=5)
                    except subprocess.TimeoutExpired as final_error:
                        preserve_partial(final_error)
                        status['cleanupError'] = 'process-still-running-after-kill'
                status['exitCode'] = process.returncode
    except OSError as error:
        field = 'spawnError' if process is None else 'commandError'
        status[field] = {'type': type(error).__name__, 'errno': error.errno,
                         'message': str(error)}
        reap_after_failure()
    except Exception as error:
        status['unexpectedError'] = repr(error)
        reap_after_failure()
    finally:
        status.update(startedUtc=started_utc, endedUtc=utc(),
                      elapsedSeconds=time.monotonic() - start)
        put(out / (label + '.stdout.raw'), stdout)
        put(out / (label + '.stderr.raw'), stderr)
        put(out / (label + '.status.json'), status)
    return status, stdout, stderr


def succeeded(result, code):
    status, stdout, stderr = result
    demand(status['exitCode'] == 0 and status['timedOut'] is False and
           status['interrupted'] is False and status['spawnError'] is None and
           status.get('cleanupError') is None and status.get('commandError') is None and
           status.get('unexpectedError') is None and
           stderr == b'', code)
    return stdout


def validate_permit(value):
    keys = {'kind', 'status', 'issuer', 'holder', 'purpose', 'maxInvocations',
            'consumedInvocations', 'runnerCid', 'imageId', 'repoSource',
            'nodeSource', 'imageDataSource', 'runnerBirthRef', 'creatorOutcomeRef',
            'sourceRefs', 'reviewRefs',
            'inspectorClosureRequired'}
    demand(type(value) is dict and set(value) == keys, 'permit-keys')
    demand(value['kind'] == 'root-one-use-readonly-target-linux-resolution' and
           value['status'] == 'ISSUED' and value['issuer'] == '/root' and
           value['holder'] == '/root/engineer_portable_custody' and
           value['purpose'] == 'four-public-root-file-resolution-only', 'permit-authority')
    demand(type(value['maxInvocations']) is int and value['maxInvocations'] == 1 and
           type(value['consumedInvocations']) is int and value['consumedInvocations'] == 0 and
           value['inspectorClosureRequired'] is True, 'permit-once')
    demand(type(value['runnerCid']) is str and HEX.fullmatch(value['runnerCid']) and
           value['imageId'] == IMAGE, 'permit-runner')
    demand(type(value['repoSource']) is str and value['repoSource'] == str(ROOT) and
           type(value['nodeSource']) is str and
           value['nodeSource'] == str(ROOT / 'scratch/r22-adoption-161/linux-portable-preparation/node-linux-x64-executable') and
           value['imageDataSource'] == str(IMAGE_DATA),
           'permit-mounts')
    demand(value['sourceRefs'] == {'resolverSha256': 'sha256:' + RESOLVER_SHA,
                                   'nodeProofSha256': 'sha256:' + PROOF_SHA,
                                   'resolver01PacketSha256': 'sha256:' + PACKET_SHA,
                                   'dockerSha256': 'sha256:' + DOCKER_SHA,
                                   'directoryAmendmentSha256': 'sha256:' + DIRECTORY_AMENDMENT_SHA,
                                   'directoryInspectorReviewSha256': 'sha256:' + DIRECTORY_INSPECTOR_REVIEW_SHA,
                                   'creatorSourceSha256': 'sha256:' + CREATOR_SOURCE_SHA,
                                   'predecessorArchitectHeldSha256': 'sha256:' + PREDECESSOR_ARCHITECT_HELD_SHA,
                                   'predecessorInspectorHeldSha256': 'sha256:' + PREDECESSOR_INSPECTOR_HELD_SHA,
                                   'typedControlAddendumSha256': 'sha256:' + TYPED_CONTROL_ADDENDUM_SHA,
                                   'callerSha256': 'sha256:' + digest(Path(__file__).read_bytes())}, 'permit-source')
    demand(type(value['reviewRefs']) is dict and set(value['reviewRefs']) == {'architect', 'inspector'} and
           all(type(item) is dict and set(item) == {'path', 'sha256'} and
               type(item['sha256']) is str and item['sha256'].startswith('sha256:') and
               HEX.fullmatch(item['sha256'][7:]) for item in value['reviewRefs'].values()), 'permit-review')
    ref = value['runnerBirthRef']
    demand(type(ref) is dict and set(ref) == {'path', 'bytes', 'sha256'} and
           type(ref['path']) is str and ref['path'].startswith(
               'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-caller-07/inspector-runner-birth-01/') and
           '..' not in Path(ref['path']).parts and
           type(ref['bytes']) is int and ref['bytes'] > 0 and
           type(ref['sha256']) is str and ref['sha256'].startswith('sha256:') and
           HEX.fullmatch(ref['sha256'][7:]), 'permit-birth-ref')
    creator = value['creatorOutcomeRef']
    demand(type(creator) is dict and set(creator) == {'path', 'bytes', 'sha256'} and
           creator['path'] == 'scratch/r22-adoption-161/public-installer-preparation/'
               'populated-history-target-linux-runner-creation-05/actual-one-use-creation/OUTCOME.json' and
           type(creator['bytes']) is int and creator['bytes'] > 0 and
           type(creator['sha256']) is str and creator['sha256'].startswith('sha256:') and
           HEX.fullmatch(creator['sha256'][7:]), 'creator-outcome-ref')
    return value


def validate_image(image):
    demand(type(image) is dict and image.get('Id') == IMAGE and
           image.get('Os') == 'linux' and image.get('Architecture') == 'amd64' and
           image.get('Config', {}).get('Volumes') == {'/var/lib/postgresql': {}}, 'image-volume')


def validate_birth(birth, permit, creator):
    demand(type(birth) is dict and set(birth) == {'actor', 'scopeStatus', 'runnerCid',
           'imageId', 'mountSources', 'processInventory', 'imageDataDirectory'}, 'birth-keys')
    demand(birth['actor'] == '/root/inspector_adoption_160' and
           birth['scopeStatus'] == 'CLOSED' and birth['runnerCid'] == permit['runnerCid'] and
           birth['imageId'] == IMAGE, 'birth-identity')
    sources = birth['mountSources']
    demand(type(sources) is dict and set(sources) == {'/repo', '/usr/local/bin/node',
           '/var/lib/postgresql'}, 'birth-mount-keys')
    for dest, host in (('/repo', permit['repoSource']),
                       ('/usr/local/bin/node', permit['nodeSource']),
                       ('/var/lib/postgresql', permit['imageDataSource'])):
        demand(sources[dest] in (host, '/host_mnt' + host), 'birth-mount-source:' + dest)
    directory = birth['imageDataDirectory']
    demand(type(directory) is dict and set(directory) == {'source', 'ownerUid', 'ownerGid',
           'mode', 'device', 'inode', 'empty'} and
           directory['source'] == str(IMAGE_DATA) and directory['mode'] == '0700' and
           directory['empty'] is True and
           all(type(directory[key]) is int and directory[key] >= 0 for key in
               ('ownerUid', 'ownerGid', 'device', 'inode')) and
           directory['device'] > 0 and directory['inode'] > 0 and
           directory == creator['imageDataDirectory'], 'birth-directory-identity')
    inventory = birth['processInventory']
    demand(type(inventory) is dict and set(inventory) == {'command', 'stdoutSha256',
            'rowCount'} and inventory['command'] == ['top', permit['runnerCid'],
            '-eo', 'pid,ppid,comm,args'] and type(inventory['rowCount']) is int and
            inventory['rowCount'] == 1 and type(inventory['stdoutSha256']) is str and
            inventory['stdoutSha256'].startswith('sha256:') and
            HEX.fullmatch(inventory['stdoutSha256'][7:]), 'birth-inventory')
    return birth


def read_creator_outcome(permit):
    ref = permit['creatorOutcomeRef']
    path = ROOT / ref['path']
    correction = path.with_name('INTERRUPTION-AFTER-OUTCOME.json')
    def no_late_correction():
        try:
            correction.lstat()  # includes dangling links and malformed correction files
        except FileNotFoundError:
            return
        demand(False, 'creator-late-interruption-or-unknown-disposition')
    no_late_correction()
    demand(regular(path), 'creator-outcome-file')
    raw = path.read_bytes()
    demand(len(raw) == ref['bytes'] and 'sha256:' + digest(raw) == ref['sha256'],
           'creator-outcome-bytes')
    value = json.loads(raw)
    demand(type(value) is dict and value.get('status') ==
           'RUNNER_CREATED_PENDING_INSPECTOR_BIRTH_CLOSED' and
           value.get('directoryCreatedAcknowledged') is True and
           value.get('actualCid') == permit['runnerCid'] and
           type(value.get('imageDataDirectory')) is dict and
           type(value.get('imageDataParentChain')) is list,
           'creator-outcome-status')
    no_late_correction()
    return value


def image_data_parent_chain():
    path = ROOT
    chain = []
    for component in (None, *IMAGE_DATA.parent.relative_to(ROOT).parts):
        if component is not None:
            path = path / component
        parent = path.lstat()
        demand(stat.S_ISDIR(parent.st_mode) and not stat.S_ISLNK(parent.st_mode) and
               path.resolve() == path, 'image-data-parent-redirect')
        demand(all(type(item) is int and item >= 0 for item in
                   (parent.st_dev, parent.st_ino, parent.st_uid, parent.st_gid)) and
               parent.st_dev > 0 and parent.st_ino > 0,
               'image-data-parent-stat')
        chain.append({'source': str(path), 'device': parent.st_dev, 'inode': parent.st_ino,
                      'ownerUid': parent.st_uid, 'ownerGid': parent.st_gid,
                      'mode': format(stat.S_IMODE(parent.st_mode), '04o')})
    return chain


def verify_image_data_directory(out, label, expected, expected_chain):
    chain = image_data_parent_chain()
    demand(chain == expected_chain, 'image-data-parent-chain-drift:' + label)
    before = IMAGE_DATA.lstat()
    demand(stat.S_ISDIR(before.st_mode) and not stat.S_ISLNK(before.st_mode),
           'image-data-leaf-type:' + label)
    fd = os.open(IMAGE_DATA, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        opened = os.fstat(fd)
        names = sorted(os.listdir(fd))
        value = {'source': str(IMAGE_DATA), 'ownerUid': before.st_uid,
                 'ownerGid': before.st_gid, 'mode': format(stat.S_IMODE(before.st_mode), '04o'),
                 'device': before.st_dev, 'inode': before.st_ino, 'empty': names == []}
        put(out / (label + '.json'), {'parentChain': chain, 'lstat': value, 'listing': names,
            'fstat': {'ownerUid': opened.st_uid, 'ownerGid': opened.st_gid,
                      'mode': format(stat.S_IMODE(opened.st_mode), '04o'),
                      'device': opened.st_dev, 'inode': opened.st_ino}})
        demand(all(value[key] == (opened.st_uid if key == 'ownerUid' else
                  opened.st_gid if key == 'ownerGid' else
                  format(stat.S_IMODE(opened.st_mode), '04o') if key == 'mode' else
                  opened.st_dev if key == 'device' else opened.st_ino)
                  for key in ('ownerUid', 'ownerGid', 'mode', 'device', 'inode')),
               'image-data-lstat-fstat:' + label)
        demand(value == expected and value['empty'] is True,
               'image-data-identity:' + label)
        return value
    finally:
        os.close(fd)


def validate_runner(actual, permit, image, birth):
    demand(type(actual) is dict and actual.get('Id') == permit['runnerCid'] and
           actual.get('Name') == '/detran-r22-161-target-resolver-keeper03' and
           actual.get('Image') == IMAGE and actual.get('State', {}).get('Running') is True and
           type(actual.get('State', {}).get('Pid')) is int and
           actual['State']['Pid'] > 0, 'runner-identity')
    cfg, host, net = actual['Config'], actual['HostConfig'], actual['NetworkSettings']
    demand(cfg.get('Labels') == LABELS and cfg.get('User') == '999:999' and
           cfg.get('Entrypoint') == ['/bin/sleep'] and
           cfg.get('Cmd') == ['infinity'] and cfg.get('Env') == image['Config'].get('Env') and
           cfg.get('WorkingDir') in ('', '/'), 'runner-inert')
    demand(host.get('ReadonlyRootfs') is True and host.get('NetworkMode') == 'none' and
           host.get('Privileged') is False and host.get('CapDrop') == ['ALL'] and
           host.get('CapAdd') in (None, []) and host.get('SecurityOpt') == ['no-new-privileges'] and
           host.get('PortBindings') in (None, {}) and net.get('Ports') in (None, {}), 'runner-isolation')
    demand(host.get('Binds') in (None, []) and host.get('Devices') in (None, []) and
           host.get('DeviceRequests') in (None, []) and
           host.get('DeviceCgroupRules') in (None, []) and
           host.get('GroupAdd') in (None, []) and host.get('ExtraHosts') in (None, []) and
           host.get('PidMode') == '' and host.get('IpcMode') == 'private' and
           host.get('UTSMode') == '' and host.get('UsernsMode') == '' and
           host.get('Tmpfs') in (None, {}) and host.get('VolumesFrom') in (None, []) and
           host.get('Links') in (None, []), 'runner-no-foreign-sharing')
    expected = {
        ('/repo', 'bind', birth['mountSources']['/repo'], False),
        ('/usr/local/bin/node', 'bind', birth['mountSources']['/usr/local/bin/node'], False),
        ('/var/lib/postgresql', 'bind', birth['mountSources']['/var/lib/postgresql'], False),
    }
    demand(type(actual.get('Mounts')) is list and len(actual['Mounts']) == 3 and
           all(type(m) is dict and type(m.get('RW')) is bool and m['RW'] is False
               for m in actual['Mounts']), 'runner-actual-ro-bool')
    mounts = {(m.get('Destination'), m.get('Type'), m.get('Source'), m.get('RW'))
              for m in actual['Mounts']}
    demand(mounts == expected and len(actual.get('Mounts', [])) == 3, 'runner-exact-readonly-mounts')
    requested = host.get('Mounts')
    demand(type(requested) is list and len(requested) == 3, 'runner-requested-mount-count')
    by_target = {m.get('Target'): m for m in requested}
    demand(len(by_target) == 3 and set(by_target) == set(birth['mountSources']),
           'runner-requested-targets')
    for target, source in (('/repo', permit['repoSource']),
                           ('/usr/local/bin/node', permit['nodeSource']),
                           ('/var/lib/postgresql', permit['imageDataSource'])):
        mount = by_target[target]
        demand(mount.get('Type') == 'bind' and mount.get('ReadOnly') is True and
               mount.get('Source') in (source, '/host_mnt' + source),
               'runner-requested-bind:' + target)


def read_birth(permit, creator):
    ref = permit['runnerBirthRef']
    path = ROOT / ref['path']
    demand(regular(path) and path.resolve().is_relative_to(ROOT), 'birth-file')
    raw = path.read_bytes()
    demand(len(raw) == ref['bytes'] and 'sha256:' + digest(raw) == ref['sha256'], 'birth-bytes')
    return validate_birth(json.loads(raw), permit, creator)


def proc_identity(raw):
    text = raw.decode('ascii').strip()
    end = text.rfind(') ')
    demand(end > 0, 'proc-stat-shape')
    pid = int(text[:text.index(' ')])
    fields = text[end + 2:].split()
    demand(pid == 1 and len(fields) > 19 and fields[0] != 'Z', 'pid1-live')
    return {'pid': pid, 'ppid': int(fields[1]), 'startTicks': int(fields[19])}


def verify_pid1(out, cid, interrupted):
    def read(label, argv):
        return succeeded(command(out, label, ['exec', '--user', '999:999', cid, *argv],
                                 timeout=30, interrupted=interrupted), label)
    before = proc_identity(read('pid1-stat-before', ['/bin/cat', '/proc/1/stat']))
    argv = read('pid1-cmdline', ['/bin/cat', '/proc/1/cmdline']).split(b'\0')
    demand(argv[-1] == b'' and argv[:-1] == [b'/usr/bin/qemu-x86_64', b'/bin/sleep', b'infinity'], 'pid1-argv')
    link = read('pid1-exe-link', ['/usr/bin/readlink', '/proc/1/exe']).strip().decode()
    value = read('pid1-exe-hash', ['/usr/bin/sha256sum', '/proc/1/exe']).decode().strip()
    after = proc_identity(read('pid1-stat-after', ['/bin/cat', '/proc/1/stat']))
    demand(before == after and before['ppid'] == 0 and link == QEMU_LINK and
           value == QEMU_SHA + '  /proc/1/exe', 'pid1-qemu-proof')
    return before


def rehash_sources(permit):
    demand(regular(Path(__file__)) and
           'sha256:' + digest(Path(__file__).read_bytes()) == permit['sourceRefs']['callerSha256'],
           'caller-bytes')
    demand(regular(DOCKER) and digest(DOCKER.read_bytes()) == DOCKER_SHA, 'docker-bytes')
    demand(regular(RESOLVER) and digest(RESOLVER.read_bytes()) == RESOLVER_SHA, 'resolver-bytes')
    demand(regular(PROOF) and digest(PROOF.read_bytes()) == PROOF_SHA, 'proof-bytes')
    demand(regular(DIRECTORY_AMENDMENT) and
           digest(DIRECTORY_AMENDMENT.read_bytes()) == DIRECTORY_AMENDMENT_SHA,
           'directory-amendment-bytes')
    demand(regular(DIRECTORY_INSPECTOR_REVIEW) and
           digest(DIRECTORY_INSPECTOR_REVIEW.read_bytes()) == DIRECTORY_INSPECTOR_REVIEW_SHA,
           'directory-inspector-review-bytes')
    demand(regular(CREATOR_SOURCE) and digest(CREATOR_SOURCE.read_bytes()) ==
           CREATOR_SOURCE_SHA, 'creator-source-bytes')
    for path, expected in ((PREDECESSOR_ARCHITECT_HELD, PREDECESSOR_ARCHITECT_HELD_SHA),
                           (PREDECESSOR_INSPECTOR_HELD, PREDECESSOR_INSPECTOR_HELD_SHA),
                           (TYPED_CONTROL_ADDENDUM, TYPED_CONTROL_ADDENDUM_SHA)):
        demand(regular(path) and digest(path.read_bytes()) == expected,
               'predecessor-review-bytes')
    demand(regular(PACKET) and digest(PACKET.read_bytes()) == PACKET_SHA, 'packet-bytes')
    entries = json.loads(PACKET.read_bytes())['inputs']
    demand(type(entries) is dict and len(entries) == 19, 'packet-entry-count')
    for record in entries.values():
        demand(type(record) is dict and set(record) == {'path', 'bytes', 'sha256'}, 'packet-record')
        path = ROOT / record['path']
        demand(regular(path) and path.resolve().is_relative_to(ROOT) and
               len(path.read_bytes()) == record['bytes'] and
               'sha256:' + digest(path.read_bytes()) == record['sha256'],
               'packet-drift:' + record['path'])
    node = Path(permit['nodeSource'])
    demand(regular(node) and digest(node.read_bytes()) == NODE_SHA, 'host-node-bytes')
    for item in permit['reviewRefs'].values():
        path = ROOT / item['path']
        demand(regular(path) and path.resolve().is_relative_to(ROOT) and
               'sha256:' + digest(path.read_bytes()) == item['sha256'], 'review-bytes')
    creator = read_creator_outcome(permit)
    read_birth(permit, creator)


def verify_inventory(out, cid, birth, label, interrupted):
    stdout = succeeded(command(out, label, birth['processInventory']['command'],
                               timeout=30, interrupted=interrupted), label)
    demand(len(stdout.splitlines()) == 2 and all(stdout.splitlines()),
           'foreign-process-count:' + label)
    demand('sha256:' + digest(stdout) == birth['processInventory']['stdoutSha256'],
           'foreign-process-inventory:' + label)
    return stdout


def clean_stop(stop):
    status, _stdout, stderr = stop
    return status['exitCode'] == 0 and status['timedOut'] is False and \
        status['spawnError'] is None and status.get('commandError') is None and \
        status.get('unexpectedError') is None and status.get('cleanupError') is None and stderr == b''


def _run_once(expected_permit_sha256, interrupted):
    demand(type(expected_permit_sha256) is str and HEX.fullmatch(expected_permit_sha256), 'permit-sha-shape')
    demand(regular(PERMIT), 'permit-file')
    permit_bytes = PERMIT.read_bytes()
    demand(digest(permit_bytes) == expected_permit_sha256, 'permit-sha')
    permit = validate_permit(json.loads(permit_bytes))
    demand(not OUT.exists(), 'one-use-output-exists')
    OUT.mkdir(mode=0o700)
    fsync_dir(OUT.parent)
    result = {'kind': 'target-linux-resolution-one-use-caller', 'status': 'UNKNOWN',
              'runnerCid': permit['runnerCid'], 'permitSha256': expected_permit_sha256,
              'resolverInvocationsAttempted': 0, 'sdkEvaluations': 0, 'sqlCommands': 0,
              'inspectorClosure': 'PENDING_INDEPENDENT_READBACK'}
    owned_runner = False
    birth = None
    try:
        demand(not interrupted['requested'], 'interrupted-before-preflight')
        put(OUT / 'admitted-permit.raw', permit_bytes)
        rehash_sources(permit)
        creator = read_creator_outcome(permit)
        birth = read_birth(permit, creator)
        verify_image_data_directory(OUT, 'image-data-before', birth['imageDataDirectory'],
                                    creator['imageDataParentChain'])
        image = json.loads(succeeded(command(OUT, 'image-inspect', ['image', 'inspect', IMAGE],
            interrupted=interrupted), 'image-inspect'))[0]
        validate_image(image)
        actual = json.loads(succeeded(command(OUT, 'runner-inspect', ['inspect', permit['runnerCid']],
            interrupted=interrupted), 'runner-inspect'))[0]
        validate_runner(actual, permit, image, birth)
        owned_runner = True
        verify_inventory(OUT, permit['runnerCid'], birth, 'foreign-inventory-before', interrupted)
        result['pid1'] = verify_pid1(OUT, permit['runnerCid'], interrupted)
        node_hash = succeeded(command(OUT, 'mounted-node-hash', ['exec', '--user', '999:999', permit['runnerCid'],
                                             '/usr/bin/sha256sum', '/usr/local/bin/node'], timeout=45,
                                             interrupted=interrupted), 'mounted-node-hash')
        demand(node_hash.decode().strip() == NODE_SHA + '  /usr/local/bin/node', 'mounted-node-bytes')
        rehash_sources(permit)
        demand(not interrupted['requested'], 'interrupted-before-consume')
        demand(digest(PERMIT.read_bytes()) == expected_permit_sha256, 'permit-preconsume-drift')
        put(OUT / 'CONSUMING.json', {'permitSha256': expected_permit_sha256, 'utc': utc(),
                                      'resolverInvocationsAllowed': 1})
        rehash_sources(permit)
        verify_image_data_directory(OUT, 'image-data-before-resolver', birth['imageDataDirectory'],
                                    creator['imageDataParentChain'])
        demand(not interrupted['requested'], 'interrupted-before-resolver')
        demand(digest(PERMIT.read_bytes()) == expected_permit_sha256, 'permit-prespawn-drift')
        result['resolverInvocationsAttempted'] = 1
        status, stdout, stderr = command(OUT, 'resolver', ['exec', '--user', '999:999', '--workdir', '/repo',
            permit['runnerCid'], '/usr/bin/env', '-i', *INNER_ENV, '/usr/local/bin/node', SCRIPT],
            timeout=900, interrupted=interrupted)
        demand(not interrupted['requested'] and status['exitCode'] == 0 and
               status['timedOut'] is False and status['interrupted'] is False and
               status['spawnError'] is None and status.get('commandError') is None and
               status.get('unexpectedError') is None and status.get('cleanupError') is None and
               stderr == b'', 'resolver-status')
        demand(stdout.endswith(b'\n') and stdout.count(b'\n') == 1, 'resolver-single-json-line')
        output = json.loads(stdout)
        demand(output.get('status') == 'TARGET_RESOLUTION_ONLY_NO_SDK_EVALUATION' and
               output.get('sdkEvaluated') is False and output.get('sqlCommands') == 0 and
               output.get('node', {}).get('execArgv') == [] and
               output.get('kernel', {}).get('layout') == 'emulated' and
               output.get('kernel', {}).get('exeSha256') == 'sha256:' + QEMU_SHA and
               output.get('embeddedLoaders') == {
                   'internal/modules/cjs/loader': 'sha256:a3e3ee095d409597bf224522411607aa7d2f4747cf42b5329179bf3b4b5528ed',
                   'internal/modules/customization_hooks': 'sha256:02cf07c29fd2c4701ccc19395d5d0b11968aee34a9aefb37b5684f7248c457f7',
                   'internal/modules/helpers': 'sha256:3d6d6d7c7257610dcee83c76f29d6314ba56af5560faf50650a025fd9a56bbb3',
               }, 'resolver-process-proof')
        demand(not interrupted['requested'], 'interrupted-after-output')
        result['status'] = 'RESOLUTION_OUTPUT_RETAINED_PENDING_INSPECTOR_CLOSED'
    except Exception as error:
        result['error'] = repr(error)
        result['status'] = 'UNKNOWN_QUARANTINE'
    finally:
        if birth is not None:
            try:
                verify_image_data_directory(OUT, 'image-data-after', birth['imageDataDirectory'],
                                            creator['imageDataParentChain'])
            except Exception as error:
                result['imageDataAfterError'] = repr(error)
                result['status'] = 'UNKNOWN_QUARANTINE'
        if owned_runner:
            try:
                verify_inventory(OUT, permit['runnerCid'], birth,
                                 'foreign-inventory-after', interrupted)
            except Exception as error:
                result['inventoryAfterError'] = repr(error)
                result['status'] = 'UNKNOWN_QUARANTINE'
            try:
                stop = command(OUT, 'owned-runner-stop', ['stop', '--time', '10', permit['runnerCid']],
                               timeout=45, interrupted=interrupted, cleanup=True)
                result['ownedRunnerStopExitCode'] = stop[0]['exitCode']
                if not clean_stop(stop):
                    result['status'] = 'UNKNOWN_QUARANTINE'
                final = json.loads(succeeded(command(OUT, 'runner-final-inspect',
                    ['inspect', permit['runnerCid']], interrupted=interrupted,
                    cleanup=True), 'runner-final-inspect'))[0]
                result['ownedRunnerStopped'] = final.get('Id') == permit['runnerCid'] and \
                    final.get('State', {}).get('Running') is False
                if not result['ownedRunnerStopped']:
                    result['status'] = 'UNKNOWN_QUARANTINE'
            except Exception as error:
                result['ownedRunnerStopError'] = repr(error)
                result['status'] = 'UNKNOWN_QUARANTINE'
        try:
            rehash_sources(permit)
            demand(digest(PERMIT.read_bytes()) == expected_permit_sha256, 'permit-closing-drift')
        except Exception as error:
            result['closingError'] = repr(error)
            result['status'] = 'UNKNOWN_QUARANTINE'
        if interrupted['requested']:
            result['interruptSignal'] = interrupted['signal']
            result['status'] = 'UNKNOWN_QUARANTINE'
        put(OUT / 'OUTCOME.json', result)
    return result


def run_once(expected_permit_sha256):
    interrupted = {'requested': False, 'signal': None}
    previous = {signum: signal.getsignal(signum) for signum in (signal.SIGINT, signal.SIGTERM)}

    def request_stop(signum, _frame):
        interrupted['requested'] = True
        interrupted['signal'] = signum

    try:
        for signum in previous:
            signal.signal(signum, request_stop)
        result = _run_once(expected_permit_sha256, interrupted)
    finally:
        for signum, handler in previous.items():
            signal.signal(signum, handler)
    if interrupted['requested']:
        # A signal during immutable OUTCOME writing or during restoration of
        # the other still-custom handler must be observed before publication.
        # Once both originals are restored, a later signal uses caller policy.
        result['status'] = 'UNKNOWN_QUARANTINE'
        result['lateInterruptSignal'] = interrupted['signal']
        try:
            original = (OUT / 'OUTCOME.json').read_bytes()
            put(OUT / 'INTERRUPTION-AFTER-OUTCOME.json', {
                'kind': 'additive-late-interruption',
                'originalOutcomeSha256': 'sha256:' + digest(original),
                'signal': interrupted['signal'],
                'status': 'UNKNOWN_QUARANTINE', 'utc': utc()})
        except Exception as error:
            result['lateEvidenceError'] = repr(error)
    return result


if __name__ == '__main__':
    demand(False, 'SOURCE_ONLY_NO_ISSUED_PERMIT_OR_INDEPENDENT_REVIEW')
