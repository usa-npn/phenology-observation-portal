# Handoff — Saved search cutover to `/v1/saved_search`

Written 2026-08-12 from the POP client side. Companion to
`docs/handoffs/tinybird-serverless-handoff.md`.

POP no longer calls `pop-services` for saved searches. Save and retrieve now go to the new API:

| | Was | Now |
|---|---|---|
| Save | `POST {pop-services}/search` | `POST /v1/saved_search` |
| Retrieve | `GET {pop-services}/search?searchId=<hash>` | `GET /v1/saved_search/{hash}` |

The request envelope (`{"searchJson": {...}}`) and the save response key (`saved_search_hash`)
are unchanged, so this was a URL change plus error handling. Configured via `SAVED_SEARCH_URL`
in `src/environments/environment*.ts`, read through `Config.getSavedSearchUrl()`.

Because both services front the same database table, **existing shared `?search=<hash>` links
still resolve**, including searches written by the visualization tool — which POP reads for
`stations` and `searchSource`. No data migration was needed and the viz tool's writer was not
touched.

The FGDC metadata link (`metadata.component.ts`) was the only remaining `pop-services` consumer
after this change, and it has since been cut over too: the link now fetches
`raw.githubusercontent.com/usa-npn/metadata/master/USA-NPN_Phenology_observation_data.xml`
directly, which is all `pop-services/fgdc` ever forwarded. **POP no longer calls `pop-services`
at all**, and `Config.getPopServerUrl()` / `Config.getPopFgdcEndpoint()` are gone.
(`Config.getPopUrl()` remains — that is POP's own front-end URL, used to build shareable
`?search=` links, not a service endpoint.)

---

## 1. Pre-cutover saved searches no longer restore output-field selections

**This is deliberate.** It is the one behavior change users could notice.

Old saved searches store `optionalFields` — an arbitrary list of `metadata_field_id` values from
`getMetadataFields.json`. Since the S&I / IPM / Site-Level retrofits, POP no longer selects
individual fields: the UI selects **groups**, and the download payload sends `include_*` flags.
So POP now persists `optionalFieldGroups` (a list of flag names) and restores from that.

For a pre-cutover search:

- everything else restores normally — dates, states, species, phenophases, partner groups,
  integrated datasets, ancillary datasheets;
- the Output Fields screen comes back with nothing ticked, and the user re-picks their groups.

Mapping arbitrary historical field subsets onto the new groups was judged not worth the effort —
a partial subset has no correct group answer anyway (`getSelectedIncludeFlags()` only emits a
flag when *every* member of a group is selected, so a partial restore would silently drop the
flag and the fields with it). Searches saved from this build forward round-trip exactly.

The legacy `optionalFields` key is **still written** on save, for any other reader of the shared
table. POP ignores it on restore.

## 2. Two bugs fixed along the way, both predating this work

Recorded because they explain why "saved searches work" was only ever half true.

**Retrieve could hang the app.** The legacy endpoint answered a stale or malformed hash with
`200` and an empty body. The client dereferenced the null response, threw inside the subscribe
handler, and never ran `initializeData()` — leaving the user on the loading bar forever. The new
API returns `400` (hash isn't a 32-char hex md5) and `404` (no such search), which route to an
error handler; POP now logs and falls through to a normal empty session on every failure path.

**Output-field selections never restored at all**, on any search, old or new — two independent
causes:

1. `init*Fields()`, which consumes the restored selections, wasn't called on the restore path.
   It was commented out of `AppComponent.initializeData()` in commit `69036ef` (March 2020), and
   `get-started`'s `setDownloadType()` early-returns when the clicked type already equals the
   restored one. `AppComponent` now loads metadata for the restored type only — a cold start is
   unchanged and still issues one request when the user picks a type, not four.
2. `PersistentSearchService` was provided in **both** `AppModule.providers` and
   `AppComponent.providers`, producing two instances. Component-provided services
   (`LocationsService`, `SpeciesService`, …) shared `AppComponent`'s instance — which is why
   those filters restored — but `OutputFieldsService` is module-provided and injected the
   *module* instance, so it never saw what `AppComponent` wrote. The duplicate component-level
   provider has been removed.

Also fixed: ancillary datasheet selections now set `site_visit_datasheet_selected` /
`observers_datasheet_selected` at restore time. Previously only `AncillaryDataComponent.submit()`
set them, so a restored Observers datasheet didn't force `include_submission` on a Status and
Intensity download unless the user happened to open the Ancillary Data page first.

## 3. For your side — one thing to be aware of

Per the OpenAPI description, saved searches are **content-addressed by the md5 of their JSON, and
the hash is key-order sensitive**. Two consequences for POP:

- Adding `optionalFieldGroups` to the payload changes the hash of new saves. Existing records are
  untouched; nothing needs to be backfilled.
- Reordering keys in the client's payload object literal would silently change hashes for
  otherwise-identical searches. Worth knowing if anyone ever deduplicates or reports on that
  table.

No confirmation needed on any of the above unless item 1 conflicts with something you've told
users about saved-search longevity.
