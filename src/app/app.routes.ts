import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth/auth.guard';
import { AccessComponent } from './features/pages/access/access.component';
import { OnboardComponent } from './features/pages/onboard/onboard.component';
import { SearchComponent } from './features/pages/search/search.component';
import { WatchlistComponent } from './features/pages/watchlist/watchlist.component';
import { watchlistGuard } from './core/guards/watchlist/watchlist.guard';
import { ProfileComponent } from './features/pages/profile/profile.component';
import { TrendingsComponent } from './features/pages/trendings/trendings.component';

export const routes: Routes = [
    { path: '', redirectTo: 'watchlist', pathMatch: 'full' },
    { path: 'welcome', component: OnboardComponent, data: { showNavbar: false } },
    { path: 'access', component: AccessComponent, data: { showNavbar: false } },
    { path: 'watchlist', component: WatchlistComponent, canActivate: [authGuard, watchlistGuard] },
    { path: 'trendings', component: TrendingsComponent },
    { path: 'search', component: SearchComponent, canActivate: [authGuard, watchlistGuard] },
    { path: 'profile', component: ProfileComponent, canActivate: [authGuard, watchlistGuard] },
];
