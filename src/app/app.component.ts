import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { NavbarService } from './shared/services/navbar/navbar.service';
import { ToastService } from './shared/services/toast/toast.service';
import { setLogLevel, LogLevel } from '@angular/fire';
@Component({
    selector: 'app-root',
    imports: [RouterOutlet, ReactiveFormsModule, CommonModule, ToastComponent, NavbarComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    // UTILS
    title = 'watch-app';

    // INJECTS
    private toastService = inject(ToastService);
    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);
    protected navbarService = inject(NavbarService);

    // SIGNALS
    readonly currentToast = this.toastService.currentToast;

    ngOnInit(): void {
        setLogLevel(LogLevel.VERBOSE);
        this.router.events.subscribe((e) => {
            if (e instanceof NavigationEnd) {
                let route = this.activatedRoute;
                while (route.firstChild) route = route.firstChild;
                const showNavbar = route.snapshot.data['showNavbar'] !== false;
                showNavbar ? this.navbarService.show() : this.navbarService.hide();
            }
        });
    }
}
