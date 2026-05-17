import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth/auth.service';
import { WatchlistService } from '../../services/watchlist/watchlist.service';

@Component({
    selector: 'app-avatar',
    imports: [],
    templateUrl: './avatar.component.html',
    styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
    // INJECTS
    private authService = inject(AuthService);
    private watchlistService = inject(WatchlistService);

    // INPUTS
    showBadge = input<boolean>(false);

    // SIGNALS
    user = toSignal(this.authService.user$);
    watchlistInvitations = toSignal(this.watchlistService.watchlistInvitations$);

    // COMPUTED
    initialsLoggedUser = computed<string>(() => this.user()?.name[0].toUpperCase() ?? '');
}
