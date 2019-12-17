import {Pipe} from "@angular/core";

@Pipe({
    name: 'networkSearch',
    // pure: false
})
export class SearchPipe {
    // tmp = [];
    transform(value, groupName) {

        //deep copy to make sure nested filtered out items reappear when filter is removed
        var value = JSON.parse(JSON.stringify(value));

        //only do work if there is something to filter on
        if ( groupName && groupName != '') {

            groupName = groupName.toString().toLowerCase();
            var foundPrimaryGroup = false;
            var foundSecondaryGroup = false;
            var foundTertiaryGroup = false;
            var foundQuaternaryGroup = false;

            //TODO: this iterative approach works, but would be generalized an much cleaner if written recursively
            // the gist of this filter is to:
            // 1. check if the current lvls network_name includes the search param, if so keep it
            // 2. otherwise pend filtering the current node until checking it's subnetworks
            // 3. check/filter subnetworks
            // 4. if subnetwork found propagate back up that you need to keep the parent network
            
            return value.filter(function(group) {
                foundPrimaryGroup = false;

                if (group.network_name.toLowerCase().includes(groupName)) {
                    foundPrimaryGroup = true;
                    return true;
                }
                foundSecondaryGroup = false;
                if (group.secondary_network) {
                    group.secondary_network = group.secondary_network.filter(function(secondaryGroup) {
                        
                        if (secondaryGroup.network_name.toLowerCase().includes(groupName)) {
                            foundSecondaryGroup = true;
                            return true;
                        }
                        foundTertiaryGroup = false;    
                        if (secondaryGroup.tertiary_network) {
                            secondaryGroup.tertiary_network = secondaryGroup.tertiary_network.filter(function(tertiaryGroup) {
                                
                                if (tertiaryGroup.network_name.toLowerCase().includes(groupName)) {
                                    foundTertiaryGroup = true;
                                    return true;
                                }
                                foundQuaternaryGroup = false;
                                if (tertiaryGroup.quaternary_network) {
                                    tertiaryGroup.quaternary_network = tertiaryGroup.quaternary_network.filter(function(quaternaryGroup) {
                                        
                                        if (quaternaryGroup.network_name.toLowerCase().includes(groupName)) {
                                            foundQuaternaryGroup = true;
                                            return true;
                                        }
                                        return false;
                                    });
                                }
                                if(foundQuaternaryGroup) {
                                    foundTertiaryGroup = true;
                                }
                                return foundQuaternaryGroup;
                            });
                        }
                        if(foundTertiaryGroup) {
                            foundSecondaryGroup = true;
                        }
                        return foundTertiaryGroup || foundQuaternaryGroup;
                    });
                    
                }
                if(foundSecondaryGroup) {
                    foundPrimaryGroup = true;
                }
                return foundSecondaryGroup || foundTertiaryGroup || foundQuaternaryGroup;
            });
        }
        // else {
        //     this.tmp = value;
        // }
        // return this.tmp;
        return value;
    }
}