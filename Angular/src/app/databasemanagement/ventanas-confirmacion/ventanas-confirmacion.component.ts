import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-ventanas-confirmacion',
  templateUrl: './ventanas-confirmacion.component.html',
  styleUrls: ['./ventanas-confirmacion.component.css']
})
export class VentanasConfirmacionComponent implements OnInit{

  constructor(
    public dialogo: MatDialogRef<VentanasConfirmacionComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string) { }

    cerrarDialogo(): void {
      this.dialogo.close(false);
    }
    confirmado(): void {
      this.dialogo.close(true);
    }

  ngOnInit() {
  }

}
