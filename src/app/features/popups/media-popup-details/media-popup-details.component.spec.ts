import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaPopupDetailsComponent } from './media-popup-details.component';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { TmdbService } from '../../../shared/services/tmdb/tmdb.service';
import { CollectionService } from '../../../shared/services/collection/collection.service';
import { UsersService } from '../../../shared/services/users/users.service';
import { WatchlistService } from '../../../shared/services/watchlist/watchlist.service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { Subject, of } from 'rxjs';
import { CONTENT_TYPE, PAGE_VIEW_TYPE, ACTIONS_VIEW } from '../../../shared/models/models';
import { GRADE } from '../../../shared/models/firebase.models';
import { TOAST_TYPE } from '../../../shared/models/toast.model';
import { Component, signal } from '@angular/core';

@Component({
    selector: 'app-media-popup-details-mock',
    template: '',
    standalone: true,
})
class MediaPopupDetailsMockComponent extends MediaPopupDetailsComponent {}

describe('MediaPopupDetailsComponent', () => {
    let component: MediaPopupDetailsComponent;
    let fixture: ComponentFixture<MediaPopupDetailsMockComponent>;

    let mockAuthService: any;
    let mockTmdbService: any;
    let mockCollectionService: any;
    let mockUsersService: any;
    let mockWatchlistService: any;
    let mockToastService: any;

    let userSubject$: Subject<any>;
    let activeWatchlistSubject$: Subject<any>;
    let addMediaSubject$: Subject<any>;
    let removeMediaSubject$: Subject<any>;
    let updateGradeSubject$: Subject<any>;
    let updateSeenSubject$: Subject<any>;

    let mockDetailsData: any;

    const mockBaseItem = { id: 111, type: CONTENT_TYPE.MOVIE, title: 'Inception' };
    const mockEnrichedItem = {
        mediaDetails: {
            id: 222,
            type: CONTENT_TYPE.MOVIE,
            title: 'Avatar',
            genres: [],
            videos: [],
        },
        uidMedia: 'm-999',
        isSeen: true,
        grade: GRADE.LIKE,
        addedByUser: { uid: 'u-777' },
    };

    beforeEach(async () => {
        userSubject$ = new Subject();
        activeWatchlistSubject$ = new Subject();
        addMediaSubject$ = new Subject();
        removeMediaSubject$ = new Subject();
        updateGradeSubject$ = new Subject();
        updateSeenSubject$ = new Subject();

        mockDetailsData = { id: 111, title: 'Default', genres: [], videos: [] };

        mockAuthService = { user$: userSubject$.asObservable() };
        mockTmdbService = {
            getFullContext: vi.fn(() =>
                of({ id: 111, name: 'Full Context', genres: [], videos: [] }),
            ),
        };
        mockCollectionService = {
            addMediaToWatchlist: vi.fn(() => addMediaSubject$.asObservable()),
            removeMediaFromWatchlist: vi.fn(() => removeMediaSubject$.asObservable()),
            updateMediaGrade: vi.fn(() => updateGradeSubject$.asObservable()),
            updateMediaSeenStatus: vi.fn(() => updateSeenSubject$.asObservable()),
        };
        mockUsersService = { getUser: vi.fn(() => of({ name: 'John Doe' })) };
        mockWatchlistService = { activeWatchlist$: activeWatchlistSubject$.asObservable() };
        mockToastService = { show: vi.fn() };

        await TestBed.configureTestingModule({
            imports: [MediaPopupDetailsMockComponent],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                { provide: TmdbService, useValue: mockTmdbService },
                { provide: CollectionService, useValue: mockCollectionService },
                { provide: UsersService, useValue: mockUsersService },
                { provide: WatchlistService, useValue: mockWatchlistService },
                { provide: ToastService, useValue: mockToastService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(MediaPopupDetailsMockComponent);
        component = fixture.componentInstance;

        fixture.componentRef.setInput('contentType', CONTENT_TYPE.MOVIE);
        fixture.componentRef.setInput('view', PAGE_VIEW_TYPE.SEARCH);
        fixture.componentRef.setInput('itemInfos', mockBaseItem);

        vi.spyOn(component, 'mediaDetails').mockImplementation(() => mockDetailsData);

        fixture.detectChanges();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should create with baseline signal defaults', () => {
        expect(component).toBeTruthy();
        expect(component.showTrailer()).toBe(false);
        expect(component.actionsView()).toBe(ACTIONS_VIEW.DEFAULT);
    });

    describe('rxResource & Computed Data Mapping', () => {
        it('should bypass data loads if input fields resolve to null states', () => {
            fixture.componentRef.setInput('itemInfos', null);
            mockDetailsData = null;
            fixture.detectChanges();
            expect(component.mediaDetails()).toBeNull();
        });

        it('should query tmdb context endpoints if views do not equal watchlist targets', () => {
            fixture.componentRef.setInput('view', PAGE_VIEW_TYPE.SEARCH);
            fixture.componentRef.setInput('itemInfos', mockBaseItem);
            fixture.detectChanges();

            expect(component.mediaDetails()).toBeDefined();
        });

        it('should extract direct synchronous structures if view matches watchlist contexts', () => {
            fixture.componentRef.setInput('view', PAGE_VIEW_TYPE.WATCHLIST);
            fixture.componentRef.setInput('itemInfos', mockEnrichedItem);
            mockDetailsData = mockEnrichedItem.mediaDetails;
            fixture.detectChanges();

            expect(component.mediaDetails()).toEqual(mockEnrichedItem.mediaDetails);
        });

        it('should resolve user metadata profiles and compute matching owner names', () => {
            fixture.componentRef.setInput('view', PAGE_VIEW_TYPE.WATCHLIST);
            fixture.componentRef.setInput('itemInfos', mockEnrichedItem);
            fixture.detectChanges();

            expect(mockUsersService.getUser).toHaveBeenCalledWith('u-777');
            expect(component.ownerName()).toBe('John Doe');
        });
    });

    describe('mediaSeenStatus Computed evaluation', () => {
        it('should override native statuses if runtime UI modifications occur', () => {
            component.uiStatusChanged.set(true);
            expect(component.mediaSeenStatus()).toBe(true);

            component.uiStatusChanged.set(false);
            expect(component.mediaSeenStatus()).toBe(false);
        });

        it('should map false values if requested environments do not match watchlists', () => {
            fixture.componentRef.setInput('view', PAGE_VIEW_TYPE.SEARCH);
            expect(component.mediaSeenStatus()).toBe(false);
        });

        it('should capture baseline properties from enriched datasets in watchlist states', () => {
            fixture.componentRef.setInput('view', PAGE_VIEW_TYPE.WATCHLIST);
            fixture.componentRef.setInput('itemInfos', mockEnrichedItem);
            fixture.detectChanges();
            expect(component.mediaSeenStatus()).toBe(true);
        });
    });

    describe('mediaGrade Computed evaluation', () => {
        it('should override computed properties if temporary active states exist', () => {
            component.uiGradeChanged.set(GRADE.LOVE);
            expect(component.mediaGrade()).toBe(GRADE.LOVE);
        });

        it('should yield NO_GRADE placeholders if payload references are absent', () => {
            fixture.componentRef.setInput('itemInfos', null);
            fixture.detectChanges();
            expect(component.mediaGrade()).toBe(GRADE.NO_GRADE);
        });
    });

    describe('Interactive Actions', () => {
        it('should bubble termination workflows via close output hooks on onClose', () => {
            const emitSpy = vi.spyOn(component.close, 'emit');
            component.onClose();
            expect(emitSpy).toHaveBeenCalled();
        });

        it('should modify view signal states appropriately via changeActionsView', () => {
            component.changeActionsView(ACTIONS_VIEW.GRADES);
            expect(component.actionsView()).toBe(ACTIONS_VIEW.GRADES);
        });
    });

    describe('addToCollection', () => {
        it('should return early if watchlist identitiers cannot be matched', () => {
            activeWatchlistSubject$.next(null);
            component.addToCollection();
            expect(mockCollectionService.addMediaToWatchlist).not.toHaveBeenCalled();
        });

        it('should fire error toasts if backend requests map back negative returns', () => {
            activeWatchlistSubject$.next({ uidWatchlist: 'w-123' });
            userSubject$.next({ uid: 'u-abc' });
            fixture.detectChanges();

            component.addToCollection();
            addMediaSubject$.next(false);

            expect(mockToastService.show).toHaveBeenCalledWith({
                type: TOAST_TYPE.ERROR,
                message: 'Un problème est survenu',
            });
        });

        it('should dispatch successes and communicate events upon positive network callbacks', () => {
            const addedSpy = vi.spyOn(component.addedToCollection, 'emit');
            activeWatchlistSubject$.next({ uidWatchlist: 'w-123' });
            userSubject$.next({ uid: 'u-abc' });
            fixture.detectChanges();

            component.addToCollection();
            addMediaSubject$.next(true);

            expect(addedSpy).toHaveBeenCalled();
            expect(mockToastService.show).toHaveBeenCalledWith({
                type: TOAST_TYPE.SUCCESS,
                message: 'Ajouté à la watchlist',
            });
        });
    });

    describe('removeFromCollection', () => {
        it('should exit immediately if active target links do not exist', () => {
            activeWatchlistSubject$.next(null);
            component.removeFromCollection();
            expect(mockCollectionService.removeMediaFromWatchlist).not.toHaveBeenCalled();
        });

        it('should push message errors if database delete processes fail', () => {
            activeWatchlistSubject$.next({ uidWatchlist: 'w-123' });
            fixture.componentRef.setInput('itemInfos', mockEnrichedItem);
            fixture.detectChanges();

            component.removeFromCollection();
            removeMediaSubject$.next(false);

            expect(mockToastService.show).toHaveBeenCalledWith({
                type: TOAST_TYPE.ERROR,
                message: 'Un problème est survenu',
            });
        });

        it('should execute output notify streams when removals return positive codes', () => {
            const removeSpy = vi.spyOn(component.removedFromCollection, 'emit');
            activeWatchlistSubject$.next({ uidWatchlist: 'w-123' });
            fixture.componentRef.setInput('itemInfos', mockEnrichedItem);
            fixture.detectChanges();

            component.removeFromCollection();
            removeMediaSubject$.next(true);

            expect(removeSpy).toHaveBeenCalled();
            expect(mockToastService.show).toHaveBeenCalledWith({
                type: TOAST_TYPE.SUCCESS,
                message: 'Supprimé de la watchlist',
            });
        });
    });

    describe('changeGrade', () => {
        it('should abort updates if active grades return invalid configurations', () => {
            component.uiGradeChanged.set(null);
            fixture.componentRef.setInput('itemInfos', null);
            fixture.detectChanges();

            component.changeGrade(GRADE.LIKE);
            expect(mockCollectionService.updateMediaGrade).not.toHaveBeenCalled();
        });

        it('should toggle selection targets back to NO_GRADE definitions if identical keys match', () => {
            activeWatchlistSubject$.next({ uidWatchlist: 'w-123' });
            fixture.componentRef.setInput('itemInfos', mockEnrichedItem);
            fixture.detectChanges();

            component.changeGrade(GRADE.LIKE);
            expect(mockCollectionService.updateMediaGrade).toHaveBeenCalledWith(
                'w-123',
                'm-999',
                GRADE.NO_GRADE,
            );
        });

        it('should fire failure configurations if update actions throw errors downstream', () => {
            activeWatchlistSubject$.next({ uidWatchlist: 'w-123' });
            fixture.componentRef.setInput('itemInfos', mockEnrichedItem);
            fixture.detectChanges();

            component.changeGrade(GRADE.LOVE);
            updateGradeSubject$.next(false);

            expect(mockToastService.show).toHaveBeenCalledWith({
                type: TOAST_TYPE.ERROR,
                message: 'Un problème est survenu',
            });
        });

        it('should lock operations down and clear modal frames upon successful payload entries', () => {
            activeWatchlistSubject$.next({ uidWatchlist: 'w-123' });
            fixture.componentRef.setInput('itemInfos', mockEnrichedItem);
            fixture.detectChanges();

            component.changeGrade(GRADE.LOVE);
            updateGradeSubject$.next(true);

            expect(component.uiGradeChanged()).toBe(GRADE.LOVE);
            expect(component.actionsView()).toBe(ACTIONS_VIEW.DEFAULT);
        });
    });

    describe('changeSeenStatus', () => {
        it('should intercept workflows early if tracking states equal null conditions', () => {
            component.uiStatusChanged.set(null);
            fixture.componentRef.setInput('view', PAGE_VIEW_TYPE.WATCHLIST);
            fixture.componentRef.setInput('itemInfos', null);
            fixture.detectChanges();

            component.changeSeenStatus();
            expect(mockCollectionService.updateMediaSeenStatus).not.toHaveBeenCalled();
        });

        it('should route directly into collection inclusions if views aren’t tracking watchlists', () => {
            const spy = vi.spyOn(component, 'addToCollection');
            fixture.componentRef.setInput('view', PAGE_VIEW_TYPE.SEARCH);
            fixture.detectChanges();

            component.changeSeenStatus();

            expect(component.uiStatusChanged()).toBe(true);
            expect(spy).toHaveBeenCalled();
        });

        it('should display error indicators if data updates error out inside watchlist contexts', () => {
            activeWatchlistSubject$.next({ uidWatchlist: 'w-123' });
            fixture.componentRef.setInput('view', PAGE_VIEW_TYPE.WATCHLIST);
            fixture.componentRef.setInput('itemInfos', mockEnrichedItem);
            fixture.detectChanges();

            component.changeSeenStatus();
            updateSeenSubject$.next(false);

            expect(mockToastService.show).toHaveBeenCalledWith({
                type: TOAST_TYPE.ERROR,
                message: 'Un problème est survenu',
            });
        });

        it('should toggle local cache identifiers upon successful backend state saves', () => {
            activeWatchlistSubject$.next({ uidWatchlist: 'w-123' });
            fixture.componentRef.setInput('view', PAGE_VIEW_TYPE.WATCHLIST);
            fixture.componentRef.setInput('itemInfos', mockEnrichedItem);
            fixture.detectChanges();

            component.changeSeenStatus();
            updateSeenSubject$.next(true);

            expect(component.uiStatusChanged()).toBe(false);
        });
    });
});
