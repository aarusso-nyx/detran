# DETRAN CI

Source: `.github/workflows/ci.yml`. Runs on every pull request, push to main and manual workflow dispatch, without path filters. Required gates verify evidence, foundation, SENATRAN mock and backend behavior. Dependency installation uses the frozen workspace lockfile and PACKAGES_READ_TOKEN. The attested RC route requires immutable evidence for the exact candidate tree and a successful trusted verifier check; missing or invalid claims do not count as a pass. Inspect the failed job and repair the candidate before retrying.
