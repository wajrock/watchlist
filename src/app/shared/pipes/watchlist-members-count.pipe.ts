import { Pipe, PipeTransform } from '@angular/core';
import { EnrichedMember, Member } from '../models/firebase.models';

@Pipe({
    name: 'watchlistMembersCount',
})
export class WatchlistMembersCountPipe implements PipeTransform {
    transform(members: EnrichedMember[] | Member[]): number {
        return members.filter((member) => member.invitationAccepted).length;
    }
}
