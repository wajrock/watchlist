import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { signal } from '@angular/core';
import { watchlistGuard } from './watchlist.guard';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { WatchlistService } from '../../../shared/services/watchlist/watchlist.service';

describe('watchlistGuard', () => {
    let userSubject$: BehaviorSubject<any>;
    let watchlistsSubject$: BehaviorSubject<any[] | undefined>;
    let activeIdSignal = signal<string | null>(null);

    let mockAuthService: any;
    let mockWatchlistService: any;

    beforeEach(() => {
        userSubject$ = new BehaviorSubject<any>(null);
        watchlistsSubject$ = new BehaviorSubject<any[] | undefined>(undefined);
        activeIdSignal = signal<string | null>(null);

        mockAuthService = {
            user$: userSubject$.asObservable(),
        };

        mockWatchlistService = {
            watchlists$: watchlistsSubject$.asObservable(),
            activeId: activeIdSignal,
            setActiveId: vi.fn(),
        };

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                { provide: WatchlistService, useValue: mockWatchlistService },
            ],
        });
    });

    it('should return true if user has no watchlists', async () => {
        userSubject$.next({ uid: 'user123' });
        watchlistsSubject$.next([]);

        const result = await TestBed.runInInjectionContext(() =>
            watchlistGuard({} as any, {} as any),
        );

        expect(result).toBe(true);
        expect(mockWatchlistService.setActiveId).not.toHaveBeenCalled();
    });

    it('should return true and NOT change active ID if current active ID is still a member of the list', async () => {
        const mockLists = [{ uidWatchlist: 'list-A' }, { uidWatchlist: 'list-B' }];
        userSubject$.next({ uid: 'user123' });
        watchlistsSubject$.next(mockLists);
        activeIdSignal.set('list-B');

        const result = await TestBed.runInInjectionContext(() =>
            watchlistGuard({} as any, {} as any),
        );

        expect(result).toBe(true);
        expect(mockWatchlistService.setActiveId).not.toHaveBeenCalled();
    });

    it('should set the first watchlist as active if currentId is missing or user is no longer a member', async () => {
        const mockLists = [{ uidWatchlist: 'list-A' }, { uidWatchlist: 'list-B' }];
        userSubject$.next({ uid: 'user123' });
        watchlistsSubject$.next(mockLists);
        activeIdSignal.set('list-C');

        const result = await TestBed.runInInjectionContext(() =>
            watchlistGuard({} as any, {} as any),
        );

        expect(result).toBe(true);
        expect(mockWatchlistService.setActiveId).toHaveBeenCalledWith('list-A');
    });
});
