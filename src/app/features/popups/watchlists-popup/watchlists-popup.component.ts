import { Component, inject, input, output } from '@angular/core';
import { PopupComponent } from '../../../shared/components/popup/popup.component';
import { WatchlistItem } from '../../../shared/models/firebase.models';
import { WatchlistMembersCountPipe } from '../../../shared/pipes/watchlist-members-count.pipe';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { WatchlistService } from '../../../shared/services/watchlist/watchlist.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CollectionService } from '../../../shared/services/collection/collection.service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { TOAST_TYPE } from '../../../shared/models/toast.model';
import { Router } from '@angular/router';

@Component({
    selector: 'app-watchlists-popup',
    imports: [PopupComponent, ButtonComponent],
    providers: [WatchlistMembersCountPipe],
    templateUrl: './watchlists-popup.component.html',
    styleUrl: './watchlists-popup.component.scss',
})
export class WatchlistsPopupComponent {
    private watchlistService = inject(WatchlistService);
    private collectionService = inject(CollectionService);
    private toastService = inject(ToastService);
    private router = inject(Router);

    watchlists = input.required<WatchlistItem[]>();
    close = output<void>();
    createNewWatchlist = output<void>();

    activeWatchlist = toSignal(this.watchlistService.activeWatchlist$);

    createWatchlist(): void {
        this.createNewWatchlist.emit();
        this.close.emit();
    }
    selectWatchlist(watchlistId: string) {
        this.watchlistService.setActiveId(watchlistId);
        this.close.emit();
    }

    removeWatchlist(watchlistId: string) {
        this.watchlistService.deleteWatchlist(watchlistId).subscribe((response) => {
            if (response) {
                this.toastService.show({
                    type: TOAST_TYPE.SUCCESS,
                    message: 'Watchlist supprimée',
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
