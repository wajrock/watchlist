import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassicSearchComponent } from './classic-search.component';

describe('ClassicSearchComponent', () => {
  let component: ClassicSearchComponent;
  let fixture: ComponentFixture<ClassicSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassicSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassicSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
