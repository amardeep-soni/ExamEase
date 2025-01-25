import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ResetPasswordDto } from '../../../service-proxies/service-proxies';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password-dialog',
  templateUrl: './reset-password-dialog.component.html',
  imports: [CommonModule, FormsModule],
})
export class ResetPasswordDialogComponent {
  resetData: ResetPasswordDto = {} as ResetPasswordDto;

  constructor(public dialogRef: MatDialogRef<ResetPasswordDialogComponent>) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.dialogRef.close(this.resetData);
  }
}
