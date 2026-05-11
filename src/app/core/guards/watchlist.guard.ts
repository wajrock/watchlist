import { inject } from '@angular/core';
import { user } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { WatchlistService } from '../../shared/services/watchlist.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, firstValueFrom, take } from 'rxjs';

export const watchlistGuard: CanActivateFn = async () => {
    const watchlistService = inject(WatchlistService);
    const authService = inject(AuthService);
    const router = inject(Router);

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
