import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrUpdateExamComponent } from './create-or-update-exam.component';

describe('CreateOrUpdateExamComponent', () => {
  let component: CreateOrUpdateExamComponent;
  let fixture: ComponentFixture<CreateOrUpdateExamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOrUpdateExamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOrUpdateExamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
