import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth/auth.guard';
import { watchlistGuard } from './core/guards/watchlist/watchlist.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'watchlist', pathMatch: 'full' },
    {
        path: 'welcome',
        loadComponent: () =>
            import('./features/pages/onboard/onboard.component').then((m) => m.OnboardComponent),
        data: { showNavbar: false },
    },
    {
        path: 'access',
        loadComponent: () =>
            import('./features/pages/access/access.component').then((m) => m.AccessComponent),
        data: { showNavbar: false },
    },
    {
        path: 'watchlist',
        loadComponent: () =>
            import('./features/pages/watchlist/watchlist.component').then(
                (m) => m.WatchlistComponent,
            ),
        canActivate: [authGuard, watchlistGuard],
    },
    {
        path: 'trendings',
        loadComponent: () =>
            import('./features/pages/trendings/trendings.component').then(
                (m) => m.TrendingsComponent,
            ),
    },
    {
        path: 'search',
        loadComponent: () =>
            import('./features/pages/search/search.component').then((m) => m.SearchComponent),
        canActivate: [authGuard, watchlistGuard],
    },
    {
        path: 'profile',
        loadComponent: () =>
            import('./features/pages/profile/profile.component').then((m) => m.ProfileComponent),
        canActivate: [authGuard, watchlistGuard],
    },
];
