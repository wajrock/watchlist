import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { of, firstValueFrom, Observable } from 'rxjs';
import { UsersService } from './users.service';
import { User } from '../../models/firebase.models';

let mockCollectionDataObservable: Observable<any> = of([]);
let mockAddDocPromise: Promise<any> = Promise.resolve({ id: 'new-user-id' });

vi.mock('@angular/fire/firestore', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@angular/fire/firestore')>();
    return {
        ...actual,
        collection: vi.fn(),
        collectionData: vi.fn(() => mockCollectionDataObservable),
        addDoc: vi.fn(() => mockAddDocPromise),
    };
});

describe('UsersService', () => {
    let service: UsersService;

    beforeEach(() => {
        const store: Record<string, string> = {};
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => store[key] || null);
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
            store[key] = value;
        });

        TestBed.configureTestingModule({
            providers: [UsersService, { provide: Firestore, useValue: {} }],
        });
        service = TestBed.inject(UsersService);

        mockCollectionDataObservable = of([]);
        mockAddDocPromise = Promise.resolve({ id: 'new-user-id' });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getUsernames', () => {
        it('should map collection data into an array of usernames', async () => {
            const mockUsers = [
                { uid: '1', username: 'alice', name: 'Alice' },
                { uid: '2', username: 'bob', name: 'Bob' },
            ];
            mockCollectionDataObservable = of(mockUsers);

            const result = await firstValueFrom(service.getUsernames());
            expect(result).toEqual(['alice', 'bob']);
        });
    });

    describe('getAllUsers', () => {
        it('should map clean user model fields excluding passwords or extra properties', async () => {
            const mockRawData = [{ uid: '1', username: 'alice', name: 'Alice', extra: 'ignored' }];
            mockCollectionDataObservable = of(mockRawData);

            const result = await firstValueFrom(service.getAllUsers());
            expect(result).toEqual([{ uid: '1', name: 'Alice', username: 'alice' }]);
        });
    });

    describe('addUser', () => {
        it('should push a new user structure to storage and map structural returns', async () => {
            const result = await firstValueFrom(service.addUser('clark', 'Clark Kent', 'pwd'));
            expect(result).toEqual({
                uid: 'new-user-id',
                name: 'Clark Kent',
                username: 'clark',
            });
        });
    });

    describe('getUser', () => {
        it('should locate the correct matching object reference given a user ID criteria', async () => {
            const mockUsers = [
                { uid: '1', username: 'alice', name: 'Alice' },
                { uid: '2', username: 'bob', name: 'Bob' },
            ] as User[];
            mockCollectionDataObservable = of(mockUsers);

            const result = await firstValueFrom(service.getUser('2'));
            expect(result).toEqual({ uid: '2', username: 'bob', name: 'Bob' });
        });

        it('should return undefined if no matching object reference can be found', async () => {
            mockCollectionDataObservable = of([]);
            const result = await firstValueFrom(service.getUser('999'));
            expect(result).toBeUndefined();
        });
    });

    describe('getLoggedUser', () => {
        it('should parse and return the saved object data from active browser local stores', () => {
            const mockStoredUser = { uid: '1', username: 'alice', name: 'Alice' };
            localStorage.setItem('user', JSON.stringify(mockStoredUser));

            const result = service.getLoggedUser();
            expect(result).toEqual(mockStoredUser);
        });

        it('should output null directly if browser local stores contain no match items', () => {
            const result = service.getLoggedUser();
            expect(result).toBeNull();
        });
    });
});
