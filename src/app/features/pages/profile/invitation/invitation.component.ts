import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
    selector: 'app-invitation',
    imports: [ButtonComponent],
    templateUrl: './invitation.component.html',
    styleUrl: './invitation.component.scss',
})
export class InvitationComponent {
    watchlistName = input.required<string>();
    acceptInvitation = output<void>();
    declineInvitation = output<void>();
}
