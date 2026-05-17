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

    // SIGNALS
    animatePopup = signal<boolean>(true);

    handleOpenDetails() {
        this.openDetails.emit();
    }
}
