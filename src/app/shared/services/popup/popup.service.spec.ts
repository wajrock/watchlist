import { TestBed } from '@angular/core/testing';
import { PopupService } from './popup.service';

describe('PopupService', () => {
    let service: PopupService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [PopupService],
        });
        service = TestBed.inject(PopupService);
    });

    it('should be created with initial value false', () => {
        expect(service).toBeTruthy();
        expect(service.isPopupOpen()).toBe(false);
    });

    it('should set isPopupOpen signal to true when open is called', () => {
        service.open();
        expect(service.isPopupOpen()).toBe(true);
    });

    it('should set isPopupOpen signal to false when close is called', () => {
        service.open();
        expect(service.isPopupOpen()).toBe(true);

        service.close();
        expect(service.isPopupOpen()).toBe(false);
    });
});
