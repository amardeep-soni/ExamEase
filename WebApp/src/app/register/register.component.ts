import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AuthServiceProxy,
  RegisterDto,
} from '../../service-proxies/service-proxies';
import { ServiceProxyModule } from '../../service-proxies/service-proxy.module';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OtpDialogComponent } from '../dialogs/otp-dialog/otp-dialog.component';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, ServiceProxyModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [DialogService],
})
export class RegisterComponent {
  user: RegisterDto = new RegisterDto();
  ref: DynamicDialogRef | undefined;
  constructor(
    private router: Router,
    private _authService: AuthServiceProxy,
    public dialogService: DialogService
  ) {}

  onSubmit(form: NgForm) {
    this.ref = this.dialogService.open(OtpDialogComponent, {
      width: '30vw',
      modal: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
    if (form.valid) {
      console.log('Form submitted', this.user);

      this._authService.register(this.user).subscribe(
        (res: any) => {
          if (res) {
            this.ref = this.dialogService.open(OtpDialogComponent, {
              width: '50vw',
              modal: true,
              breakpoints: {
              '960px': '75vw',
              '640px': '90vw',
              },
              data: {
              email: this.user.email,
              },
            });
            this.ref.onClose.subscribe((otp: any) => {
              if (otp) {
              console.log('OTP received:', otp);
              // Call verify OTP endpoint
              // this._authService.verifyOtp(this.user.email, otp).subscribe(
              //   (verifyRes: any) => {
              //   if (verifyRes) {
              //     console.log('OTP verified successfully');
              //     this.router.navigate(['/dashboard']);
              //   } else {
              //     console.log('OTP verification failed');
              //   }
              //   },
              //   (error: any) => {
              //   console.error('Error verifying OTP:', error);
              //   }
              // );
              }
            });
          } 
        },
       
      );
    }
  }
}
