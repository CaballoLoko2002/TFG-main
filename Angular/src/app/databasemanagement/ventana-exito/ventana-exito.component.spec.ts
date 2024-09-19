import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentanaExitoComponent } from './ventana-exito.component';

describe('VentanaExitoComponent', () => {
  let component: VentanaExitoComponent;
  let fixture: ComponentFixture<VentanaExitoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VentanaExitoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VentanaExitoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
