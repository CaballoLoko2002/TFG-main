import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VentanasConfirmacionComponent } from 'src/app/databasemanagement/ventanas-confirmacion/ventanas-confirmacion.component';

@Component({
  selector: 'app-ventana-acierto-pregunta',
  templateUrl: './ventana-acierto-pregunta.component.html',
  styleUrls: ['./ventana-acierto-pregunta.component.css']
})
export class VentanaAciertoPreguntaComponent {

  constructor(
    public dialogo: MatDialogRef<VentanasConfirmacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }


    confirmado(): void {
      this.dialogo.close(true);
    }

  ngOnInit() {
  }
}
