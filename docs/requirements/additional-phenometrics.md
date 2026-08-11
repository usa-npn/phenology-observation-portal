# Phenology Observation Portal (POP) Site Level and Magnitude Phenometrics Retrofit

This document describes the requirements to modernize the NPN's Phenology Observation Portal (POP) interface to communicate asyncronously with serverless/Tinybird cloud configuration rather than communicating directly with self-hosted services and database, as to pull Site Level (SLD) and Magnitude Phenometrics Data (MD).

This is the next step in the series of development phases, adding different data products to the POP. The initial retrofitting is described in docs/plans/status-and-intensity-plan.md and individual phenometrics have also been implemented as per individual-phenometrics-plan.md. This time we'll add support for the final two products, site level data and magnitude data.

## Site Level Data

Here's where SLD diverges from the current IPM. As with IPM the vast majority of these requirements are already done and simply need to be checked if they are still funtional given the other recent changes.

### Date Selection

The date selector here works exactly the same as with IPM allowing the user to select a predefiend year range plus start and end date and monht. Additionally, this screen has a Data Precision Filter.

### Ancillary Data

The only selectable options for SLD is "Sites" and "Protocols (7 files)"


## Magnitude Data

Here's where MD diverges from the current IPM. As with MD the vast majority of these requirements are already done and simply need to be checked if they are still funtional given the other recent changes.

### Date Selection

Here date selection consists only of the years in question. They should be bounded to Jan 1st and Dec 31st for the inputs for the requests / API calls. Additionally the user submits a summary interval which can consists of all of the current day options, i.e. 7/14 days, monthly or custom, and user enters a number of days of their choosing.

### Ancillary Data

Only "Protocols (7 files)" is available for this data type.


## Endpoint URLs

A noteable change, becauses it affects IPM and status data as well, is a change in the endpoint URL. Before each product would fetch data from an endpoint matching its own data type in the URL. Instead now, we have a single endpoint for all data types:

https://services2-dev.usanpn.org/v1/data/package

To request data for a particular data type, now an additional parameter needs to be submitted, "downloadType", which has the following valid options:
 - "Status and Intensity"
 - "Individual Phenometrics"
 - "Site Phenometrics"
 - "Magnitude Phenometrics"


## Output Fields

There's also additional changes to how the output fields are broken up into groups and organized. Rather than attempt to describe them in detail, check the reference document that comes from the contract established while building the tinybird side of things.

C:\projects\npn\tinybird\docs\reference\include-flags.md

This provides an authoritative truth to which flags go with which data types and which optional data fields, which in turn indicates how they should be grouped in the user interface.


