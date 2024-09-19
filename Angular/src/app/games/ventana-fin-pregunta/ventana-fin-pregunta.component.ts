import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VentanasConfirmacionComponent } from 'src/app/databasemanagement/ventanas-confirmacion/ventanas-confirmacion.component';

@Component({
  selector: 'app-ventana-fin-pregunta',
  templateUrl: './ventana-fin-pregunta.component.html',
  styleUrls: ['./ventana-fin-pregunta.component.css']
})
export class VentanaFinPreguntaComponent implements OnInit {

  constructor(
    public dialogo: MatDialogRef<VentanasConfirmacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }


    confirmado(): void {
      this.dialogo.close(true);
    }

  ngOnInit() {
  }
}
