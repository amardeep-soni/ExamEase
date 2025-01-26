import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-custom-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './custom-delete-dialog.component.html',
  styleUrl: './custom-delete-dialog.component.css'
})
export class CustomDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CustomDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { examName: string }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
