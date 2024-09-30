import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkipQuestionDialogComponent } from './skip-question-dialog.component';

describe('SkipQuestionDialogComponent', () => {
  let component: SkipQuestionDialogComponent;
  let fixture: ComponentFixture<SkipQuestionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SkipQuestionDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkipQuestionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
