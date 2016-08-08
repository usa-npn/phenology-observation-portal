// export interface OutputField {
//     display_name: string;
//     request_param: string;
//     selected: boolean;
//     qc: boolean;
// }
export interface OutputField {
    metadata_field_id: number;
    field_name: string;
    field_description: string;
    seq_num: number;
    type: string;
    quality_check: boolean;
    climate: boolean;
    required: boolean;
    machine_name: string;
    controlled_values: string;
    selected: boolean;
}
//{"field_name":"Tmin","field_description":"Minimum temperature (in degrees C) on the Observation_Date. From Daymet (http:\/\/daymet.ornl.gov).","seq_num":51,"type":"Raw","quality_check":0,"climate":1,"required":0,"machine_name":"tmin","controlled_values":""}