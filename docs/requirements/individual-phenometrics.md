# Phenology Observation Portal (POP) Individual Phenometrics Retrofit

This document describes the requirements to modernize the NPN's Phenology Observation Portal (POP) interface to communicate asyncronously with serverless/Tinybird cloud configuration rather than communicating directly with self-hosted services and database, as to pull individual phenometrics (IPM) data.

This is the next step in the series of development phases, adding different data products to the POP. The initial retrofitting is described in docs/plans/status-and-intensity-plan.md. This time we'll add support for IPM.

## Observation Date

The main difference is how the user selects the date range. Whereas with S&I the user can simply select a start and end date, with IPM, requests are windowed into years (handled on the server side), but this time selection needs to be represented in the current interface. There are currently controls that handle this correctly, allowing the user to set custom date range, or different calendar types, like 'water year' or 'canedar year'. Ultimately what gets submitted to the service is a start and end date, representing the calendar day of the start period, with the start year, and then calendar day of the end period, with the end year.

## Output Fields

Another big difference are the output fields. The S&I has been adapted to send include_* type flags and has broken the various fields into categories. We need to do the same here, and will need to draft some new categories for the different data fields available for IPM. The set of fields available as compared to the current day IPM download.

## Ancillary Data

This changes as well now, excluding Site Visit Ancillary data for IPMs.

## Estimated Recrods

This should stay mostly the same. We will use the current day implementation of estimated the number of records by querying the S&I data count endpoint and then dividing it by a static factor.

## Endpoint URL

The endpoint URL also doesn't change, /v1/data/observations/export , however, we need to pass an additional new param   "downloadType" which can now be set to either "Status and Intensity" or "Individual Phenometrics".
