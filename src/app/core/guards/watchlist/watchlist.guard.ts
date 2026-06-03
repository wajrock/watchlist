import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { filter, firstValueFrom, take } from 'rxjs';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { WatchlistService } from '../../../shared/services/watchlist/watchlist.service';

export const watchlistGuard: CanActivateFn = async () => {
    const watchlistService = inject(WatchlistService);
    const authService = inject(AuthService);

    const user = await firstValueFrom(
        authService.user$.pipe(
            filter((u) => u !== null),
            take(1),
        ),
    );

    const lists = await firstValueFrom(
        watchlistService.watchlists$.pipe(
            filter((l) => l !== undefined),
            take(1),
        ),
    );

    if (lists.length === 0) return true;

    const currentId = watchlistService.activeId();
    const isStillMember = lists.find((l) => l.uidWatchlist === currentId);

    if (!currentId || !isStillMember) {
        console.log('correct');
        watchlistService.setActiveId(lists[0].uidWatchlist);
    }

    return true;
};
