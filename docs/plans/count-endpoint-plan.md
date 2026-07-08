# Record Count Retrofitting — Implementation Plan

This plan covers replacing the mocked observation count with a real count fetched **directly from
Tinybird**, per `docs/requirements/count-endpoint.md`. It is the output of a design review; every
decision below was confirmed with the project owner.

## Guiding principles

- **Surgical & non-invasive.** Legacy app; touch as few lines as possible and follow existing
  conventions. The `setObservationCount()` call sites (9 components) and the download-summary
  template are already correct — nothing in the "responsive" plumbing changes.
- **Scope = Status & Intensity (`downloadType === 'raw'`) only.** The other three download types
  keep the mocked 50M base (and their existing ÷20 / ÷115 / magnitude derivations) untouched.
- **Build for the future.** Token handling and the pipe-count fetch live in a dedicated, generic
  `TinybirdService` so the other data types can later reuse it with a different pipe URL.

---

## Decision summary (from design review)

| # | Topic | Decision |
|---|-------|----------|
| 1 | Token endpoint | `https://services2-dev.usanpn.org/v1/data/token`, called **anonymously** (GET). URL lives in environment files as `TOKEN_URL`. |
| 2 | Presenting the JWT to Tinybird | `Authorization: Bearer <jwt>` header on the GET (not a `token=` query param). |
| 3 | Count response shape | Standard Tinybird pipe JSON; the count is `data[0].total_records` (UInt64). |
| 4 | `phenophase_short_names` param | Send the selected phenophases' **`phenophase_category`** values — mirrors what the download endpoint receives (`phenophaseCategories`), despite the param's name. |
| 5 | Param serialization | Comma-separated values for ID/code lists; `YYYY-MM-DD` dates (what `startDate`/`endDate` already hold); **omit** any param whose filter is unset (don't send empty strings). |
| 6 | Other download types | **Raw only.** Non-raw types keep the `of({ obsCount: 50000000 })` mock as their estimate base. |
| 7 | Token lifecycle | **Simple expiry check only**: cache token + `expires_at` in memory; before each count request, fetch a fresh token if missing or expiring (small safety buffer). No 401-retry, no in-flight-fetch sharing, no localStorage — a reload just fetches a new token. |
| 8 | Display | Keep the existing `roundEstimate()` K/M formatting unchanged. |
| 9 | Stale responses | Add a tiny request **sequence guard** in `setObservationCount()` so an out-of-order (stale) response can't overwrite a newer count. |
| 10 | Error state | On token or count failure, set `observationCount = 'N/a'` so the spinner resolves (template shows spinner while count is `-1`; `roundEstimate()` already passes `'N/a'` through). |
| 11 | Environments | Same values in `environment.ts`, `environment.prod.ts`, and `environment.ts.example` (consistent with the dev-everywhere lambda URLs). One pipe URL for all environments; the token determines the workspace/data. |
| 12 | Architecture | New `TinybirdService` (token lifecycle + generic pipe count fetch). `NpnPortalService.getObservationCount()` branches: raw → Tinybird, else existing mock. |

---

## Endpoints

| Purpose | URL | Method | Notes |
|---|---|---|---|
| Fetch JWT | `https://services2-dev.usanpn.org/v1/data/token` | `GET` | Anonymous. Returns `{ token: '<jwt>', expires_at: '2026-07-08T18:30:00Z' }`. Token lives ~1 hour. |
| Observation count | `https://api.us-west-2.aws.tinybird.co/v0/pipes/status_data_count.json` | `GET` | `Authorization: Bearer <jwt>`. Returns standard Tinybird JSON; count at `data[0].total_records`. |

No lambda/CloudWatch in this path — the browser talks to Tinybird directly.

### Count request parameters (filter → param mapping)

| Pipe param | Source in `NpnPortalService` |
|---|---|
| `start_date` | `startDate` (already `YYYY-MM-DD`) |
| `end_date` | `endDate` |
| `species_ids` | `getSelectedSpecies().map(s => s.species_id).join(',')` |
| `phenophase_short_names` | `getSelectedPhenophases().map(p => p.phenophase_category).join(',')` (decision #4) |
| `network_ids` | `getSelectedPartnerGroups().map(g => g.network_id).join(',')` |
| `dataset_ids` | `getSelectedDatasets().map(d => d.dataset_id).join(',')` |
| `states` | `getSelectedStates().map(s => s.state_code).join(',')` |
| `bottom_left_lat` | `extent.bottom_left_x1` |
| `bottom_left_lng` | `extent.bottom_left_y1` |
| `upper_right_lat` | `extent.upper_right_x2` |
| `upper_right_lng` | `extent.upper_right_y2` |

> ⚠️ **Extent naming is inverted in this codebase**: `index.html` writes `getSouthWest().lat()` into
> `ObservationBottomLeftX1` — so **`x1`/`x2` hold latitude and `y1`/`y2` hold longitude**. The
> mapping above is correct as written; do not "fix" it to x=lng.

Every param is **omitted** when its filter is unset/empty (decision #5).

---

## Workflow (target behavior)

On app load and on every filter change (existing `setObservationCount()` calls — no new wiring):

1. `observationCount = -1` → template shows the spinner (unchanged).
2. **Raw type:** `TinybirdService` checks its cached token; if missing or within the safety buffer
   of `expires_at`, it first GETs a fresh token from `TOKEN_URL`. It then GETs the count pipe with
   `Authorization: Bearer <jwt>` and the filter params, and emits `data[0].total_records`.
3. **Non-raw types:** the existing mock `of({ obsCount: 50000000 })` emits as today, and the
   existing ÷20 / ÷115 / magnitude derivations apply.
4. The response flows through the existing `roundEstimate()` → badge shows e.g. `1.2 M`.
5. A response is discarded if a newer `setObservationCount()` call has since fired (sequence guard).
6. On any error (token fetch or count fetch): `observationCount = 'N/a'` (+ existing console log).

---

## File-by-file changes

### 1. `src/environments/environment.ts`, `environment.prod.ts`, `environment.ts.example`

Add `TOKEN_URL` and populate the already-present `OBSERVATION_COUNT_URL` placeholder — same values
in all three files (decision #11):

```ts
TOKEN_URL: "https://services2-dev.usanpn.org/v1/data/token",
OBSERVATION_COUNT_URL: "https://api.us-west-2.aws.tinybird.co/v0/pipes/status_data_count.json",
```

### 2. `src/app/config.service.ts`

- Add `getTokenUrl()` → `environment.TOKEN_URL`.
- `getObservationCountUrl()` already exists and already reads `environment.OBSERVATION_COUNT_URL` —
  no change.

### 3. New: `src/app/tinybird.service.ts`

Small injectable following the existing service conventions (constructor-injected `HttpClient` +
`Config`; register in the app module's providers alongside the other services).

```ts
@Injectable()
export class TinybirdService {
  private token: string = null;
  private expiresAt: number = null;   // epoch ms parsed from expires_at

  // Generic: any pipe URL + params → count/first-row observable, so future
  // data types reuse this with their own pipe.
  getCount(pipeUrl: string, params: HttpParams): Observable<number>
}
```

Behavior of `getCount()` (decision #7 — expiry check only):

1. If `token` is null or `Date.now() > expiresAt - 60000` (60s buffer), GET `config.getTokenUrl()`,
   store `token` and parsed `expires_at`, then proceed. Plain sequential observable chain
   (`switchMap`) — no `shareReplay`, no retry logic.
2. GET `pipeUrl` with the provided `HttpParams` and header
   `Authorization: 'Bearer ' + this.token`.
3. `map` the response to `Number(response.data[0].total_records)`.
4. Errors propagate to the caller (which sets `'N/a'`).

### 4. `src/app/npn-portal.service.ts`

**`getObservationCount()`** — replace the mock-only body with a branch:

```ts
getObservationCount() {
  if (this.downloadType === 'raw') {
    return this._tinybirdService.getCount(
        this.config.getObservationCountUrl(), this.buildCountParams())
      .pipe(map((total: number) => ({ obsCount: total })));
  }
  return of({ obsCount: 50000000 }); // other types: mock until their retrofits land
}
```

**New private helper `buildCountParams(): HttpParams`** — builds the params per the mapping table
above, appending each param only when its filter has a value (dates non-null, arrays non-empty,
`extent.bottom_left_x1 !== null` for the four coords).

**`setObservationCount()`** — two surgical additions, existing estimate/rounding logic untouched:

- Sequence guard (decision #9): increment a `countRequestId` field at the top, capture it, and in
  both subscribe callbacks bail out if it no longer matches.
- Error handler (decision #10): in addition to the existing `errorMessage`/log lines, set
  `this.observationCount = 'N/a'`.

- Inject `TinybirdService` in the constructor.
- Note: `downloadType` is `null` on first load before a type is chosen — that falls into the
  non-raw branch (mock), which is the desired behavior.

### 5. Module registration

Add `TinybirdService` to the providers list where `NpnPortalService`/`Config` are registered
(`app.module.ts` or equivalent).

### 6. No changes

- The 9 `setObservationCount()` call sites, `download.html` badge/spinner markup,
  `roundEstimate()`, `getMagnitudeEstimate()`, and the download/polling flow all stay as-is.

---

## Out of scope / deferred (tracked follow-ups)

1. **Other download types' real counts** — when Individual/Site/Magnitude are retrofitted, point
   them at their own pipes via `TinybirdService.getCount()` and remove the mock.
2. **401-retry / in-flight token sharing** — explicitly declined for now (decision #7). If Tinybird
   auth failures show up in practice (e.g. clock skew making a "valid" token 401), revisit.
3. **Prod URLs** — all environments intentionally point at dev services (`services2-dev`) for now,
   matching the lambda endpoints; swap at launch.
4. **CORS verification** — the Bearer header triggers a preflight; Tinybird's API handles this by
   default, but confirm the NPN token endpoint (`services2-dev`) also returns CORS headers for the
   portal's origin.

---

## Implementation order (suggested)

1. Environment files + `Config.getTokenUrl()` — small, unblocks everything.
2. `TinybirdService` (token fetch/cache + `getCount`).
3. `NpnPortalService`: `buildCountParams()`, `getObservationCount()` branch, sequence guard,
   `'N/a'` error handling.
4. Module provider registration.
5. Manual verification (below).

## Verification

- Load the app, pick Status & Intensity → network tab shows one GET to `v1/data/token`, then a GET
  to the pipe with `Authorization: Bearer …`; badge shows a real (non-50.0 M) figure.
- Change each filter type (dates, species, phenophases, partner groups, datasets, states, extent)
  → count refreshes; request query string carries only the set filters, CSV-joined; extent params
  map lat↔x / lng↔y correctly.
- Change filters twice quickly → final badge reflects the latest filters (guard works).
- Wait past token expiry (or fake `expiresAt`) → next filter change fetches a new token first.
- Select a non-raw type → badge still shows the derived mock estimates (÷20 / ÷115 / magnitude).
- Kill the network / point `TOKEN_URL` at a bad host → badge resolves to `N/a`, no infinite spinner.
- `nvm use 14.21.3` before building (legacy webpack/OpenSSL constraint); confirm prod build passes.
