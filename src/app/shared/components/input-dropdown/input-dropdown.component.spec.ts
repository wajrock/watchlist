import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputDropdownComponent } from './input-dropdown.component';
import { ParamOptions } from '../../models/models';

describe('InputDropdownComponent', () => {
    let component: InputDropdownComponent;
    let fixture: ComponentFixture<InputDropdownComponent>;

    const mockOptions: ParamOptions[] = [
        { id: '1', value: 'Apple' },
        { id: '2', value: 'Banana' },
        { id: '3', value: 'Cherry' },
        { id: '4', value: 'Date' },
    ];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [InputDropdownComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(InputDropdownComponent);
        component = fixture.componentInstance;

        fixture.componentRef.setInput('name', 'test-dropdown');
        fixture.componentRef.setInput('id', 'dropdown-id');
        fixture.componentRef.setInput('placeholder', 'Select fruit');
        fixture.componentRef.setInput('options', mockOptions);

        fixture.detectChanges();
    });

    it('should create and initialize values', () => {
        expect(component).toBeTruthy();
        expect(component.value()).toBe('');
        expect(component.isOptionsVisible()).toBe(false);
    });

    describe('filteredOptions computed signal', () => {
        it('should return all options sliced by 2 if length is greater than 2 and value is empty', () => {
            expect(component.filteredOptions()).toEqual([
                { id: '3', value: 'Cherry' },
                { id: '4', value: 'Date' },
            ]);
        });

        it('should filter options by keyword matches without slice if result length is 2 or less', () => {
            component.value.set('App');
            fixture.detectChanges();
            expect(component.filteredOptions()).toEqual([{ id: '1', value: 'Apple' }]);
        });

        it('should return empty list if query search finds no match criteria', () => {
            component.value.set('Zucchini');
            fixture.detectChanges();
            expect(component.filteredOptions()).toEqual([]);
        });
    });

    describe('onValueInput', () => {
        it('should open dropdown and emit open event when input has value and matches exist', () => {
            const openSpy = vi.spyOn(component.onDropdownOpen, 'emit');

            component.onValueInput('Ap');

            expect(component.value()).toBe('Ap');
            expect(component.isOptionsVisible()).toBe(true);
            expect(openSpy).toHaveBeenCalledWith(true);
        });

        it('should keep dropdown closed if query text results in no matches', () => {
            const openSpy = vi.spyOn(component.onDropdownOpen, 'emit');

            component.onValueInput('Zucchini');

            expect(component.isOptionsVisible()).toBe(false);
            expect(openSpy).toHaveBeenCalledWith(false);
        });

        it('should keep dropdown closed if input value string is blank', () => {
            const openSpy = vi.spyOn(component.onDropdownOpen, 'emit');

            component.onValueInput('');

            expect(component.isOptionsVisible()).toBe(false);
            expect(openSpy).toHaveBeenCalledWith(false);
        });
    });

    describe('selectOption', () => {
        it('should emit selection event, clear values, and shut visibility maps down', () => {
            const selectSpy = vi.spyOn(component.onOptionSelected, 'emit');
            const openSpy = vi.spyOn(component.onDropdownOpen, 'emit');

            component.value.set('Ap');
            component.isOptionsVisible.set(true);

            const selection = mockOptions[0];
            component.selectOption(selection);

            expect(selectSpy).toHaveBeenCalledWith(selection);
            expect(component.isOptionsVisible()).toBe(false);
            expect(component.value()).toBe('');
            expect(openSpy).toHaveBeenCalledWith(false);
        });
    });

    describe('onDocumentClick HostListener', () => {
        it('should break early if option visibility triggers are already false', () => {
            const closeSpy = vi.spyOn(component as any, 'closeDropdown');
            component.isOptionsVisible.set(false);

            const outsideElement = document.createElement('span');
            const mockEvent = { target: outsideElement } as unknown as MouseEvent;

            component.onDocumentClick(mockEvent);

            expect(closeSpy).not.toHaveBeenCalled();
        });

        it('should trigger close procedures if document target click event occurs outside host bounds', () => {
            component.isOptionsVisible.set(true);
            component.value.set('Ap');

            const outsideElement = document.createElement('span');
            document.body.appendChild(outsideElement);

            const mockEvent = { target: outsideElement } as unknown as MouseEvent;

            component.onDocumentClick(mockEvent);

            expect(component.isOptionsVisible()).toBe(false);
            expect(component.value()).toBe('');

            outsideElement.remove();
        });

        it('should keep menu unchanged if document target click events originate within internal elements', () => {
            component.isOptionsVisible.set(true);

            const internalChild = document.createElement('span');
            fixture.nativeElement.appendChild(internalChild);

            const mockEvent = { target: internalChild } as unknown as MouseEvent;
            component.onDocumentClick(mockEvent);

            expect(component.isOptionsVisible()).toBe(true);

            internalChild.remove();
        });
    });
});
