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

            //TODO: this iterative approach works, but would be generalized an much cleaner if written recursively
            // the gist of this filter is to:
            // 1. check if the current lvls network_name includes the search param, if so keep it
            // 2. otherwise pend filtering the current node until checking it's subnetworks
            // 3. check/filter subnetworks
            // 4. if subnetwork found propagate back up that you need to keep the parent network
            
            return value.filter(function(group) {
                if (group.Name.toLowerCase().includes(groupName)) {
                    return true;
                }
            });
        }
        // else {
        //     this.tmp = value;
        // }
        // return this.tmp;
        return value;
    }
}