"""Disabled one-use creation of a fresh inert target-Linux resolver runner.

No database, Node, SDK or installer command. Direct entry unconditionally refuses.
Actual effects require separate Root SHA admission, independent source reviews, and
one-use permit; this file alone supplies no authority.
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
PERMIT = BASE / 'ROOT-RUNNER-CREATION-PERMIT-ISSUED.json'
OUT = BASE / 'actual-one-use-creation'
DOCKER = Path('/opt/homebrew/Cellar/docker/29.7.2/bin/docker')
DOCKER_SHA = 'adb33a6b552536d8219b2d8c32f3c44def98058e76e97c8031498471c8dfdac8'
NODE = ROOT / 'scratch/r22-adoption-161/linux-portable-preparation/node-linux-x64-executable'
NODE_SHA = '89af8424dd53e560b1933f87ba650d8bf57c83ca5a04600eefb31f416aabbae7'
IMAGE = 'sha256:88dfc24521607f7695d0eb0ee6f908dacb84b8e6cd31ee67a37a09aeedf513e8'
CONTAINER = 'detran-r22-161-target-resolver-keeper03'
IMAGE_DATA = ROOT / 'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-creation-03/empty-image-pgdata'
LABELS = {'detran.owner': 'target-linux-resolver-keeper03', 'detran.gate': 'four-root-resolution'}
HOST_ENV = {'DOCKER_HOST': 'unix:///var/run/docker.sock', 'LANG': 'C', 'LC_ALL': 'C', 'TZ': 'UTC'}
HEX = re.compile(r'[0-9a-f]{64}\Z')
POLL = 0.25
DESIGN = ROOT / 'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-creation-design-01/ARCHITECT-FIXED-RUNNER-CREATION-INTERFACE.md'
DESIGN_SHA = '20249f8f9df6b7eccf0ed752380785714f0c53a00636a997c2abf98be355d607'
CALLER04 = ROOT / 'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-caller-04/run_target_resolution_once.py'
CALLER04_SHA = 'cc5fb4925cd911700196aac6e0b2d5772e2e23266e09afbe283d19693e519c89'
ERRATUM = ROOT / 'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-creation-design-01/ARCHITECT-RUNNER-CREATION-CALLER04-BIRTH-ERRATUM.md'
ERRATUM_SHA = '7ade3a8d8e8f4189feb15e923d83efdd2fc9a09208b297123fa77ddee5a30aca'
AMBIGUOUS_ACK_ERRATUM = ROOT / 'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-creation-design-01/ARCHITECT-CREATION-AMBIGUOUS-ACK-OWNERSHIP-ERRATUM.md'
AMBIGUOUS_ACK_ERRATUM_SHA = 'fcc97ced200ee0665e6b95bc1d7f5f55dbe5676d0bfcdd28bc66d68465043182'
DIRECTORY_AMENDMENT = ROOT / 'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-creation-design-01/ARCHITECT-EXCLUSIVE-DIRECTORY-RUNNER-AMENDMENT.md'
DIRECTORY_AMENDMENT_SHA = '1e4c8eca5f083963dff40299be70938c59ce00373f3648102204691d5592dd0d'
DIRECTORY_INSPECTOR_REVIEW = ROOT / 'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-creation-design-01/inspector-directory-amendment-review-01/INSPECTOR-EXCLUSIVE-DIRECTORY-AMENDMENT-REVIEW.json'
DIRECTORY_INSPECTOR_REVIEW_SHA = 'a0b1ff62114b4930d533f1116b6b7cd708e430d20bee260177a39d1a66f08543'
PREDECESSOR_ARCHITECT_HELD = ROOT / 'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-creation-03/architect-source-review-01/ARCHITECT-CREATOR03-CALLER05-COMBINED-HELD-REVIEW.json'
PREDECESSOR_ARCHITECT_HELD_SHA = 'e944c096fb6bcba677a093d4e9dbdbfaa87d3aac6659d5bec93f56a3c889fcab'
PREDECESSOR_INSPECTOR_HELD = ROOT / 'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-creation-03/inspector-source-review-01/INSPECTOR-CREATOR03-CALLER05-EXACT-SOURCE-HELD-REVIEW.json'
PREDECESSOR_INSPECTOR_HELD_SHA = '2e85fb7f8618226eab4367b762fdea0768abb250881a692004bd793f43e1c33b'
PREDECESSOR_INSPECTOR_ACCEPTED = ROOT / 'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-creation-04/inspector-source-review-01/INSPECTOR-CREATOR04-CALLER06-DISABLED-SOURCE-REVIEW.json'
PREDECESSOR_INSPECTOR_ACCEPTED_SHA = 'b10b3f934c913de6bb7dedbb27846048816e8b47fc77e43c39144ef21e4fc596'
COUNT_WITNESS = ROOT / 'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-creation-04/architect-source-review-01/ARCHITECT-CREATOR04-PRE-MKDIR-COUNT-INERT-WITNESS.json'
COUNT_WITNESS_SHA = '37c92381afee04e5d2ff44c902b451eef0baeac66c0786054885f6eedbd77b0b'
CALLER04_ARCHITECT_REVIEW = ROOT / 'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-caller-04/architect-source-review-01/ARCHITECT-CALLER04-DISABLED-SOURCE-REVIEW.json'
CALLER04_ARCHITECT_REVIEW_SHA = '8eca2439aa4f6a21da6adf26bca9e1daf297037c8dc7ed51549c56f989c998cf'
INTERFACE_INSPECTOR_REVIEW = ROOT / 'scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-creation-design-01/inspector-interface-review-01/INSPECTOR-FIXED-RUNNER-CREATION-INTERFACE-REVIEW.json'
INTERFACE_INSPECTOR_REVIEW_SHA = 'd9c8857c40d7dde220d4f17efe5043b03efaa082d2aa136432804c7352e1574c'
IMAGE_PROOF = ROOT / 'scratch/r22-adoption-161/linux-postgis-preparation/ROOT-ACTUAL-DERIVED-RUNTIME-CUSTODY.json'
IMAGE_PROOF_SHA = 'fee756fed6b14494d0c57deed3ea4bf8b8aeffa1694d34816e43ce2fd3274de4'
IMAGE_IDENTITY = ROOT / 'scratch/r22-adoption-161/linux-postgis-preparation/ROOT-DERIVED-IMAGE-IDENTITY.json'
IMAGE_IDENTITY_SHA = '89ae0f2689496e50e2216e6a4da828ccd3b76ab05f5b2c1c4ef77b0c93855e6d'


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def demand(ok, code):
    if not ok:
        raise RuntimeError('INERT_RUNNER_CREATION_REFUSED:' + code)


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


def save(path, value):
    raw = value if isinstance(value, bytes) else (json.dumps(value, indent=2, sort_keys=True) + '\n').encode()
    with path.open('xb') as stream:
        stream.write(raw)
        stream.flush()
        os.fsync(stream.fileno())
    fsync_dir(path.parent)
    return {'path': str(path.relative_to(ROOT)), 'bytes': len(raw), 'sha256': 'sha256:' + sha(raw)}


def command(out, label, args, interrupted, *, timeout=60, cleanup=False):
    argv = [str(DOCKER), *args]
    save(out / (label + '.argv.json'), argv)
    save(out / (label + '.env.json'), HOST_ENV)
    started, mono = utc(), time.monotonic()
    stdout = stderr = b''
    status = {'exitCode': None, 'timedOut': False, 'interrupted': False,
              'spawnError': None, 'spawned': False}
    proc = None
    def partial(error):
        nonlocal stdout, stderr
        stdout = error.stdout or stdout
        stderr = error.stderr or stderr
    def reap():
        nonlocal stdout, stderr
        if proc is None:
            return
        try:
            if proc.poll() is None:
                proc.kill()
        except Exception as error:
            status['cleanupError'] = repr(error)
        try:
            stdout, stderr = proc.communicate(timeout=5)
            status['exitCode'] = proc.returncode
        except subprocess.TimeoutExpired as error:
            partial(error)
            status['cleanupError'] = 'process-still-running-after-kill'
        except Exception as error:
            status['cleanupError'] = repr(error)
    try:
        if interrupted['requested'] and not cleanup:
            status['interrupted'] = True
        else:
            proc = subprocess.Popen(argv, stdout=subprocess.PIPE,
                                    stderr=subprocess.PIPE, env=HOST_ENV)
            status['spawned'] = True
            deadline = mono + timeout
            while True:
                if interrupted['requested'] and not cleanup:
                    status['interrupted'] = True
                    break
                remaining = deadline - time.monotonic()
                if remaining <= 0:
                    status['timedOut'] = True
                    break
                try:
                    stdout, stderr = proc.communicate(timeout=min(POLL, remaining))
                    status['exitCode'] = proc.returncode
                    break
                except subprocess.TimeoutExpired as error:
                    partial(error)
            if status['interrupted'] or status['timedOut']:
                try:
                    proc.terminate()
                except ProcessLookupError:
                    pass
                try:
                    stdout, stderr = proc.communicate(timeout=5)
                except subprocess.TimeoutExpired as error:
                    partial(error)
                    proc.kill()
                    try:
                        stdout, stderr = proc.communicate(timeout=5)
                    except subprocess.TimeoutExpired as error2:
                        partial(error2)
                        status['cleanupError'] = 'process-still-running-after-kill'
                status['exitCode'] = proc.returncode
    except OSError as error:
        field = 'spawnError' if proc is None else 'commandError'
        status[field] = {'type': type(error).__name__, 'errno': error.errno, 'message': str(error)}
        reap()
    except Exception as error:
        status['unexpectedError'] = repr(error)
        reap()
    finally:
        status.update(startedUtc=started, endedUtc=utc(), elapsedSeconds=time.monotonic() - mono)
        save(out / (label + '.stdout.raw'), stdout)
        save(out / (label + '.stderr.raw'), stderr)
        save(out / (label + '.status.json'), status)
    return status, stdout, stderr


def clean(result, code):
    status, stdout, stderr = result
    demand(status['spawned'] is True and status['exitCode'] == 0 and
           not status['timedOut'] and not status['interrupted'] and
           status['spawnError'] is None and status.get('commandError') is None and
           status.get('unexpectedError') is None and status.get('cleanupError') is None and
           stderr == b'', code)
    return stdout


def ref_file(record):
    demand(type(record) is dict and set(record) == {'path', 'bytes', 'sha256'}, 'ref-shape')
    name = record['path']
    demand(type(name) is str and name.startswith('scratch/r22-adoption-161/public-installer-preparation/') and
           '..' not in name.split('/') and type(record['bytes']) is int and record['bytes'] > 0 and
           type(record['sha256']) is str and record['sha256'].startswith('sha256:') and
           HEX.fullmatch(record['sha256'][7:]), 'ref-values')
    path = ROOT / name
    demand(regular(path), 'ref-file')
    raw = path.read_bytes()
    demand(len(raw) == record['bytes'] and 'sha256:' + sha(raw) == record['sha256'], 'ref-drift')
    return raw


def validate_permit(value):
    keys = {'kind', 'status', 'issuer', 'holder', 'maxInvocations', 'consumedInvocations',
            'containerName', 'imageDataSource', 'imageId', 'platform', 'repoSource', 'nodeSource',
            'hostUid', 'hostGid',
            'sourceRefs', 'reviewRefs', 'allowedEffects'}
    demand(type(value) is dict and set(value) == keys, 'permit-keys')
    demand(value['kind'] == 'root-one-use-inert-target-resolver-runner-creation' and
           value['status'] == 'ISSUED' and value['issuer'] == '/root' and
           value['holder'] == '/root/engineer_portable_custody' and
           type(value['maxInvocations']) is int and value['maxInvocations'] == 1 and
           type(value['consumedInvocations']) is int and value['consumedInvocations'] == 0,
           'permit-authority')
    demand(value['containerName'] == CONTAINER and value['imageDataSource'] == str(IMAGE_DATA) and
           value['imageId'] == IMAGE and value['platform'] == 'linux/amd64' and
           value['repoSource'] == str(ROOT) and value['nodeSource'] == str(NODE),
           'permit-identities')
    demand(type(value['hostUid']) is int and value['hostUid'] == os.geteuid() and
           type(value['hostGid']) is int and value['hostGid'] == os.getegid(),
           'permit-host-identity')
    demand(value['sourceRefs'] == {'creatorSha256': 'sha256:' + sha(Path(__file__).read_bytes()),
           'dockerSha256': 'sha256:' + DOCKER_SHA, 'nodeSha256': 'sha256:' + NODE_SHA,
           'designSha256': 'sha256:' + DESIGN_SHA, 'caller04Sha256': 'sha256:' + CALLER04_SHA,
           'erratumSha256': 'sha256:' + ERRATUM_SHA,
           'ambiguousAckErratumSha256': 'sha256:' + AMBIGUOUS_ACK_ERRATUM_SHA,
           'directoryAmendmentSha256': 'sha256:' + DIRECTORY_AMENDMENT_SHA,
           'directoryInspectorReviewSha256': 'sha256:' + DIRECTORY_INSPECTOR_REVIEW_SHA,
           'predecessorArchitectHeldSha256': 'sha256:' + PREDECESSOR_ARCHITECT_HELD_SHA,
           'predecessorInspectorHeldSha256': 'sha256:' + PREDECESSOR_INSPECTOR_HELD_SHA,
           'predecessorInspectorAcceptedSha256': 'sha256:' + PREDECESSOR_INSPECTOR_ACCEPTED_SHA,
           'countWitnessSha256': 'sha256:' + COUNT_WITNESS_SHA,
           'caller04ArchitectReviewSha256': 'sha256:' + CALLER04_ARCHITECT_REVIEW_SHA,
           'interfaceInspectorReviewSha256': 'sha256:' + INTERFACE_INSPECTOR_REVIEW_SHA,
           'imageProofSha256': 'sha256:' + IMAGE_PROOF_SHA,
           'imageIdentitySha256': 'sha256:' + IMAGE_IDENTITY_SHA},
           'permit-source-refs')
    demand(type(value['reviewRefs']) is dict and set(value['reviewRefs']) == {'architect', 'inspector'},
           'permit-reviews')
    for item in value['reviewRefs'].values():
        ref_file(item)
    demand(value['allowedEffects'] == ['exclusive-directory-mkdir', 'container-create', 'container-start',
                                      'owned-container-stop-if-needed'], 'permit-effects')
    return value


def source_preflight(permit):
    demand(regular(Path(__file__)) and 'sha256:' + sha(Path(__file__).read_bytes()) ==
           permit['sourceRefs']['creatorSha256'], 'creator-bytes')
    for path, expected, code in ((DOCKER, DOCKER_SHA, 'docker-bytes'),
                                 (NODE, NODE_SHA, 'node-bytes'),
                                 (DESIGN, DESIGN_SHA, 'design-bytes'),
                                 (ERRATUM, ERRATUM_SHA, 'erratum-bytes'),
                                 (AMBIGUOUS_ACK_ERRATUM, AMBIGUOUS_ACK_ERRATUM_SHA,
                                  'ambiguous-ack-erratum-bytes'),
                                 (DIRECTORY_AMENDMENT, DIRECTORY_AMENDMENT_SHA,
                                  'directory-amendment-bytes'),
                                 (DIRECTORY_INSPECTOR_REVIEW, DIRECTORY_INSPECTOR_REVIEW_SHA,
                                  'directory-inspector-review-bytes'),
                                 (PREDECESSOR_ARCHITECT_HELD, PREDECESSOR_ARCHITECT_HELD_SHA,
                                  'predecessor-architect-review-bytes'),
                                 (PREDECESSOR_INSPECTOR_HELD, PREDECESSOR_INSPECTOR_HELD_SHA,
                                  'predecessor-inspector-review-bytes'),
                                 (PREDECESSOR_INSPECTOR_ACCEPTED, PREDECESSOR_INSPECTOR_ACCEPTED_SHA,
                                  'predecessor-inspector-accepted-bytes'),
                                 (COUNT_WITNESS, COUNT_WITNESS_SHA, 'count-witness-bytes'),
                                 (CALLER04, CALLER04_SHA, 'caller04-bytes'),
                                 (CALLER04_ARCHITECT_REVIEW, CALLER04_ARCHITECT_REVIEW_SHA,
                                  'caller04-review-bytes'),
                                 (INTERFACE_INSPECTOR_REVIEW, INTERFACE_INSPECTOR_REVIEW_SHA,
                                  'interface-inspector-review-bytes'),
                                 (IMAGE_PROOF, IMAGE_PROOF_SHA, 'image-proof-bytes'),
                                 (IMAGE_IDENTITY, IMAGE_IDENTITY_SHA, 'image-identity-bytes')):
        demand(regular(path) and sha(path.read_bytes()) == expected, code)
    for item in permit['reviewRefs'].values():
        ref_file(item)


def receipt_rehash(out, known):
    """Retain immutable raw command evidence across each later effect boundary."""
    current = {}
    for path in out.iterdir():
        demand(regular(path), 'receipt-file-type')
        raw = path.read_bytes()
        current[path.name] = {'bytes': len(raw), 'sha256': 'sha256:' + sha(raw)}
    demand(all(name in current and current[name] == record
               for name, record in known.items()), 'receipt-drift')
    known.update(current)
    return known


def image_shape(image):
    demand(type(image) is dict and image.get('Id') == IMAGE and
           image.get('Os') == 'linux' and image.get('Architecture') == 'amd64' and
           image.get('Config', {}).get('Volumes') == {'/var/lib/postgresql': {}}, 'image-shape')


def parent_identity():
    demand(IMAGE_DATA == ROOT / 'scratch/r22-adoption-161/public-installer-preparation/'
           'populated-history-target-linux-runner-creation-03/empty-image-pgdata',
           'directory-fixed-leaf')
    chain = []
    path = ROOT
    for part in (None, *IMAGE_DATA.parent.relative_to(ROOT).parts):
        if part is not None:
            path = path / part
        st = path.lstat()
        demand(stat.S_ISDIR(st.st_mode) and not stat.S_ISLNK(st.st_mode) and
               path.resolve() == path, 'redirected-parent')
        demand(type(st.st_dev) is int and st.st_dev > 0 and
               type(st.st_ino) is int and st.st_ino > 0 and
               type(st.st_uid) is int and st.st_uid >= 0 and
               type(st.st_gid) is int and st.st_gid >= 0, 'parent-stat-types')
        chain.append({'source': str(path), 'device': st.st_dev, 'inode': st.st_ino,
                      'ownerUid': st.st_uid, 'ownerGid': st.st_gid,
                      'mode': format(stat.S_IMODE(st.st_mode), '04o')})
    return chain


def leaf_absence(out):
    parent = parent_identity()
    save(out / 'directory-parent-before.json', parent)
    try:
        observed = IMAGE_DATA.lstat()  # catches dangling symlinks too
    except FileNotFoundError:
        save(out / 'directory-leaf-before.json', {'source': str(IMAGE_DATA), 'absent': True})
        return parent
    save(out / 'directory-leaf-before.json', {'source': str(IMAGE_DATA), 'absent': False,
         'mode': observed.st_mode, 'device': observed.st_dev, 'inode': observed.st_ino})
    demand(False, 'image-data-leaf-already-exists')


def directory_identity(out, label, expected=None, parent_expected=None):
    parent = parent_identity()
    if parent_expected is not None:
        demand(parent == parent_expected, 'directory-parent-drift:' + label)
    flags = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW
    before = IMAGE_DATA.lstat()
    demand(stat.S_ISDIR(before.st_mode) and not stat.S_ISLNK(before.st_mode),
           'directory-type:' + label)
    fd = os.open(IMAGE_DATA, flags)
    try:
        opened = os.fstat(fd)
        names = sorted(os.listdir(fd))
        real_path = IMAGE_DATA.resolve()
        identity = {'source': str(IMAGE_DATA), 'ownerUid': before.st_uid,
                    'ownerGid': before.st_gid, 'mode': format(stat.S_IMODE(before.st_mode), '04o'),
                    'device': before.st_dev, 'inode': before.st_ino, 'empty': names == [],
                    'mtimeNs': before.st_mtime_ns, 'ctimeNs': before.st_ctime_ns,
                    'listing': names}
        save(out / (label + '.json'), {'parent': parent, 'realPath': str(real_path),
             'lstat': identity,
             'fstat': {'device': opened.st_dev, 'inode': opened.st_ino,
                       'ownerUid': opened.st_uid, 'ownerGid': opened.st_gid,
                       'mode': format(stat.S_IMODE(opened.st_mode), '04o')}})
        demand((before.st_dev, before.st_ino, before.st_uid, before.st_gid,
                stat.S_IMODE(before.st_mode)) ==
               (opened.st_dev, opened.st_ino, opened.st_uid, opened.st_gid,
                stat.S_IMODE(opened.st_mode)), 'directory-lstat-fstat-drift:' + label)
        demand(real_path == IMAGE_DATA and type(before.st_dev) is int and before.st_dev > 0 and
               type(before.st_ino) is int and before.st_ino > 0 and
               type(before.st_uid) is int and before.st_uid >= 0 and
               type(before.st_gid) is int and before.st_gid >= 0,
               'directory-realpath-or-stat-types:' + label)
        demand(before.st_uid == os.geteuid() and before.st_gid == os.getegid() and
               identity['mode'] == '0700' and
               identity['empty'] is True, 'directory-owner-mode-empty:' + label)
        if expected is not None:
            for key in ('source', 'ownerUid', 'ownerGid', 'mode', 'device', 'inode', 'empty'):
                demand(identity[key] == expected[key], 'directory-identity-drift:' + label)
        os.fsync(fd)
        fsync_dir(IMAGE_DATA.parent)
        return identity
    finally:
        os.close(fd)


def expected_mounts(actual, repo_source, node_source):
    demand(type(actual) is list and len(actual) == 3, 'mount-count')
    by_target = {m.get('Destination'): m for m in actual}
    demand(len(by_target) == 3 and set(by_target) == {'/repo', '/usr/local/bin/node',
           '/var/lib/postgresql'}, 'mount-targets')
    for target, source in (('/repo', repo_source), ('/usr/local/bin/node', node_source),
                           ('/var/lib/postgresql', str(IMAGE_DATA))):
        mount = by_target[target]
        demand(mount.get('Type') == 'bind' and mount.get('RW') is False and
               mount.get('Source') in (source, '/host_mnt' + source), 'mount-bind:' + target)
    return {target: by_target[target]['Source'] for target in
            ('/repo', '/usr/local/bin/node', '/var/lib/postgresql')}


def container_shape(container, image, permit, *, running):
    demand(type(container) is dict and type(container.get('Id')) is str and
           HEX.fullmatch(container['Id']) and container.get('Name') == '/' + CONTAINER and
           container.get('Image') == IMAGE, 'container-identity')
    cfg, host = container['Config'], container['HostConfig']
    demand(cfg.get('Labels') == LABELS and cfg.get('User') == '999:999' and
           cfg.get('Entrypoint') == ['/bin/sleep'] and cfg.get('Cmd') == ['infinity'] and
           cfg.get('Env') == image['Config'].get('Env') and cfg.get('WorkingDir') in ('', '/'),
           'container-inert')
    demand(host.get('ReadonlyRootfs') is True and host.get('NetworkMode') == 'none' and
           host.get('Privileged') is False and host.get('CapDrop') == ['ALL'] and
           host.get('CapAdd') in (None, []) and host.get('SecurityOpt') == ['no-new-privileges'] and
           host.get('PortBindings') in (None, {}) and container.get('NetworkSettings', {}).get('Ports') in (None, {}),
           'container-isolation')
    demand(host.get('Binds') in (None, []) and host.get('Devices') in (None, []) and
           host.get('DeviceRequests') in (None, []) and
           host.get('DeviceCgroupRules') in (None, []) and
           host.get('GroupAdd') in (None, []) and
           host.get('ExtraHosts') in (None, []) and
           host.get('PidMode') == '' and host.get('IpcMode') == 'private' and
           host.get('UTSMode') == '' and host.get('UsernsMode') == '' and
           host.get('Tmpfs') in (None, {}) and host.get('VolumesFrom') in (None, []) and
           host.get('Links') in (None, []), 'container-no-foreign-namespace-or-device')
    requested = host.get('Mounts')
    demand(type(requested) is list and len(requested) == 3, 'requested-mount-count')
    by_target = {mount.get('Target'): mount for mount in requested}
    demand(len(by_target) == 3 and set(by_target) == {'/repo', '/usr/local/bin/node',
           '/var/lib/postgresql'}, 'requested-mount-targets')
    for target, source in (('/repo', permit['repoSource']),
                           ('/usr/local/bin/node', permit['nodeSource']),
                           ('/var/lib/postgresql', permit['imageDataSource'])):
        mount = by_target[target]
        demand(mount.get('Type') == 'bind' and mount.get('ReadOnly') is True and
               mount.get('Source') in (source, '/host_mnt' + source),
               'requested-bind:' + target)
    demand(container.get('State', {}).get('Running') is running, 'container-running-state')
    sources = expected_mounts(container.get('Mounts'), permit['repoSource'], permit['nodeSource'])
    return {'cid': container['Id'], 'mountSources': sources}


def create_args(permit):
    return ['create', '--name', CONTAINER, '--platform', 'linux/amd64', '--network', 'none',
            '--read-only', '--user', '999:999', '--cap-drop', 'ALL',
            '--security-opt', 'no-new-privileges', '--label', 'detran.owner=' + LABELS['detran.owner'],
            '--label', 'detran.gate=' + LABELS['detran.gate'],
            '--mount', 'type=bind,source=' + permit['repoSource'] + ',target=/repo,readonly',
            '--mount', 'type=bind,source=' + permit['nodeSource'] + ',target=/usr/local/bin/node,readonly',
            '--mount', 'type=bind,source=' + permit['imageDataSource'] + ',target=/var/lib/postgresql,readonly',
            '--entrypoint', '/bin/sleep', IMAGE, 'infinity']


def run_once(expected_permit_sha256):
    demand(type(expected_permit_sha256) is str and HEX.fullmatch(expected_permit_sha256), 'permit-sha')
    demand(regular(PERMIT), 'permit-file')
    raw_permit = PERMIT.read_bytes()
    demand(sha(raw_permit) == expected_permit_sha256, 'permit-bytes')
    permit = validate_permit(json.loads(raw_permit))
    demand(not OUT.exists(), 'one-use-output-exists')
    interrupted = {'requested': False, 'signal': None}
    previous = {s: signal.getsignal(s) for s in (signal.SIGINT, signal.SIGTERM)}
    def flag(signum, _frame):
        interrupted.update(requested=True, signal=signum)
    result = {'kind': 'inert-target-resolver-runner-creation', 'status': 'UNKNOWN_QUARANTINE',
              'permitSha256': expected_permit_sha256, 'directoryCreateAttempted': 0,
              'directoryCreatedAcknowledged': False,
              'containerCreateAttempted': 0, 'startAttempted': 0,
              'inspectorBirthClosure': 'PENDING_INDEPENDENT_READBACK'}
    owned_cid = None
    image = None
    parent_before = None
    image_data_identity = None
    receipts = {}
    try:
        for signum in previous:
            signal.signal(signum, flag)
        OUT.mkdir(mode=0o700)
        fsync_dir(OUT.parent)
        save(OUT / 'admitted-permit.raw', raw_permit)
        source_preflight(permit)
        image = json.loads(clean(command(OUT, 'image-inspect', ['image', 'inspect', IMAGE],
                                         interrupted), 'image-inspect'))[0]
        image_shape(image)
        source_preflight(permit)
        # Exact-name absence and the host leaf lstat are adjacent to consumption.
        container_list = clean(command(OUT, 'preflight-container-absence',
            ['container', 'ls', '--all', '--no-trunc', '--filter', 'name=^/' + CONTAINER + '$',
             '--format', '{{.ID}} {{.Names}}'], interrupted), 'container-absence')
        demand(container_list == b'', 'container-name-not-fresh')
        parent_before = leaf_absence(OUT)
        demand(not interrupted['requested'] and sha(PERMIT.read_bytes()) == expected_permit_sha256,
               'preconsume-drift-or-signal')
        save(OUT / 'CONSUMING.json', {'permitSha256': expected_permit_sha256,
                                     'utc': utc(), 'maxInvocations': 1})
        source_preflight(permit)
        demand(not interrupted['requested'] and sha(PERMIT.read_bytes()) == expected_permit_sha256,
               'preeffect-drift-or-signal')
        started_utc = utc()
        demand(not interrupted['requested'], 'interrupted-immediately-before-mkdir')
        result['directoryCreateAttempted'] = 1
        try:
            IMAGE_DATA.mkdir(mode=0o700, exist_ok=False)
            result['directoryCreatedAcknowledged'] = True
            fsync_dir(IMAGE_DATA.parent)
            save(OUT / 'directory-mkdir.json', {'path': str(IMAGE_DATA), 'mode': '0700',
                 'startedUtc': started_utc, 'endedUtc': utc(), 'acknowledged': True})
        except Exception as error:
            save(OUT / 'directory-mkdir.json', {'path': str(IMAGE_DATA), 'mode': '0700',
                 'startedUtc': started_utc, 'endedUtc': utc(), 'acknowledged': False,
                 'error': repr(error)})
            raise
        image_data_identity = directory_identity(OUT, 'directory-after-mkdir',
                                                 parent_expected=parent_before)
        result['imageDataParentChain'] = parent_before
        result['imageDataDirectory'] = {key: image_data_identity[key] for key in
            ('source', 'ownerUid', 'ownerGid', 'mode', 'device', 'inode', 'empty')}
        receipt_rehash(OUT, receipts)
        source_preflight(permit)
        demand(not interrupted['requested'], 'interrupted-before-container-create')
        directory_identity(OUT, 'directory-before-container-create', image_data_identity,
                           parent_before)
        result['containerCreateAttempted'] = 1
        created = clean(command(OUT, 'container-create', create_args(permit), interrupted,
                                timeout=180), 'container-create')
        demand(re.fullmatch(rb'[0-9a-f]{64}\n', created), 'container-create-output')
        # Inspect exact reserved name; never infer ownership from a name alone.
        actual = json.loads(clean(command(OUT, 'container-inspect',
            ['inspect', '--type', 'container', CONTAINER], interrupted), 'container-inspect'))[0]
        identity = container_shape(actual, image, permit, running=False)
        demand(identity['cid'] == created.decode().strip(), 'create-cid-drift')
        owned_cid = identity['cid']
        result.update(actualCid=owned_cid, mountSources=identity['mountSources'])
        receipt_rehash(OUT, receipts)
        source_preflight(permit)
        directory_identity(OUT, 'directory-before-container-start', image_data_identity,
                           parent_before)
        demand(not interrupted['requested'] and sha(PERMIT.read_bytes()) == expected_permit_sha256,
               'prestart-drift-or-signal')
        result['startAttempted'] = 1
        started = clean(command(OUT, 'container-start', ['start', owned_cid], interrupted,
                                timeout=90), 'container-start')
        demand(started == (owned_cid + '\n').encode() or started == (CONTAINER + '\n').encode(),
               'container-start-output')
        live = json.loads(clean(command(OUT, 'running-inspect', ['inspect', owned_cid], interrupted),
                                'running-inspect'))[0]
        demand(container_shape(live, image, permit, running=True)['cid'] == owned_cid,
               'running-cid-drift')
        directory_identity(OUT, 'directory-before-birth', image_data_identity, parent_before)
        demand(not interrupted['requested'], 'late-interruption')
        result['status'] = 'RUNNER_CREATED_PENDING_INSPECTOR_BIRTH_CLOSED'
    except Exception as error:
        result['error'] = repr(error)
        result['status'] = 'UNKNOWN_QUARANTINE'
    finally:
        if interrupted['requested']:
            result['signal'] = interrupted['signal']
            result['status'] = 'UNKNOWN_QUARANTINE'
        if result['directoryCreatedAcknowledged']:
            try:
                directory_identity(OUT, 'directory-closing', image_data_identity, parent_before)
            except Exception as error:
                result['directoryClosingError'] = repr(error)
                result['status'] = 'UNKNOWN_QUARANTINE'
        if result['containerCreateAttempted'] and owned_cid is None:
            try:
                observed = json.loads(clean(command(OUT, 'closing-name-inspect',
                    ['inspect', '--type', 'container', CONTAINER], interrupted,
                    cleanup=True), 'closing-name-inspect'))[0]
                running = observed.get('State', {}).get('Running')
                demand(type(running) is bool, 'closing-running-type')
                identity = container_shape(observed, image, permit, running=running)
                # Name/control readback is diagnostic only: a same-name race is
                # indistinguishable without the clean create stdout full CID.
                result['unprovenCidObservedAfterAmbiguity'] = identity['cid']
                result['sameNameRaceQuarantine'] = True
            except Exception as error:
                result['containerObservationError'] = repr(error)
                result['status'] = 'UNKNOWN_QUARANTINE'
        if owned_cid is not None and result['status'] == 'UNKNOWN_QUARANTINE':
            try:
                current = json.loads(clean(command(OUT, 'cleanup-inspect', ['inspect', owned_cid],
                    interrupted, cleanup=True), 'cleanup-inspect'))[0]
                current_running = current.get('State', {}).get('Running')
                demand(type(current_running) is bool, 'cleanup-running-type')
                demand(container_shape(current, image, permit, running=current_running)['cid'] ==
                       owned_cid, 'cleanup-cid-drift')
                if current_running:
                    stop = command(OUT, 'owned-stop', ['stop', '--time', '10', owned_cid], interrupted,
                                   timeout=45, cleanup=True)
                    clean(stop, 'owned-stop')
                    final = json.loads(clean(command(OUT, 'cleanup-final-inspect',
                        ['inspect', owned_cid], interrupted, cleanup=True), 'cleanup-final-inspect'))[0]
                    demand(container_shape(final, image, permit, running=False)['cid'] == owned_cid,
                           'cleanup-not-stopped')
                    result['ownedRunnerStopped'] = True
                else:
                    result['ownedRunnerAlreadyStopped'] = True
            except Exception as error:
                result['cleanupError'] = repr(error)
                result['status'] = 'UNKNOWN_QUARANTINE'
        try:
            receipt_rehash(OUT, receipts)
            result['retainedReceiptCount'] = len(receipts)
            source_preflight(permit)
            demand(sha(PERMIT.read_bytes()) == expected_permit_sha256, 'closing-permit-drift')
        except Exception as error:
            result['closingError'] = repr(error)
            result['status'] = 'UNKNOWN_QUARANTINE'
        if interrupted['requested']:
            result['signal'] = interrupted['signal']
            result['status'] = 'UNKNOWN_QUARANTINE'
        try:
            save(OUT / 'OUTCOME.json', result)
        finally:
            for signum, handler in previous.items():
                signal.signal(signum, handler)
    if interrupted['requested']:
        result['status'] = 'UNKNOWN_QUARANTINE'
        result['lateSignal'] = interrupted['signal']
        if owned_cid is not None and not result.get('ownedRunnerStopped') and not result.get('ownedRunnerAlreadyStopped'):
            result['ownedRunnerRunningUnresolvedQuarantine'] = owned_cid
        original = (OUT / 'OUTCOME.json').read_bytes()
        save(OUT / 'INTERRUPTION-AFTER-OUTCOME.json',
             {'status': 'UNKNOWN_QUARANTINE', 'originalOutcomeSha256': 'sha256:' + sha(original),
              'signal': interrupted['signal'], 'utc': utc(),
              'ownedRunnerRunningUnresolvedQuarantine':
                  result.get('ownedRunnerRunningUnresolvedQuarantine')})
    return result


if __name__ == '__main__':
    demand(False, 'SOURCE_ONLY_NO_ISSUED_CREATION_AUTHORITY')
