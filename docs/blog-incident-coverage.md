# Incident blog coverage

This matrix maps every issue extracted from the PitchIQ and Rung `CLAUDE.md`
incident logs to the bilingual blog article that documents its root cause,
failed approach, resolution, and regression strategy.

## PitchIQ

| Issue                         | Article slug                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| Vercel Active CPU             | `active-cpu-heavy-json-request-paths`                                                 |
| ISR writes                    | `isr-revalidation-write-amplification`                                                |
| Heavy request-time data       | `active-cpu-heavy-json-request-paths`                                                 |
| Static game routes            | `active-cpu-heavy-json-request-paths`, `game-rules-routing-payload-contracts`         |
| Middleware/scanner load       | `infrastructure-failures-impersonate-app-bugs`                                        |
| Translation catalog poisoning | `i18n-boundary-poisoning`                                                             |
| False i18n checks             | `i18n-boundary-poisoning`                                                             |
| Strict Mode fetch deadlock    | `react-football-engine-boundaries`                                                    |
| Server/client boundary leak   | `active-cpu-heavy-json-request-paths`, `infrastructure-failures-impersonate-app-bugs` |
| Nondeterministic games        | `deterministic-football-replay`                                                       |
| Mode registry/build failure   | `game-rules-routing-payload-contracts`                                                |
| Captain replay failure        | `game-rules-routing-payload-contracts`                                                |
| Static payload explosion      | `game-rules-routing-payload-contracts`                                                |
| Budget Cap dead opening       | `football-budget-draft-deadlocks`                                                     |
| Cross-era pricing             | `football-budget-draft-deadlocks`                                                     |
| Price compression             | `football-budget-draft-deadlocks`                                                     |
| Floating-point affordability  | `football-budget-draft-deadlocks`                                                     |
| Bench index crash             | `football-budget-draft-deadlocks`                                                     |
| Budget replacement dead end   | `football-budget-draft-deadlocks`                                                     |
| Misleading fixtures           | `football-budget-draft-deadlocks`, `visual-correctness-domain-rules`                  |
| Nationality fallback          | `game-rules-routing-payload-contracts`                                                |
| Shared route leakage          | `game-rules-routing-payload-contracts`                                                |
| Season query loss             | `share-code-untrusted-replay-protocol`                                                |
| Formation/share codec failure | `share-code-untrusted-replay-protocol`                                                |
| Wrong share destination       | `share-code-untrusted-replay-protocol`                                                |
| Duplicate match decisions     | `share-code-untrusted-replay-protocol`                                                |
| Seed lost between screens     | `share-code-untrusted-replay-protocol`                                                |
| Invalid encoded answers       | `share-code-untrusted-replay-protocol`                                                |
| Keeper dismissal              | `react-football-engine-boundaries`                                                    |
| Bench request lifecycle       | `react-football-engine-boundaries`                                                    |
| Reduced-motion match freeze   | `react-football-engine-boundaries`                                                    |
| VAR score mismatch            | `react-football-engine-boundaries`                                                    |
| Arabic pitch mirroring        | `i18n-boundary-poisoning`                                                             |
| Arabic names/digits           | `i18n-boundary-poisoning`                                                             |
| Share-card overlap            | `visual-correctness-domain-rules`                                                     |
| Photo fallback                | `visual-correctness-domain-rules`                                                     |
| Wrong-person photos           | `visual-correctness-domain-rules`                                                     |
| Empty keeper pools            | `react-football-engine-boundaries`                                                    |
| Engine calibration            | `visual-correctness-domain-rules`, `bounded-historical-football-ratings`              |
| Animation regressions         | `visual-correctness-domain-rules`                                                     |
| Test blind spots              | `visual-correctness-domain-rules`, `investigate-flaky-tests-dont-rerun`               |
| Deployment storage            | `translation-catalog-deployment-storage`                                              |

## Rung

| Issue                         | Article slug                                                                |
| ----------------------------- | --------------------------------------------------------------------------- |
| Presence impersonation        | `presence-is-not-identity`, `realtime-state-not-authorization`              |
| Binary realtime events        | `realtime-state-not-authorization`                                          |
| Stale offline snapshots       | `realtime-state-not-authorization`                                          |
| Persistence/navigation race   | `realtime-state-not-authorization`                                          |
| Recursive RLS                 | `row-level-security-data-model`                                             |
| Guest write escalation        | `row-level-security-data-model`                                             |
| Security-definer escalation   | `row-level-security-data-model`                                             |
| Workspace consistency         | `row-level-security-data-model`, `database-invariants-concurrency-deletion` |
| Position corruption           | `database-invariants-concurrency-deletion`                                  |
| INSERT RETURNING failure      | `row-level-security-data-model`                                             |
| Archive/trash failure         | `database-invariants-concurrency-deletion`                                  |
| Account deletion failure      | `database-invariants-concurrency-deletion`                                  |
| Status invariants             | `database-invariants-concurrency-deletion`                                  |
| Case-insensitive duplicates   | `row-level-security-data-model`                                             |
| Join-table mutation           | `row-level-security-data-model`                                             |
| Next.js version instability   | `shipping-on-next-16`, `app-router-navigation-state`                        |
| Theme contrast                | `accessibility-outside-component`                                           |
| Responsive UI defects         | `accessibility-outside-component`                                           |
| Stale reducer state           | `app-router-navigation-state`                                               |
| Not-found boundary            | `app-router-navigation-state`                                               |
| Parallel route interception   | `app-router-navigation-state`                                               |
| Optimistic clear bug          | `app-router-navigation-state`                                               |
| Silent RLS update/delete      | `row-level-security-data-model`                                             |
| Sticky composer layout        | `accessibility-outside-component`                                           |
| Invalid nested controls       | `accessibility-outside-component`                                           |
| Heading names                 | `accessibility-outside-component`                                           |
| Markdown backfill             | `rendering-not-content-migration`                                           |
| Markdown round trips          | `rendering-not-content-migration`, `rich-text-without-markdown-corruption`  |
| Redirect cookie loss          | `app-router-navigation-state`                                               |
| Sabotage harness corruption   | `green-check-test-never-ran`                                                |
| Flaky timing assertion        | `zero-point-six-percent-flake`, `green-check-test-never-ran`                |
| Shell false positives         | `green-check-test-never-ran`                                                |
| Development E2E hangs         | `green-check-test-never-ran`                                                |
| False database cleanup        | `green-check-test-never-ran`                                                |
| Touch drag failure            | `accessibility-outside-component`                                           |
| Wrong scroll target           | `accessibility-outside-component`                                           |
| Fake SSR proof                | `green-check-test-never-ran`                                                |
| Color feasibility             | `accessibility-outside-component`                                           |
| Docker/Kong false rate limit  | `infrastructure-failures-impersonate-app-bugs`                              |
| False production verification | `infrastructure-failures-impersonate-app-bugs`                              |
| Migration ambiguity           | `infrastructure-failures-impersonate-app-bugs`                              |
| Font build failure            | `infrastructure-failures-impersonate-app-bugs`                              |
| WSL false results             | `infrastructure-failures-impersonate-app-bugs`                              |
| Line-ending churn             | `infrastructure-failures-impersonate-app-bugs`                              |
| Shared .next corruption       | `infrastructure-failures-impersonate-app-bugs`                              |
| Unsafe process cleanup        | `infrastructure-failures-impersonate-app-bugs`                              |
| Node version selection        | `infrastructure-failures-impersonate-app-bugs`                              |
| PR false green                | `green-check-test-never-ran`                                                |
| CI result ambiguity           | `green-check-test-never-ran`                                                |
| Deployment/schema mismatch    | `infrastructure-failures-impersonate-app-bugs`                              |
