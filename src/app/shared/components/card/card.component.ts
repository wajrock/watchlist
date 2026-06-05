import { Component, input, output, signal } from '@angular/core';

@Component({
    selector: 'app-card',
    imports: [],
    templateUrl: './card.component.html',
    styleUrl: './card.component.scss',
})
export class CardComponent {
    // INPUTS
    posterPath = input.required<string>();

    // OUTPUTS
    openDetails = output<void>();

    buildTmdbUrl(size: 'w92' | 'w185' | 'w342'): string {
        const path = this.posterPath();
        return `https://image.tmdb.org/t/p/${size}${path}`;
    }

    handleOpenDetails() {
        this.openDetails.emit();
    }
}
