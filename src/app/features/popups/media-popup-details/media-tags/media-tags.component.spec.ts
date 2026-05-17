import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaTagsComponent } from './media-tags.component';

describe('MediaTagsComponent', () => {
  let component: MediaTagsComponent;
  let fixture: ComponentFixture<MediaTagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaTagsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
