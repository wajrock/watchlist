import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { firstValueFrom, Observable, of } from 'rxjs';
import { ApiMedia, GRADE, Member, WatchlistMediaAdd } from '../../models/firebase.models';
import { CollectionService } from './collection.service';

let mockCollectionDataObservable: Observable<any> = of([]);
let mockGetDocsPromise = Promise.resolve({ docs: [] as any[] });
let mockGetDocPromise = Promise.resolve({ exists: () => false, data: () => ({}) });
let mockAddDocPromise = Promise.resolve({ id: 'new-doc-id' });
let mockUpdateDocPromise = Promise.resolve();

vi.mock('firebase/firestore', async (importOriginal) => {
    const actual = await importOriginal<typeof import('firebase/firestore')>();
    return {
        ...actual,
        collection: vi.fn(),
        doc: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        arrayUnion: vi.fn((val) => val),
        addDoc: vi.fn(() => mockAddDocPromise),
        getDocs: vi.fn(() => mockGetDocsPromise),
        getDoc: vi.fn(() => mockGetDocPromise),
        updateDoc: vi.fn(() => mockUpdateDocPromise),
    };
});

vi.mock('@angular/fire/firestore', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@angular/fire/firestore')>();
    return {
        ...actual,
        collectionData: vi.fn(() => mockCollectionDataObservable),
    };
});

describe('CollectionService', () => {
    let service: CollectionService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [CollectionService, { provide: Firestore, useValue: {} }],
        });
        service = TestBed.inject(CollectionService);

        mockCollectionDataObservable = of([]);
        mockGetDocsPromise = Promise.resolve({ docs: [] as any[] });
        mockGetDocPromise = Promise.resolve({ exists: () => false, data: () => ({}) } as any);
        mockAddDocPromise = Promise.resolve({ id: 'new-doc-id' });
        mockUpdateDocPromise = Promise.resolve();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getWatchlists', () => {
        it('should return watchlists array from collectionData', async () => {
            const mockLists = [{ id: '1', name: 'List 1' }];
            mockCollectionDataObservable = of(mockLists);

            const result = await firstValueFrom(service.getWatchlists('user123'));
            expect(result).toEqual(mockLists);
        });
    });

    describe('addWatchlist', () => {
        it('should create a watchlist and map the reference id', async () => {
            const members: Member[] = [{ id: 'u1', invitationAccepted: true }];
            const result = await firstValueFrom(service.addWatchlist('Movies', members));

            expect(result.uidWatchlist).toBe('new-doc-id');
            expect(result.name).toBe('Movies');
            expect(result.members).toEqual(members);
        });
    });

    describe('checkIfMediaAlreadyInDB', () => {
        it('should return document id if media exists in database', async () => {
            mockGetDocsPromise = Promise.resolve({
                docs: [{ id: 'media-existing-id' }],
            } as any);

            const result = await firstValueFrom(service.checkIfMediaAlreadyInDB(123, 'movie'));
            expect(result).toBe('media-existing-id');
        });

        it('should return null if media does not exist in database', async () => {
            mockGetDocsPromise = Promise.resolve({ docs: [] } as any);

            const result = await firstValueFrom(service.checkIfMediaAlreadyInDB(123, 'movie'));
            expect(result).toBeNull();
        });
    });

    describe('addMediaToWatchlist', () => {
        const apiMedia: ApiMedia = { id: 123, type: 'movie', title: 'Test' } as any;
        const mediaInfos: WatchlistMediaAdd = {
            isSeen: false,
            grade: GRADE.LIKE,
            addedByUserId: 'user123',
            dateAddedToWatchlist: '2026-06-05T20:00:00.000Z',
        };

        it('should update watchlist directly if media already exists in database', async () => {
            mockGetDocsPromise = Promise.resolve({ docs: [{ id: 'existing-id' }] } as any);

            const result = await firstValueFrom(
                service.addMediaToWatchlist('w1', apiMedia, mediaInfos),
            );
            expect(result).toBe(true);
        });

        it('should create media document first then update watchlist if media is new', async () => {
            mockGetDocsPromise = Promise.resolve({ docs: [] } as any);
            mockAddDocPromise = Promise.resolve({ id: 'created-media-id' });

            const result = await firstValueFrom(
                service.addMediaToWatchlist('w1', apiMedia, mediaInfos),
            );
            expect(result).toBe(true);
        });

        it('should return false and handle error if any operation fails', async () => {
            mockGetDocsPromise = Promise.reject(new Error('Firebase Error'));

            const result = await firstValueFrom(
                service.addMediaToWatchlist('w1', apiMedia, mediaInfos),
            );
            expect(result).toBe(false);
        });
    });

    describe('updateMediaSeenStatus', () => {
        it('should return false if watchlist document does not exist', async () => {
            mockGetDocPromise = Promise.resolve({ exists: () => false } as any);

            const result = await firstValueFrom(service.updateMediaSeenStatus('w1', 'm1', true));
            expect(result).toBe(false);
        });

        it('should update matching media seen status inside array', async () => {
            mockGetDocPromise = Promise.resolve({
                exists: () => true,
                data: () => ({
                    medias: [
                        { idMedia: 'm1', isSeen: false },
                        { idMedia: 'm2', isSeen: false },
                    ],
                }),
            } as any);

            const result = await firstValueFrom(service.updateMediaSeenStatus('w1', 'm1', true));
            expect(result).toBe(true);
        });

        it('should return false if internal update execution throws an error', async () => {
            mockGetDocPromise = Promise.reject(new Error('Network Crash'));

            const result = await firstValueFrom(service.updateMediaSeenStatus('w1', 'm1', true));
            expect(result).toBe(false);
        });
    });

    describe('updateMediaGrade', () => {
        it('should return false if watchlist document does not exist', async () => {
            mockGetDocPromise = Promise.resolve({ exists: () => false } as any);

            const result = await firstValueFrom(service.updateMediaGrade('w1', 'm1', GRADE.LOVE));
            expect(result).toBe(false);
        });

        it('should update media grade matching specified target identifier', async () => {
            mockGetDocPromise = Promise.resolve({
                exists: () => true,
                data: () => ({ medias: [{ idMedia: 'm1', grade: GRADE.LIKE }] }),
            } as any);

            const result = await firstValueFrom(service.updateMediaGrade('w1', 'm1', GRADE.LOVE));
            expect(result).toBe(true);
        });
    });

    describe('updateMemberInvitation', () => {
        it('should return false if watchlist document does not exist', async () => {
            mockGetDocPromise = Promise.resolve({ exists: () => false } as any);

            const result = await firstValueFrom(service.updateMemberInvitation('w1', 'u1', true));
            expect(result).toBe(false);
        });

        it('should accept invitation and set accepted flag to true when joinWatchlist is true', async () => {
            mockGetDocPromise = Promise.resolve({
                exists: () => true,
                data: () => ({ medias: [], members: [{ id: 'u1', invitationAccepted: false }] }),
            } as any);

            const result = await firstValueFrom(service.updateMemberInvitation('w1', 'u1', true));
            expect(result).toBe(true);
        });

        it('should remove member from array completely when joinWatchlist is false', async () => {
            mockGetDocPromise = Promise.resolve({
                exists: () => true,
                data: () => ({ medias: [], members: [{ id: 'u1' }, { id: 'u2' }] }),
            } as any);

            const result = await firstValueFrom(service.updateMemberInvitation('w1', 'u1', false));
            expect(result).toBe(true);
        });
    });

    describe('removeMediaFromWatchlist', () => {
        it('should return false if watchlist document does not exist', async () => {
            mockGetDocPromise = Promise.resolve({ exists: () => false } as any);

            const result = await firstValueFrom(service.removeMediaFromWatchlist('w1', 'm1'));
            expect(result).toBe(false);
        });

        it('should filter out targeted media entries and submit clean array map updates', async () => {
            mockGetDocPromise = Promise.resolve({
                exists: () => true,
                data: () => ({ medias: [{ idMedia: 'm1' }, { idMedia: 'm2' }] }),
            } as any);

            const result = await firstValueFrom(service.removeMediaFromWatchlist('w1', 'm1'));
            expect(result).toBe(true);
        });

        it('should fall back to empty medias tracking configuration array if target document contains null properties', async () => {
            mockGetDocPromise = Promise.resolve({
                exists: () => true,
                data: () => ({ medias: null }),
            } as any);

            const result = await firstValueFrom(service.removeMediaFromWatchlist('w1', 'm1'));
            expect(result).toBe(true);
        });

        it('should return false if an exception is caught during operations', async () => {
            mockGetDocPromise = Promise.reject(new Error('Deletion Failure'));

            const result = await firstValueFrom(service.removeMediaFromWatchlist('w1', 'm1'));
            expect(result).toBe(false);
        });
    });
});
