import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CardComponent } from '../../../shared/components/card/card.component';
import { CardInfo, CONTENT_TYPE, PAGE_VIEW_TYPE } from '../../../shared/models/models';
import { FilterService } from '../../../shared/services/filter/filter.service';
import { ScrollService } from '../../../shared/services/scroll/scroll.service';
import { TmdbService } from '../../../shared/services/tmdb/tmdb.service';
import { WatchlistService } from '../../../shared/services/watchlist/watchlist.service';
import { mapDetailsToApiMedia } from '../../../shared/utils/media.utils';
import { MediaPopupDetailsComponent } from '../../popups/media-popup-details/media-popup-details.component';

@Component({
    selector: 'app-trendings',
    imports: [CardComponent, MediaPopupDetailsComponent],
    templateUrl: './trendings.component.html',
    styleUrl: './trendings.component.scss',
})
export class TrendingsComponent {
    // UTILS
    readonly PAGE_VIEW_TYPE = PAGE_VIEW_TYPE;
    readonly CONTENT_TYPE = CONTENT_TYPE;
    readonly Array = Array;

    // INJECTS
    private tmdbService = inject(TmdbService);
    protected filterService = inject(FilterService);
    private watchlistService = inject(WatchlistService);
    private scrollService = inject(ScrollService);

    // SIGNALS
    selectedInfo = signal<CardInfo | null>(null);
    showDetailsPopup = signal<boolean>(false);
    activeWatchlist = toSignal(this.watchlistService.activeWatchlist$);

    // RESOURCE
    trendingsResource = rxResource({
        request: this.filterService.contentType,
        loader: ({ request: contentType }) =>
            this.tmdbService.getTrendings(contentType).pipe(
                map((response) =>
                    response.results.map((item) => {
                        return mapDetailsToApiMedia(item, this.filterService.contentType());
                    }),
                ),
            ),
    });

    trendingMedias = computed(() => {
        if (!this.trendingsResource.value()) return [];
        return this.trendingsResource
            .value()
            ?.filter(
                (item) =>
                    !this.activeWatchlist()?.medias.some(
                        (media) => media.mediaDetails.id === item.id,
                    ),
            );
    });

    // MISC.
    @ViewChild('trendingsPage') trendingsPage!: ElementRef<HTMLDivElement>;

    // METHODS
    constructor() {
        this.scrollService.scrollToTop.subscribe((scrollToTop) => {
            console.log(scrollToTop);

            if (scrollToTop) {
                this.trendingsPage.nativeElement.scrollTo(0, 0);
                this.scrollService.shouldScrollToTop.set(false);
            }
        });
    }

    switchView() {
        const newType =
            this.filterService.contentType() === CONTENT_TYPE.MOVIE
                ? CONTENT_TYPE.TV
                : CONTENT_TYPE.MOVIE;

        this.filterService.setContentType(newType);
    }

    handleShowDetails(info: CardInfo) {
        this.selectedInfo.set(info);
        this.showDetailsPopup.set(true);
    }

    closeDetailsPopup() {
        this.showDetailsPopup.set(false);
    }
}
