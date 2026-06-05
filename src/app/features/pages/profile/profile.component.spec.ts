import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { WatchlistService } from '../../../shared/services/watchlist/watchlist.service';
import { CollectionService } from '../../../shared/services/collection/collection.service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { CONTENT_TYPE, PROFILE_SECTION_VIEW } from '../../../shared/models/models';
import { GRADE } from '../../../shared/models/firebase.models';
import { TOAST_TYPE } from '../../../shared/models/toast.model';

describe('ProfileComponent', () => {
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
    let router: Router;
    let mockAuthService: any;
    let mockWatchlistService: any;
    let mockCollectionService: any;
    let mockToastService: any;

    let userSubject$: BehaviorSubject<any>;
    let invitationsSubject$: BehaviorSubject<any[]>;
    let watchlistsSubject$: BehaviorSubject<any[]>;
    let updateInvitationSubject$: BehaviorSubject<boolean>;

    const mockMedias = [
        { grade: GRADE.LIKE, mediaDetails: { type: CONTENT_TYPE.MOVIE } },
        { grade: GRADE.LOVE, mediaDetails: { type: CONTENT_TYPE.TV } },
    ];

    beforeEach(async () => {
        userSubject$ = new BehaviorSubject<any>({ uid: 'user123', name: 'John Doe' });
        invitationsSubject$ = new BehaviorSubject<any[]>([]);
        watchlistsSubject$ = new BehaviorSubject<any[]>([]);
        updateInvitationSubject$ = new BehaviorSubject<boolean>(true);

        mockAuthService = {
            user$: userSubject$.asObservable(),
            logout: vi.fn().mockResolvedValue(null),
        };

        mockWatchlistService = {
            watchlistInvitations$: invitationsSubject$.asObservable(),
            watchlists$: watchlistsSubject$.asObservable(),
            getCollectionByIds: vi.fn().mockReturnValue(of([])),
            enrichWatchlist: vi.fn().mockReturnValue({ medias: mockMedias }),
        };

        mockCollectionService = {
            updateMemberInvitation: vi
                .fn()
                .mockReturnValue(updateInvitationSubject$.asObservable()),
        };

        mockToastService = {
            show: vi.fn(),
        };

        await TestBed.configureTestingModule({
            imports: [ProfileComponent],
            providers: [
                provideRouter([]),
                { provide: AuthService, useValue: mockAuthService },
                { provide: WatchlistService, useValue: mockWatchlistService },
                { provide: CollectionService, useValue: mockCollectionService },
                { provide: ToastService, useValue: mockToastService },
            ],
        }).compileComponents();

        router = TestBed.inject(Router);
        vi.spyOn(router, 'navigate').mockResolvedValue(true);

        fixture = TestBed.createComponent(ProfileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create with initial default values', () => {
        expect(component).toBeTruthy();
        expect(component.view()).toBeNull();
        expect(component.activeView()).toBe(PROFILE_SECTION_VIEW.HISTORY);
    });

    describe('Navigation & Auth Actions', () => {
        it('should navigate back to root view', () => {
            component.goBack();
            expect(router.navigate).toHaveBeenCalledWith(['/'], { replaceUrl: true });
        });

        it('should logout successfully and redirect to welcome', async () => {
            await component.logOut();
            expect(mockAuthService.logout).toHaveBeenCalled();
            expect(router.navigate).toHaveBeenCalledWith(['/welcome'], { replaceUrl: true });
        });
    });

    describe('Computed Medias Mapping & Counting', () => {
        it('should handle computed counts correctly when medias are loaded', () => {
            watchlistsSubject$.next([{ medias: [{ idMedia: '1' }], members: [{ id: 'u1' }] }]);
            fixture.detectChanges();

            expect(component.movieMediasCount()).toBe(1);
            expect(component.seriesMediasCount()).toBe(1);
            expect(component.likeMediasCount()).toBe(1);
            expect(component.loveMediasCount()).toBe(1);
        });

        it('should dynamically adapt activeView according to invitations presence', () => {
            invitationsSubject$.next([{ idInvitation: 'inv1' }]);
            fixture.detectChanges();
            expect(component.activeView()).toBe(PROFILE_SECTION_VIEW.INVITATIONS);

            component.view.set(PROFILE_SECTION_VIEW.HISTORY);
            expect(component.activeView()).toBe(PROFILE_SECTION_VIEW.HISTORY);
        });

        it('should filter medias collection depending on historyFilter configuration', () => {
            watchlistsSubject$.next([{ medias: [{ idMedia: '1' }], members: [{ id: 'u1' }] }]);
            fixture.detectChanges();

            component.historyFilter.set(CONTENT_TYPE.MOVIE);
            expect(component.filteredMedias().length).toBe(1);

            component.historyFilter.set(GRADE.LIKE);
            expect(component.filteredMedias().length).toBe(1);
        });

        it('should return empty filteredMedias array if signal contains no items', () => {
            watchlistsSubject$.next([]);
            fixture.detectChanges();
            expect(component.filteredMedias()).toEqual([]);
        });
    });

    describe('Invitations Handler', () => {
        it('should trigger error toast if active user is missing during operation', () => {
            userSubject$.next(null);
            fixture.detectChanges();

            component.handleInvitation('watchlist-A', true);

            expect(mockToastService.show).toHaveBeenCalledWith({
                type: TOAST_TYPE.ERROR,
                message: 'Un problème est survenu',
            });
            expect(mockCollectionService.updateMemberInvitation).not.toHaveBeenCalled();
        });

        it('should dispatch success toast if invitation acceptance resolves correctly', () => {
            component.handleInvitation('watchlist-A', true);

            expect(mockCollectionService.updateMemberInvitation).toHaveBeenCalledWith(
                'watchlist-A',
                'user123',
                true,
            );
            expect(mockToastService.show).toHaveBeenCalledWith({
                type: TOAST_TYPE.SUCCESS,
                message: 'Invitation acceptée',
            });
        });

        it('should dispatch success toast if invitation denial resolves correctly', () => {
            component.handleInvitation('watchlist-B', false);

            expect(mockCollectionService.updateMemberInvitation).toHaveBeenCalledWith(
                'watchlist-B',
                'user123',
                false,
            );
            expect(mockToastService.show).toHaveBeenCalledWith({
                type: TOAST_TYPE.SUCCESS,
                message: 'Invitation refusée',
            });
        });

        it('should dispatch error toast if subscription response resolves false', () => {
            updateInvitationSubject$.next(false);

            component.handleInvitation('watchlist-C', true);

            expect(mockToastService.show).toHaveBeenCalledWith({
                type: TOAST_TYPE.ERROR,
                message: 'Un problème est survenu',
            });
        });
    });
});
