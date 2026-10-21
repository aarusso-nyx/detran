# PR #214 — review prompt formatting reconciliation

Run39633458947 failed at the unchanged full format:check gate on the newly
added C7 delivery-review prompt. The docs dependency installation had completed
and reported zero vulnerabilities; the full docs:security gate was not reached.
The original GitHub job and external raw failure capture remain preserved.

Two original literal path globs are now marked as inline code to prevent
Prettier interpreting their stars as Markdown emphasis. Other than these code
delimiters and whitespace, the literal input text is unchanged, mechanically
compared after removing the added delimiters. The failed intermediate formatting
probe was not accepted as byte equality.

The original reviewer input is preserved byte-exact in
original-delivery-review-prompt.md.gz; source-map.json binds its SHA-256 to the
unchanged bridge record and Git source object. The current Markdown is a later
presentation version; use the archived original or its recorded Git object to
verify the historical review-input hash. No bridge metadata or past verdict is
edited, and no review is rerun.

The C7 dependency repair and all gates remain unchanged. No product behavior,
threshold, closed round or prior proof changes. C6 remains blocked and is outside
this presentation correction.
