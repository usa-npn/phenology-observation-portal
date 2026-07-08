# Phenology Observation Portal (POP) Retrofitting - Record Count

This is a continuation of status-intensity-retrofit.md wherein we implement the observation count functionality which previously was retrofitted to only provide a static count, just to make the tool work. Now we will provide a real count based on a new endpoint.


## Broad Requirements 

The goal here to provide the user a number of records based on their filters whenever the app loads and whenever their filter changes. Most of the "responsive" actions are already built into the app, we only need to managed calling the correct endpoints.

As before we need to design this with the intention in mind to expand this functionality for the other data types although for now we will only affect the status and intensity type datapoint.

Different in this requirement is that we are going to talk to Tinybird directly as there is no real value in logging all this information in cloudwatch, so we can avoid the extra costs of running a lambda function every time this runs which will be much more responsive than the download endpoint.

That means there's also a new endpoint to fetch a JWT token, and so a workflow needs to be through through to accomodate this authentication flow, to get a valid JWT token and then use that to make further requests to Tinybird. The token lives about an hour, so we will need to test for validitity and refresh when necessary.

## Endpoints

v1/data/token - Endpoint for fetching a valid JWT Token. The token returned comes in such a JSON response:

{
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    expires_at: '2026-07-08T18:30:00Z',
}

api.us-west-2.aws.tinybird.co/v0/pipes/status_data_count.json - For fetching the actual count of observations. The params for this endpoint closely mirror those of the download endpoint. See the following:
  - start_date (Date)
  - end_date (Date)
  - species_ids (String)
  - phenophase_short_names (String)
  - network_ids (String)
  - dataset_ids (String)
  - states (String)
  - bottom_left_lat (Float32)
  - upper_right_lat (Float32)
  - bottom_left_lng (Float32)
  - upper_right_lng (Float32)