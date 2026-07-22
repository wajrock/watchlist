import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchComponent } from './search.component';
import { provideRouter, Router } from '@angular/router';
import { FilterService } from '../../../shared/services/filter/filter.service';
import { NavbarService } from '../../../shared/services/navbar/navbar.service';
import { WatchlistService } from '../../../shared/services/watchlist/watchlist.service';
import { CONTENT_TYPE } from '../../../shared/models/models';
import { signal } from '@angular/core';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';

describe('SearchComponent', () => {
    let component: SearchComponent;
    let fixture: ComponentFixture<SearchComponent>;

    let mockRouter: any;
    let mockFilterService: any;
    let mockNavbarService: any;
    let mockAuthService: any;
    let mockWatchlistService: any;
    let contentTypeSignal: any;

    beforeEach(async () => {
        contentTypeSignal = signal(CONTENT_TYPE.MOVIE);

        mockFilterService = {
            contentType: contentTypeSignal,
            setContentType: vi.fn((val) => contentTypeSignal.set(val)),
        };

        mockNavbarService = {
            show: vi.fn(),
            hide: vi.fn(),
        };

        mockAuthService = {
            user$: of(null),
        };

        mockWatchlistService = {
            activeWatchlist$: of(null),
            watchlists$: of([]),
            watchlistInvitations$: of([]),
        };

        await TestBed.configureTestingModule({
            imports: [SearchComponent],
            providers: [
                provideRouter([]),
                provideHttpClient(),
                { provide: FilterService, useValue: mockFilterService },
                { provide: NavbarService, useValue: mockNavbarService },
                { provide: AuthService, useValue: mockAuthService },
                { provide: WatchlistService, useValue: mockWatchlistService },
            ],
        }).compileComponents();

        const router = TestBed.inject(Router);
        mockRouter = { navigate: vi.spyOn(router, 'navigate').mockResolvedValue(true) };

        fixture = TestBed.createComponent(SearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create with initial default states', () => {
        expect(component).toBeTruthy();
        expect(component.selectedInfo()).toBeNull();
        expect(component.noResults()).toBe(false);
        expect(component.showDetailsPopup()).toBe(false);
        expect(component.isMagicSearchActivated()).toBe(false);
    });

    describe('switchView', () => {
        it('should change content type filter from tv to movie', () => {
            contentTypeSignal.set(CONTENT_TYPE.TV);
            component.switchView();
            expect(mockFilterService.setContentType).toHaveBeenCalledWith(CONTENT_TYPE.MOVIE);
        });

        it('should change content type filter from movie to tv', () => {
            contentTypeSignal.set(CONTENT_TYPE.MOVIE);
            component.switchView();
            expect(mockFilterService.setContentType).toHaveBeenCalledWith(CONTENT_TYPE.TV);
        });
    });

    describe('switchSearchType', () => {
        it('should activate magic search and hide navbar', () => {
            expect(component.isMagicSearchActivated()).toBe(false);

            component.switchSearchType();

            expect(component.isMagicSearchActivated()).toBe(true);
            expect(mockNavbarService.hide).toHaveBeenCalled();
        });

        it('should deactivate magic search and show navbar', () => {
            component.switchSearchType();
            mockNavbarService.hide.mockClear();
            mockNavbarService.show.mockClear();

            component.switchSearchType();

            expect(component.isMagicSearchActivated()).toBe(false);
            expect(mockNavbarService.show).toHaveBeenCalled();
        });
    });

    describe('closeSearchPage', () => {
        it('should navigate to home and replace history', () => {
            component.closeSearchPage();
            expect(mockRouter.navigate).toHaveBeenCalledWith([''], { replaceUrl: true });
        });
    });

    describe('handleShowDetails', () => {
        it('should set selectedInfo and open details popup', () => {
            const card: any = { id: 123 };
            component.handleShowDetails(card);
            expect(component.selectedInfo()).toBe(card);
            expect(component.showDetailsPopup()).toBe(true);
        });
    });

    describe('closeDetailsPopup', () => {
        it('should close the details popup', () => {
            component.showDetailsPopup.set(true);
            component.closeDetailsPopup();
            expect(component.showDetailsPopup()).toBe(false);
        });
    });

    describe('onMediaAddedToWatchlist', () => {
        it('should close the details popup', () => {
            const spy = vi.spyOn(component, 'closeDetailsPopup');
            component.onMediaAddedToWatchlist();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('onSearchSubmit', () => {
        it('should set geminiSearchQuery to searchValue', async () => {
            component.searchValue.set('film triste des années 90');
            await component.onSearchSubmit();
            expect((component as any).geminiSearchQuery()).toBe('film triste des années 90');
        });
    });
});
