import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    inject,
    input,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    signal,
    ViewChild,
} from '@angular/core';
import { NavbarService } from '../../services/navbar/navbar.service';
import { ButtonComponent } from '../button/button.component';

@Component({
    selector: 'app-popup',
    imports: [CommonModule, ButtonComponent],
    templateUrl: './popup.component.html',
    styleUrl: './popup.component.scss',
})
export class PopupComponent implements OnInit, OnDestroy {
    private startY = 0;
    private currentY = 0;
    private threshold = 150;
    private isDragging = false;
    private renderer = inject(Renderer2);
    private navbarService = inject(NavbarService);

    animateOnInit = input<boolean>(true);
    displayCloseBtn = input<boolean>(false);
    hideNavbarOnClose = signal<boolean>(false);

    @Output() close = new EventEmitter<void>();

    @ViewChild('popup') popupContent!: ElementRef;

    ngOnInit(): void {
        this.hideNavbarOnClose.set(!this.navbarService.showNavbar());
        this.navbarService.hide();
    }

    ngOnDestroy(): void {
        this.restoreNavbarVisibility();
    }

    closePopup(): void {
        this.restoreNavbarVisibility();
        this.close.emit();
    }

    private restoreNavbarVisibility(): void {
        if (this.hideNavbarOnClose()) {
            this.navbarService.hide();
            return;
        }

        this.navbarService.show();
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
