import { Component, input, output } from '@angular/core';
import { SafeUrlPipe } from '../../../shared/pipes/safe-url.pipe';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
    selector: 'app-trailer',
    imports: [SafeUrlPipe, ButtonComponent],
    templateUrl: './trailer.component.html',
    styleUrl: './trailer.component.scss',
})
export class TrailerComponent {
    // INPUTS
    trailerKey = input.required<string>();

    // OUTPUTS
    onClose = output<void>();

    // METHODS
    close(): void {
        this.onClose.emit();
    }
}
