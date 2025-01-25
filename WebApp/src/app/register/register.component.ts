import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AuthServiceProxy,
  RegisterDto,
} from '../../service-proxies/service-proxies';
import { ServiceProxyModule } from '../../service-proxies/service-proxy.module';
import { OtpDialogComponent } from '../dialogs/otp-dialog/otp-dialog.component';

import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, ServiceProxyModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  user: RegisterDto = new RegisterDto();
  constructor(
    private router: Router,
    private _authService: AuthServiceProxy,
    private dialog: MatDialog // Add MatDialog to the constructor
  ) {}

  onSubmit(form: NgForm) {
    if (form.valid) {
      console.log(this.user);
      this._authService.register(this.user).subscribe((res: any) => {
        if (res) {
          const dialogRef = this.dialog.open(OtpDialogComponent, {
            width: '400px', // Increased width
            maxWidth: '90vw', // Responsive width
            data: { userEmail: this.user.email }, // Pass the email to the dialog
          });

          dialogRef.afterClosed().subscribe((result) => {
            console.log(result);
            if (result) {
              this.router.navigate(['/login']);
            }
          });
        }
      });
    }
  }
}
