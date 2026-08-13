import {Component} from "@angular/core";

// Served straight from the metadata repo. This used to go through pop-services/fgdc,
// which did nothing but forward this file with a Content-Disposition header.
const FGDC_METADATA_URL = 'https://raw.githubusercontent.com/usa-npn/metadata/master/USA-NPN_Phenology_observation_data.xml';
const FGDC_METADATA_FILENAME = 'USA-NPN_Phenology_observation_data.xml';

@Component({
    templateUrl: 'metadata.html',
    styleUrls: ['metadata.component.css']
})

export class MetadataComponent {

    fgdcLink = FGDC_METADATA_URL;

    downloadFile(fileLocation) {
        window.location.replace('https://www.usanpn.org' + fileLocation);
    }

    // GitHub serves the file as text/plain, so a plain link would render it in the browser
    // instead of downloading it. Pull it down and hand the browser a named blob instead.
    downloadFgdcMetadata(event: Event) {
        event.preventDefault();
        fetch(FGDC_METADATA_URL)
            .then(response => {
                if(!response.ok) {
                    throw new Error('FGDC metadata request failed: ' + response.status);
                }
                return response.blob();
            })
            .then(blob => {
                let objectUrl = URL.createObjectURL(blob);
                let link = document.createElement('a');
                link.href = objectUrl;
                link.download = FGDC_METADATA_FILENAME;
                link.click();
                URL.revokeObjectURL(objectUrl);
            })
            .catch(error => {
                console.error(error);
                window.open(FGDC_METADATA_URL, '_blank');
            });
    }
}
