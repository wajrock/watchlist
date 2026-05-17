import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMembersPopupComponent } from './add-members-popup.component';

describe('AddMembersPopupComponent', () => {
  let component: AddMembersPopupComponent;
  let fixture: ComponentFixture<AddMembersPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMembersPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMembersPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
