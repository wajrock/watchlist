import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AccessComponent } from './features/pages/access/access.component';
import { OnboardComponent } from './features/pages/onboard/onboard.component';
import { SearchComponent } from './features/pages/search/search.component';
import { WatchlistComponent } from './features/pages/watchlist/watchlist.component';
import { watchlistGuard } from './core/guards/watchlist.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'watchlist', pathMatch: 'full' },
    { path: 'welcome', component: OnboardComponent },
    { path: 'access', component: AccessComponent },
    { path: 'watchlist', component: WatchlistComponent, canActivate: [authGuard, watchlistGuard] },
    { path: 'search', component: SearchComponent, canActivate: [authGuard, watchlistGuard] },
];
