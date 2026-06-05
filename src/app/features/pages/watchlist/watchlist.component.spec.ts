import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WatchlistComponent } from './watchlist.component';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { FilterService } from '../../../shared/services/filter/filter.service';
import { WatchlistService } from '../../../shared/services/watchlist/watchlist.service';
import { PopupService } from '../../../shared/services/popup/popup.service';
import { WatchlistMembersCountPipe } from '../../../shared/pipes/watchlist-members-count.pipe';
import { Subject, of } from 'rxjs';
import {
    CONTENT_TYPE,
    CONTENT_VIEW_TYPE,
    PAGE_VIEW_TYPE,
    POPUP,
} from '../../../shared/models/models';
import { Component, signal, ElementRef } from '@angular/core';

@Component({
    selector: 'app-watchlist-mock',
    template: '',
    standalone: true,
})
class WatchlistMockComponent extends WatchlistComponent {}

describe('WatchlistComponent', () => {
    let component: WatchlistComponent;
    let fixture: ComponentFixture<WatchlistMockComponent>;

    let mockRouter: any;
    let mockAuthService: any;
    let mockFilterService: any;
    let mockWatchlistService: any;
    let mockPopupService: any;
    let mockPipe: any;

    let userSubject$: Subject<any>;
    let activeWatchlistSubject$: Subject<any>;
    let watchlistsSubject$: Subject<any>;

    let contentTypeFilterSignal: any;
    let contentViewTypeFilterSignal: any;

    let mockNativeElement: any;

    beforeEach(async () => {
        userSubject$ = new Subject();
        activeWatchlistSubject$ = new Subject();
        watchlistsSubject$ = new Subject();

        contentTypeFilterSignal = signal(CONTENT_TYPE.MOVIE);
        contentViewTypeFilterSignal = signal(CONTENT_VIEW_TYPE.NOT_SEEN);

        mockRouter = { navigate: vi.fn() };
        mockAuthService = { user$: userSubject$.asObservable() };
        mockPopupService = { close: vi.fn() };
        mockPipe = { transform: vi.fn(() => '2 membres') };

        mockFilterService = {
            contentType: contentTypeFilterSignal,
            contentViewType: contentViewTypeFilterSignal,
            setContentType: vi.fn((type) => contentTypeFilterSignal.set(type)),
            setContentViewType: vi.fn((view) => contentViewTypeFilterSignal.set(view)),
        };

        mockWatchlistService = {
            activeWatchlist$: activeWatchlistSubject$.asObservable(),
            watchlists$: watchlistsSubject$.asObservable(),
            setActiveId: vi.fn(),
        };

        mockNativeElement = { scrollTop: 100 };

        await TestBed.configureTestingModule({
            imports: [WatchlistMockComponent],
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: AuthService, useValue: mockAuthService },
                { provide: FilterService, useValue: mockFilterService },
                { provide: WatchlistService, useValue: mockWatchlistService },
                { provide: PopupService, useValue: mockPopupService },
                { provide: WatchlistMembersCountPipe, useValue: mockPipe },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(WatchlistMockComponent);
        component = fixture.componentInstance;
        Object.defineProperty(component, 'watchlistWrapper', {
            get: () => ({ nativeElement: mockNativeElement }),
            set: () => {},
            configurable: true,
        });

        fixture.detectChanges();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should create with baseline default signals and constants', () => {
        expect(component).toBeTruthy();
        expect(component.showDetailsPopup()).toBe(false);
        expect(component.showWatchlistsPopup()).toBe(false);
        expect(component.showNewWatchlistPopup()).toBe(false);
        expect(component.showMembersPopup()).toBe(false);
        expect(component.showAddMembersPopup()).toBe(false);
    });

    describe('Computed State Management', () => {
        it('should yield null for filteredWatchlist if activeWatchlist stream is empty', () => {
            activeWatchlistSubject$.next(null);
            fixture.detectChanges();
            expect(component.filteredWatchlist()).toBeNull();
        });

        it('should correctly segment and filter movies matching seen status parameters', () => {
            contentTypeFilterSignal.set(CONTENT_TYPE.MOVIE);
            contentViewTypeFilterSignal.set(CONTENT_VIEW_TYPE.SEEN);

            activeWatchlistSubject$.next({
                uidWatchlist: 'w-1',
                medias: [
                    { mediaDetails: { type: CONTENT_TYPE.MOVIE }, isSeen: true },
                    { mediaDetails: { type: CONTENT_TYPE.MOVIE }, isSeen: false },
                    { mediaDetails: { type: CONTENT_TYPE.TV }, isSeen: true },
                ],
            });
            fixture.detectChanges();

            const result = component.filteredWatchlist();
            expect(result?.medias.length).toBe(1);
            expect(result?.medias[0].isSeen).toBe(true);
        });

        it('should cleanly structure accepted invitations into activeMembers dataset listings', () => {
            activeWatchlistSubject$.next({
                members: [
                    { uid: 'u1', invitationAccepted: true },
                    { uid: 'u2', invitationAccepted: false },
                ],
            });
            fixture.detectChanges();

            expect(component.activeMembers()).toEqual([{ uid: 'u1', invitationAccepted: true }]);
        });
    });

    describe('Navigation Hook Bindings', () => {
        it('should trigger router shifts pointing to search destinations over existing frame context', () => {
            component.openSearchView();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/search'], { replaceUrl: true });
        });

        it('should route profiles to replace screen tracking contexts upon openProfile requests', () => {
            component.openProfile();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile'], { replaceUrl: true });
        });
    });

    describe('Filter Management Trigger Actions', () => {
        it('should command setContentType updates and schedule container scroll resettings', () => {
            vi.useFakeTimers();
            component.setContentType(CONTENT_TYPE.TV);

            expect(mockFilterService.setContentType).toHaveBeenCalledWith(CONTENT_TYPE.TV);
            vi.advanceTimersByTime(0);

            expect(mockNativeElement.scrollTop).toBe(0);
            vi.useRealTimers();
        });

        it('should forward view layout targets toward global filterService tracking properties', () => {
            component.setView(CONTENT_VIEW_TYPE.SEEN);
            expect(mockFilterService.setContentViewType(CONTENT_VIEW_TYPE.SEEN));
        });
    });

    describe('Open / Close Popup Modal Factories', () => {
        const popupMapping = [
            { type: POPUP.ITEM_DETAILS, signalName: 'showDetailsPopup', carriesData: true },
            { type: POPUP.NEW_WATCHLIST, signalName: 'showNewWatchlistPopup' },
            { type: POPUP.WATCHLISTS, signalName: 'showWatchlistsPopup' },
            { type: POPUP.MEMBERS, signalName: 'showMembersPopup' },
            { type: POPUP.ADD_MEMBERS, signalName: 'showAddMembersPopup' },
        ];

        popupMapping.forEach(({ type, signalName, carriesData }) => {
            it(`should enable visibility trackers over ${signalName} states on openPopup matching criteria`, () => {
                const dummyData = carriesData ? ({ mock: true } as any) : undefined;
                component.openPopup(type, dummyData);
                expect((component as any)[signalName]()).toBe(true);
                if (carriesData) {
                    expect(component.selectedInfo()).toEqual(dummyData);
                }
            });

            it(`should toggle visibility trackers off over ${signalName} flags on closePopup hooks`, () => {
                (component as any)[signalName].set(true);
                component.closePopup(type);
                expect((component as any)[signalName]()).toBe(false);
                expect(mockPopupService.close).toHaveBeenCalled();
            });
        });

        it('should call default fallback closings on undefined or unrecognized open criteria parameters', () => {
            component.openPopup('UNKNOWN' as any);
            expect(mockPopupService.close).toHaveBeenCalled();
        });

        it('should exit close chains cleanly without service calls if popup types do not exist', () => {
            mockPopupService.close.mockClear();
            component.closePopup('UNKNOWN' as any);
            expect(mockPopupService.close).not.toHaveBeenCalled();
        });

        it('should handle nested toggle adjustments specifically customized for ADD_MEMBERS removals', () => {
            component.showAddMembersPopup.set(true);
            component.showMembersPopup.set(false);

            component.closePopup(POPUP.ADD_MEMBERS);

            expect(component.showAddMembersPopup()).toBe(false);
            expect(component.showMembersPopup()).toBe(true);
            expect(mockPopupService.close).toHaveBeenCalled();
        });
    });

    describe('handleNewWatchlist Callback workflow integrations', () => {
        it('should strip target new modal window frames and command workspace focal transformations', () => {
            component.showNewWatchlistPopup.set(true);
            const mockItem = { uidWatchlist: 'w-new-99' } as any;

            component.handleNewWatchlist(mockItem);

            expect(component.showNewWatchlistPopup()).toBe(false);
            expect(mockWatchlistService.setActiveId).toHaveBeenCalledWith('w-new-99');
        });
    });
});
