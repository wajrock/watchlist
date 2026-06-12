import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MagicSearchComponent } from './magic-search.component';
import { FilterService } from '../../../../shared/services/filter/filter.service';
import { Functions } from '@angular/fire/functions';
import { CONTENT_TYPE } from '../../../../shared/models/models';
import { signal } from '@angular/core';

let mockHttpsCallableInstance: any;

vi.mock('firebase/functions', async (importOriginal) => {
    const actual = await importOriginal<typeof import('firebase/functions')>();
    return {
        ...actual,
        httpsCallable: vi.fn(() => mockHttpsCallableInstance),
    };
});

describe('MagicSearchComponent', () => {
    let component: MagicSearchComponent;
    let fixture: ComponentFixture<MagicSearchComponent>;

    let mockFilterService: any;
    let contentTypeSignal: any;

    beforeEach(async () => {
        contentTypeSignal = signal(CONTENT_TYPE.MOVIE);

        mockFilterService = {
            contentType: contentTypeSignal,
            setContentType: vi.fn((val) => contentTypeSignal.set(val)),
        };

        mockHttpsCallableInstance = vi.fn(() =>
            Promise.resolve({
                data: {
                    medias: [
                        { id: 1, poster_path: '/poster1.jpg', title: 'Movie 1' },
                        { id: 2, poster_path: null, title: 'Movie 2' },
                        { id: 3, poster_path: '/poster3.jpg', title: 'Movie 3' },
                    ],
                },
            }),
        );

        await TestBed.configureTestingModule({
            imports: [MagicSearchComponent],
            providers: [
                { provide: FilterService, useValue: mockFilterService },
                { provide: Functions, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(MagicSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create with initial default states', () => {
        expect(component).toBeTruthy();
        expect(component.searchQuery()).toBe('');
        expect(component.searchInput()).toBe('');
    });

    describe('onSubmitSearch', () => {
        it('should set searchQuery from searchInput when input is not empty', () => {
            component.searchInput.set('film triste des années 90');
            component.onSubmitSearch();
            expect(component.searchQuery()).toBe('film triste des années 90');
        });

        it('should not update searchQuery when searchInput is empty', () => {
            component.searchInput.set('');
            component.onSubmitSearch();
            expect(component.searchQuery()).toBe('');
        });
    });

    describe('geminiResponseResource', () => {
        it('should return empty array when query is empty', async () => {
            component.searchQuery.set('');
            fixture.detectChanges();
            await fixture.whenStable();

            expect(component.geminiResponseResource.value()).toEqual([]);
        });

        it('should call searchMedias with query and content type, and map results', async () => {
            component.searchInput.set('film triste des années 90');
            component.onSubmitSearch();
            fixture.detectChanges();
            await fixture.whenStable();

            expect(mockHttpsCallableInstance).toHaveBeenCalledWith({
                query: 'film triste des années 90',
                type: CONTENT_TYPE.MOVIE,
            });

            const value = component.geminiResponseResource.value();
            expect(value?.length).toBe(3);
        });

        it('should refetch when content type changes', async () => {
            component.searchInput.set('comédie');
            component.onSubmitSearch();
            fixture.detectChanges();
            await fixture.whenStable();

            mockHttpsCallableInstance.mockClear();

            mockFilterService.setContentType(CONTENT_TYPE.TV);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(mockHttpsCallableInstance).toHaveBeenCalledWith({
                query: 'comédie',
                type: CONTENT_TYPE.TV,
            });
        });
    });

    describe('Template rendering', () => {
        it('should display skeleton cards while loading', async () => {
            let resolvePromise: (value: any) => void;
            mockHttpsCallableInstance.mockReturnValue(
                new Promise((resolve) => {
                    resolvePromise = resolve;
                }),
            );

            component.searchInput.set('action');
            component.onSubmitSearch();
            fixture.detectChanges();

            const skeletons = fixture.nativeElement.querySelectorAll('.card-skeleton');
            expect(skeletons.length).toBe(9);

            resolvePromise!({ data: { medias: [] } });
            await fixture.whenStable();
        });

        it('should display "Aucun résultats" when results array is empty', async () => {
            mockHttpsCallableInstance.mockResolvedValue({ data: { medias: [] } });

            component.searchInput.set('something obscure');
            component.onSubmitSearch();
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();

            const message = fixture.nativeElement.querySelector('.results-grid-message');
            expect(message?.textContent).toContain('Aucun résultats');
        });

        it('should display error message when resource fails', async () => {
            mockHttpsCallableInstance.mockRejectedValue(new Error('Network error'));

            component.searchInput.set('error case');
            component.onSubmitSearch();
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();

            const message = fixture.nativeElement.querySelector('.results-grid-message');
            expect(message?.textContent).toContain('Veuillez réessayer la recherche');
        });

        it('should only render cards for medias with a posterPath', async () => {
            component.searchInput.set('film triste des années 90');
            component.onSubmitSearch();
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();

            const cards = fixture.nativeElement.querySelectorAll('app-card');
            expect(cards.length).toBe(2);
        });
    });
});
