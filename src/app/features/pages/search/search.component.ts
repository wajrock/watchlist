import {
    ChangeDetectorRef,
    Component,
    computed,
    ElementRef,
    inject,
    signal,
    ViewChild,
} from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { combineLatest, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';

import { SearchbarComponent } from '../../../shared/components/searchbar/searchbar.component';
import { ApiMedia, MergedMedia } from '../../../shared/models/firebase.models';
import { CardInfo, CONTENT_TYPE, PAGE_VIEW_TYPE } from '../../../shared/models/models';
import { FilterService } from '../../../shared/services/filter/filter.service';
import { TmdbService } from '../../../shared/services/tmdb/tmdb.service';
import { WatchlistService } from '../../../shared/services/watchlist/watchlist.service';
import { mapDetailsToApiMedia, mapSearchToApiMedia } from '../../../shared/utils/media.utils';
import { MediaPopupDetailsComponent } from '../../popups/media-popup-details/media-popup-details.component';

@Component({
    selector: 'app-search',
    imports: [
        CardComponent,
        FormsModule,
        MediaPopupDetailsComponent,
        ButtonComponent,
        SearchbarComponent,
    ],
    templateUrl: './search.component.html',
    styleUrl: './search.component.scss',
})
export class SearchComponent {
    // CONSTANTS
    readonly CONTENT_TYPE = CONTENT_TYPE;
    readonly PAGE_VIEW_TYPE = PAGE_VIEW_TYPE;
    readonly Array = Array;

    // INJECTS
    private router = inject(Router);
    private readonly cdr = inject(ChangeDetectorRef);
    private watchlistsService = inject(WatchlistService);
    private tmdbService = inject(TmdbService);
    private filterService = inject(FilterService);

    @ViewChild('gridResults') gridResults!: ElementRef<HTMLDivElement>;

    selectedInfo!: CardInfo;

    // Signals
    noResults = signal<boolean>(false);
    showDetailsPopup = signal<boolean>(false);
    animatePopupDetails = signal<boolean>(false);

    activeWatchlist = toSignal(this.watchlistsService.activeWatchlist$);
    fullCollection = signal<MergedMedia[]>([]);

    searchValue = signal<string>('');
    contentTypeFilter = this.filterService.contentType;

    // Async State
    searchResults = toSignal(
        combineLatest([toObservable(this.searchValue), toObservable(this.contentTypeFilter)]).pipe(
            debounceTime(100),
            distinctUntilChanged(),
            switchMap(([value, type]) => {
                if (value.length < 2) return of(null);
                return this.tmdbService
                    .search(type, value)
                    .pipe(
                        map((response) =>
                            response.results.map((item) =>
                                mapSearchToApiMedia(item, this.contentTypeFilter()),
                            ),
                        ),
                    );
            }),
        ),
        { initialValue: null },
    );

    // Computed
    filteredSearchResults = computed<ApiMedia[]>(() => {
        const searchResults = this.searchResults();
        const watchlist = this.activeWatchlist();
        if (!searchResults) return [];
        return searchResults
            ?.filter(
                (item) => !watchlist?.medias.some((media) => media.mediaDetails.id === item.id),
            )
            ?.filter((item) => item.backdropPath)
            .sort((a, b) => b.popularity - a.popularity)
            .map((item) => {
                return item;
            });
    });

    // Resources
    trendingsResource = rxResource({
        request: this.contentTypeFilter,
        loader: ({ request: contentType }) =>
            this.tmdbService.getTrendings(contentType).pipe(
                map((response) =>
                    response.results.map((item) => {
                        return mapDetailsToApiMedia(item, this.contentTypeFilter());
                    }),
                ),
            ),
    });

    async switchView() {
        const newType =
            this.contentTypeFilter() === CONTENT_TYPE.MOVIE ? CONTENT_TYPE.TV : CONTENT_TYPE.MOVIE;

        this.filterService.setContentType(newType);

        setTimeout(() => {
            this.gridResults.nativeElement.scrollTop = 0;
        }, 0);
    }

    closeSearchPage() {
        this.router.navigate([''], { replaceUrl: true });
    }

    handleShowDetails(info: CardInfo) {
        this.selectedInfo = info;
        this.showDetailsPopup.set(true);
    }

    closeDetailsPopup() {
        this.showDetailsPopup.set(false);
        this.animatePopupDetails.set(true);
    }

    onMediaAddedToWatchlist(): void {
        this.closeDetailsPopup();
    }

    handleUpdate() {
        this.animatePopupDetails.set(false);
    }
}
