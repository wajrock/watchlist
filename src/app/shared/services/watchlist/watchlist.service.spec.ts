import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { BehaviorSubject, of, firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { WatchlistService } from './watchlist.service';
import { AuthService } from '../auth/auth.service';
import { WatchlistItem, Member } from '../../models/firebase.models';

const mockCollectionData$ = new BehaviorSubject<any[]>([]);
const mockDocData$ = new BehaviorSubject<any>(null);
const mockGetDocPromise = vi.fn();
const mockDeleteDocPromise = vi.fn();
const mockUpdateDocPromise = vi.fn();

vi.mock('@angular/fire/firestore', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@angular/fire/firestore')>();
    return {
        ...actual,
        collection: vi.fn(),
        doc: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        documentId: vi.fn(() => 'documentId'),
        collectionData: vi.fn(() => mockCollectionData$.asObservable()),
        docData: vi.fn(() => mockDocData$.asObservable()),
        getDoc: vi.fn((...args) => mockGetDocPromise(...args)),
        deleteDoc: vi.fn((...args) => mockDeleteDocPromise(...args)),
        updateDoc: vi.fn((...args) => mockUpdateDocPromise(...args)),
    };
});

describe('WatchlistService', () => {
    let service: WatchlistService;
    let mockAuthService: any;
    let mockUserSubject$: BehaviorSubject<any>;

    beforeEach(() => {
        mockCollectionData$.next([]);
        mockDocData$.next(null);
        mockGetDocPromise.mockResolvedValue({ exists: () => false, data: () => ({}) });
        mockDeleteDocPromise.mockResolvedValue(undefined);
        mockUpdateDocPromise.mockResolvedValue(undefined);

        const store: Record<string, string> = { activeWatchlistId: 'w-123' };
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => store[key] || null);
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
            store[key] = value;
        });
        vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
            delete store[key];
        });

        mockUserSubject$ = new BehaviorSubject<any>(null);
        mockAuthService = {
            user$: mockUserSubject$.asObservable(),
        };

        TestBed.configureTestingModule({
            providers: [
                WatchlistService,
                { provide: Firestore, useValue: {} },
                { provide: AuthService, useValue: mockAuthService },
            ],
        });

        service = TestBed.inject(WatchlistService);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('watchlists$', () => {
        it('should return empty array if user is unauthenticated', async () => {
            mockUserSubject$.next(null);
            const result = await firstValueFrom(service.watchlists$.pipe(take(1)));
            expect(result).toEqual([]);
        });

        it('should map, filter accepted members, and sort watchlists by date descending', async () => {
            const mockLists = [
                {
                    uidWatchlist: 'a',
                    creationTime: '2026-01-01T00:00:00.000Z',
                    members: [{ id: 'u1', invitationAccepted: true }],
                },
                {
                    uidWatchlist: 'b',
                    creationTime: '2026-02-01T00:00:00.000Z',
                    members: [{ id: 'u1', invitationAccepted: true }],
                },
                {
                    uidWatchlist: 'c',
                    creationTime: '2026-02-01T00:00:00.000Z',
                    members: [{ id: 'u1', invitationAccepted: false }],
                },
            ];
            mockCollectionData$.next(mockLists);
            mockUserSubject$.next({ uid: 'u1' });

            const result = await firstValueFrom(service.watchlists$.pipe(take(1)));
            expect(result.length).toBe(2);
            expect(result[0].uidWatchlist).toBe('b');
            expect(result[1].uidWatchlist).toBe('a');
        });
    });

    describe('watchlistInvitations$', () => {
        it('should return empty array if user is null', async () => {
            mockUserSubject$.next(null);
            const result = await firstValueFrom(service.watchlistInvitations$.pipe(take(1)));
            expect(result).toEqual([]);
        });

        it('should capture lists where user invitation has not been accepted yet', async () => {
            const mockLists = [
                { uidWatchlist: 'a', members: [{ id: 'u1', invitationAccepted: false }] },
                { uidWatchlist: 'b', members: [{ id: 'u1', invitationAccepted: true }] },
            ];
            mockCollectionData$.next(mockLists);
            mockUserSubject$.next({ uid: 'u1' });

            const result = await firstValueFrom(service.watchlistInvitations$.pipe(take(1)));
            expect(result.length).toBe(1);
            expect(result[0].uidWatchlist).toBe('a');
        });
    });

    describe('activeWatchlist$', () => {
        it('should return null if activeId emission state resolves to null', async () => {
            service.setActiveId('');
            const result = await firstValueFrom(service.activeWatchlist$.pipe(take(1)));
            expect(result).toBeNull();
        });

        it('should return null if matching watchlist doc database data is missing', async () => {
            mockDocData$.next(null);
            const result = await firstValueFrom(service.activeWatchlist$.pipe(take(1)));
            expect(result).toBeNull();
        });

        it('should join and enrich watchlist dependencies matching aggregated structural tracking schemas', async () => {
            const baseWatchlist = {
                uidWatchlist: 'w-123',
                members: [{ id: 'u1', invitationAccepted: true }],
                medias: [{ idMedia: 'm1', addedByUserId: 'u1' }],
            } as any;

            mockDocData$.next(baseWatchlist);
            mockCollectionData$.next([
                { uid: 'u1', name: 'John Doe', username: 'johndoe', uidMedia: 'm1' },
            ]);

            const result = await firstValueFrom(service.activeWatchlist$.pipe(take(1)));
            expect(result).not.toBeNull();
            expect(result?.uidWatchlist).toBe('w-123');
            expect(result?.members[0].name).toBe('John Doe');
        });
    });

    describe('getCollectionByIds', () => {
        it('should output empty array immediately if tracking array parameter argument is blank', async () => {
            const result = await firstValueFrom(
                service.getCollectionByIds('path', 'field', []).pipe(take(1)),
            );
            expect(result).toEqual([]);
        });
    });

    describe('deleteWatchlist', () => {
        it('should fallback clean active signal indices if target deletion is matching currently selected list', async () => {
            vi.spyOn(service, 'watchlists$', 'get').mockReturnValue(
                of([
                    {
                        uidWatchlist: 'w-456',
                        creationTime: '2026-01-01',
                        members: [],
                        name: 'Mock List',
                        medias: [],
                    } as WatchlistItem,
                ]),
            );

            const result = await firstValueFrom(service.deleteWatchlist('w-123').pipe(take(1)));
            expect(result).toBe(true);
            expect(service.activeId()).toBe('w-456');
        });

        it('should clear structural indicators if no alternative options remain available post-delete actions', async () => {
            vi.spyOn(service, 'watchlists$', 'get').mockReturnValue(of([]));

            const result = await firstValueFrom(service.deleteWatchlist('w-123').pipe(take(1)));
            expect(result).toBe(true);
            expect(service.activeId()).toBeNull();
        });

        it('should handle failure streams cleanly and return false inside recovery catch blocks', async () => {
            mockDeleteDocPromise.mockRejectedValueOnce(new Error('Firebase Blocked'));

            const result = await firstValueFrom(service.deleteWatchlist('w-123').pipe(take(1)));
            expect(result).toBe(false);
        });
    });

    describe('removeMember', () => {
        it('should return false if targeted document dataset reference does not exist inside repository', async () => {
            mockGetDocPromise.mockResolvedValueOnce({ exists: () => false, data: () => ({}) });

            const result = await firstValueFrom(service.removeMember('w1', 'u1').pipe(take(1)));
            expect(result).toBe(false);
        });

        it('should remove entry from array properties map list configurations matching target identities', async () => {
            mockGetDocPromise.mockResolvedValueOnce({
                exists: () => true,
                data: () => ({ medias: [], members: [{ id: 'u1' }, { id: 'u2' }] }),
            });

            const result = await firstValueFrom(service.removeMember('w1', 'u1').pipe(take(1)));
            expect(result).toBe(true);
            expect(mockUpdateDocPromise).toHaveBeenCalled();
        });

        it('should return false if processing operations catch execution errors', async () => {
            mockGetDocPromise.mockRejectedValueOnce(new Error('Fatal Network Error'));

            const result = await firstValueFrom(service.removeMember('w1', 'u1').pipe(take(1)));
            expect(result).toBe(false);
        });
    });

    describe('addNewMembers', () => {
        it('should merge additional targets tracking blocks directly onto historical snapshot arrays', async () => {
            mockGetDocPromise.mockResolvedValueOnce({
                exists: () => true,
                data: () => ({ medias: [], members: [{ id: 'u1' }] }),
            });

            const result = await firstValueFrom(
                service.addNewMembers('w1', [{ id: 'u2' } as Member]),
            );
            expect(result).toBe(true);
            expect(mockUpdateDocPromise).toHaveBeenCalled();
        });

        it('should return false if collection query operations miss current matching file structures', async () => {
            mockGetDocPromise.mockResolvedValueOnce({ exists: () => false, data: () => ({}) });

            const result = await firstValueFrom(service.addNewMembers('w1', []));
            expect(result).toBe(false);
        });
    });
});
