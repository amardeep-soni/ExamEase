import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-forgot-password-dialog',
  templateUrl: './forgot-password-dialog.component.html',
  styleUrls: ['./forgot-password-dialog.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ForgotPasswordDialogComponent {
  email: string = '';
  isValidEmail: boolean = false;
  showError: boolean = false;
  emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  constructor(public dialogRef: MatDialogRef<ForgotPasswordDialogComponent>) {}

  get inputClasses(): string {
    return `w-full px-4 py-2 border rounded-lg transition-all duration-200 
      ${this.showError 
        ? 'border-red-500 focus:ring-2 focus:ring-red-200 focus:border-red-500' 
        : 'border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500'}`;
  }

  validateEmail(): void {
    this.isValidEmail = this.emailPattern.test(this.email);
    this.showError = this.email.length > 0 && !this.isValidEmail;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.isValidEmail) {
      this.dialogRef.close(this.email);
    }
  }
}
