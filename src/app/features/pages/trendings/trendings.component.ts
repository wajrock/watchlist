import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CardComponent } from '../../../shared/components/card/card.component';
import { CardInfo, CONTENT_TYPE, PAGE_VIEW_TYPE } from '../../../shared/models/models';
import { FilterService } from '../../../shared/services/filter/filter.service';
import { TmdbService } from '../../../shared/services/tmdb/tmdb.service';
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

    // SIGNALS
    selectedInfo = signal<CardInfo | null>(null);
    showDetailsPopup = signal<boolean>(false);

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

    // METHODS
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
