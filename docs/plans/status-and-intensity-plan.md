# Status & Intensity Retrofitting — Implementation Plan

This plan covers retrofitting the **Status and Intensity** (`downloadType === 'raw'`) download to
talk to the new serverless/Tinybird stack asynchronously, per `docs/requirements.md`. It is the
output of a design review; every decision below was confirmed with the project owner.

## Guiding principles

- **Surgical & non-invasive.** This is a legacy app. Touch as few lines as possible, follow existing
  conventions, and avoid refactors that are out of scope. **One sanctioned exception:** the
  environment-detection branching in `Config` (`if (location.hostname.includes('dev')) …`) gets
  replaced wholesale with environment variables (Angular environment files). See decision #7 and the
  `config.service.ts` section.
- **POC scope = Status & Intensity only.** The other three download types (`summarized`,
  `siteLevelSummarized`, `magnitude`) are out of scope and must keep working as they do today.
- **Build for the future.** The other types will eventually be retrofitted the same way, but with
  different fields/groups. Structure the new code (especially the group config) so adding a per-type
  grouping later is a config change, not a rewrite.

---

## Decision summary (from design review)

| # | Topic | Decision |
|---|-------|----------|
| 1 | UI redesign scope | Build the grouped UI for **raw only** now; branch by `downloadType`. Leave the other types' existing 3-tab UI untouched. Architect the group config to be per-type extensible. |
| 2 | Group definitions source | **Static frontend config** (no backend/metadata changes). Open to revisit later. |
| 3 | Field labels & tooltips | **Keep the metadata endpoint**; map fields into groups by `machine_name`. Fall back to a hardcoded label/tooltip only for group members not present in metadata. |
| 4 | Request body | For raw, send the 8 `include_*` flags only and **drop** `additionalFields`/`additionalFieldsDisplay`. Other types keep the old payload. |
| 5 | Derived per-field behaviors (`qualityFlags`, ancillary-datasheet forcing) | **Out of scope / deferred.** Documented as follow-ups (see below). Must not crash. |
| 6 | Status endpoint URL | Provided: `https://mivgdumeczmbd3zm2mvrfwu2540vwsff.lambda-url.us-west-2.on.aws/` |
| 7 | Env configurability | All new URLs live in **Angular environment files** (`environment.ts` / `environment.prod.ts`), read via `Config`. **Amendment:** also migrate the *existing* hostname-branched URLs in `Config` to environment vars — the one sanctioned exception to the small-footprint rule (see below). |
| 8 | Poll termination | Cap at **15 min 35 s**, then timeout→error. Polling cadence slows over time (see schedule). |
| 9 | Observation count | Endpoint not built. **Full request scaffold** + commented real call, but return a mocked `Observable.of({ obsCount: 50000000 })` for now. |

---

## Endpoints

| Purpose | URL | Method | Notes |
|---|---|---|---|
| Create async data request | `https://5cpb3wyvskklwikuxndqilxsae0elgst.lambda-url.us-west-2.on.aws/` | `POST` | Returns **202** with `{ job_id }`. Same contract as old endpoint except Optional Fields → `include_*` flags. |
| Check async status | `https://mivgdumeczmbd3zm2mvrfwu2540vwsff.lambda-url.us-west-2.on.aws/` | `GET` | Query param `jobId`. Returns status `processing` \| `complete` \| `failed`. On `complete` also returns presigned `download_url`. |
| Observation count | _not built_ | — | Mock returns 50M. Scaffold only. |

All three URLs (plus any download/base URL) move into Angular environment files (decision #7).

---

## Workflow (target behavior)

1. **Count:** Whenever filters change (existing `setObservationCount()` calls remain), call
   `getObservationCount()` against the new (mocked) count endpoint and display the estimate — same UX
   as today.
2. **Download (raw):**
   1. `POST` the request to the create endpoint.
   2. On `202`, read `job_id` from the JSON body.
   3. Poll the status endpoint (`GET ?jobId=<job_id>`) on the schedule below.
   4. On `complete`, navigate the browser to the presigned `download_url` to download from S3.
   5. On `failed` (or transport error, or timeout) set `downloadStatus = 'error'`.

### Polling schedule (decision #8)

- First check at **t = 5s**.
- Then every **10s** through **t = 35s** → checks at 5s, 15s, 25s, 35s.
- After 35s, every **2 minutes** → checks at 2:35, 4:35, 6:35, 8:35, 10:35, 12:35, 14:35.
- **Give up at t = 15:35** → `downloadStatus = 'error'` (timeout).

Implementation note: drive this with a small helper that tracks elapsed time and computes the next
delay (`5000`, then `10000` until elapsed ≥ 35s, then `120000`), aborting once elapsed ≥ `935000` ms.
`processing` → schedule next check; `complete` → download + `complete`; `failed`/HTTP error → `error`.

---

## File-by-file changes

### 1. `src/environments/environment.ts` (gitignored), `environment.prod.ts` (tracked), `environment.ts.example` (tracked)

Add the new URL keys to all three (keep `production` flag). Example shape:

```ts
export const environment = {
  production: false,
  // new async stack
  CREATE_REQUEST_URL: "https://5cpb3wyvskklwikuxndqilxsae0elgst.lambda-url.us-west-2.on.aws/",
  STATUS_REQUEST_URL: "https://mivgdumeczmbd3zm2mvrfwu2540vwsff.lambda-url.us-west-2.on.aws/",
  OBSERVATION_COUNT_URL: "",  // TODO: not built yet; placeholder for the future count endpoint
  // migrated from Config hostname-branching (decision #7 amendment)
  POP_SERVER_URL: "https://data-dev.usanpn.org",     // dev value; prod file uses https://data.usanpn.org
  NPN_PORTAL_SERVER_URL: "https://services.usanpn.org"
};
```

`environment.prod.ts` gets the same keys with prod values (`POP_SERVER_URL` →
`https://data.usanpn.org`, lambda/count URLs as appropriate).

- `environment.prod.ts` currently only has `production: true` — it **must** gain the same keys or the
  prod build breaks once `Config` references them. Use prod URLs when available (placeholders for now).
- Remove the leftover `TB_TOKEN` (already removed from `.example`; the live `environment.ts` still
  contains a real token — scrub it).
- The old GCP Tinybird token in `environment.ts` should be deleted as part of this work.

### 2. `src/app/config.service.ts`

- Replace `getLambdaEndpoint()` body to return `environment.CREATE_REQUEST_URL`.
- Add `getStatusEndpoint()` → `environment.STATUS_REQUEST_URL`.
- Add `getObservationCountUrl()` → `environment.OBSERVATION_COUNT_URL`.
- Remove the now-dead `getTinybirdHost()` (already removed in working tree) and the
  `getCloudFrontURL()` localhost hack — the presigned `download_url` comes back from the status
  response, so no CloudFront base is needed for raw.
- Import `environment` (the file already lives under `src/environments`).

**Amendment (decision #7) — kill the hostname branching.** Replace the
`if (location.hostname.includes('dev')) …` logic with environment vars:

- `getPopServerUrl()` → `return environment.POP_SERVER_URL;` (this was the only method with a *real*
  dev/prod difference: `data-dev.usanpn.org` vs `data.usanpn.org`).
- `getNpnPortalServerUrl()` → `return environment.NPN_PORTAL_SERVER_URL;` (both branches were
  identical today — moving it to env removes the dead branch and makes it actually configurable).
- `getPopUrl()` → collapse to `return window.location.origin + "/observations";`. Both branches were
  already identical and this is **runtime-origin-derived, not environment config**, so it correctly
  stays origin-based — just drop the no-op `if/else` and the commented-out local hack.
- Delete the stale commented-out `location.hostname.includes('local')` blocks throughout.

Net effect: `Config` no longer inspects `location.hostname` at all; per-deployment values come
entirely from the environment files (the per-env build), which is the whole point of the amendment.

### 3. New static group config — `src/app/output-fields/optional-field-groups.ts` (new file)

A typed constant describing the 8 groups for raw, ordered per the requirements. Keep it keyed so a
future per-type map (`{ raw: [...], summarized: [...] }`) is a trivial extension.

```ts
export interface OptionalFieldGroup {
  flag: string;            // e.g. 'include_submission' — the request flag name
  label: string;           // human label shown on the group checkbox
  machineNames: string[];  // member field machine_names, in display order
}

// Members fall back to a hardcoded label/tooltip ONLY if absent from the metadata endpoint.
export const RAW_OPTIONAL_FIELD_GROUPS: OptionalFieldGroup[] = [ /* 8 groups */ ];
```

Group → member `machine_name` mapping (from `requirements.md`):

- `include_submission`: `observedby_person_id`, `submission_id`, `submittedby_person_id`,
  `submission_datetime`, `updatedby_person_id`, `update_datetime`
- `include_observation_detail`: `dataset_id`, `protocol_id`, `observation_time`,
  `observation_group_id`, `observation_comments`, `observed_status_conflict_flag`,
  `status_conflict_related_records`, `partner_group`
- `include_species_detail`: `species_functional_type`, `species_category`, `lifecycle_duration`,
  `growth_habit`, `usda_plants_symbol`, `itis_number`
- `include_site_detail`: `site_name`
- `include_individual_detail`: `plant_nickname`, `patch`
- `include_phenophase_detail`: `phenophase_category`, `phenophase_name`,
  `phenophase_definition_id`, `secondary_species_specific_definition_id`
- `include_climate`: all `dm.*` climate fields (`gdd`, `gddf`, `tmax`, … `daylength`)
- `include_remote_sensing`: all `dm.*` remote-sensing fields (`numcycles`, `greenup_0`, … `qa_overall_1`)

> **Note:** Several members (e.g. `site_name`, `plant_nickname`, `patch`, the `phenophase_*` set) may
> not exist in the current `getMetadataFields.json` response. During implementation, fetch the live
> raw metadata and reconcile. For any member missing from metadata, supply a hardcoded
> `{ label, tooltip }` in the static config (decision #3 fallback). Capture the reconciliation result
> in this doc or a code comment.

### 4. `src/app/output-fields/output-fields.service.ts`

- Keep loading raw metadata (`initRawFields`/`getRawFields`) — still the source of labels/tooltips.
- Add a way to resolve a group's display rows: for each `machineName`, look up the metadata field
  (label = `field_name`, tooltip = `field_description`); fall back to the static config entry.
- **Selection model (surgical):** a group checkbox toggles the `selected` flag of all its member
  fields in the existing `optionalFieldsRaw` / `optionalFields` arrays. A group is "checked" iff all
  its members are selected. This keeps `getSelectedOptionalFields()`, `filtersAreSet()`,
  `removeOptionalField()` (download-summary chips) and persistent-search restore working unchanged.
- Add a helper `getSelectedIncludeFlags()` (or compute in `download()`) that returns
  `{ include_submission: '1', ... }` for each group whose members are all selected (omit the rest).
- Leave `dataQualityChecksSelected()`, `togglePartnerGroup*`, and the non-raw init paths as-is.

### 5. `src/app/output-fields/output-fields.component.ts` + `output-fields.html`

- **Branch by `downloadType`:**
  - `raw` → new two-section view: **Optional** (grouped checkboxes) and **Default** (unchanged).
  - non-raw → existing 3-tab UI, untouched.
- Optional section for raw: render each group as one checkbox + label; under it, list member fields
  read-only with the existing tooltip markup (`data-toggle="tooltip" title="{{description}}"`).
  Individual fields are **not** independently selectable (decision: group is the unit).
- Toggling a group checkbox calls the service helper to set member `selected` flags.
- Keep the existing `submit()` → `setObservationCount()` behavior.
- Remove/condition the commented-out remote-sensing tab logic only within the raw branch; do not
  disturb the shared tab array used by other types.

### 6. `src/app/npn-portal.service.ts`

**`getObservationCount()` (decision #9 — full scaffold, mock return):**

```ts
getObservationCount() {
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  // const url = this.config.getObservationCountUrl();
  // const body = this.buildRequestPayload();  // same filter→param shape as download()
  // return this.http.post(url, body, httpOptions)
  //   .pipe(map((r: any) => ({ obsCount: r.total_records })));
  return of({ obsCount: 50000000 }); // mock until the count endpoint exists
}
```

- Restores an `Observable` return type so `setObservationCount().subscribe(...)` works again (the
  current working-tree POC returns a bare number and is broken).
- Import `of` from `rxjs`.

**`download()` (raw path):**

- Build the request body from filters as today, but for raw **replace** `additionalFields` /
  `additionalFieldsDisplay` with the 8 `include_*` flags (set `'1'` when the group is selected, omit
  otherwise). Non-raw keeps the old `additionalFields` payload.
- `POST` to `config.getLambdaEndpoint()`; on success read `res.job_id` (not `res.fileName`).
- Kick off the new polling loop with `job_id`.

**Replace `checkPopDownloadStatus()`** with a `job_id`-based status poller:

- `GET config.getStatusEndpoint() + '?jobId=' + jobId`.
- `complete` → `downloadStatus = 'complete'`; `window.location.assign(res.download_url)`.
- `processing` → schedule next poll per the schedule above.
- `failed` / HTTP error / timeout (≥ 15:35) → `downloadStatus = 'error'`.
- Remove the CloudFront HEAD logic.

### 7. Consumers (no change expected)

`download.component.ts` and `ancillary-data` modal display `downloadStatus`
(`downloading`/`complete`/`error`) — the new flow reuses these exact states, so the modals keep
working. Verify no other code reads `res.fileName` or `getCloudFrontURL()`.

---

## Out of scope / deferred (tracked follow-ups)

These were explicitly deferred (decision #5) and must be revisited before/with full production rollout:

1. **`qualityFlags` behavior.** Today `qualityFlags='ignored'` unless `observed_status_conflict_flag`
   is selected. That field now lives in `include_observation_detail`. With group-level selection the
   flag follows the group. Confirm the backend's expected semantics and whether this is acceptable.
2. **Ancillary datasheet forcing.** Site Visit / Observers datasheets force-include
   `observation_group_id` / `observedby_person_id`. With group selection these only get included if
   their owning group (`include_observation_detail` / `include_submission`) is selected. Revisit.
3. **Saved-search restore.** `persistent-search` restores optional fields by `metadata_field_id`. With
   group-as-unit selection, partial restores could leave a group "partially selected". Decide whether
   to round up to the whole group on restore.
4. **Other download types' retrofit** (`summarized`, `siteLevelSummarized`, `magnitude`) — future.
5. **Real observation-count endpoint** — build the lambda/Tinybird connection and uncomment the
   scaffolded call; set `OBSERVATION_COUNT_URL`.
6. **Per-member metadata reconciliation** — confirm which group members are missing from the metadata
   endpoint and finalize their hardcoded fallback labels/tooltips.

---

## Implementation order (suggested)

1. Environment files + `Config` (URLs, scrub token). — small, unblocks everything.
2. `getObservationCount()` scaffold + restore Observable. — fixes current breakage, verifiable.
3. Static group config file.
4. `output-fields.service` group/selection helpers.
5. `output-fields` component/template raw branch (UI).
6. `download()` + status poller rewrite.
7. Manual verification (see below).

## Verification

- Count: change filters on a raw search → estimate shows ~50.0 M.
- UI: raw output-fields shows Optional (8 group checkboxes with member fields + tooltips) and Default;
  other download types still show the original tabs.
- Download (raw): POST returns 202 + `job_id`; polling follows the 5s→10s→2m schedule; on `complete`
  the presigned URL downloads; `failed`/timeout shows the error modal.
- Confirm the prod build succeeds with `environment.prod.ts` populated.
