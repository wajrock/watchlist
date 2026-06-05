import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaLogoComponent } from './media-logo.component';

describe('MediaLogoComponent', () => {
    let component: MediaLogoComponent;
    let fixture: ComponentFixture<MediaLogoComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MediaLogoComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(MediaLogoComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
