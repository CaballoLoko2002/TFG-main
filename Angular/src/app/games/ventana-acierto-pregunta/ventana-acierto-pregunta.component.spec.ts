import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentanaAciertoPreguntaComponent } from './ventana-acierto-pregunta.component';

describe('VentanaAciertoPreguntaComponent', () => {
  let component: VentanaAciertoPreguntaComponent;
  let fixture: ComponentFixture<VentanaAciertoPreguntaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VentanaAciertoPreguntaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VentanaAciertoPreguntaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
