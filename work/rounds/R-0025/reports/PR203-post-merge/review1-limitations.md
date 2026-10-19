# First review provenance and finding dispositions

The first bridge input was formatted while its read-only CLI was active: one
blank line was added before a list (2173→2174 bytes). The consumed original is
preserved verbatim in review1-consumed-prompt.md. The bridge hashes the prompt
path at completion, so review1 is advisory and not treated as final exact-input
provenance. A second immutable-prompt review on the final committed packet is
required before PR preparation is considered complete. Original bridge outputs
remain unmodified.

Findings on task-state custody, claim-context/read decorator tuples, legacy GET
qualification409, fixture-only WORKLIST harness disposition, CTG2 fixture ownership,
merge-column entries and CLI/harness attribution were addressed in the packet/
report. ci-repairs.json now independently proves the four corrective commits
change only four test specs.

The campaign Section2/PC-tranche finding is unsupported by the inspected current
C-0003 file: it contains no PR203-candidate/merge-next instruction or PC tranche.
Its only PR203 mentions are the current merged banner. `rg -n '203|S1'
work/campaigns/*.md` and the committed file were checked; no invented section was
edited. The final reviewer is asked to verify that disposition against actual
source. Historical campaign tables remain explicitly historical.
