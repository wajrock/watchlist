import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopupService } from '../../services/popup/popup.service';
import { PopupComponent } from './popup.component';

describe('PopupComponent', () => {
    let component: PopupComponent;
    let fixture: ComponentFixture<PopupComponent>;
    let mockPopupService: any;

    beforeEach(async () => {
        mockPopupService = {
            isPopupOpen: {
                set: vi.fn(),
            },
        };

        await TestBed.configureTestingModule({
            imports: [PopupComponent],
            providers: [{ provide: PopupService, useValue: mockPopupService }],
        }).compileComponents();

        fixture = TestBed.createComponent(PopupComponent);
        component = fixture.componentInstance;
    });

    it('should create and set popup open on init', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
        expect(mockPopupService.isPopupOpen.set).toHaveBeenCalledWith(true);
    });

    it('should close popup and emit event when closePopup is invoked', () => {
        const emitSpy = vi.spyOn(component.close, 'emit');
        fixture.detectChanges();

        component.closePopup();

        expect(mockPopupService.isPopupOpen.set).toHaveBeenCalledWith(false);
        expect(emitSpy).toHaveBeenCalled();
    });

    it('should trigger closePopup on background click when target is the overlay', () => {
        const closeSpy = vi.spyOn(component, 'closePopup');
        fixture.detectChanges();

        const mockEvent = {
            target: {
                classList: {
                    contains: vi.fn().mockReturnValue(true),
                },
            },
        } as unknown as MouseEvent;

        component.onBackgroundClick(mockEvent);

        expect(closeSpy).toHaveBeenCalled();
    });

    it('should not trigger closePopup on background click when target is not the overlay', () => {
        const closeSpy = vi.spyOn(component, 'closePopup');
        fixture.detectChanges();

        const mockEvent = {
            target: {
                classList: {
                    contains: vi.fn().mockReturnValue(false),
                },
            },
        } as unknown as MouseEvent;

        component.onBackgroundClick(mockEvent);

        expect(closeSpy).not.toHaveBeenCalled();
    });

    describe('Touch Gestures', () => {
        beforeEach(() => {
            component.popupContent = new ElementRef(document.createElement('div'));
            fixture.detectChanges();
        });

        it('should track coordinates correctly on touchstart', () => {
            const startEvent = {
                touches: [{ clientY: 100 }],
            } as unknown as TouchEvent;

            component.onTouchStart(startEvent);

            expect((component as any).startY).toBe(100);
            expect((component as any).isDragging).toBe(true);
        });

        it('should update element transform during touchmove downward gestures', () => {
            const startEvent = { touches: [{ clientY: 100 }] } as unknown as TouchEvent;
            component.onTouchStart(startEvent);

            const moveEvent = { touches: [{ clientY: 150 }] } as unknown as TouchEvent;
            component.onTouchMove(moveEvent);

            expect((component as any).currentY).toBe(50);
            expect(component.popupContent.nativeElement.style.transform).toBe('translateY(50px)');
        });

        it('should ignore touchmove modifications if negative upward drag occurs', () => {
            const startEvent = { touches: [{ clientY: 100 }] } as unknown as TouchEvent;
            component.onTouchStart(startEvent);

            const moveEvent = { touches: [{ clientY: 50 }] } as unknown as TouchEvent;
            component.onTouchMove(moveEvent);

            expect((component as any).currentY).toBe(-50);
            expect(component.popupContent.nativeElement.style.transform).toBe('');
        });

        it('should ignore touchmove calls if element references are not established', () => {
            (component as any).popupContent = undefined;
            const startEvent = { touches: [{ clientY: 100 }] } as unknown as TouchEvent;
            component.onTouchStart(startEvent);

            const moveEvent = { touches: [{ clientY: 150 }] } as unknown as TouchEvent;
            component.onTouchMove(moveEvent);

            expect((component as any).currentY).toBe(0);
        });

        it('should close the popup when touchend exceeds structural thresholds', () => {
            const closeSpy = vi.spyOn(component, 'closePopup');

            const startEvent = { touches: [{ clientY: 100 }] } as unknown as TouchEvent;
            component.onTouchStart(startEvent);

            const moveEvent = { touches: [{ clientY: 300 }] } as unknown as TouchEvent;
            component.onTouchMove(moveEvent);

            component.onTouchEnd();

            expect(closeSpy).toHaveBeenCalled();
            expect((component as any).isDragging).toBe(false);
        });

        it('should reset position parameters when touchend does not clear threshold constraints', () => {
            const closeSpy = vi.spyOn(component, 'closePopup');

            const startEvent = { touches: [{ clientY: 100 }] } as unknown as TouchEvent;
            component.onTouchStart(startEvent);

            const moveEvent = { touches: [{ clientY: 120 }] } as unknown as TouchEvent;
            component.onTouchMove(moveEvent);

            component.onTouchEnd();

            expect(closeSpy).not.toHaveBeenCalled();
            expect(component.popupContent.nativeElement.style.transform).toBe('translateY(0)');
            expect((component as any).isDragging).toBe(false);
        });

        it('should abort touchend workflows prematurely if dragging lifecycle states are false', () => {
            (component as any).isDragging = false;
            component.onTouchEnd();
            expect(component.popupContent.nativeElement.style.transform).toBe('');
        });
    });
});
