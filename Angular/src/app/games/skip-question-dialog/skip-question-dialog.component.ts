import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-skip-question-dialog',
  templateUrl: './skip-question-dialog.component.html',
  styleUrls: ['./skip-question-dialog.component.css'],
  encapsulation: ViewEncapsulation.None // Desactiva el encapsulamiento de estilos
})
export class SkipQuestionDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SkipQuestionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
}
