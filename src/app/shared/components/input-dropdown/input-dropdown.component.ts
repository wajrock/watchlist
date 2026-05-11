import {
    Component,
    computed,
    ElementRef,
    HostListener,
    inject,
    input,
    output,
    signal,
} from '@angular/core';
import { InputComponent } from '../input/input.component';
import { ParamOptions } from '../../models';

@Component({
    selector: 'app-input-dropdown',
    imports: [InputComponent],
    templateUrl: './input-dropdown.component.html',
    styleUrl: './input-dropdown.component.scss',
})
export class InputDropdownComponent {
    private elementRef = inject(ElementRef);

    // Inputs
    name = input.required<string>();
    id = input.required<string>();
    placeholder = input.required<string>();
    options = input.required<Array<ParamOptions>>();
    titleOptions = input<string>('');

    // Signals
    value = signal<string>('');
    isOptionsVisible = signal<boolean>(false);

    // Others
    onOptionSelected = output<ParamOptions>();
    onDropdownOpen = output<boolean>();

    filteredOptions = computed(() => {
        return this.value() === ''
            ? this.options()
            : this.options().filter((option) =>
                  option.value.toLowerCase().includes(this.value().toLowerCase()),
              );
    });

    onValueInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.value.set(input.value);
        const shouldOpen = this.value().length > 0 && this.filteredOptions().length > 0;
        this.isOptionsVisible.set(shouldOpen);
        this.onDropdownOpen.emit(shouldOpen);
    }

    selectOption(option: ParamOptions) {
        this.onOptionSelected.emit(option);
        this.closeDropdown();
    }

    @HostListener('document:mousedown', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (!this.isOptionsVisible()) {
            return;
        }

        const target = event.target as Node;
        if (!this.elementRef.nativeElement.contains(target)) {
            this.closeDropdown();
        }
    }

    private closeDropdown(): void {
        this.isOptionsVisible.set(false);
        this.value.set('');
        this.onDropdownOpen.emit(false);
    }
}
