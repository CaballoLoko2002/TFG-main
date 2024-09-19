import { Component, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VentanasConfirmacionComponent } from 'src/app/databasemanagement/ventanas-confirmacion/ventanas-confirmacion.component';

@Component({
  selector: 'app-ventana-fin-pregunta-cc',
  templateUrl: './ventana-fin-pregunta-cc.component.html',
  styleUrls: ['../../ventana-fin-pregunta/ventana-fin-pregunta.component.css']
})
export class VentanaFinPreguntaCCComponent {
  constructor(
    public dialogo: MatDialogRef<VentanasConfirmacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }


    confirmado(): void {
      this.dialogo.close(true);
    }

  ngOnInit() {
  }
}
