import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ServiceProxyModule } from '../../../service-proxies/service-proxy.module';
import { FormsModule, ValueChangeEvent } from '@angular/forms';
import {
  AuthServiceProxy,
  ForgotPasswordDto,
  VerifyOtpDto,
} from '../../../service-proxies/service-proxies';

@Component({
  selector: 'app-otp-dialog',
  templateUrl: './otp-dialog.component.html',
  styleUrls: ['./otp-dialog.component.css'],
  imports: [FormsModule, ServiceProxyModule, CommonModule],
})
export class OtpDialogComponent {
  otpValues: string[] = new Array(6).fill('');
  isOtpValid = false;
  isVerifying = false;
  resendDisabled = false;
  resendCountdown = 0;
  userEmail: string;

  constructor(
    public dialogRef: MatDialogRef<OtpDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _authService: AuthServiceProxy
  ) {
    this.userEmail = data.userEmail; // Get the email from the data
  }

  ngOnInit(): void {}

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
        VerifyOtpDto;
        const verifyOtpData = new VerifyOtpDto();
        verifyOtpData.email = this.userEmail;
        verifyOtpData.otp = otp;

        this._authService.verifyOtp(verifyOtpData).subscribe((res: any) => {
          if (res) {
            this.dialogRef.close(res); // Pass the OTP and email back
          }
        });
        // this.dialogRef.close({ otp, email: this.userEmail }); // Pass the OTP and email back
        // console.log(otp);
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
      const forgotPasswordDto = new ForgotPasswordDto();
      forgotPasswordDto.email = this.userEmail;
      this._authService.resendOtp(forgotPasswordDto).subscribe((res: any) => {
        console.log(res);
        console.log('Code resent');
      });
      console.log('Code resent');
    }, 1000);
  }
}
