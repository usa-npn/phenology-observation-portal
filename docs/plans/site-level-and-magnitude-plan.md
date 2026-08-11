# Site Level & Magnitude Phenometrics Retrofitting — Implementation Plan

This plan covers retrofitting the final two download types — **Site Level Data**
(`downloadType === 'siteLevelSummarized'`) and **Magnitude Data** (`downloadType === 'magnitude'`) —
to the serverless/Tinybird stack, per `docs/requirements/additional-phenometrics.md`. It is the output
of a design review; every decision below was confirmed with the project owner.

It builds on `docs/plans/status-and-intensity-plan.md` and `docs/plans/individual-phenometrics-plan.md`,
and cashes in the extension point IPM left behind: *"Adding `siteLevelSummarized` / `magnitude` later
becomes a pure config addition."* That held up — the group config, the download summary, and the
ancillary summary all generalize for free. What did **not** hold up is the plumbing underneath, which
had two-arm branches that silently fall through to the wrong download type's data.

Companion document: **`docs/handoffs/tinybird-serverless-handoff.md`** — items this phase surfaced that
belong to the Tinybird / serverless / metadata-API side.

## Guiding principles

- **Surgical & non-invasive.** Legacy app; touch as few lines as possible and follow existing
  conventions.
- **Generalize, don't duplicate.** Where a rule already exists in two places, this phase collapses it
  to one rather than adding a third copy.
- **Most of the requirements are already satisfied.** Both Ancillary Data sections and both Date
  Selection sections are already-shipped behavior. They are documented as verified no-ops rather than
  re-implemented. The real work is the group config, the endpoint swap, the count, and three latent
  plumbing defects.

---

## Decision summary (from design review)

| # | Topic | Decision |
|---|-------|----------|
| 1 | Endpoint URL | **Swap `CREATE_REQUEST_URL` to `/v1/data/package` in both environment files.** All four types cut over at once — that is the point of a single endpoint. Status and token URLs unchanged. No user impact: none of this has shipped to a functioning production environment. |
| 2 | `taxon` / `phenophase_grain` | **Assume server defaults; send neither; build no UI.** POP has no concept of grain. This is the serverless middleware's problem to solve, not this front end's. Recorded in the handoff doc. |
| 3 | Missing 13 contract fields | **Omit `include_taxonomic_detail` entirely; omit `pheno_class_*` from the phenophase group.** These are primarily submitted and consumed in a second front-end tool, and are not explicitly necessary here per the requirements. Consistent with raw and IPM, which also omit them. |
| 4 | MD `start_date_doy` / `end_date_doy` | **Group them under `include_observation_detail`** and keep them optional as far as this UI is concerned. Tinybird needs to fold them into that flag — handoff item. |
| 5 | Estimated records | **Real Tinybird count for all four types.** Delete the `of({obsCount: 50000000})` mock. Keep the existing `÷115` (SLD) and `getMagnitudeEstimate()` (MD) divisors. |
| 6 | Group → flag contract | **7 groups for SLD, 4 for MD.** Zero orphans, zero fallbacks. `include_dispersion` is labeled **"Dispersion Measures"**. |
| 7 | Plumbing defects | **Fix all three** — `getFieldArrays()`, the unconditional Climate tab, and the `ngOnInit` magnitude→site-level fall-through (a pre-existing cross-type data leak). |
| 8 | Ancillary availability | **Extract one shared `isDatasheetAvailable(name, reportType)`**, used by both `AvailabilityPipe` and the `ancillary_data` payload filter. Deletes the drifted `summarized`-only hardcode. Tighten the `include_submission` forcing to `raw` only. |
| 9 | Date selection | **Both sections are verified no-ops.** Separately, fix the `toISOString()` timezone bug at all four call sites. The `frequency` param contract goes to the handoff doc. |
| 10 | Partner-group forcing & `qualityFlags` | **Leave semantics as-is, documented as carried-forward follow-ups.** Refactor `togglePartnerGroupOptionalField()` onto `getFieldArrays()`, collapsing its four-way branch. |
| 11 | Tests | **None.** Manual verification only, consistent with both prior phases. This project has one spec file and it lives in `src/app/old/`. |
| 12 | Verification scope | **All four download types.** Four shared touchpoints move, so S&I and IPM need regression checks even though they aren't the feature. |
| 13 | Legacy saved searches | **Out of scope**, matching the IPM plan. Pre-retrofit searches may restore partial groups. |

---

## Endpoints

**One change, affecting all four download types.**

| Purpose | Before | After |
|---|---|---|
| Create async data request | `https://services2-dev.usanpn.org/v1/data/observations/download` | **`https://services2-dev.usanpn.org/v1/data/package`** |
| Check async status | `https://services2-dev.usanpn.org/v1/data/job/status/` | unchanged |
| Auth token | `https://services2-dev.usanpn.org/v1/data/token` | unchanged |
| Observation count | `https://api.us-west-2.aws.tinybird.co/v0/pipes/status_data_count.json` | unchanged |

Applied identically to `src/environments/environment.ts` and `src/environments/environment.prod.ts`.

Data type is selected by the existing `downloadType` body param, which `getReportType()`
(`npn-portal.service.ts:96-108`) already returns correctly for all four types:

| `downloadType` | `getReportType()` → body value |
|---|---|
| `raw` | `Status and Intensity` |
| `summarized` | `Individual Phenometrics` |
| `siteLevelSummarized` | `Site Phenometrics` |
| `magnitude` | `Magnitude Phenometrics` |

**No work needed** for the `downloadType` param itself — it already ships correctly.

> **Noted, not fixed:** `environment.prod.ts` is byte-identical to `environment.ts` and points at
> **services2-dev**. Production builds therefore hit the dev host. Out of scope for this phase.

---

## Field inventory (verified against live metadata)

Fetched from `getMetadataFields.json` for both types. **Staging and production return identical field
sets** (`services.usanpn.org` vs `services-staging.usanpn.org`, all four types diffed — zero
differences), so the mapping below is host-independent.

| Type | `?type=` | Total | Required | Optional | Climate | Remote sensing |
|---|---|:-:|:-:|:-:|:-:|:-:|
| Site Level | `site_summarized` | 69 | 26 | 23 | 20 | 0 |
| Magnitude | `magnitude` | 46 | 32 | 14 | 0 | 0 |

**Every optional field maps into exactly one group — 43/43 for SLD, 14/14 for MD.** No orphans, and
unlike the raw config, **no `fallbacks` entries are needed anywhere**.

### Fields in the contract that POP cannot offer

`include-flags.md` lists two column groups absent from POP's metadata on **every** type (verified:
`raw`, `individual_summarized`, `site_summarized`, `magnitude` all return zero matches):

- the 11 higher-taxonomy columns (`class_id`, `order_name`, `family_common_name`, `genus_id`, …)
- `pheno_class_id` / `pheno_class_name`

Neither `RAW_OPTIONAL_FIELD_GROUPS` nor `SUMMARIZED_OPTIONAL_FIELD_GROUPS` exposes them, so SLD and MD
follow suit (decision #3). Consequence: `include_taxonomic_detail` is never sent by POP for any type,
and `include_phenophase_detail` carries only `phenophase_category` on the two new types.

---

## Group → field mapping

### Site Level (`siteLevelSummarized`) — 7 groups

| Flag | Label | n | Members |
|---|---|:-:|---|
| `include_observation_detail` | Observation Detail | 3 | `partner_group`, `observed_status_conflict_flag`, `observed_status_conflict_flag_individual_ids` |
| `include_site_detail` | Site Detail | 1 | `site_name` |
| `include_species_detail` | Species Detail | 6 | `species_functional_type`, `species_category`, `lifecycle_duration`, `growth_habit`, `usda_plants_symbol`, `itis_number` |
| `include_phenophase_detail` | Phenophase Detail | 1 | `phenophase_category` |
| `include_series_detail` | Series Detail | 2 | `num_individuals_with_multiple_firsty`, `individuals_ids_with_multiple_firsty` |
| `include_dispersion` | **Dispersion Measures** | 10 | `sd_first_yes_in_days`, `min_first_yes_doy`, `max_first_yes_doy`, `median_first_yes_doy`, `sd_numdays_since_prior_no`, `sd_last_yes_in_days`, `min_last_yes_doy`, `max_last_yes_doy`, `median_last_yes_doy`, `sd_numdays_until_next_no` |
| `include_climate` | Climate Data | 20 | resolved via `fieldCategory: 'climate'` |

> The metadata machine name is `individuals_ids_with_multiple_firsty`, though the contract calls the
> emitted column `Multiple_FirstY_Individual_IDs`. The config keys on the **machine name**.

### Magnitude (`magnitude`) — 4 groups, no climate

| Flag | Label | n | Members |
|---|---|:-:|---|
| `include_species_detail` | Species Detail | 6 | same six as SLD |
| `include_phenophase_detail` | Phenophase Detail | 1 | `phenophase_category` |
| `include_observation_detail` | Observation Detail | 4 | `in-phase_search_method`, `in-phase_per_hr_search_method`, `start_date_doy`, `end_date_doy` |
| `include_dispersion` | **Dispersion Measures** | 3 | `sd_numanimals_in-phase`, `sd_numanimals_in-phase_per_hr`, `sd_numanimals_in-phase_per_hr_per_acre` |

**Magnitude has no `include_climate` group** — correct per the contract (`magnitude_metrics` aggregates
across locations, so there is no coherent Daymet key) and consistent with its metadata, which returns
zero climate fields.

`start_date_doy` / `end_date_doy` are grouped under `include_observation_detail` per decision #4. The
contract currently lists them as **core** for `magnitude_metrics`; Tinybird needs to fold them into the
flag so the checkbox is meaningful. Tracked in the handoff doc.

Flags are sent as `'1'` when a group is fully selected and omitted otherwise — same convention as S&I
and IPM.

---

## Workflow (target behavior)

Identical in shape to the two shipped types:

1. **Count:** on every filter change, `setObservationCount()` → `getObservationCount()` fetches the real
   count from the Tinybird pipe, then applies the per-type divisor (SLD `÷115`; MD `periods × count`).
2. **Download:** `POST` to `/v1/data/package` with `downloadType` plus the selected `include_*` flags →
   202 + `job_id` → existing `pollJobStatus()` schedule (5s, then 10s to 35s, then 2 min, abort at
   15:35) → presigned `download_url`.

---

## File-by-file changes

### 1. `src/environments/environment.ts` and `environment.prod.ts`

```ts
CREATE_REQUEST_URL: "https://services2-dev.usanpn.org/v1/data/package",
```

Both files, identical change. Nothing else in either file moves.

### 2. `src/app/output-fields/optional-field-groups.ts`

- Add `SITE_LEVEL_OPTIONAL_FIELD_GROUPS` and `MAGNITUDE_OPTIONAL_FIELD_GROUPS` per the mapping tables
  above. No `fallbacks` entries on either.
- Extend the per-type map:

```ts
export const OPTIONAL_FIELD_GROUPS: { [downloadType: string]: OptionalFieldGroup[] } = {
    raw: RAW_OPTIONAL_FIELD_GROUPS,
    summarized: SUMMARIZED_OPTIONAL_FIELD_GROUPS,
    siteLevelSummarized: SITE_LEVEL_OPTIONAL_FIELD_GROUPS,
    magnitude: MAGNITUDE_OPTIONAL_FIELD_GROUPS
};
```

`usesGroupedFields()` needs no change — it already derives from the map, so both new types become
grouped automatically.

### 3. `src/app/output-fields/output-fields.service.ts`

**`getFieldArrays()` — the hard blocker.** It currently knows two types and falls through to **raw** for
everything else (`:285-294`). Every group helper routes through it — `getGroupMembers`,
`getGroupDisplayItems`, `isGroupSelected`, `toggleGroup`, `syncOptionalFields` — so without this, all
five would silently operate on raw's field arrays the moment SLD/MD become grouped. Replace the
if/return with a full per-type resolution:

```ts
private getFieldArrays(downloadType: string) {
    switch (downloadType) {
        case 'summarized':
            return { optional: this.optionalFieldsSummarized,
                     climate: this.climateFieldsSummarized,
                     remoteSensing: this.remoteSensingFieldsSummarized };
        case 'siteLevelSummarized':
            return { optional: this.optionalFieldsSiteLevelSummarized,
                     climate: this.climateFieldsSiteLevelSummarized,
                     remoteSensing: this.remoteSensingFieldsSiteLevelSummarized };
        case 'magnitude':
            return { optional: this.optionalFieldsMagnitude,
                     climate: this.climateFieldsMagnitude,
                     remoteSensing: this.remoteSensingFieldsMagnitude };
        default:
            return { optional: this.optionalFieldsRaw,
                     climate: this.climateFieldsRaw,
                     remoteSensing: this.remoteSensingFieldsRaw };
    }
}
```

**Add `remoteSensingFieldsMagnitude: OutputField[] = []`** alongside the other magnitude arrays
(`:83-87`). Magnitude is the only type missing this property, and `syncOptionalFields` does
`optional.concat(climate).concat(remoteSensing)` — without it that appends `undefined`. Declared as a
real property rather than an inline `[]` so magnitude matches the other three types structurally.

**`togglePartnerGroupOptionalField()` (`:110-138`)** — four hand-written branches doing the same thing,
where the magnitude arm omits the remote-sensing concat. Collapse onto the resolver:

```ts
togglePartnerGroupOptionalField(selected, downloadType) {
    const { optional } = this.getFieldArrays(downloadType);
    for (const field of optional) {
        if (field.machine_name === 'partner_group')
            field.selected = selected;
    }
    this.syncOptionalFields(downloadType);
}
```

**`getSelectedIncludeFlags()` (`:347`)** — tighten the Observers forcing guard. Neither `site_metrics`
nor `magnitude_metrics` declares `include_submission`, so a carried-over Observers selection must not
send it:

```ts
if (this.observers_datasheet_selected && downloadType === 'raw') {
    flags['include_submission'] = '1';
}
```

> `AvailabilityPipe` hides the Observers datasheet for **all four** report types, so this forcing is
> unreachable through the UI on every path. It is kept, narrowed, rather than deleted, so the
> semantics stay explicit if Observers is ever re-enabled for S&I.

### 4. `src/app/output-fields/output-fields.component.ts`

**Constructor (`:18-21`)** — the grouped branch pushes a `'Climate Data'` tab unconditionally. Magnitude
has no climate group and no climate fields, so it would render an empty tab. Note the *non*-grouped
branch already guards this (`:24`), so promoting magnitude to grouped would otherwise **regress**
behavior it has today. Guard it:

```ts
if (this.usesGroupedFields()) {
    this.tabs.push({title: 'Optional Fields', view: 'optionalFieldsView'});
    if (this.getClimateGroups().length) {
        this.tabs.push({title: 'Climate Data', view: 'climateDataView'});
    }
    this.tabs.push({title: 'Default Fields', view: 'defaultFieldsView'});
}
```

`getClimateGroups()` reads only the static config, so it is safe to call from the constructor.

**`ngOnInit` (`:170` and `:172`)** — both are two-way ternaries with **no magnitude arm**, so magnitude
falls through to the *site-level* arrays:

```ts
this.climateFields = … raw ? climateFieldsRaw : (summarized ? climateFieldsSummarized : climateFieldsSiteLevelSummarized);
```

`submit()` (`:120`) then does `optionalFields.concat(climateFields).concat(remoteSensingFields)` and
writes the result to the shared service. **This is a live cross-type data leak, present today:** a user
who visits Site Level, ticks climate fields, then switches to Magnitude gets 20 site-level climate
fields injected into magnitude's `additionalFields` payload and download summary. Give both a real
magnitude arm, mirroring the shape the `optionalFields` and `defaultFields` ternaries already use
(`:162-168`, `:174-180`).

### 5. `src/app/ancillary-data/availability-pipe.ts`

Extract the rule into one exported predicate so the pipe and the payload filter cannot drift:

```ts
export function isDatasheetAvailable(name: string, reportType: string): boolean { … }

@Pipe({ name: 'available' })
export class AvailabilityPipe {
    transform(value, reportType) {
        return value.filter((d) => isDatasheetAvailable(d.name, reportType));
    }
}
```

**Behavior is unchanged** — the exclusion set is copied verbatim. Both requirement sections are already
satisfied by it today:

| Report type | Excluded | **Renders** | Requirement | |
|---|---|---|---|:-:|
| Site Phenometrics | Observers, Individual Plants, Site Visit Details | **Sites, Protocols (7 files)** | Sites + Protocols | ✅ |
| Magnitude Phenometrics | Observers, Individual Plants, Site Visit Details, Sites | **Protocols (7 files)** | Protocols only | ✅ |

(Only five datasheets exist: `ancillary-data.service.ts:14-20`.)

> Two dead conditions live in the current pipe: `"Observation Details"` is not a datasheet name at all,
> and Site Visit Details is excluded twice for magnitude. Copied as-is — removing them is a cleanup
> this phase doesn't need to take on.

### 6. `src/app/npn-portal.service.ts`

**`getObservationCount()` (`:285-292`)** — delete the mock:

```ts
getObservationCount() {
    return this._tinybirdService.getCount(
        this.config.getObservationCountUrl(), this.buildCountParams())
      .pipe(map((total: number) => ({ obsCount: total })));
}
```

All four types now hit the real pipe. The divisors in `setObservationCount()` (`:215-225`) are unchanged
— `÷20` for IPM, `÷115` for SLD, `getMagnitudeEstimate()` for MD.

**`download()` (`:366`)** — `usesFlags` becomes the shared predicate:

```ts
const usesFlags = usesGroupedFields(this.downloadType);
```

Since all four types are now grouped, the `else` branch is dead but is left in place — it is the
fallback for any download type added later without a group config.

**`download()` `ancillary_data` (`:396-401`)** — replace the drifted `summarized`-only hardcode with the
shared predicate:

```ts
ancillary_data: this.getSelectedDatasheets()
  .map((datasheet) => datasheet.name)
  .filter((name) => isDatasheetAvailable(name, this.getReportType())),
```

This closes the saved-search carry-over hole for all four types at once — previously a search carrying
`Individual Plants` into Site Level, or `Sites` into Magnitude, would send a datasheet the UI never
offered.

### 7. `src/app/date-range/date-range.component.ts`

**No functional change to either date form.** Both requirement sections are satisfied by shipped code:

| Requirement | Where it already lives |
|---|---|
| SLD: year range + start/end month & day | `dateForm` / `startDateGroup` / `endDateGroup`, `:250-274` |
| SLD: Data Precision filter | `:71` (control), `:276-279` (submit), `:352-357` (restore, defaults to 30) |
| MD: years only | `magnitudePhenoForm`, `:79-83`, `:203-219` (validation) |
| MD: bounded Jan 1 / Dec 31 | `:245-247` |
| MD: 7 / 14 / monthly / custom interval | `:130` (custom detect), `:241` (resolve), `:309-310` (cap 366), `:359-363` (default 7) |

**One fix:** all four date assignments (`:245`, `:247`, `:273`, `:274`) use
`new Date(...).toISOString().split('T')[0]`. `new Date(y, m, d)` is **local** midnight and
`toISOString()` converts to UTC, so at any positive UTC offset the date shifts back one day — a user in
Europe requesting 2020–2024 magnitude data silently gets a start date in **2019**. US offsets are all
negative, so this is correct today for the primary audience and has never been observed. Replace with
local-date formatting via a small private helper:

```ts
private toLocalIsoDate(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
```

### 8. No change

`download.component.ts`, `download.html`, and `ancillary-data.html` are **already fully generic**. They
key entirely off `usesGroupedFields()` (`download.component.ts:125-146`), so the nested group summary,
the group-count badge, and group removal all begin working for SLD and MD the moment those types appear
in `OPTIONAL_FIELD_GROUPS`. This is the IPM plan's extension point paying off exactly as intended.

Also unchanged: `config.service.ts`, `tinybird.service.ts`, the polling logic, and
`ancillary-data.component.ts`.

> `ancillary-data.component.ts` `submit()` (`:52-65`) force-selects `observation_group_id` for Site
> Visit Details and `observedby_person_id` for Observers. Both datasheets are hidden for SLD and MD,
> and **neither field exists in either type's metadata**, so both branches are already inert for the
> new types — the same reasoning that made them inert for IPM. No guard needed.

---

## Out of scope / deferred (tracked follow-ups)

1. **`taxon` / `phenophase_grain`** — POP sends neither and relies on the server's `species` /
   `phenophase` defaults. Middleware's problem, not this front end's. → handoff doc.
2. **`Start_Date_DOY` / `End_Date_DOY`** — grouped under `include_observation_detail` client-side;
   Tinybird still treats them as core. → handoff doc.
3. **Partner-group forcing goes inert under the grouped UI.** `partner-groups.component.ts:123`
   force-selects the `partner_group` field, but on SLD that is 1 of 3 members of
   `include_observation_detail`, and `isGroupSelected()` requires all members. So the checkbox stays
   unchecked, the flag is never sent, and the column doesn't appear — while `partner_group` sits
   selected in `additionalFields`, invisible (the grouped summary lists groups, not fields).
   **Pre-existing on raw and IPM**, which have `partner_group` in the same group. Magnitude escapes it
   entirely — `partner_group` isn't in its metadata. Making the forcing group-aware would pull two
   extra columns in from a *filter* choice and would change shipped S&I/IPM behavior; deliberately not
   done here.
4. **`qualityFlags` semantics.** `dataQualityChecksSelected()` keys entirely off
   `observed_status_conflict_flag`. On SLD that field sits inside `include_observation_detail`, so data
   quality handling follows a three-field group toggle. On MD the field doesn't exist at all, so
   `qualityFlags` is **always `'ignored'`** — unchanged from magnitude's behavior today, but now
   permanent. Carried forward from the S&I and IPM plans.
5. **`additionalFields` / `additionalFieldsDisplay` still sent** alongside the `include_*` flags for all
   four types. The S&I plan's decision #4 said to drop them; never done. Deliberately left alone again.
6. **Legacy saved searches.** Promoting SLD/MD to grouped types means a pre-retrofit search storing
   arbitrary per-field subsets can restore a *partial* group — checkbox unchecked, flag never sent,
   fields silently dropped from the output. Explicitly unsupported, matching the IPM plan. Searches
   saved from here on round-trip correctly with no new code.
7. **`environment.prod.ts` points at `services2-dev`** — identical to the dev file, so production builds
   hit the dev host. Noted, not fixed.
8. **Dead conditions in `AvailabilityPipe`** — `"Observation Details"` matches no datasheet; Site Visit
   Details is excluded twice for magnitude. Copied verbatim during extraction.
9. **Higher taxonomy and `pheno_class_*` are unreachable from POP** on every download type, because no
   metadata type returns those fields. → handoff doc.

---

## Implementation order (suggested)

1. `environment.ts` + `environment.prod.ts` — endpoint swap. Pure config; verify S&I still downloads
   before going further.
2. `optional-field-groups.ts` — SLD and MD group configs + map entries. Pure addition.
3. `output-fields.service.ts` — `getFieldArrays()` switch, `remoteSensingFieldsMagnitude`,
   `togglePartnerGroupOptionalField()` refactor, `include_submission` guard.
4. `output-fields.component.ts` — Climate tab guard, `ngOnInit` magnitude arms.
5. `availability-pipe.ts` — extract `isDatasheetAvailable()`.
6. `npn-portal.service.ts` — count mock removal, `usesFlags` predicate, `ancillary_data` filter.
7. `date-range.component.ts` — `toLocalIsoDate()` helper at four call sites.
8. Manual verification (below).

## Verification

`nvm use 14.21.3` before building — legacy webpack/OpenSSL constraint.

### Site Level

- **Output Fields:** six group checkboxes on the Optional tab (Observation Detail, Site Detail, Species
  Detail, Phenophase Detail, Series Detail, Dispersion Measures) plus Climate Data on its own tab. Each
  lists its members with tooltips. **No fallback labels should appear** — every member resolves from
  metadata. Default tab shows 26 required fields.
- **Date:** year range + start/end month/day render, and the Data Precision control is present and
  defaults to 30.
- **Ancillary:** exactly two datasheets — **Sites** and **Protocols (7 files)**.
- **Count:** badge shows a real figure that *moves when filters change* (previously pinned at 435 K).
  Roughly 1/115th of the S&I count for the same filters.
- **Download:** POST to `/v1/data/package` with `downloadType: "Site Phenometrics"` and only the
  selected `include_*` flags. 202 → `job_id` → poll → presigned URL.

### Magnitude

- **Output Fields:** four group checkboxes (Species Detail, Phenophase Detail, Observation Detail,
  Dispersion Measures) on the Optional tab. **No Climate Data tab at all** — this is the specific
  regression the constructor guard prevents. Default tab shows 32 required fields.
- **Observation Detail** lists four members including Start Date DOY and End Date DOY.
- **Date:** years only, plus the summary interval (7 / 14 / monthly / custom). Custom caps at 366.
- **Ancillary:** exactly one datasheet — **Protocols (7 files)**.
- **Count:** real figure that moves with filters and with the summary interval.
- **Download:** POST with `downloadType: "Magnitude Phenometrics"`, `startDate` = `<startYear>-01-01`,
  `endDate` = `<endYear>-12-31`.
- **Cross-type leak (regression):** select Site Level → tick several Climate Data fields → switch to
  Magnitude → inspect the download summary and POST body. **No site-level climate fields may appear.**
  This fails before the `ngOnInit` fix.

### S&I and IPM (regression — four shared touchpoints move)

- **S&I:** Output Fields still renders its original seven groups; download POSTs to the new
  `/v1/data/package` URL and completes end to end; count unchanged.
- **IPM:** six groups unchanged; Observers still absent from Ancillary; count still ~1/20th of S&I.
- **Partner groups:** selecting a partner group on S&I behaves exactly as before (the forcing is
  already inert under grouped selection — confirm no *new* behavior, not that it works).
- **Ancillary payload:** on each type, the POST body's `ancillary_data` contains only datasheets the UI
  actually offered for that type.

### Timezone fix

- With the OS clock set to a positive-UTC-offset zone (e.g. Europe/Berlin), a magnitude request for
  2020–2024 must POST `startDate: "2020-01-01"`, not `"2019-12-31"`.
