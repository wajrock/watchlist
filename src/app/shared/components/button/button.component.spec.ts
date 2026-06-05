import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
    let component: ButtonComponent;
    let fixture: ComponentFixture<ButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create with standard configuration defaults', () => {
        expect(component).toBeTruthy();
        expect(component.customClass).toBe('');
        expect(component.isClicked).toBe(false);
    });

    describe('handleClick workflow actions', () => {
        it('should broadcast notification requests through action event emitters', () => {
            const emitSpy = vi.spyOn(component.action, 'emit');

            component.handleClick();

            expect(emitSpy).toHaveBeenCalled();
        });
    });

    describe('handleTouchEnd event listeners', () => {
        it('should reset click tracking state variables back to false conditions', () => {
            component.isClicked = true;

            component.handleTouchEnd();

            expect(component.isClicked).toBe(false);
        });
    });
});
