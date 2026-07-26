import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideFlame, LucideLibraryBig, LucideSearch, LucideUserRound } from '@lucide/angular';
import { ScrollService } from '../../services/scroll/scroll.service';

@Component({
    selector: 'app-navbar',
    imports: [
        RouterLink,
        RouterLinkActive,
        LucideFlame,
        LucideLibraryBig,
        LucideSearch,
        LucideUserRound,
    ],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
    private router = inject(Router);
    protected scrollService = inject(ScrollService);

    activeIndex = signal<number>(0);

    goTo(url: string): void {
        this.router.navigateByUrl(url, { replaceUrl: true });
    }
}
