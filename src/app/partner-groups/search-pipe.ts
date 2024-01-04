import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: 'networkSearch',
    // pure: false
})
export class SearchPipe implements PipeTransform {
    // tmp = [];


    transform(value, groupName, groupTags, regionTag) {

        //deep copy to make sure nested filtered out items reappear when filter is removed
        var value = JSON.parse(JSON.stringify(value));

        var tags = groupTags.concat(regionTag)

        function checkTags(group, groupTags, regionTag) {

            if(tags.length == 0)
                return true;

            if(!group.tags || group.tags.length == 0)
                return false;

            if (regionTag.length != 0 && !group.tags.find(e => e.Name === regionTag[0].Name)) {
                return false;
            }
            
            for (var tag of group.tags) {
                if (tags.find(e => e.Name === tag.Name)) {
                    return true;
                }
            }

            return false;
                
        }

        //only do work if there is something to filter on
        if ( (groupName && groupName != '') || (groupTags && groupTags.length > 0) || regionTag) {

            groupName = groupName.toString().toLowerCase();
            var foundPrimaryGroup = false;

            //TODO: this iterative approach works, but would be generalized an much cleaner if written recursively
            // the gist of this filter is to:
            // 1. check if the current lvls network_name includes the search param, if so keep it
            // 2. otherwise pend filtering the current node until checking it's subnetworks
            // 3. check/filter subnetworks
            // 4. if subnetwork found propagate back up that you need to keep the parent network
            
            return value.filter(function(group) {
                if (group.Name.toLowerCase().includes(groupName) && checkTags(group, groupTags, regionTag)) {
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