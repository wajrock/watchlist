import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { combineLatest, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SearchbarComponent } from '../../../shared/components/searchbar/searchbar.component';
import { ApiMedia, MergedMedia } from '../../../shared/models/firebase.models';
import { CardInfo, CONTENT_TYPE, PAGE_VIEW_TYPE } from '../../../shared/models/models';
import { FilterService } from '../../../shared/services/filter/filter.service';
import { PopupService } from '../../../shared/services/popup/popup.service';
import { TmdbService } from '../../../shared/services/tmdb/tmdb.service';
import { WatchlistService } from '../../../shared/services/watchlist/watchlist.service';
import { mapSearchToApiMedia } from '../../../shared/utils/media.utils';
import { MediaPopupDetailsComponent } from '../../popups/media-popup-details/media-popup-details.component';

@Component({
    selector: 'app-search',
    imports: [
        CardComponent,
        FormsModule,
        MediaPopupDetailsComponent,
        ButtonComponent,
        SearchbarComponent,
        AvatarComponent,
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
    private watchlistsService = inject(WatchlistService);
    private tmdbService = inject(TmdbService);
    protected filterService = inject(FilterService);
    private popupService = inject(PopupService);
    private functions = inject(Functions);

    // Signals
    selectedInfo = signal<CardInfo | null>(null);
    noResults = signal<boolean>(false);
    showDetailsPopup = signal<boolean>(false);
    isMagicSearchActivated = signal<boolean>(false);

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

    // METHODS
    switchView() {
        const newType =
            this.contentTypeFilter() === CONTENT_TYPE.MOVIE ? CONTENT_TYPE.TV : CONTENT_TYPE.MOVIE;

        this.filterService.setContentType(newType);
    }

    switchSearchType() {
        this.isMagicSearchActivated.update((value) => !value);
    }

    closeSearchPage() {
        this.router.navigate([''], { replaceUrl: true });
    }

    handleShowDetails(info: CardInfo) {
        this.selectedInfo.set(info);
        this.showDetailsPopup.set(true);
    }

    closeDetailsPopup() {
        this.showDetailsPopup.set(false);
        this.popupService.close();
    }

    onMediaAddedToWatchlist(): void {
        this.closeDetailsPopup();
    }

    async onSearchSubmit() {
        try {
            const askGeminiFn = httpsCallable<
                { prompt: string },
                { success: boolean; text: string }
            >(this.functions, 'askGemini');

            const response = await askGeminiFn({ prompt: this.searchValue() });

            return response.data.text;
        } catch (error) {
            throw error;
        }
    }
}
