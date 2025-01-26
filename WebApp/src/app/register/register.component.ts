import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
  standalone: true,
  imports: [CommonModule, FormsModule, ServiceProxyModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  user: RegisterDto = new RegisterDto();
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private _authService: AuthServiceProxy,
    private dialog: MatDialog
  ) {}

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this._authService.register(this.user).subscribe({
        next: (res: any) => {
          if (res) {
            const dialogRef = this.dialog.open(OtpDialogComponent, {
              width: '400px',
              maxWidth: '90vw',
              data: { userEmail: this.user.email },
            });

            dialogRef.afterClosed().subscribe((result) => {
              if (result) {
                this.router.navigate(['/login']);
              }
            });
          }
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.errorMessage = 'An error occurred during registration. Please try again.';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}
