import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Toast, TOAST_TYPE } from './shared/models/toast.model';
import { ToastService } from './shared/services/toast/toast.service';
import { ToastComponent } from './shared/components/toast/toast.component';
@Component({
    selector: 'app-root',
    imports: [RouterOutlet, ReactiveFormsModule, CommonModule, ToastComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    private toastService = inject(ToastService);

    title = 'watch-app';

    readonly currentToast = this.toastService.currentToast;
}
