import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembersPopupComponent } from './members-popup.component';

describe('MembersPopupComponent', () => {
  let component: MembersPopupComponent;
  let fixture: ComponentFixture<MembersPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembersPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MembersPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
