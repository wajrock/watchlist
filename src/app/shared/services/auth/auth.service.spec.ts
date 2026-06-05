import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { EnvironmentInjector } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, updateProfile } from '@angular/fire/auth';
import { Firestore, setDoc, docData } from '@angular/fire/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Subject, firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

const mockAuthStateSubject = new Subject<any>();
const mockFirestoreState = {
    querySnapshotEmpty: true,
};

vi.mock('@angular/fire/auth', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@angular/fire/auth')>();
    return {
        ...actual,
        authState: () => mockAuthStateSubject.asObservable(),
        signInWithEmailAndPassword: vi.fn(),
        signOut: vi.fn(),
        updateProfile: vi.fn(),
    };
});

vi.mock('@angular/fire/firestore', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@angular/fire/firestore')>();
    return {
        ...actual,
        collection: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        limit: vi.fn(),
        setDoc: vi.fn(),
        getDocs: vi.fn(() => Promise.resolve({ empty: mockFirestoreState.querySnapshotEmpty })),
        docData: vi.fn(() => new Subject().asObservable()),
    };
});

vi.mock('firebase/auth', async (importOriginal) => {
    const actual = await importOriginal<typeof import('firebase/auth')>();
    return {
        ...actual,
        createUserWithEmailAndPassword: vi.fn().mockResolvedValue({
            user: { uid: 'new-user-123' },
        }),
    };
});

vi.mock('firebase/firestore', async (importOriginal) => {
    const actual = await importOriginal<typeof import('firebase/firestore')>();
    return {
        ...actual,
        doc: vi.fn(),
    };
});

describe('AuthService', () => {
    let service: AuthService;
    let mockRouter: any;
    let mockAuth: any;
    let mockFirestore: any;

    beforeEach(() => {
        mockRouter = { navigate: vi.fn() };
        mockAuth = {};
        mockFirestore = {};

        const store: Record<string, string> = { activeWatchlistId: 'id-123' };
        vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
            delete store[key];
        });

        TestBed.configureTestingModule({
            providers: [
                AuthService,
                { provide: Router, useValue: mockRouter },
                { provide: Auth, useValue: mockAuth },
                { provide: Firestore, useValue: mockFirestore },
                { provide: EnvironmentInjector, useValue: { runInContext: (fn: any) => fn() } },
            ],
        });

        service = TestBed.inject(AuthService);
        mockFirestoreState.querySnapshotEmpty = true;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('user$ Observable Stream', () => {
        it('should emit null if the firebase auth state returns unauthenticated', async () => {
            const userPromise = firstValueFrom(service.user$);
            mockAuthStateSubject.next(null);

            const result = await userPromise;
            expect(result).toBeNull();
        });

        it('should pipe document details from firestore if an authorized user is present', async () => {
            const mockUserDocument = { uid: 'user789', username: 'johnny', name: 'John' };
            const docDataSubject$ = new Subject<any>();
            vi.mocked(docData).mockReturnValue(docDataSubject$.asObservable());

            const userPromise = firstValueFrom(service.user$);
            mockAuthStateSubject.next({ uid: 'user789' });
            docDataSubject$.next(mockUserDocument);

            const result = await userPromise;
            expect(result).toEqual(mockUserDocument);
        });
    });

    describe('checkUserExists()', () => {
        it('should return false instantly if username string provided is completely empty', async () => {
            const result = await service.checkUserExists('');
            expect(result).toBe(false);
        });

        it('should return true if query matching username has results', async () => {
            mockFirestoreState.querySnapshotEmpty = false;
            const result = await service.checkUserExists('existing_user');
            expect(result).toBe(true);
        });

        it('should return false if query matching username returns empty tracking arrays', async () => {
            mockFirestoreState.querySnapshotEmpty = true;
            const result = await service.checkUserExists('unknown_user');
            expect(result).toBe(false);
        });
    });

    describe('signUp()', () => {
        it('should proceed through credential creation, update profiles, and sync store document maps', async () => {
            await service.signUp('clark_kent', 'superpassword', 'Clark Kent');

            expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
                mockAuth,
                'clark_kent@watchlist.local',
                'superpassword',
            );
            expect(updateProfile).toHaveBeenCalledWith({ uid: 'new-user-123' } as any, {
                displayName: 'Clark Kent',
            });
            expect(setDoc).toHaveBeenCalled();
        });

        it('should rethrow errors encountered downstream inside execution try blocks', async () => {
            vi.mocked(createUserWithEmailAndPassword).mockRejectedValueOnce(
                new Error('Weak Password Error'),
            );

            await expect(service.signUp('err', '123', 'Name')).rejects.toThrow(
                'Weak Password Error',
            );
        });
    });

    describe('login()', () => {
        it('should invoke native firebase signIn client procedures using mapped local domain formatting credentials', async () => {
            await service.login('bruce_wayne', 'batman123');

            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
                mockAuth,
                'bruce_wayne@watchlist.local',
                'batman123',
            );
        });
    });

    describe('logout()', () => {
        it('should dispatch firebase signout triggers and completely clear local session keys', async () => {
            await service.logout();

            expect(signOut).toHaveBeenCalledWith(mockAuth);
            expect(localStorage.removeItem).toHaveBeenCalledWith('activeWatchlistId');
        });
    });
});
