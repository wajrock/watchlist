import { Component, inject, input, output } from '@angular/core';
import { PopupComponent } from '../../../shared/components/popup/popup.component';
import { EnrichedMember, EnrichedWatchlist, Member } from '../../../shared/models/firebase.models';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { WatchlistService } from '../../../shared/services/watchlist/watchlist.service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { TOAST_TYPE } from '../../../shared/models/toast.model';

@Component({
    selector: 'app-members-popup',
    imports: [PopupComponent, ButtonComponent],
    templateUrl: './members-popup.component.html',
    styleUrl: './members-popup.component.scss',
})
export class MembersPopupComponent {
    readonly TOAST_TYPE = TOAST_TYPE;
    private watchlistService = inject(WatchlistService);
    private toastService = inject(ToastService);

    activeWatchlist = input.required<EnrichedWatchlist>();

    close = output<void>();
    inviteFriends = output<void>();

    inviteFriendsActions(): void {
        this.close.emit();
        this.inviteFriends.emit();
    }

    removeMember(watchlistId: string, memberId: string) {
        this.watchlistService.removeMember(watchlistId, memberId).subscribe((response) => {
            if (response) {
                this.toastService.show({
                    type: TOAST_TYPE.SUCCESS,
                    message: 'Membre supprimé',
                });
                this.close.emit();
            } else {
                this.toastService.show({
                    type: TOAST_TYPE.ERROR,
                    message: 'Une erreur est survenue',
                });
            }
        });
    }
}
