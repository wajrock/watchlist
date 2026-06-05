import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchbarComponent } from './searchbar.component';

describe('SearchbarComponent', () => {
    let component: SearchbarComponent;
    let fixture: ComponentFixture<SearchbarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SearchbarComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SearchbarComponent);
        component = fixture.componentInstance;

        fixture.componentRef.setInput('searchValue', '');
        fixture.componentRef.setInput('placeholder', 'Search...');
        fixture.componentRef.setInput('inputName', 'search');
        fixture.componentRef.setInput('inputId', 'search-id');

        fixture.detectChanges();
    });

    it('should create with baseline default signals and inputs', () => {
        expect(component).toBeTruthy();
        expect(component.isSearchActive()).toBe(false);
    });

    describe('clearSearch workflow operations', () => {
        it('should emit an empty string sequence when triggering the cleanup utility', () => {
            const emitSpy = vi.spyOn(component.onSearchChanged, 'emit');

            component.clearSearch();

            expect(emitSpy).toHaveBeenCalledWith('');
        });
    });

    describe('onNameInput change tracking events', () => {
        it('should extract target input values, apply trimming transformations, and broadcast parameters', () => {
            const emitSpy = vi.spyOn(component.onSearchChanged, 'emit');
            const mockEvent = {
                target: {
                    value: '   Interstellar   ',
                },
            } as unknown as Event;

            component.onNameInput(mockEvent);

            expect(emitSpy).toHaveBeenCalledWith('Interstellar');
        });
    });
});
