import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattlemodeComponent } from './battlemode.component';

describe('BattlemodeComponent', () => {
  let component: BattlemodeComponent;
  let fixture: ComponentFixture<BattlemodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BattlemodeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BattlemodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
