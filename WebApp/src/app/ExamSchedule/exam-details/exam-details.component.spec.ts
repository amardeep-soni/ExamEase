import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamDetailsComponent } from './exam-details.component';

describe('ExamDetailsComponent', () => {
  let component: ExamDetailsComponent;
  let fixture: ComponentFixture<ExamDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
