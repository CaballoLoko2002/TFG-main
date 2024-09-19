import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VentanasConfirmacionComponent } from 'src/app/databasemanagement/ventanas-confirmacion/ventanas-confirmacion.component';

@Component({
  selector: 'app-esperar-resultados-modal',
  templateUrl: './esperar-resultados-modal.component.html',
  styleUrls: ['../../ventana-fin-pregunta/ventana-fin-pregunta.component.css']
})
export class EsperarResultadosModalComponent {
  constructor(
    public dialogo: MatDialogRef<VentanasConfirmacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: boolean) { }


    confirmado(): void {
      this.dialogo.close(true);
    }

  ngOnInit() {
  }
}
