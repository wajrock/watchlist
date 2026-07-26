import { Component, inject, output, resource, signal } from '@angular/core';
import { Functions } from '@angular/fire/functions';
import { LucideSearch } from '@lucide/angular';
import { httpsCallable } from 'firebase/functions';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ApiMedia } from '../../../../shared/models/firebase.models';
import { CONTENT_TYPE } from '../../../../shared/models/models';
import { SearchMovieDetails, SearchTvDetails } from '../../../../shared/models/tmdb.models';
import { FilterService } from '../../../../shared/services/filter/filter.service';
import { mapSearchToApiMedia } from '../../../../shared/utils/media.utils';

@Component({
    selector: 'app-magic-search',
    imports: [ButtonComponent, CardComponent, LucideSearch],
    templateUrl: './magic-search.component.html',
    styleUrl: './magic-search.component.scss',
})
export class MagicSearchComponent {
    // UTILS
    readonly CONTENT_TYPE = CONTENT_TYPE;
    readonly Array = Array;

    // INJECTS
    private functions = inject(Functions);
    protected filterService = inject(FilterService);

    // SIGNALS
    searchQuery = signal<string>('');
    searchInput = signal<string>('');

    // RESOURCES
    geminiResponseResource = resource({
        request: () => ({ query: this.searchQuery(), type: this.filterService.contentType() }),
        loader: async ({ request }) => {
            if (!request.query) return [];
            const searchMedias = httpsCallable<
                { query: string; type: CONTENT_TYPE },
                { medias: (SearchMovieDetails | SearchTvDetails)[] }
            >(this.functions, 'searchMedias');
            const result = await searchMedias(request);

            return result.data.medias.map((media) =>
                mapSearchToApiMedia(media, this.filterService.contentType()),
            );
        },
    });

    // OUTPUTS
    onCardClicked = output<ApiMedia>();

    // METHODS
    onSubmitSearch() {
        if (!this.searchInput()) return;
        this.searchQuery.set(this.searchInput());
    }
}
