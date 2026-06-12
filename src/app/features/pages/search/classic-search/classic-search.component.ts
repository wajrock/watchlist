import { Component, computed, inject, output, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { SearchbarComponent } from '../../../../shared/components/searchbar/searchbar.component';
import { ApiMedia } from '../../../../shared/models/firebase.models';
import { CONTENT_TYPE } from '../../../../shared/models/models';
import { FilterService } from '../../../../shared/services/filter/filter.service';
import { TmdbService } from '../../../../shared/services/tmdb/tmdb.service';
import { WatchlistService } from '../../../../shared/services/watchlist/watchlist.service';
import { mapSearchToApiMedia } from '../../../../shared/utils/media.utils';

@Component({
    selector: 'app-classic-search',
    imports: [SearchbarComponent, CardComponent],
    templateUrl: './classic-search.component.html',
    styleUrl: './classic-search.component.scss',
})
export class ClassicSearchComponent {
    // UTILS
    readonly CONTENT_TYPE = CONTENT_TYPE;

    // INJECTS
    private tmdbService = inject(TmdbService);
    private watchlistsService = inject(WatchlistService);
    protected filterService = inject(FilterService);

    // SIGNALS
    searchValue = signal<string>('');
    contentTypeFilter = this.filterService.contentType;

    // ASYNC STATES
    activeWatchlist = toSignal(this.watchlistsService.activeWatchlist$);

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

    // COMPUTED
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

    // OUTPUTS
    onCardClicked = output<ApiMedia>();
}
