import { WatchlistMembersCountPipe } from './watchlist-members-count.pipe';
import { EnrichedMember } from '../models/firebase.models';

describe('WatchlistMembersCountPipe', () => {
    let pipe: WatchlistMembersCountPipe;

    beforeEach(() => {
        pipe = new WatchlistMembersCountPipe();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return the correct count of members who have accepted the invitation', () => {
        const mockMembers = [
            { uid: '1', name: 'Alice', invitationAccepted: true },
            { uid: '2', name: 'Bob', invitationAccepted: false },
            { uid: '3', name: 'Charlie', invitationAccepted: true },
        ] as EnrichedMember[];

        const result = pipe.transform(mockMembers);

        expect(result).toBe(2);
    });

    it('should return 0 if the members list is empty', () => {
        const result = pipe.transform([]);
        expect(result).toBe(0);
    });

    it('should return 0 if no members have accepted the invitation', () => {
        const mockMembers = [
            { uid: '1', name: 'Alice', invitationAccepted: false },
            { uid: '2', name: 'Bob', invitationAccepted: false },
        ] as EnrichedMember[];

        const result = pipe.transform(mockMembers);

        expect(result).toBe(0);
    });
});
