import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-searchbar',
    imports: [FormsModule],
    templateUrl: './searchbar.component.html',
    styleUrl: './searchbar.component.scss',
})
export class SearchbarComponent {
    searchValue = input.required<string>();
    placeholder = input.required<string>();
    inputName = input.required<string>();
    inputId = input.required<string>();
    isSearchActive = signal<boolean>(false);
    onSearchChanged = output<string>();

    clearSearch(): void {
        this.onSearchChanged.emit('');
    }

    onNameInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        const value = input.value.trim();
        this.onSearchChanged.emit(value);
    }
}
