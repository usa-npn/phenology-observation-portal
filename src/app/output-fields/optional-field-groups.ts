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
            'update_datetime'
        ]
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
    },
    {
        flag: 'include_remote_sensing',
        label: 'Remote Sensing Data',
        machineNames: [],
        fieldCategory: 'remoteSensing'
    }
];
