import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    inject,
    Input,
    Output,
    Renderer2,
    ViewChild,
} from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
    selector: 'app-popup',
    imports: [CommonModule, ButtonComponent],
    templateUrl: './popup.component.html',
    styleUrl: './popup.component.scss',
})
export class PopupComponent {
    private startY = 0;
    private currentY = 0;
    private threshold = 150;
    private isDragging = false;
    private renderer = inject(Renderer2);

    @Input() animateOnInit = true;

    @Output() close = new EventEmitter<void>();

    @ViewChild('popup') popupContent!: ElementRef;

    closePopup(): void {
        this.close.emit();
    }

    onBackgroundClick(event: MouseEvent): void {
        const target = event.target as HTMLElement;
        if (target.classList.contains('popup-overlay')) {
            this.closePopup();
        }
    }

    @HostListener('touchstart', ['$event'])
    onTouchStart(event: TouchEvent): void {
        this.startY = event.touches[0].clientY;
        this.currentY = 0;
        this.isDragging = true;
    }

    @HostListener('touchmove', ['$event'])
    onTouchMove(event: TouchEvent): void {
        if (!this.isDragging || !this.popupContent) return;

        this.currentY = event.touches[0].clientY - this.startY;

        if (this.currentY > 0) {
            this.renderer.setStyle(
                this.popupContent.nativeElement,
                'transform',
                `translateY(${this.currentY}px)`,
            );
        }
    }

    @HostListener('touchend')
    onTouchEnd(): void {
        if (!this.isDragging || !this.popupContent) return;

        if (this.currentY > this.threshold) {
            this.closePopup();
        } else {
            this.renderer.setStyle(this.popupContent.nativeElement, 'transform', 'translateY(0)');
        }

        this.isDragging = false;
        this.currentY = 0;
    }
}
