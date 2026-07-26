import { Component, input, output } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SafeUrlPipe } from '../../../shared/pipes/safe-url.pipe';

@Component({
    selector: 'app-trailer',
    imports: [SafeUrlPipe, ButtonComponent, LucideX],
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
