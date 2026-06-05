import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchComponent } from './search.component';
import { Router, ActivatedRoute } from '@angular/router';
import { WatchlistService } from '../../../shared/services/watchlist/watchlist.service';
import { TmdbService } from '../../../shared/services/tmdb/tmdb.service';
import { FilterService } from '../../../shared/services/filter/filter.service';
import { PopupService } from '../../../shared/services/popup/popup.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { Functions } from '@angular/fire/functions';
import { Subject, of } from 'rxjs';
import { CONTENT_TYPE } from '../../../shared/models/models';
import { signal } from '@angular/core';

let mockHttpsCallableInstance: any;

vi.mock('@angular/fire/functions', () => ({
    Functions: class {},
    httpsCallable: vi.fn(() => mockHttpsCallableInstance),
}));

describe('SearchComponent', () => {
    let component: SearchComponent;
    let fixture: ComponentFixture<SearchComponent>;

    let mockRouter: any;
    let mockWatchlistService: any;
    let mockTmdbService: any;
    let mockFilterService: any;
    let mockPopupService: any;
    let mockAuthService: any;

    let activeWatchlistSubject$: Subject<any>;
    let searchSubject$: Subject<any>;
    let contentTypeSignal: any;

    beforeEach(async () => {
        activeWatchlistSubject$ = new Subject();
        searchSubject$ = new Subject();
        contentTypeSignal = signal(CONTENT_TYPE.MOVIE);

        mockRouter = { navigate: vi.fn() };
        mockWatchlistService = {
            activeWatchlist$: activeWatchlistSubject$.asObservable(),
            watchlistInvitations$: of([]),
        };
        mockTmdbService = { search: vi.fn(() => searchSubject$.asObservable()) };
        mockFilterService = {
            contentType: contentTypeSignal,
            setContentType: vi.fn((val) => contentTypeSignal.set(val)),
        };
        mockPopupService = { close: vi.fn() };
        mockAuthService = { user$: of(null) };
        mockHttpsCallableInstance = vi.fn(() =>
            Promise.resolve({ data: { text: 'Gemini Result' } }),
        );

        await TestBed.configureTestingModule({
            imports: [SearchComponent],
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: new Map() } } },
                { provide: WatchlistService, useValue: mockWatchlistService },
                { provide: TmdbService, useValue: mockTmdbService },
                { provide: FilterService, useValue: mockFilterService },
                { provide: PopupService, useValue: mockPopupService },
                { provide: AuthService, useValue: mockAuthService },
                { provide: Functions, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(SearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should create with initial default states', () => {
        expect(component).toBeTruthy();
        expect(component.selectedInfo()).toBeNull();
        expect(component.noResults()).toBe(false);
        expect(component.showDetailsPopup()).toBe(false);
        expect(component.isMagicSearchActivated()).toBe(false);
    });

    describe('switchView', () => {
        it('should change content type filters to movie from tv state representations', () => {
            contentTypeSignal.set(CONTENT_TYPE.TV);
            component.switchView();
            expect(mockFilterService.setContentType).toHaveBeenCalledWith(CONTENT_TYPE.MOVIE);
        });

        it('should change content type filters to tv from movie state representations', () => {
            contentTypeSignal.set(CONTENT_TYPE.MOVIE);
            component.switchView();
            expect(mockFilterService.setContentType).toHaveBeenCalledWith(CONTENT_TYPE.TV);
        });
    });

    describe('switchSearchType', () => {
        it('should invert the active status flag parameters for magicSearch structures', () => {
            expect(component.isMagicSearchActivated()).toBe(false);
            component.switchSearchType();
            expect(component.isMagicSearchActivated()).toBe(true);
        });
    });

    describe('closeSearchPage', () => {
        it('should command router configurations to overwrite historical steps and return home', () => {
            component.closeSearchPage();
            expect(mockRouter.navigate).toHaveBeenCalledWith([''], { replaceUrl: true });
        });
    });

    describe('handleShowDetails', () => {
        it('should register target object references and map popups open triggers', () => {
            const card: any = { id: 123 };
            component.handleShowDetails(card);
            expect(component.selectedInfo()).toBe(card);
            expect(component.showDetailsPopup()).toBe(true);
        });
    });

    describe('closeDetailsPopup', () => {
        it('should toggle local display toggles and clear modal layers via popupService', () => {
            component.showDetailsPopup.set(true);
            component.closeDetailsPopup();
            expect(component.showDetailsPopup()).toBe(false);
            expect(mockPopupService.close).toHaveBeenCalled();
        });
    });

    describe('onMediaAddedToWatchlist', () => {
        it('should redirect clean down actions and close popup containers entirely', () => {
            const spy = vi.spyOn(component, 'closeDetailsPopup');
            component.onMediaAddedToWatchlist();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('Async Streams and Filtering logic', () => {
        it('should return empty result arrays immediately if search keywords are under two letters', async () => {
            vi.useFakeTimers();
            component.searchValue.set('A');
            fixture.detectChanges();

            await vi.advanceTimersByTimeAsync(100);
            fixture.detectChanges();

            expect(component.filteredSearchResults()).toEqual([]);
        });

        it('should map, exclude items already saved, omit items lacking backdrop images, and sort list by popularity', () => {
            const mockApiResults = [
                { id: 1, popularity: 10, backdropPath: '/path1.jpg', title: 'Low Pop' },
                { id: 2, popularity: 100, backdropPath: '/path2.jpg', title: 'High Pop' },
                { id: 3, popularity: 50, backdropPath: null, title: 'No Backdrop' },
                { id: 999, popularity: 500, backdropPath: '/saved.jpg', title: 'Already Saved' },
            ];

            (component as any).searchResults = signal(mockApiResults);

            activeWatchlistSubject$.next({
                medias: [{ mediaDetails: { id: 999 } }],
            });

            fixture.detectChanges();

            const results = component.filteredSearchResults();
            expect(results.length).toBe(2);
            expect(results[0].id).toBe(2);
            expect(results[1].id).toBe(1);
        });
    });

    describe('onSearchSubmit Cloud Functions Call', () => {
        it('should complete call requests successfully and parse response message data text bundles', async () => {
            component.searchValue.set('Recommend Sci-Fi movies');
            const res = await component.onSearchSubmit();
            expect(res).toBe('Gemini Result');
        });

        it('should reject promises completely and rethrow standard errors if downstream calls crash', async () => {
            mockHttpsCallableInstance.mockRejectedValueOnce(new Error('Network Lost'));
            component.searchValue.set('Errors out');
            await expect(component.onSearchSubmit()).rejects.toThrow('Network Lost');
        });
    });
});
