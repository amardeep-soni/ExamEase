import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDeleteDialogComponent } from './custom-delete-dialog.component';

describe('CustomDeleteDialogComponent', () => {
  let component: CustomDeleteDialogComponent;
  let fixture: ComponentFixture<CustomDeleteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomDeleteDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
