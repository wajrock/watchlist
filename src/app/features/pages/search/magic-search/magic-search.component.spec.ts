import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagicSearchComponent } from './magic-search.component';

describe('MagicSearchComponent', () => {
  let component: MagicSearchComponent;
  let fixture: ComponentFixture<MagicSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MagicSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
