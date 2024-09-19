import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-ventana-exito',
  templateUrl: './ventana-exito.component.html',
  styleUrls: ['./ventana-exito.component.css']
})

export class VentanaExitoComponent implements OnInit{

  constructor(
    public dialogo: MatDialogRef<VentanaExitoComponent>,
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
