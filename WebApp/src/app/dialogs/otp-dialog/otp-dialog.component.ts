import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-otp-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './otp-dialog.component.html',
  styleUrl: './otp-dialog.component.css',
})
export class OtpDialogComponent {
  dialogRef = inject(DynamicDialogRef);
  otpValues: string[] = new Array(6).fill('');
  isOtpValid = false;
  isVerifying = false;
  resendDisabled = false;
  resendCountdown = 0;

  onOtpChange(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Only allow numbers
    if (!/^\d*$/.test(value)) {
      input.value = '';
      return;
    }

    // Update the OTP array
    this.otpValues[index] = value;

    // Move to next input if value is entered
    if (value && index < 5) {
      const nextInput = input.nextElementSibling as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }

    this.validateOtp();
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;

    // Handle backspace
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prevInput = input.previousElementSibling as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
        this.otpValues[index - 1] = '';
      }
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text');

    if (pastedData && /^\d{6}$/.test(pastedData)) {
      const inputs = document.querySelectorAll('input[type="text"]');
      pastedData.split('').forEach((value, index) => {
        this.otpValues[index] = value;
        (inputs[index] as HTMLInputElement).value = value;
      });
      this.validateOtp();
    }
  }

  validateOtp() {
    this.isOtpValid =
      this.otpValues.every((value) => value !== '') &&
      this.otpValues.length === 6;
  }

  async verifyOtp() {
    if (this.isOtpValid) {
      this.isVerifying = true;
      const otp = this.otpValues.join('');

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        this.dialogRef.close(otp);
        console.log(otp);
      } catch (error) {
        // Handle error
        console.error('OTP verification failed:', error);
      } finally {
        this.isVerifying = false;
      }
    }
  }

  resendCode() {
    this.resendDisabled = true;
    this.resendCountdown = 30;

    // Start countdown timer
    const timer = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown === 0) {
        this.resendDisabled = false;
        clearInterval(timer);
      }
    }, 1000);

    // Simulate resend API call
    setTimeout(() => {
      console.log('Code resent');
    }, 1000);
  }
}
