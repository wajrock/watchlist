import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Toast, TOAST_TYPE } from './shared/models/toast.model';
import { ToastService } from './shared/services/toast/toast.service';
import { ToastComponent } from './shared/components/toast/toast.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { PopupService } from './shared/services/popup/popup.service';
@Component({
    selector: 'app-root',
    imports: [RouterOutlet, ReactiveFormsModule, CommonModule, ToastComponent, NavbarComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    private toastService = inject(ToastService);

    title = 'watch-app';

    readonly currentToast = this.toastService.currentToast;
    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);
    private popupService = inject(PopupService);

    private routeNavbarVisible = signal(false);
    showNavbar = computed(() => this.routeNavbarVisible() && !this.popupService.isPopupOpen());

    ngOnInit(): void {
        this.router.events.subscribe((e) => {
            if (e instanceof NavigationEnd) {
                let route = this.activatedRoute;
                while (route.firstChild) route = route.firstChild;
                const show = route.snapshot.data && (route.snapshot.data as any).showNavbar;
                this.routeNavbarVisible.set(show !== false);
            }
        });
    }
}
