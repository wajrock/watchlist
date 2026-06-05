import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
    let component: CardComponent;
    let fixture: ComponentFixture<CardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CardComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CardComponent);
        component = fixture.componentInstance;

        fixture.componentRef.setInput('posterPath', '/mock-path.jpg');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('handleOpenDetails', () => {
        it('should invoke emit methods cleanly over openDetails output reference hooks', () => {
            const emitSpy = vi.spyOn(component.openDetails, 'emit');

            component.handleOpenDetails();

            expect(emitSpy).toHaveBeenCalled();
        });
    });
});
