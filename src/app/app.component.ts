import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import {NavbarComponent} from './shared/components/navbar/navbar.component';
@Component({
    selector: 'app-root',
    imports: [RouterOutlet, ReactiveFormsModule, CommonModule, NavbarComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    title = 'watch-app';
    showNavbar = true;
    constructor(private router: Router) {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                const showOnRoutes = ['/', '/search', '/profile'];
                this.showNavbar = showOnRoutes.includes(event.urlAfterRedirects);
            }
        });
    }
}
