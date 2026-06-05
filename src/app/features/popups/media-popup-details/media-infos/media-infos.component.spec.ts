import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaInfosComponent } from './media-infos.component';

describe('MediaInfosComponent', () => {
    let component: MediaInfosComponent;
    let fixture: ComponentFixture<MediaInfosComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MediaInfosComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(MediaInfosComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
