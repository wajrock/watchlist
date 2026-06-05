import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Subject } from 'rxjs';
import { authGuard } from './auth.guard';
import { firstValueFrom } from 'rxjs';

const authStateSubject$ = new Subject<any>();
vi.mock('@angular/fire/auth', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@angular/fire/auth')>();
    return {
        ...actual,
        authState: () => authStateSubject$.asObservable(),
    };
});

describe('authGuard', () => {
    let mockRouter: any;
    let mockAuth: any;
    const dummyUrlTree = {} as UrlTree;

    beforeEach(() => {
        mockRouter = {
            parseUrl: vi.fn().mockReturnValue(dummyUrlTree),
        };
        mockAuth = {};

        TestBed.configureTestingModule({
            providers: [
                { provide: Auth, useValue: mockAuth },
                { provide: Router, useValue: mockRouter },
            ],
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return true if the user is authenticated', async () => {
        const mockUser = { uid: 'user123', email: 'test@watchlist.com' };

        const guardPromise = TestBed.runInInjectionContext(() => {
            const result = authGuard({} as any, {} as any);
            return typeof result === 'boolean'
                ? Promise.resolve(result)
                : firstValueFrom(result as any);
        });

        authStateSubject$.next(mockUser);

        const finalResult = await guardPromise;

        expect(finalResult).toBe(true);
        expect(mockRouter.parseUrl).not.toHaveBeenCalled();
    });

    it('should return an UrlTree to redirect to /welcome if the user is NOT authenticated', async () => {
        const guardPromise = TestBed.runInInjectionContext(() => {
            const result = authGuard({} as any, {} as any);
            return typeof result === 'boolean'
                ? Promise.resolve(result)
                : firstValueFrom(result as any);
        });

        authStateSubject$.next(null);

        const finalResult = await guardPromise;

        expect(finalResult).toBe(dummyUrlTree);
        expect(mockRouter.parseUrl).toHaveBeenCalledWith('/welcome');
    });
});
