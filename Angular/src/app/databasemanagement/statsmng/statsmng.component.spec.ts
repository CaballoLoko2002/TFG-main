import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsmngComponent } from './statsmng.component';

describe('StatsmngComponent', () => {
  let component: StatsmngComponent;
  let fixture: ComponentFixture<StatsmngComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatsmngComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsmngComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
