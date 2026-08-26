export interface OptionalFieldGroup {
    flag: string;           // include_* flag sent in the request body
    label: string;          // human label shown on the group checkbox
    machineNames: string[]; // member machine_names in display order
    fieldCategory?: 'climate' | 'remoteSensing'; // use all fields of this category instead of machineNames
    fallbacks?: { [machineName: string]: { label: string; tooltip: string } };
}

// Members fall back to a hardcoded label/tooltip ONLY if absent from the metadata endpoint.
// TODO: reconcile against live getMetadataFields.json?type=raw to finalize which fields need fallbacks.
export const RAW_OPTIONAL_FIELD_GROUPS: OptionalFieldGroup[] = [
    {
        flag: 'include_submission',
        label: 'Submission Details',
        machineNames: [
            'observedby_person_id',
            'submission_id',
            'submittedby_person_id',
            'submission_datetime',
            'updatedby_person_id',
            'update_datetime',
            'lpl_certified_date',
            'observer_certified',
            'observer_certified_date'
        ],
        fallbacks: {
            lpl_certified_date: {
                label: 'LPL Certified Date',
                tooltip: 'Placeholder description for LPL Certified Date.'
            },
            observer_certified: {
                label: 'Observer Certified',
                tooltip: ''
            },
            observer_certified_date: {
                label: 'Observer Certified Date',
                tooltip: ''
            }
        }
    },
    {
        flag: 'include_observation_detail',
        label: 'Observation Detail',
        machineNames: [
            'dataset_id',
            'protocol_id',
            'observation_time',
            'observation_group_id',
            'observation_comments',
            'observed_status_conflict_flag',
            'status_conflict_related_records',
            'partner_group'
        ],
        fallbacks: {
            status_conflict_related_records: {
                label: 'Status Conflict Related Records',
                tooltip: 'Observation IDs of related records involved in a status conflict.'
            }
        }
    },
    {
        flag: 'include_species_detail',
        label: 'Species Detail',
        machineNames: [
            'species_functional_type',
            'species_category',
            'lifecycle_duration',
            'growth_habit',
            'usda_plants_symbol',
            'itis_number'
        ]
    },
    {
        flag: 'include_site_detail',
        label: 'Site Detail',
        machineNames: ['site_name'],
        fallbacks: {
            site_name: {
                label: 'Site Name',
                tooltip: 'The name of the monitoring site.'
            }
        }
    },
    {
        flag: 'include_individual_detail',
        label: 'Individual Detail',
        machineNames: ['plant_nickname', 'patch'],
        fallbacks: {
            plant_nickname: {
                label: 'Plant Nickname',
                tooltip: 'The nickname assigned to this individual plant.'
            },
            patch: {
                label: 'Patch',
                tooltip: 'Indicates whether the individual is a patch of plants.'
            }
        }
    },
    {
        flag: 'include_phenophase_detail',
        label: 'Phenophase Detail',
        machineNames: [
            'phenophase_category',
            'phenophase_name',
            'phenophase_definition_id',
            'secondary_species_specific_definition_id'
        ],
        fallbacks: {
            phenophase_category: {
                label: 'Phenophase Category',
                tooltip: 'The category of the observed phenophase.'
            },
            phenophase_name: {
                label: 'Phenophase Name',
                tooltip: 'The name of the observed phenophase.'
            },
            phenophase_definition_id: {
                label: 'Phenophase Definition ID',
                tooltip: 'The unique identifier for the phenophase definition.'
            },
            secondary_species_specific_definition_id: {
                label: 'Secondary Species Definition ID',
                tooltip: 'The unique identifier for the secondary species-specific phenophase definition.'
            }
        }
    },
    {
        flag: 'include_climate',
        label: 'Climate Data',
        machineNames: [],
        fieldCategory: 'climate'
    }
];

// Members below exist in the individual_summarized metadata except the certification fields, which
// are not published there yet and so carry fallbacks.
export const SUMMARIZED_OPTIONAL_FIELD_GROUPS: OptionalFieldGroup[] = [
    {
        flag: 'include_submission',
        label: 'Submission Details',
        machineNames: [
            'observedby_person_id',
            'lpl_certified_date',
            'observer_certified',
            'observer_certified_date'
        ],
        fallbacks: {
            lpl_certified_date: {
                label: 'LPL Certified Date',
                tooltip: 'Placeholder description for LPL Certified Date.'
            },
            observer_certified: {
                label: 'Observer Certified',
                tooltip: ''
            },
            observer_certified_date: {
                label: 'Observer Certified Date',
                tooltip: ''
            }
        }
    },
    {
        flag: 'include_observation_detail',
        label: 'Observation Detail',
        machineNames: ['dataset_id', 'partner_group', 'observed_status_conflict_flag']
    },
    {
        flag: 'include_series_detail',
        label: 'Series Detail',
        machineNames: ['numys_in_series', 'numdays_in_series', 'multiple_observers', 'multiple_firsty']
    },
    {
        flag: 'include_species_detail',
        label: 'Species Detail',
        machineNames: [
            'species_functional_type',
            'species_category',
            'lifecycle_duration',
            'growth_habit',
            'usda_plants_symbol',
            'itis_number'
        ]
    },
    {
        flag: 'include_individual_detail',
        label: 'Individual Detail',
        machineNames: ['site_name', 'plant_nickname', 'patch', 'phenophase_category']
    },
    {
        flag: 'include_climate',
        label: 'Climate Data',
        machineNames: [],
        fieldCategory: 'climate'
    }
];

// Every member below exists in the site_summarized metadata, so no fallbacks are needed.
export const SITE_LEVEL_OPTIONAL_FIELD_GROUPS: OptionalFieldGroup[] = [
    {
        flag: 'include_observation_detail',
        label: 'Observation Detail',
        machineNames: [
            'partner_group',
            'observed_status_conflict_flag',
            'observed_status_conflict_flag_individual_ids'
        ]
    },
    {
        flag: 'include_site_detail',
        label: 'Site Detail',
        machineNames: ['site_name']
    },
    {
        flag: 'include_species_detail',
        label: 'Species Detail',
        machineNames: [
            'species_functional_type',
            'species_category',
            'lifecycle_duration',
            'growth_habit',
            'usda_plants_symbol',
            'itis_number'
        ]
    },
    {
        flag: 'include_phenophase_detail',
        label: 'Phenophase Detail',
        machineNames: ['phenophase_category']
    },
    {
        flag: 'include_series_detail',
        label: 'Series Detail',
        machineNames: ['num_individuals_with_multiple_firsty', 'individuals_ids_with_multiple_firsty']
    },
    {
        flag: 'include_dispersion',
        label: 'Dispersion Measures',
        machineNames: [
            'sd_first_yes_in_days',
            'min_first_yes_doy',
            'max_first_yes_doy',
            'median_first_yes_doy',
            'sd_numdays_since_prior_no',
            'sd_last_yes_in_days',
            'min_last_yes_doy',
            'max_last_yes_doy',
            'median_last_yes_doy',
            'sd_numdays_until_next_no'
        ]
    },
    {
        flag: 'include_climate',
        label: 'Climate Data',
        machineNames: [],
        fieldCategory: 'climate'
    }
];

// Every member below exists in the magnitude metadata, so no fallbacks are needed. No climate group —
// magnitude_metrics aggregates across locations, so there is no coherent Daymet key.
export const MAGNITUDE_OPTIONAL_FIELD_GROUPS: OptionalFieldGroup[] = [
    {
        flag: 'include_species_detail',
        label: 'Species Detail',
        machineNames: [
            'species_functional_type',
            'species_category',
            'lifecycle_duration',
            'growth_habit',
            'usda_plants_symbol',
            'itis_number'
        ]
    },
    {
        flag: 'include_phenophase_detail',
        label: 'Phenophase Detail',
        machineNames: ['phenophase_category']
    },
    {
        flag: 'include_observation_detail',
        label: 'Observation Detail',
        machineNames: ['in-phase_search_method', 'in-phase_per_hr_search_method', 'start_date_doy', 'end_date_doy']
    },
    {
        flag: 'include_dispersion',
        label: 'Dispersion Measures',
        machineNames: ['sd_numanimals_in-phase', 'sd_numanimals_in-phase_per_hr', 'sd_numanimals_in-phase_per_hr_per_acre']
    }
];

export const OPTIONAL_FIELD_GROUPS: { [downloadType: string]: OptionalFieldGroup[] } = {
    raw: RAW_OPTIONAL_FIELD_GROUPS,
    summarized: SUMMARIZED_OPTIONAL_FIELD_GROUPS,
    siteLevelSummarized: SITE_LEVEL_OPTIONAL_FIELD_GROUPS,
    magnitude: MAGNITUDE_OPTIONAL_FIELD_GROUPS
};

export function usesGroupedFields(downloadType: string): boolean {
    return !!OPTIONAL_FIELD_GROUPS[downloadType];
}

// The output field carrying the partner group name. Filtering by partner group implies the user
// wants that column back, so selecting any partner group auto-selects the group that owns it -
// under grouped fields the whole group has to be selected for its include_* flag to be sent.
export const PARTNER_GROUP_MACHINE_NAME = 'partner_group';

// The group that owns partner_group for a download type, or undefined when that type has none
// (magnitude aggregates across partners, so it exposes no partner_group column).
export function getPartnerGroupFieldGroup(downloadType: string): OptionalFieldGroup | undefined {
    return (OPTIONAL_FIELD_GROUPS[downloadType] || [])
        .find(group => group.machineNames.indexOf(PARTNER_GROUP_MACHINE_NAME) !== -1);
}
