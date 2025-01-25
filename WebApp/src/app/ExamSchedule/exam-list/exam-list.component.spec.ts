import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamListComponent } from './exam-list.component';

describe('ExamListComponent', () => {
  let component: ExamListComponent;
  let fixture: ComponentFixture<ExamListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
