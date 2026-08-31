# PEC specification-debt register

This register records origin PEC behavior that has no dedicated approved use case. Porting a
mechanism here preserves observable behavior without silently promoting its legacy implementation
into product authority. Domain-specific effects remain fail-closed until an approved rule or use
case defines them.

| Origin module             | Port decision               | Preserved behavior                                                                                                                                               | Explicit boundary                                                                                                                                                                           |
| ------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `process-blocks-workflow` | Port as `ch/process-blocks` | Tenant-scoped, encounter-linked active block; idempotent source/kind registration; actor-attributed resolution; active blocks can gate other approved workflows. | The module does not decide which business event creates a block, what a new block kind means, or whether it may be resolved. Those decisions remain with the originating approved workflow. |
