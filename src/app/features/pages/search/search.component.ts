import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    inject,
    Input,
    signal,
    ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import axios from 'axios';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import {
    API_RESPONSE,
    MergedMedia,
    CONTENT_TYPE,
    CollectionMedia,
    EnrichedMedia,
} from '../../../shared/models';
import { CollectionService } from '../../../shared/services/collection.service';
import { ItemPopupDetailsComponent } from '../../item-popup-details/item-popup-details.component';

@Component({
    selector: 'app-search',
    imports: [CardComponent, FormsModule, ItemPopupDetailsComponent, ButtonComponent],
    templateUrl: './search.component.html',
    styleUrl: './search.component.scss',
})
export class SearchComponent {
    private router = inject(Router);

    @Input() contentType!: CONTENT_TYPE;
    @ViewChild('searchInput') searchInput!: ElementRef;
    @ViewChild('searchbar') searchbar!: ElementRef;
    @ViewChild('gridResults') gridResults!: ElementRef<HTMLDivElement>;

    public value: string = '';

    public searchResults: EnrichedMedia[] = [];

    public selectedInfo!: EnrichedMedia;

    public noResults: boolean = false;
    public isSearchActive: boolean = false;
    public showDetailsPopup = false;
    public animatePopupDetails = true;

    public defaultFilter!: CONTENT_TYPE;

    private searchSubject = new Subject<string>();
    private searchSub!: Subscription;

    private readonly cdr = inject(ChangeDetectorRef);

    constructor(public collectionService: CollectionService) {}

    activeWatchlistId = signal<string>(localStorage.getItem('activeWatchlistId')!);
    fullCollection = signal<MergedMedia[]>([]);

    ngOnInit() {
        if (localStorage.getItem('filter')) {
            this.defaultFilter = localStorage.getItem('filter') as CONTENT_TYPE;
            this.contentType = this.defaultFilter;
        }

        this.collectionService.getWatchlistMedias(this.activeWatchlistId()).subscribe((medias) => {
            this.fullCollection.set(medias);
        });

        this.searchSub = this.searchSubject.pipe(debounceTime(0)).subscribe(async (value) => {
            await this.updateSearch();

            this.noResults =
                value.length > 0 && value.trim() !== '' && this.searchResults.length === 0;
        });
    }

    ngOnDestroy() {
        this.searchSub.unsubscribe();
    }

    async switchView() {
        const newFilter =
            this.contentType === CONTENT_TYPE.MOVIE ? CONTENT_TYPE.TV : CONTENT_TYPE.MOVIE;
        this.contentType = newFilter;
        //
        localStorage.setItem('filter', newFilter);
        await this.updateSearch();
        this.noResults =
            this.value.length > 0 && this.value.trim() !== '' && this.searchResults.length === 0;

        this.cdr.detectChanges();

        setTimeout(() => {
            this.gridResults.nativeElement.scrollTop = 0;
        }, 0);
    }

    closeSearchPage() {
        localStorage.setItem('filter', this.contentType);
        this.router.navigate(['']);
    }

    onSearchChange(value: string) {
        this.searchSubject.next(value);
    }

    isInCollection(apiId: number): boolean {
        return this.fullCollection().some((media) => media.apiId === apiId);
    }

    async updateSearch() {
        if (!this.value?.trim()) {
            this.searchResults = [];
            return;
        }

        const headers = {
            accept: 'application/json',
            Authorization:
                'Bearer ***REMOVED***',
        };

        const response = await axios.get(
            `https://api.themoviedb.org/3/search/${this.contentType}?query=${this.value}&include_adult=false&language=fr-FR&page=1`,
            { headers },
        );
        const moviesList = (response.data.results as API_RESPONSE[]).sort(
            (a, b) => b.popularity - a.popularity,
        );

        if (this.contentType === 'movie') {
            this.searchResults = moviesList
                .filter((movie) => movie.backdrop_path && !this.isInCollection(movie.id))
                .sort((a, b) => b.popularity - a.popularity)
                .map(({ id, ...movie }) => ({
                    apiId: id,
                    mediaCollectionInfos: { apiId: id, ...movie, type: CONTENT_TYPE.MOVIE },
                }));
        } else {
            this.searchResults = (response.data.results as API_RESPONSE[])
                .filter((serie) => serie.backdrop_path && !this.isInCollection(serie.id))
                .sort((a, b) => b.popularity - a.popularity)
                .map(({ id, name, first_air_date, ...rest }) => ({
                    addedByUserId: undefined,
                    dateAddedToWatchlist: undefined,
                    uidMedia: null,
                    isSeen: null,
                    mediaDetails: {
                        apiId: id,
                        ...rest,
                        type: CONTENT_TYPE.TV,
                        title: name,
                        release_date: first_air_date,
                    },
                }));
        }
    }

    clearSearch(): void {
        this.value = '';
        this.updateSearch();
        this.noResults = false;
    }

    handleShowDetails(info: EnrichedMedia) {
        this.selectedInfo = info;
        this.showDetailsPopup = true;
    }

    closeDetailsPopup() {
        this.showDetailsPopup = false;
        this.animatePopupDetails = true;
    }

    onMediaAddedToWatchlist(): void {
        this.closeDetailsPopup();
        this.updateSearch();
    }

    handleUpdate() {
        this.animatePopupDetails = false;
    }
}
