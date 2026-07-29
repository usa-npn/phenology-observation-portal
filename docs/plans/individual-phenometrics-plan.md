# Individual Phenometrics Retrofitting — Implementation Plan

This plan covers retrofitting the **Individual Phenometrics** (`downloadType === 'summarized'`) download
to the serverless/Tinybird stack, per `docs/requirements/individual-phenometrics.md`. It is the output
of a design review; every decision below was confirmed with the project owner.

It builds directly on `docs/plans/status-and-intensity-plan.md` and `docs/plans/count-endpoint-plan.md`,
and cashes in the extension point those plans left behind ("structure the group config so adding a
per-type grouping later is a config change, not a rewrite").

## Guiding principles

- **Surgical & non-invasive.** Legacy app; touch as few lines as possible and follow existing
  conventions.
- **Generalize, don't duplicate.** S&I's grouped Output Fields UI becomes a shared path keyed by
  `downloadType` rather than a second parallel implementation. The two un-retrofitted types
  (`siteLevelSummarized`, `magnitude`) keep working exactly as they do today.
- **Three of the five requirement sections are already satisfied.** Investigation showed the date
  controls, the `downloadType` request param, and the Site Visit ancillary exclusion all already do
  what the requirements describe. Those are documented as no-ops rather than re-implemented.

---

## Decision summary (from design review)

| # | Topic | Decision |
|---|-------|----------|
| 1 | Endpoint URL | **No change.** The requirements' `/v1/data/observations/export` is stale; all environments point at `/v1/data/observations/download` and S&I works against it. IPM reuses the same create + status URLs. |
| 2 | `downloadType` param | **Already ships.** `download()` sets `downloadType: this.getReportType()`, which already returns `'Individual Phenometrics'` for `summarized`. No work. |
| 3 | Group → flag contract | **Six groups** (below). `include_site_detail` and `include_phenophase_detail` are *not* used for IPM — their fields fold into `include_individual_detail`. No `include_remote_sensing` (IPM has no remote-sensing fields). |
| 4 | Observation Date | **No-op.** The existing `summarized` date form already submits start/end `YYYY-MM-DD` built from calendar-day + year. Year windowing stays server-side. |
| 5 | Ancillary — Site Visit | **Already excluded** by `AvailabilityPipe`. Add a defensive payload filter to close the saved-search carry-over hole. |
| 6 | Ancillary — Observers | ~~**Send it.** Remove the existing `!== 'Observers'` strip; backend support is a tracked follow-up.~~ **Superseded — see revision below. Observers is excluded from IPM entirely.** |
| 7 | Estimated records | Widen the Tinybird count branch to include `summarized`; keep the existing **÷20** factor. |
| 8 | `dataset_ids` in count | Align with `download()` — use `getSelectedDatasetIds()` so `-9999` expands to `-9999,3`. Still omitted entirely when nothing is selected. |
| 9 | Output Fields UI | **Generalize the raw path** by `downloadType` (keyed group map + threaded helpers). One shared template serves both grouped types. |
| 10 | `additionalFields` redundancy | **Leave as-is.** The raw payload still sends `additionalFields`/`additionalFieldsDisplay` alongside the flags, contrary to the S&I plan's decision #4. Documented as a follow-up, not fixed here. |
| 11 | Observers → `include_submission` | ~~**Force the whole group on** when the Observers datasheet is selected.~~ **Superseded — see revision below. Nothing forces the group for IPM.** |
| 12 | Download summary | **Nested group view**: selected groups at the top level with the `×` remove control, member fields listed read-only and indented beneath. Badge counts **groups**. Applies to S&I too. |
| 13 | Legacy saved searches | **Out of scope.** Pre-retrofit searches may restore partial groups; explicitly not supported. Searches saved from here on round-trip correctly with no new code. |
| 14 | Backend readiness | Ready enough. Send the flags and iterate server-side; a perfect first pass is not required. |

---

## Revision — Observers ancillary data removed from IPM (2026-07-29)

A requirements change after the original implementation: **Individual Phenometrics must not offer the
Observers ancillary datasheet at all**, the same way it already excludes Site Visit Details. This
reverses decisions #6 and #11 above.

Rationale for the new shape: the Observers file was only ever going to be produced once the backend
added support (follow-up #1 below), and the requirement now is that IPM has no Observers file. Rather
than sending a flag the server will not honor, the datasheet is hidden and stripped end to end. The
`observedby_person_id` field itself is unaffected — it remains an ordinary optional output field,
selectable through the **Submission Details** group on the Output Fields screen. Only the ancillary
*file* goes away.

| Aspect | Before | After |
|---|---|---|
| Datasheet checkbox visible for IPM | Yes | **No** (`AvailabilityPipe`) |
| `Observers` in `ancillary_data` payload | Sent | **Stripped** for `summarized` |
| `observedby_person_id` force-selected | Yes, when Observers ticked | **No** for `summarized` |
| `include_submission` forced on | Yes, when Observers ticked | **No** for `summarized` — group checkbox only |
| S&I / Site / Magnitude behavior | — | **Unchanged** (all three already hide Observers) |

### Files changed for this revision

**`src/app/ancillary-data/availability-pipe.ts`** — add the IPM exclusion alongside the three that
already exist:

```ts
&& !(datasheet.name === "Observers" && reportType === "Individual Phenometrics")
```

**`src/app/npn-portal.service.ts`** — widen the existing defensive `ancillary_data` filter to cover
both excluded datasheets:

```ts
.filter((name) => !(this.downloadType === 'summarized'
                    && (name === 'Site Visit Details' || name === 'Observers'))),
```

**`src/app/ancillary-data/ancillary-data.component.ts`** — `submit()` iterates the *unfiltered*
datasheet list, so a saved search carrying a ticked Observers would still force
`observedby_person_id` on and set `observers_datasheet_selected`. Guard that branch on the download
type. (The Site Visit branch above it is already inert for IPM — `observation_group_id` doesn't exist
in IPM metadata — so it needs no equivalent guard.)

**`src/app/output-fields/output-fields.service.ts`** — guard the decision-#11 forcing in
`getSelectedIncludeFlags()` with `downloadType !== 'summarized'`. Belt-and-braces given the component
guard above; kept rather than deleted so the S&I path's semantics stay explicit if Observers is ever
re-enabled for a grouped type.

No change to `SUMMARIZED_OPTIONAL_FIELD_GROUPS` — **Submission Details** stays in the group list.

### Verification delta

- IPM → Ancillary Data screen: **no Observers checkbox**; the remaining datasheets are unchanged.
- S&I, Site Phenometrics, Magnitude: Observers still hidden, as before.
- Submission Details on the IPM Output Fields screen ticks/unticks freely and sends
  `include_submission` only when the user selects it.
- A saved search created before this change with Observers ticked: the POST body's `ancillary_data`
  omits `Observers`, and `include_submission` is not forced on.

---

## Endpoints

**Unchanged from the S&I retrofit.** No environment or `Config` changes in this phase.

| Purpose | URL | Notes |
|---|---|---|
| Create async data request | `environment.CREATE_REQUEST_URL` | `POST`, returns 202 + `job_id`. Distinguished from S&I purely by the `downloadType` body value. |
| Check async status | `environment.STATUS_REQUEST_URL` | `GET .../{jobId}`, existing poller reused verbatim. |
| Observation count | `environment.OBSERVATION_COUNT_URL` | The same `status_data_count` Tinybird pipe S&I uses; IPM divides the result by 20. |

---

## Field inventory (verified against live metadata)

Fetched from `https://services.usanpn.org/npn_portal/metadata/getMetadataFields.json?type=individual_summarized`:

- **59 fields total** — 25 required (Default tab), 18 optional non-climate, 16 climate, **0 remote sensing**.
- Only `observed_status_conflict_flag` carries `quality_check`.
- **Every group member below exists in the metadata**, so unlike the raw config, the IPM groups need
  **no hardcoded label/tooltip fallbacks**.
- `observation_group_id` does **not** exist for IPM. The Site Visit Details → `observation_group_id`
  forcing in `ancillary-data.component.ts` is therefore already inert for this type.

---

## Group → field mapping (IPM)

| Flag | Label | Members |
|---|---|---|
| `include_submission` | Submission Details | `observedby_person_id` |
| `include_observation_detail` | Observation Detail | `dataset_id`, `partner_group`, `observed_status_conflict_flag` |
| `include_series_detail` | Series Detail | `numys_in_series`, `numdays_in_series`, `multiple_observers`, `multiple_firsty` |
| `include_species_detail` | Species Detail | `species_functional_type`, `species_category`, `lifecycle_duration`, `growth_habit`, `usda_plants_symbol`, `itis_number` |
| `include_individual_detail` | Individual Detail | `site_name`, `plant_nickname`, `patch`, `phenophase_category` |
| `include_climate` | Climate Data | `gdd`, `gddf`, `tmax_winter`, `tmax_spring`, `tmax_summer`, `tmax_fall`, `tmin_winter`, `tmin_spring`, `tmin_summer`, `tmin_fall`, `prcp_winter`, `prcp_spring`, `prcp_summer`, `prcp_fall`, `acc_prcp`, `daylength` (resolved via `fieldCategory: 'climate'`) |

All 18 optional + 16 climate fields are accounted for; none are orphaned. Flags are sent as `'1'` when
the group is fully selected and omitted otherwise — same convention as S&I.

> `include_series_detail` is a **new flag name coined here** for the four IPM-unique series fields.
> `include_individual_detail` carries a wider member set than it does for raw. Both are tracked
> follow-ups to reconcile server-side.

---

## Workflow (target behavior)

Identical in shape to S&I:

1. **Count:** on every filter change, `setObservationCount()` → `getObservationCount()` now fetches the
   real count from the Tinybird pipe for `summarized` as well as `raw`, then applies the existing ÷20.
2. **Download:** `POST` with `downloadType: 'Individual Phenometrics'` plus the selected `include_*`
   flags → 202 + `job_id` → existing `pollJobStatus()` schedule (5s, then 10s to 35s, then 2 min,
   abort at 15:35) → presigned `download_url`.

---

## File-by-file changes

### 1. `src/app/output-fields/optional-field-groups.ts`

- Keep the `OptionalFieldGroup` interface and `RAW_OPTIONAL_FIELD_GROUPS` unchanged.
- Add `SUMMARIZED_OPTIONAL_FIELD_GROUPS: OptionalFieldGroup[]` per the mapping table above. No
  `fallbacks` entries are needed — every member resolves from metadata.
- Add the per-type map and a shared predicate:

```ts
export const OPTIONAL_FIELD_GROUPS: { [downloadType: string]: OptionalFieldGroup[] } = {
    raw: RAW_OPTIONAL_FIELD_GROUPS,
    summarized: SUMMARIZED_OPTIONAL_FIELD_GROUPS
};

export function usesGroupedFields(downloadType: string): boolean {
    return !!OPTIONAL_FIELD_GROUPS[downloadType];
}
```

Adding `siteLevelSummarized` / `magnitude` later becomes a pure config addition.

### 2. `src/app/output-fields/output-fields.service.ts`

- Add a private resolver so the group helpers stop hardcoding the raw arrays:

```ts
private getFieldArrays(downloadType: string) {
    if (downloadType === 'summarized') {
        return { optional: this.optionalFieldsSummarized,
                 climate: this.climateFieldsSummarized,
                 remoteSensing: this.remoteSensingFieldsSummarized };
    }
    return { optional: this.optionalFieldsRaw,
             climate: this.climateFieldsRaw,
             remoteSensing: this.remoteSensingFieldsRaw };
}
```

- Thread `downloadType` through the existing helpers: `getGroupMembers`, `getGroupDisplayItems`,
  `isGroupSelected`, `toggleGroup`. Bodies are otherwise unchanged — they keep mutating the source
  arrays by reference, which is how `selected` flags already reach `getSelectedIncludeFlags()`.
- `getSelectedIncludeFlags(downloadType)` — iterate `OPTIONAL_FIELD_GROUPS[downloadType] || []`, and
  force `include_submission` on when the Observers datasheet is selected (decision #11):

```ts
if (this.observers_datasheet_selected) flags['include_submission'] = '1';
```

  (For IPM, `include_submission` has `observedby_person_id` as its only member, and the ancillary
  component already force-selects that field — so the group checkbox reflects the forcing in the UI
  too. This line guarantees the flag survives if the user later unticks the group.)
- **New** `getSelectedGroups(downloadType)` → groups where `isGroupSelected()` is true. Used by the
  two summary panels and the badge count.
- **New** `syncOptionalFields(downloadType)` — rebuild the flat `optionalFields` copy from the source
  arrays (the same concat the components' `submit()` methods do). Called after a group is removed from
  the download summary so `getSelectedOptionalFields()` doesn't go stale.
- **`reset()`** — add `site_visit_datasheet_selected = false;` and `observers_datasheet_selected = false;`.
  These are only recomputed in `ancillary-data.component.submit()`, so without this a stale
  `observers_datasheet_selected` would keep forcing `include_submission` after a filter reset.

### 3. `src/app/output-fields/output-fields.component.ts`

- Constructor tab branch: `usesGroupedFields(getDownloadType())` → the three-tab grouped layout
  (Optional Fields / Climate Data / Default Fields). Non-grouped types keep their existing branch.
- Expose `usesGroupedFields()` for the template.
- `getOptionalGroups()` / `getClimateGroups()` read `OPTIONAL_FIELD_GROUPS[this.getDownloadType()] || []`
  instead of `RAW_OPTIONAL_FIELD_GROUPS`.
- Pass `getDownloadType()` into the service helper calls (`isGroupSelected`, `onToggleGroup`,
  `getGroupDisplayItems`).
- `ngOnInit`'s existing `optionalFields`/`climateFields`/`remoteSensingFields`/`defaultFields`
  ternaries already resolve `summarized` correctly — no change.

### 4. `src/app/output-fields/output-fields.html`

- Swap the two container conditions: `*ngIf="getDownloadType() === 'raw'"` → `*ngIf="usesGroupedFields()"`,
  and `*ngIf="getDownloadType() !== 'raw'"` → `*ngIf="!usesGroupedFields()"`.
- No markup changes otherwise. IPM renders one `include_climate` group on the Climate tab; the
  existing `getClimateGroups()` filter handles the absence of remote sensing with no special-casing.

### 5. `src/app/npn-portal.service.ts`

**`getObservationCount()`** — widen the branch:

```ts
if (this.downloadType === 'raw' || this.downloadType === 'summarized') { /* Tinybird */ }
```

**`buildCountParams()`** — use `getSelectedDatasetIds()` (decision #8) so the count and the download
filter identically; keep omitting the param when nothing is selected.

**`download()`**:

- `const usesFlags = this.downloadType === 'raw' || this.downloadType === 'summarized';`
- `Object.assign(payload, this._outputFieldsService.getSelectedIncludeFlags(this.downloadType))`.
- Leave `additionalFields`/`additionalFieldsDisplay` in the base payload untouched (decision #10).
- `ancillary_data` — drop the `!== 'Observers'` filter (decision #6) and add the defensive Site Visit
  strip for IPM (decision #5). **Superseded by the 2026-07-29 revision**, which strips `Observers`
  for `summarized` too — see that section for the shipped form.

### 6. `src/app/download/download.component.ts`

- `usesGroupedFields()`, `getSelectedOptionalGroups()`, `getGroupDisplayItems(group)`,
  `getOutputFieldsCount()` (groups for grouped types, fields otherwise).
- **New** `removeOptionalGroup(group)`:

```ts
removeOptionalGroup(group) {
    const type = this._npnPortalService.downloadType;
    this._outputFieldsService.toggleGroup(group, false, type);
    this._outputFieldsService.syncOptionalFields(type);
    this._npnPortalService.setObservationCount();
}
```

  Deliberately a direct call rather than the `optionalFieldRemoved$` EventEmitter: the existing
  per-field removal only works because `output-fields.component`'s subscription outlives the destroyed
  component, and new behavior shouldn't depend on that.
- `saveSearch()` needs no change — it persists every member field id of every selected group, so
  searches saved from here on restore into complete groups.

### 7. `src/app/download/download.html`

- Line 58 (sidebar badge) and line 293 (accordion badge) → `getOutputFieldsCount()`.
- Lines 299-304 → branch the list body. Grouped types get the nested view; the legacy flat list stays
  for the other types:

```html
<ng-container *ngIf="usesGroupedFields()">
    <ng-container *ngFor="let group of getSelectedOptionalGroups()">
        <tr><td>
            <a (click)="removeOptionalGroup(group)"><span class="glyphicon glyphicon-remove"></span></a>
            <strong>{{group.label}}</strong>
        </td></tr>
        <tr *ngFor="let item of getGroupDisplayItems(group)">
            <td style="padding-left:30px;">
                <a class="outputfield" href="javascript:;" data-toggle="tooltip" title="{{item.tooltip}}">{{item.label}}</a>
            </td>
        </tr>
    </ng-container>
</ng-container>
```

  Member rows carry no interactive control — the group is the unit of removal.

### 8. `src/app/ancillary-data/ancillary-data.html`

The summary modal has a near-duplicate read-only Output Fields panel (lines 164-180). Give it the same
nested treatment and group-count badge. Both `_outputFieldsService` and `_npnPortalService` are already
public on the component, so the template can call
`_outputFieldsService.getSelectedGroups(_npnPortalService.downloadType)` directly.

### 9. No change

`date-range.*`, `config.service.ts`, all environment files, `tinybird.service.ts`, and the polling
logic.

> `ancillary-data.component.ts` and `availability-pipe.ts` were listed here originally, but the
> 2026-07-29 revision changes both.

---

## Out of scope / deferred (tracked follow-ups)

1. ~~**Observers ancillary file** — now sent to the server, but the backend hasn't added it yet. Needs
   server-side support before it produces a file. *(Owner will handle after this phase.)*~~
   **Closed by the 2026-07-29 revision** — Observers is excluded from IPM, so no backend work is
   needed for this type.
2. **`include_series_detail` / widened `include_individual_detail`** — flag names coined on the client;
   confirm or rename server-side.
3. **`additionalFields`/`additionalFieldsDisplay` still sent** alongside the `include_*` flags for both
   grouped types. The S&I plan's decision #4 said to drop them and the implementation never did.
   Deliberately left alone here.
4. **`qualityFlags` semantics** — still keys off `observed_status_conflict_flag`, which under group
   selection follows all of `include_observation_detail`. Carried forward from the S&I plan.
5. **Legacy saved searches** — pre-retrofit searches store arbitrary per-field subsets and can restore
   a partial group, silently dropping its flag. Explicitly out of scope.
6. **Site Visit Details → `observation_group_id` forcing** — inert for IPM (the field doesn't exist in
   IPM metadata) and the datasheet is hidden anyway. Left in place for S&I.
7. **Remaining download types** (`siteLevelSummarized`, `magnitude`) — future phases; both are now a
   config addition to `OPTIONAL_FIELD_GROUPS` plus their own count divisor.

---

## Implementation order (suggested)

1. `optional-field-groups.ts` — IPM groups + per-type map + `usesGroupedFields()`. Pure addition.
2. `output-fields.service.ts` — thread `downloadType`, add `getSelectedGroups`/`syncOptionalFields`,
   Observers forcing, `reset()` fix.
3. `output-fields.component.ts` + `.html` — swap to the `usesGroupedFields()` predicate.
4. `npn-portal.service.ts` — count branch, `getSelectedDatasetIds()`, flags in `download()`,
   `ancillary_data` filter changes.
5. `download.component.ts` + `download.html` — nested summary, group badge, group removal.
6. `ancillary-data.html` — nested read-only summary.
7. Manual verification (below).

## Verification

- `nvm use 14.21.3` before building (legacy webpack/OpenSSL constraint).
- **Output Fields (IPM):** six group checkboxes across the Optional and Climate tabs, each listing its
  members with tooltips; Default tab shows the 25 required fields. No fallback labels should appear —
  every member resolves from metadata.
- **S&I regression:** the raw Output Fields screen renders its original eight groups unchanged.
- **Other types:** `siteLevelSummarized` and `magnitude` still show the legacy per-field checkbox tabs.
- **Count:** pick IPM, change filters → badge shows a real figure at roughly 1/20th of the S&I count for
  the same filters; network tab shows the token fetch then the pipe request. Selecting the Nature's
  Notebook dataset sends `dataset_ids=-9999,3`.
- **Summary:** selected groups appear as removable top-level rows with indented, non-interactive member
  fields; the badge equals the number of groups; `×` removes the whole group and the count refreshes.
- **Download:** POST body carries `downloadType: "Individual Phenometrics"` plus only the selected
  `include_*` flags; 202 → `job_id` → poll → presigned URL. Backend-side flag handling may need
  iteration; that's expected.
- ~~**Observers:** ticking it checks Submission Details in the grouped UI and sends `include_submission`
  plus `Observers` in `ancillary_data`. Resetting filters clears the forcing.~~ Replaced by the
  revision's verification delta above — Observers is not offered for IPM at all.
