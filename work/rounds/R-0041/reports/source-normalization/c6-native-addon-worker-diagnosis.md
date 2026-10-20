# C6 native-addon toolchain — read-only diagnosis

Observed Gov HEAD 73c0b877980ce0e4f20fdd624c2f223a447c0e98, DEVAI 2.6.3 still installed. No Gov/provider source, manifest, lock, state, Git or runtime control was modified. Independent packaged DEVAI 2.6.4 fixture identity is recorded separately below; adoption has not happened.

## Actual physical resolution and finite contract

Root Vitest4.1.11 resolves Vite7.3.6, which resolves Rollup4.62.5 and esbuild0.28.2. The complete dependency/optional/installed-peer walk visited147 physical package instances; manifest paths and native files are retained in /tmp/c6-native-addon-worker-physical.json.

Provider source packages/cli/src/native-input-provenance.ts admits:
- Rollup native addons: exactly4.64.5 (lines896–908); current4.62.5 is unsupported.
- SWC native addons: exactly1.16.2. None is installed in this Vitest closure.
- fsevents native addons:2.3.2 or2.3.3; installed2.3.3 is supported. Its operational native functions remain explicitly unsupported, not general watcher permission.
- esbuild service subprocess: argv --service=0.28.1 or --service=0.28.2 plus --ping, with traced protocol restrictions (lines1722–1743). Installed0.28.2 is supported.
- Native addon families outside SWC/Rollup/fsevents are refused regardless of version. This closure also contains optional lightningcss-darwin-arm64 1.33.0, @parcel/watcher-darwin-arm64 2.6.0, and @rolldown/binding-darwin-arm641.2.5 via existing installed peer instances. These are installed/hashed dependencies, not proof of actual loading. No version pin can legitimately grant their unsupported native family. The selected backend-only suites must establish actual consumption through native provenance; retain any resulting refusal.

## Minimal proposed adopter pin

Add only pnpm.overrides["vite@7.3.6>rollup"]="4.64.5". Vite7.3.6 declares rollup ^4.43.0, so this stays within the declared contract. The Rollup package pins its own platform addons to the same exact version, so no separate @rollup platform wildcard override is needed. Do not globally override Rollup, change Angular/Vite8, or broaden provider acceptance.

esbuild is already supported and fixed in the current frozen lock; no immediate esbuild repair is required. An optional explicit native-toolchain reproducibility pin, if desired, is pnpm.overrides["vite@7.3.6>esbuild"]="0.28.2". It matches Vite's ^0.27.0 || ^0.28.0 declaration. This extra pin is not evidence of an existing esbuild failure. Existing fsevents2.3.3 needs no change. Preserve C2's full manifest override set and verify all Angular physical resolutions plus full-repository audit after official pnpm regeneration/frozen installation.

An isolated actual npm-resolved graph (Vitest4.1.11, Vite7.3.6, nested Rollup4.64.5/esbuild0.28.2) returned0 vulnerabilities at all severities. Raw package manifest, lock, install and audit captures are /tmp/c6-native-addon-worker-audit/. This establishes the proposed small toolchain graph, not the whole Gov graph after a future edit.

## Authentic packaged fixture correlation

Inspector c2 reports the real packaged fixture /private/var/folders/5c/m4tbc9kj091cw8v71dnxtrt00000gn/T/devai-packaged-native-smoke-RuLK1i, candidate source bd1e3574. Its tarball SHA256 is c385f4d1074e56ec2682c7232f6cf46eb7f764a6cc110d6f17eaccd4750887e1. Manifest SHA256 independently read here:136e676c216162053834aed523f1ed5009a38584a86570cdbf56dc0552888c32.

Its initial Rollup4.64.10 run was legitimately refused native-addon-version. The fixture-only Vite-parent Rollup4.64.5 override then produced the real accepted positive and retained the consumed-alias negative. Correlated complete output hashes:
- positive-installed.stdout:d3bf5a6c70414dd3c34afe00392c23f9e549df46ed70f5a4cd7e3dad003eed3e
- positive-installed-v3.stdout:f7dc109d4c6e7659602e408401b7d75fc778e9b5ea56892d6831f6ee4e9ed7b7
- negative-consumed-alias-v3.stdout:51a85a42f8bafee2ee6c12130c9f9166df66244cfaa655e57d142a4665ceb187

The v2 fixture syntax mistakes are not provider defects. Provider source/finite contracts remain unchanged. No fake readings, result extraction or threshold relaxation is proposed.

Graft lookup first estimated41188tokens/$0.05 saved; critical finite versions and physical files were verified directly.
