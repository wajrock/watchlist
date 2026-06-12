import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ClassicSearchComponent } from './classic-search.component';
import { TmdbService } from '../../../../shared/services/tmdb/tmdb.service';
import { WatchlistService } from '../../../../shared/services/watchlist/watchlist.service';
import { FilterService } from '../../../../shared/services/filter/filter.service';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { CONTENT_TYPE } from '../../../../shared/models/models';
import { Subject } from 'rxjs';
import { signal } from '@angular/core';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('ClassicSearchComponent', () => {
    let component: ClassicSearchComponent;
    let fixture: ComponentFixture<ClassicSearchComponent>;

    let mockTmdbService: any;
    let mockWatchlistService: any;
    let mockFilterService: any;

    let activeWatchlistSubject$: Subject<any>;
    let searchSubject$: Subject<any>;
    let contentTypeSignal: any;

    beforeEach(async () => {
        activeWatchlistSubject$ = new Subject();
        searchSubject$ = new Subject();
        contentTypeSignal = signal(CONTENT_TYPE.MOVIE);

        mockTmdbService = {
            search: vi.fn(() => searchSubject$.asObservable()),
        };

        mockWatchlistService = {
            activeWatchlist$: activeWatchlistSubject$.asObservable(),
        };

        mockFilterService = {
            contentType: contentTypeSignal,
            setContentType: vi.fn((val) => contentTypeSignal.set(val)),
        };

        await TestBed.configureTestingModule({
            imports: [ClassicSearchComponent],
            providers: [
                { provide: TmdbService, useValue: mockTmdbService },
                { provide: WatchlistService, useValue: mockWatchlistService },
                { provide: FilterService, useValue: mockFilterService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ClassicSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();

        activeWatchlistSubject$.next({ medias: [] });
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('should create with initial default states', () => {
        expect(component).toBeTruthy();
        expect(component.searchValue()).toBe('');
        expect(component.filteredSearchResults()).toEqual([]);
    });

    describe('Search triggering', () => {
        it('should not call tmdbService.search when searchValue has less than 2 characters', async () => {
            component.searchValue.set('A');
            fixture.detectChanges();
            await fixture.whenStable();
            await wait(150);

            expect(mockTmdbService.search).not.toHaveBeenCalled();
            expect(component.filteredSearchResults()).toEqual([]);
        });

        it('should call tmdbService.search with content type and value when searchValue has 2+ characters', async () => {
            component.searchValue.set('Matrix');
            fixture.detectChanges();
            await fixture.whenStable();
            await wait(150);

            expect(mockTmdbService.search).toHaveBeenCalledWith(CONTENT_TYPE.MOVIE, 'Matrix');
        });

        it('should re-trigger search when content type changes', async () => {
            component.searchValue.set('Matrix');
            fixture.detectChanges();
            await fixture.whenStable();
            await wait(150);

            mockTmdbService.search.mockClear();

            mockFilterService.setContentType(CONTENT_TYPE.TV);
            fixture.detectChanges();
            await fixture.whenStable();
            await wait(150);

            expect(mockTmdbService.search).toHaveBeenCalledWith(CONTENT_TYPE.TV, 'Matrix');
        });
    });

    describe('filteredSearchResults', () => {
        it('should map, exclude items already saved, omit items lacking backdrop images, and sort by popularity', async () => {
            const mockApiResults = {
                results: [
                    {
                        id: 1,
                        popularity: 10,
                        backdrop_path: '/path1.jpg',
                        poster_path: '/poster1.jpg',
                        title: 'Low Pop',
                    },
                    {
                        id: 2,
                        popularity: 100,
                        backdrop_path: '/path2.jpg',
                        poster_path: '/poster2.jpg',
                        title: 'High Pop',
                    },
                    {
                        id: 3,
                        popularity: 50,
                        backdrop_path: null,
                        poster_path: '/poster3.jpg',
                        title: 'No Backdrop',
                    },
                    {
                        id: 999,
                        popularity: 500,
                        backdrop_path: '/saved.jpg',
                        poster_path: '/poster999.jpg',
                        title: 'Already Saved',
                    },
                ],
            };

            component.searchValue.set('test');
            fixture.detectChanges();
            await fixture.whenStable();
            await wait(150);

            searchSubject$.next(mockApiResults);
            fixture.detectChanges();
            await fixture.whenStable();

            activeWatchlistSubject$.next({
                medias: [{ mediaDetails: { id: 999 } }],
            });
            fixture.detectChanges();
            await fixture.whenStable();

            const results = component.filteredSearchResults();
            expect(results.length).toBe(2);
            expect(results[0].id).toBe(2);
            expect(results[1].id).toBe(1);
        });

        it('should return empty array when searchResults is null', () => {
            expect(component.filteredSearchResults()).toEqual([]);
        });
    });

    describe('Template rendering', () => {
        it('should display "Aucun résultats" when filteredSearchResults is empty and searchValue length > 1', async () => {
            component.searchValue.set('xyz');
            fixture.detectChanges();
            await fixture.whenStable();
            await wait(150);

            searchSubject$.next({ results: [] });
            fixture.detectChanges();
            await fixture.whenStable();

            const message = fixture.nativeElement.querySelector('.results-grid-empty');
            expect(message?.textContent).toContain('Aucun résultats');
        });

        it('should not display results grid when searchValue length <= 1', () => {
            component.searchValue.set('A');
            fixture.detectChanges();

            const grid = fixture.nativeElement.querySelector('.results-grid');
            expect(grid).toBeNull();
        });

        it('should only render cards for items with a posterPath', async () => {
            const mockApiResults = {
                results: [
                    {
                        id: 1,
                        popularity: 10,
                        backdrop_path: '/path1.jpg',
                        poster_path: '/poster1.jpg',
                        title: 'With poster',
                    },
                    {
                        id: 2,
                        popularity: 20,
                        backdrop_path: '/path2.jpg',
                        poster_path: null,
                        title: 'No poster',
                    },
                ],
            };

            component.searchValue.set('test');
            fixture.detectChanges();
            await fixture.whenStable();
            await wait(150);

            searchSubject$.next(mockApiResults);
            fixture.detectChanges();
            await fixture.whenStable();

            const cards = fixture.nativeElement.querySelectorAll('app-card');
            expect(cards.length).toBe(1);
        });
    });

    describe('onCardClicked', () => {
        it('should emit the clicked item', async () => {
            const mockApiResults = {
                results: [
                    {
                        id: 1,
                        popularity: 10,
                        backdrop_path: '/path1.jpg',
                        poster_path: '/poster1.jpg',
                        title: 'Movie',
                    },
                ],
            };

            const emitSpy = vi.fn();
            component.onCardClicked.subscribe(emitSpy);

            component.searchValue.set('test');
            fixture.detectChanges();
            await fixture.whenStable();
            await wait(150);

            searchSubject$.next(mockApiResults);
            fixture.detectChanges();
            await fixture.whenStable();

            const cardDebugEl = fixture.debugElement.query(By.directive(CardComponent));
            cardDebugEl.triggerEventHandler('openDetails', null);

            expect(emitSpy).toHaveBeenCalled();
        });
    });
});
