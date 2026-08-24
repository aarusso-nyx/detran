# senatran-mock

Ported by W0.2 from `../senatran` (keeps its D-0001 standalone exception).

Until that port lands this directory is intentionally empty. The incoming mock is the
national traffic-API mock (114 endpoints incl. RENAEST/SNE/CDT), self-contained: no
stynx deps, plain `pg`, its own `docker-compose`. It is wired as an in-repo CI service
(see the `senatran-mock` job placeholder in `.github/workflows/ci.yml` — TODO(W0.2)).
