import { Component, input } from '@angular/core';
import { Toast, TOAST_TYPE } from '../../models/toast.model';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
    selector: 'app-toast',
    imports: [CommonModule],
    templateUrl: './toast.component.html',
    styleUrl: './toast.component.scss',
    animations: [
        trigger('toastAnimation', [
            transition(':enter', [
                style({
                    transform: 'translate(-50%, 7rem)',
                    opacity: 0,
                }),
                animate(
                    '0.4s ease-out',
                    style({
                        transform: 'translate(-50%, 0)',
                        opacity: 1,
                    }),
                ),
            ]),
            transition(':leave', [
                animate(
                    '4.4s ease-in',
                    style({
                        opacity: 0,
                    }),
                ),
            ]),
        ]),
    ],
})
export class ToastComponent {
    readonly TOAST_TYPE = TOAST_TYPE;
    toast = input.required<Toast>();
}
