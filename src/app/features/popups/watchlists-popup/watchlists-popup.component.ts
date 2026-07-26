import { Component, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { LucideCirclePlus, LucideTrash } from '@lucide/angular';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { PopupComponent } from '../../../shared/components/popup/popup.component';
import { WatchlistItem } from '../../../shared/models/firebase.models';
import { TOAST_TYPE } from '../../../shared/models/toast.model';
import { WatchlistMembersCountPipe } from '../../../shared/pipes/watchlist-members-count.pipe';
import { CollectionService } from '../../../shared/services/collection/collection.service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { WatchlistService } from '../../../shared/services/watchlist/watchlist.service';

@Component({
    selector: 'app-watchlists-popup',
    imports: [PopupComponent, ButtonComponent, LucideTrash, LucideCirclePlus],
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
